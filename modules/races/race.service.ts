// src/modules/races/race.service.ts
import RaceRepository from './race.repository.js';
import { IRace } from './models/race.model.js';
import { CustomError } from '../types/custom-errors.js';

export default class RaceService {
    private raceRepository: RaceRepository;

    constructor(raceRepository: RaceRepository) {
        if (!raceRepository) {
            throw new Error('RaceRepository must be provided.');
        }
        this.raceRepository = raceRepository;
    }

    async getAllRaces(): Promise<IRace[]> {
        const races = await this.raceRepository.findAll();
        return races ? races.map(race => race.toClientJSON()) : [];
    }

    async getRaceByName(name: string): Promise<IRace> {
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Race name is required.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const race = await this.raceRepository.findByName(name);
        if (!race) {
            const error = new Error(`Race with name '${name}' not found.`) as CustomError;
            error.statusCode = 404;
            throw error;
        }
        return race.toClientJSON();
    }

    /**
     * Cria uma nova raça. Recebe 'name' e 'raceData' e os passa para o repositório.
     */
    async createRace(name: string, raceData: IRace['raceData']): Promise<IRace> {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Race name is required.') as CustomError;
            error.statusCode = 400;
            throw error;
        }
        if (!raceData || !raceData.bonus || !raceData.pdd) {
            const error = new Error('Bonus and PDD data are required.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const existingRace = await this.raceRepository.findByName(name);
        if (existingRace) {
            const error = new Error(`Race with name '${name}' already exists.`) as CustomError;
            error.statusCode = 409; // Conflict
            throw error;
        }

        const newRace = await this.raceRepository.create(name, raceData);
        return newRace.toClientJSON();
    }

    /**
     * Atualiza uma raça. Recebe 'name' e os dados a serem atualizados,
     * depois passa para o repositório.
     */
    async updateRace(name: string, raceData: Partial<IRace['raceData']>): Promise<IRace> {
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Race name is required for update.') as CustomError;
            error.statusCode = 400;
            throw error;
        }
        if (!raceData || Object.keys(raceData).length === 0) {
            const error = new Error('No fields provided for update.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const existingRace = await this.raceRepository.findByName(name);
        if (!existingRace) {
            const error = new Error(`Race with name '${name}' not found for update.`) as CustomError;
            error.statusCode = 404;
            throw error;
        }

        const updatedRace = await this.raceRepository.update(name, raceData);
        if (!updatedRace) {
            const error = new Error(`Failed to update race '${name}'.`) as CustomError;
            error.statusCode = 500;
            throw error;
        }

        return updatedRace.toClientJSON();
    }

    async deleteRace(name: string): Promise<boolean> {
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Race name is required for deletion.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const wasDeleted = await this.raceRepository.delete(name);
        if (!wasDeleted) {
            const error = new Error(`Race with name '${name}' not found or could not be deleted.`) as CustomError;
            error.statusCode = 404;
            throw error;
        }
        return true;
    }
}