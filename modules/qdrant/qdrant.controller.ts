import { Request, Response } from 'express'; // Supondo Express para req/res
import QdrantService from "../qdrant/qdrant.service";
import { ILoreDocument } from '../qdrant/models/qdrant.models';

/**
 * O QdrantController lida com as requisições HTTP,
 * chama os métodos apropriados do serviço e retorna as respostas HTTP.
 */
export default class QdrantController {
    private qdrantService: QdrantService; // Tipo corrigido e privado

    constructor(qdrantService: QdrantService) { // Tipo corrigido
        if (!qdrantService || typeof qdrantService !== 'object') {
            throw new Error('Invalid Qdrant service provided');
        }
        this.qdrantService = qdrantService;

        // **Bind this** para garantir que 'this' seja correto em callbacks de rota
        this.addLore = this.addLore.bind(this);
        this.searchLore = this.searchLore.bind(this);
        this.updateLore = this.updateLore.bind(this);
        this.deleteLore = this.deleteLore.bind(this);
    }

    /**
     * Rota para adicionar um novo documento de lore.
     * Espera { text: string, metadata?: Record<string, any> } no corpo da requisição.
     * Ex: POST /lore
     */
    async addLore(req: Request, res: Response): Promise<Response> {
        const { text, metadata } = req.body;
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: "O 'text' do documento é obrigatório." });
        }

        try {
            const document: ILoreDocument = { text, metadata };
            const newPoint = await this.qdrantService.addLoreDocument(document);
            return res.status(201).json({ message: "Documento de lore adicionado com sucesso.", data: newPoint });
        } catch (error: any) {
            console.error("Erro ao adicionar lore:", error);
            return res.status(500).json({ error: "Falha ao adicionar documento de lore.", details: error.message });
        }
    }

    /**
     * Rota para buscar documentos de lore.
     * Espera query string 'text' e opcionalmente 'limit', 'filter'.
     * Ex: GET /lore/search?text=Rei Theron&limit=5
     */
    async searchLore(req: Request, res: Response): Promise<Response> {
        const queryText = req.query.text as string;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
        // Se você tiver filtros no frontend, eles viriam aqui e seriam parseados
        // const filter = req.query.filter ? JSON.parse(req.query.filter as string) : undefined;

        if (!queryText || queryText.trim() === '') {
            return res.status(400).json({ error: "O 'text' da consulta é obrigatório." });
        }

        try {
            const results = await this.qdrantService.searchLore(queryText, limit /*, filter */);
            return res.status(200).json({ message: "Busca de lore realizada com sucesso.", data: results });
        } catch (error: any) {
            console.error("Erro ao buscar lore:", error);
            return res.status(500).json({ error: "Falha ao realizar busca de lore.", details: error.message });
        }
    }

    /**
     * Rota para atualizar o payload de um documento de lore.
     * Espera { id: string | number, payload: Record<string, any> } no corpo da requisição.
     * Ex: PUT /lore/:id
     */
    async updateLore(req: Request, res: Response): Promise<Response> {
        const id = req.params.id; // Ou req.body.id dependendo do seu design de API
        const newPayload = req.body.payload;

        if (!id || !newPayload || typeof newPayload !== 'object') {
            return res.status(400).json({ error: "ID do documento e um 'payload' válido são obrigatórios." });
        }

        // Tenta converter o ID para número se for um número, senão mantém como string
        const parsedId: string | number = isNaN(Number(id)) ? id : Number(id);

        try {
            const updateResult = await this.qdrantService.updateLoreMetadata(parsedId, newPayload);
            return res.status(200).json({ message: `Lore com ID '${id}' atualizado com sucesso.`, data: updateResult });
        } catch (error: any) {
            console.error(`Erro ao atualizar lore com ID '${id}':`, error);
            return res.status(500).json({ error: "Falha ao atualizar documento de lore.", details: error.message });
        }
    }

    /**
     * Rota para deletar um ou mais documentos de lore.
     * Espera { ids: (string | number)[] } no corpo da requisição.
     * Ex: DELETE /lore
     */
    async deleteLore(req: Request, res: Response): Promise<Response> {
        const ids = req.body.ids as (string | number)[];

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "Um array de IDs para deletar é obrigatório." });
        }

        try {
            const deleteResult = await this.qdrantService.deleteLoreDocuments(ids);
            return res.status(200).json({ message: `Lore(s) com IDs [${ids.join(', ')}] deletado(s) com sucesso.`, data: deleteResult });
        } catch (error: any) {
            console.error(`Erro ao deletar lore com IDs [${ids.join(', ')}]:`, error);
            return res.status(500).json({ error: "Falha ao deletar documento(s) de lore.", details: error.message });
        }
    }
}