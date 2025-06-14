// src/modules/races/race.service.ts

import RaceRepository from './race.repository'; // Importa o RaceRepository tipado
import { IRace } from './models/race.model'; // Importa a interface IRace
import { CustomError } from '../types/custom-errors'; // Importa a interface CustomError

export default class RaceService {
    private raceRepository: RaceRepository; // Tipagem para o repositório

    constructor(raceRepository: RaceRepository) { // Tipagem do parâmetro do construtor
        if (!raceRepository) {
            throw new Error('RaceRepository must be provided.');
        }
        this.raceRepository = raceRepository;
    }

    /**
     * Retorna todas as raças, convertidas para o formato de cliente.
     * @returns Um array de objetos de raça no formato de cliente.
     */
    async getAllRaces(): Promise<IRace[]> {
        const races = await this.raceRepository.findAll();
        // Se findAll retornar null (nenhuma raça), retornamos um array vazio para o cliente.
        if (!races) {
            return [];
        }
        return races.map(race => race.toClientJSON());
    }

    /**
     * Busca uma raça pelo nome, retornando-a no formato de cliente.
     * @param name O nome da raça.
     * @returns Um objeto de raça no formato de cliente.
     * @throws CustomError se a raça não for encontrada.
     */
    async getRaceByName(name: string): Promise<IRace> {
        // Validação de entrada
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Race name is required.') as CustomError;
            error.statusCode = 400; // Bad Request
            throw error;
        }

        const race = await this.raceRepository.findByName(name);
        if (!race) {
            // Lança um CustomError para ser pego pelo errorHandler
            const error = new Error(`Race with name '${name}' not found.`) as CustomError;
            error.statusCode = 404; // Not Found
            error.path = `/races?name=${name}`; // Adiciona o path para o errorHandler
            throw error;
        }
        return race.toClientJSON();
    }

    /**
     * Cria uma nova raça.
     * @param raceData Dados da raça a ser criada.
     * @returns A raça criada no formato de cliente.
     * @throws CustomError se a raça já existir.
     */
    async createRace(raceData: Pick<IRace, 'name' | 'bonus' | 'pdd'>): Promise<IRace> {
        // Validação de entrada (opcional, já pode estar no controller ou repositório)
        if (!raceData.name || !raceData.bonus || !raceData.pdd) {
            const error = new Error('Name, bonus, and PDD are required to create a race.') as CustomError;
            error.statusCode = 400; // Bad Request
            throw error;
        }

        // Validação de negócio: Verifica se a raça já existe antes de criar
        const existingRace = await this.raceRepository.findByName(raceData.name);
        if (existingRace) {
            const error = new Error(`Race with name '${raceData.name}' already exists.`) as CustomError;
            error.statusCode = 409; // Conflict
            error.path = `/races`; // Exemplo de path
            throw error;
        }

        const newRace = await this.raceRepository.create(raceData);
        return newRace.toClientJSON();
    }

    /**
     * Atualiza uma raça existente.
     * @param name O nome da raça a ser atualizada.
     * @param raceData Os dados a serem atualizados (parcial).
     * @returns A raça atualizada no formato de cliente.
     * @throws CustomError se a raça não for encontrada.
     */
    async updateRace(name: string, raceData: Partial<Omit<IRace, 'name'>>): Promise<IRace> {
        // Validação de entrada
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Race name is required for update.') as CustomError;
            error.statusCode = 400;
            throw error;
        }
        if (Object.keys(raceData).length === 0) {
            const error = new Error('No fields provided for update.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        // Verifica se a raça existe antes de tentar atualizar
        const existingRace = await this.raceRepository.findByName(name);
        if (!existingRace) {
            const error = new Error(`Race with name '${name}' not found for update.`) as CustomError;
            error.statusCode = 404; // Not Found
            error.path = `/races/${name}`;
            throw error;
        }

        const updatedRace = await this.raceRepository.update(name, raceData);
        // O repositório lança 404 se não encontrar, então aqui ele retornará o objeto ou lançará o erro.
        // Se a chamada ao repositório não lançou erro, mas retornou null, tratamos aqui:
        if (!updatedRace) {
            const error = new Error(`Failed to update race '${name}'. It might not exist or no changes were made.`) as CustomError;
            error.statusCode = 500; // Ou 404 se preferir que o serviço lance explicitamente
            throw error;
        }
        return updatedRace.toClientJSON();
    }

    /**
     * Deleta uma raça.
     * @param name O nome da raça a ser deletada.
     * @returns True para indicar que foi deletada com sucesso.
     * @throws CustomError se a raça não for encontrada para exclusão.
     */
    async deleteRace(name: string): Promise<boolean> {
        // Validação de entrada
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Race name is required for deletion.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const wasDeleted = await this.raceRepository.delete(name);
        if (!wasDeleted) {
            // Lança um CustomError se a raça não foi encontrada ou não pôde ser deletada
            const error = new Error(`Race with name '${name}' not found or could not be deleted.`) as CustomError;
            error.statusCode = 404; // Not Found
            error.path = `/races/${name}`;
            throw error;
        }
        return true; // Retorna true para indicar que foi deletada
    }
}