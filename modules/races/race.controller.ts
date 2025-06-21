// src/modules/races/race.controller.ts
import { Request, Response } from 'express';
import responseHandler from '../shared/responseHandler.js';
import RaceService from './race.service.js';
import { IRace } from './models/race.model.js';

export default class RaceController {
    private raceService: RaceService;

    constructor(raceService: RaceService) {
        if (!raceService) {
            throw new Error('RaceService must be provided.');
        }
        this.raceService = raceService;

        // Binds
        this.getAll = this.getAll.bind(this);
        this.getByName = this.getByName.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req: Request, res: Response): Promise<void> {
        const races: IRace[] = await this.raceService.getAllRaces();
        responseHandler.success(res, races);
    }

    async getByName(req: Request, res: Response): Promise<void> {
        const { name } = req.query;

        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('"Name" parameter in query is required.');
            (error as any).statusCode = 400;
            throw error;
        }

        const race: IRace = await this.raceService.getRaceByName(name);
        responseHandler.success(res, race);
    }

    /**
     * Cria uma nova raça.
     * Espera um body no formato: { name: string, raceData: { bonus: object, pdd: object } }
     */
    async create(req: Request, res: Response): Promise<void> {
        // Desestrutura o 'name' e o objeto 'raceData' do corpo da requisição.
        const { name, raceData } = req.body;

        if (!name) {
            const error = new Error('Race "name" is required in request body.');
            (error as any).statusCode = 400;
            throw error;
        }
        if (!raceData) {
            const error = new Error('"raceData" object is required in request body.');
            (error as any).statusCode = 400;
            throw error;
        }

        const newRace: IRace = await this.raceService.createRace(name, raceData);
        responseHandler.created(res, newRace);
    }

    /**
     * Atualiza uma raça.
     * Espera um parâmetro 'name' na query e um body no formato: { raceData: { bonus?: object, pdd?: object } }
     */
    async update(req: Request, res: Response): Promise<void> {
        // Pega o nome da query string
        const nameParam = req.query.name;
        // Desestrutura o objeto 'raceData' do corpo da requisição.
        const { raceData } = req.body;

        if (typeof nameParam !== 'string' || nameParam.trim() === '') {
            const error = new Error('"name" query parameter is required to identify the race to update.');
            (error as any).statusCode = 400;
            throw error;
        }
        if (!raceData || Object.keys(raceData).length === 0) {
            const error = new Error('Request body must contain a "raceData" object with fields to update.');
            (error as any).statusCode = 400;
            throw error;
        }

        const updatedRace: IRace = await this.raceService.updateRace(nameParam, raceData);
        responseHandler.success(res, updatedRace);
    }

    async delete(req: Request, res: Response): Promise<void> {
        const nameParam = req.query.name;

        if (typeof nameParam !== 'string' || nameParam.trim() === '') {
            const error = new Error('"name" query parameter is required to identify the race to delete.');
            (error as any).statusCode = 400;
            throw error;
        }

        await this.raceService.deleteRace(nameParam);
        responseHandler.noContent(res);
    }
}