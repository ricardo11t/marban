import QdrantRepository from "../qdrant/qdrant.repository";
import { ILoreDocument, IQdrantPoint } from "../qdrant/models/qdrant.models";

/**
 * O QdrantService orquestra as operações de repositório
 * e pode conter lógica de negócio, validações adicionais,
 * ou integração com outros serviços (como a API do Gemini para embeddings reais).
 */
export default class QdrantService {
    private qdrantRepository: QdrantRepository; // Tipo corrigido e privado

    constructor(qdrantRepository: QdrantRepository) { // Tipo corrigido
        if (!qdrantRepository) {
            throw new Error('Qdrant repository must be provided.');
        }
        this.qdrantRepository = qdrantRepository;
        this.qdrantRepository.createCollectionIfNotExists(); // Garante que a coleção exista ao iniciar o serviço
    }

    /**
     * Adiciona um documento de lore ao Qdrant.
     * @param document O documento de lore a ser adicionado.
     * @returns O ponto Qdrant adicionado.
     */
    async addLoreDocument(document: ILoreDocument): Promise<IQdrantPoint> {
        // Aqui você poderia ter lógica adicional, como validação de dados,
        // ou chamar o serviço de embedding para gerar o vetor REAL (em vez do mock)
        // Por exemplo:
        // const actualEmbedding = await this.embeddingService.generateEmbedding(document.text);
        // document.vector = actualEmbedding;

        // No momento, estamos usando o mock embedding do repositório
        return this.qdrantRepository.addEmbedding(document);
    }

    /**
     * Busca documentos de lore relevantes com base em uma consulta do jogador.
     * @param queryText A pergunta do jogador.
     * @param limit O número de resultados a retornar.
     * @param filter Opcional: filtros de metadados.
     * @returns Uma lista de documentos de lore relevantes.
     */
    async searchLore(queryText: string, limit?: number, filter?: Record<string, any>): Promise<IQdrantPoint[]> {
        // Aqui você pode ter lógica para pré-processar a query do usuário antes de buscar
        return this.qdrantRepository.searchEmbeddings(queryText, limit, filter);
    }

    /**
     * Atualiza os metadados de um documento de lore existente.
     * @param id O ID do documento a ser atualizado.
     * @param newMetadata Os novos metadados para o documento.
     * @returns O resultado da operação de atualização.
     */
    async updateLoreMetadata(id: number | string, newMetadata: Record<string, any>): Promise<any> {
        return this.qdrantRepository.updatePointPayload(id, newMetadata);
    }

    /**
     * Deleta um ou mais documentos de lore.
     * @param ids Um array de IDs de documentos a serem deletados.
     * @returns O resultado da operação de deleção.
     */
    async deleteLoreDocuments(ids: (number | string)[]): Promise<any> {
        return this.qdrantRepository.deletePoints(ids);
    }
}