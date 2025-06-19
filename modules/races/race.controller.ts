import { Request, Response } from 'express'; // Importa os tipos do Express
import responseHandler from '../shared/responseHandler.js'; // Importa o responseHandler tipado
import RaceService from './race.service.js'; // Importa o RaceService tipado
import { IRace } from './models/race.model.js'; // Importa a interface IRace

export default class RaceController {
    private raceService: RaceService; // Tipagem para o RaceService

    constructor(raceService: RaceService) { // Tipagem do parâmetro do construtor
        if (!raceService) {
            throw new Error('RaceService must be provided.');
        }
        this.raceService = raceService;

        // Binda os métodos para garantir que 'this' se refira à instância da classe
        // quando usados como callbacks de rota em Express.
        this.getAll = this.getAll.bind(this);
        this.getByName = this.getByName.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    /**
     * Retorna todas as raças.
     * GET /races
     */
    async getAll(req: Request, res: Response): Promise<void> { // Métodos de controller geralmente retornam void ou Promise<void>
        const races: IRace[] = await this.raceService.getAllRaces();
        // responseHandler.success já define statusCode 200 por padrão.
        responseHandler.success(res, races); // Removido o 200, já é padrão
    }

    /**
     * Retorna uma raça pelo nome.
     * GET /races?name=NomeDaRaca
     */
    async getByName(req: Request, res: Response): Promise<void> {
        const { name } = req.query; // req.query é usado para parâmetros de query string

        // Validação de entrada
        if (typeof name !== 'string' || name.trim() === '') {
            // Lança para ser pego pelo errorHandler global
            const error = new Error('"Name" parameter in query is obligatory and must be a non-empty string.');
            throw error; // O erro será capturado pelo errorHandler no handler principal
        }

        const race: IRace | null = await this.raceService.getRaceByName(name);
        if (!race) {
            // Lança se a raça não for encontrada
            const error = new Error(`Race with name '${name}' not found.`);
            throw error;
        }
        responseHandler.success(res, race); // Status 200 por padrão
    }

    /**
     * Cria uma nova raça.
     * POST /races (body: { name: string, bonus: string, pdd: string })
     */
    async create(req: Request, res: Response): Promise<void> {
        const raceData: IRace = req.body; // req.body é usado para dados do corpo da requisição

        // Validação de entrada
        if (!raceData || typeof raceData.name !== 'string' || raceData.name.trim() === '') {
            // Lança para ser pego pelo errorHandler global
            const error = new Error('Race "name" is obligatory in request body.');
            throw error;
        }
        // Aqui você pode adicionar mais validações para raceData.bonus e raceData.pdd

        const newRace: IRace = await this.raceService.createRace(raceData);
        responseHandler.created(res, newRace); // Usa responseHandler.created para status 201
    }

    /**
     * Atualiza uma raça pelo nome.
     * PUT /races/:id (query: name, body: { bonus?: string, pdd?: string })
     * Ou se for por nome: PUT /races?name=NomeDaRaca (body: { ... })
     * Ajustado para PUT /races/:name ou PUT /races?name=
     */
    async update(req: Request, res: Response): Promise<void> {
        const nameParam = req.params.name || req.query.name; // ID da rota ou nome na query
        const raceData: Partial<IRace> = req.body; // raceData pode ser parcial para update

        // Validação de entrada
        if (typeof nameParam !== 'string' || nameParam.trim() === '') {
            const error = new Error('"Name" parameter (from URL or query) is obligatory to identify the race to update.');
            throw error;
        }
        if (Object.keys(raceData).length === 0) {
            const error = new Error('Request body cannot be empty for update operation.');
            throw error;
        }

        // Assegure que o 'name' no raceData, se presente, corresponda ao nameParam
        if (raceData.name && raceData.name !== nameParam) {
            const error = new Error('Race name in body must match name in URL/query parameter if provided.');
            throw error;
        }

        const updatedRace: IRace | null = await this.raceService.updateRace(nameParam, raceData);
        if (!updatedRace) {
            const error = new Error(`Race with name '${nameParam}' not found for update.`);
            throw error;
        }
        responseHandler.success(res, updatedRace); // Status 200 por padrão
    }

    /**
     * Deleta uma raça pelo nome.
     * DELETE /races/:name ou DELETE /races?name=NomeDaRaca
     */
    async delete(req: Request, res: Response): Promise<void> {
        const nameParam = req.params.name || req.query.name; // ID da rota ou nome na query

        // Validação de entrada
        if (typeof nameParam !== 'string' || nameParam.trim() === '') {
            const error = new Error('"Name" parameter (from URL or query) is obligatory to exclude the race.');
            throw error;
        }

        const isDeleted: boolean = await this.raceService.deleteRace(nameParam);
        if (!isDeleted) {
            // Se o serviço retorna false, significa que a raça não foi encontrada ou não foi deletada
            const error = new Error(`Race with name '${nameParam}' not found or could not be deleted.`);
            throw error;
        }
        responseHandler.noContent(res); // Usa responseHandler.noContent para status 204
    }
}