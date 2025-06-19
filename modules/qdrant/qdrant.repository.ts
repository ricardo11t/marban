// qdrant.repository.ts (VERSÃO FINAL CORRIGIDA)

import { QdrantClient } from '@qdrant/qdrant-js';
import { IQdrantPoint, ILoreDocument } from '../qdrant/models/qdrant.models.js';

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
            // CORREÇÃO 1: Passando o nome da coleção como uma string direta.
            await this.db.getCollection(this.collectionName);
            console.log(`Qdrant: Collection '${this.collectionName}' already exists.`);
        } catch (error: any) {
            if (error && error.status === 404) {
                try {
                    console.log(`Qdrant: Collection '${this.collectionName}' does not exist. Creating...`);
                    await this.db.createCollection(this.collectionName, {
                        vectors: {
                            size: this.VECTOR_SIZE,
                            distance: this.DISTANCE_METRIC,
                        },
                    });
                    console.log(`Qdrant: Collection '${this.collectionName}' created successfully.`);
                } catch (createError: any) {
                    console.error(`Qdrant: CRITICAL - Failed to create collection '${this.collectionName}'.`, createError);
                    throw new Error(`Failed to create Qdrant collection: ${createError.message}`);
                }
            } else {
                console.error("Qdrant: CRITICAL - An unexpected error occurred while checking collection.", error);
                throw new Error(`An unexpected error occurred with Qdrant: ${error.message}`);
            }
        }
    }

    async addEmbedding(document: ILoreDocument): Promise<IQdrantPoint> {
        if (!document || typeof document.text !== 'string' || document.text.trim() === '') {
            throw new Error('Invalid document provided. It must be an object with a non-empty "text" property.');
        }

        const id = document.id || Date.now().toString();
        const vector = this.generatedMockEmbedding(document.text);
        const payload = { ...document.metadata, original_text: document.text };

        const point = { id, vector, payload };

        try {
            await this.db.upsert(this.collectionName, { wait: true, points: [point] });
            console.log(`Point '${id}' upserted successfully.`);
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
                query: queryVector, limit, with_payload: true, with_vector: true, filter,
            });

            console.log(`Search completed for query: "${queryText}"`);

            return searchResults.points.map(point => {
                let finalVector: number[] = [];

                // Lógica CORRIGIDA para tratar o tipo 'number[] | number[][]'
                if (Array.isArray(point.vector)) {
                    if (point.vector.length > 0 && Array.isArray(point.vector[0])) {
                        // É um number[][], então pegamos o primeiro vetor
                        finalVector = point.vector[0] as number[];
                    } else {
                        // É um number[], então usamos ele diretamente
                        finalVector = point.vector as number[];
                    }
                }

                return {
                    id: point.id,
                    vector: finalVector, // Agora sempre será do tipo number[]
                    payload: point.payload || null,
                };
            });
        } catch (error) {
            console.error(`Error searching embeddings for query "${queryText}":`, error);
            throw new Error('Failed to perform search.');
        }
    }

    // As outras funções (updatePointPayload, deletePoints) permanecem as mesmas
    // que a versão anterior que te enviei, pois estavam corretas.

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

            if (!originalVector || !(Array.isArray(originalVector) && (originalVector as any[]).every((v: any) => typeof v === "number" || Array.isArray(v)))) {
                throw new Error(`Original vector invalid or not found for point with ID '${id}'.`);
            }

            const updateResult = await this.db.upsert(this.collectionName, {
                wait: true,
                points: [
                    {
                        id: id,
                        vector: originalVector as number[] | number[][],
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