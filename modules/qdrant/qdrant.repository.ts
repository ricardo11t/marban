// qdrant.repository.ts

import { QdrantClient } from '@qdrant/qdrant-js';
// REMOVA ESTAS LINHAS. NÃO VAMOS MAIS TENTAR IMPORTAR POINTSTRUCT.
// import { PointStruct, CollectionInfo } from '@qdrant/qdrant-js';
// import { PointStruct, CollectionInfo } from '@qdrant/qdrant-js/dist/types/src/proto/qdrant/qdrant_service_pb';
// import { PointStruct, CollectionInfo } from '@qdrant/qdrant-js/dist/types/grpc-web';


import { IQdrantPoint, ILoreDocument } from '../qdrant/models/qdrant.models';

export default class QdrantRepository {
    public db: QdrantClient;
    public collectionName: string;
    public VECTOR_SIZE: number = 768;
    public DISTANCE_METRIC: 'Cosine' | 'Euclid' | 'Dot' = 'Cosine';

    constructor(dbClient: QdrantClient, collectionName: string = "rpg_lore", vectorSize: number = 768) {
        if (!dbClient || typeof dbClient !== 'object') {
            throw new Error('Invalid database client provided');
        }
        this.db = dbClient;
        this.collectionName = collectionName;
        this.VECTOR_SIZE = vectorSize;
    }

    generatedMockEmbedding(text: string): number[] {
        return Array.from({ length: this.VECTOR_SIZE }, () => Math.random());
    }

    async createCollectionIfNotExists(): Promise<void> {
        try {
            const { collections } = await this.db.getCollections();
            const collectionExists = collections.some(col => col.name === this.collectionName);

            if (!collectionExists) {
                console.log(`Collection '${this.collectionName}' does not exist. Creating...`);
                await this.db.createCollection(this.collectionName, {
                    vectors: {
                        size: this.VECTOR_SIZE,
                        distance: this.DISTANCE_METRIC,
                    },
                });
                console.log(`Collection '${this.collectionName}' created successfully.`);
            } else {
                console.log(`Collection '${this.collectionName}' already exists.`);
            }
        } catch (error) {
            console.error(`Error checking or creating collection '${this.collectionName}':`, error);
            throw new Error('Failed to ensure collection existence.');
        }
    }

    async addEmbedding(document: ILoreDocument): Promise<IQdrantPoint> {
        if (!document || typeof document.text !== 'string' || document.text.trim() === '') {
            throw new Error('Invalid document provided. It must be an object with a non-empty "text" property.');
        }

        const id = document.id || Date.now().toString();
        const vector = this.generatedMockEmbedding(document.text);
        const payload = { ...document.metadata, original_text: document.text };

        // **Ajuste AQUI:** Remova a tipagem explícita ': PointStruct'.
        // Deixe o TypeScript inferir o tipo do objeto 'point'.
        // O compilador sabe que 'points' no upsert espera uma certa estrutura.
        const point = { // Não precisa mais de ': PointStruct'
            id: id,
            vector: vector,
            payload: payload,
        };

        try {
            await this.db.upsert(this.collectionName, {
                wait: true,
                points: [point], // 'point' aqui já está no formato correto.
            });
            console.log(`Point '${id}' upserted successfully.`);
            // Certifique-se de que o retorno corresponde à sua interface IQdrantPoint
            return point as IQdrantPoint;
        } catch (error) {
            console.error(`Error adding/updating embedding for ID '${id}':`, error);
            throw new Error('Failed to add/update embedding.');
        }
    }

    async searchEmbeddings(queryText: string, limit: number = 3, filter?: Record<string, any>): Promise<IQdrantPoint[]> {
        if (typeof queryText !== 'string' || queryText.trim() === '') {
            throw new Error('Query text must be a non-empty string.');
        }

        const queryVector = this.generatedMockEmbedding(queryText);

        try {
            const searchResults = await this.db.query(this.collectionName, {
                query: queryVector,
                limit: limit,
                with_payload: true,
                with_vector: false,
                filter: filter,
            });

            console.log(`Search completed for query: "${queryText}"`);
            // Mapeia os resultados para o formato do seu modelo ou interface
            return searchResults.points.map(point => ({
                id: point.id as string | number,
                vector: point.vector as number[], // Isso será um vetor vazio se with_vectors for false
                payload: point.payload || null,
            }));
        } catch (error) {
            console.error(`Error searching embeddings for query "${queryText}":`, error);
            throw new Error('Failed to perform search.');
        }
    }

    async updatePointPayload(id: number | string, newPayload: Record<string, any>): Promise<any> {
        if (!id || typeof newPayload !== 'object' || newPayload === null) {
            throw new Error('ID e novo payload válidos são obrigatórios.');
        }

        try {
            const existingPoints = await this.db.retrieve(this.collectionName, {
                ids: [id],
                with_vector: true,
                with_payload: false
            });

            if (existingPoints.length === 0) {
                throw new Error(`Point with ID '${id}' not found.`);
            }

            const originalPoint = existingPoints[0];
            const originalVector = originalPoint.vector;

            if (!originalVector || !(Array.isArray(originalVector) && originalVector.every((v: any) => typeof v === "number" || Array.isArray(v)))) {
                throw new Error(`Original vector invalid or not found for point with ID '${id}'.`);
            }

            const updateResult = await this.db.upsert(this.collectionName, {
                wait: true,
                points: [
                    {
                        id: id,
                        vector: originalVector as number[] | number[][], // Casting necessário aqui
                        payload: newPayload,
                    }
                ]
            });

            console.log(`Payload for point '${id}' updated successfully.`, updateResult);
            return updateResult;
        } catch (error) {
            console.error(`Error updating payload for point '${id}':`, error);
            throw new Error('Failed to update point payload.');
        }
    }

    async deletePoints(ids: (number | string)[]): Promise<any> {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('An array of IDs is required to delete points.');
        }

        try {
            const deleteResult = await this.db.delete(this.collectionName, {
                points: ids,
                wait: true,
            });
            console.log(`Points with IDs [${ids.join(', ')}] deleted successfully.`, deleteResult);
            return deleteResult;
        } catch (error) {
            console.error(`Error deleting points with IDs [${ids.join(', ')}]:`, error);
            throw new Error('Failed to delete points.');
        }
    }
}