// src/modules/races/race.repository.ts
import Race, { IRace } from './models/race.model.js';
import { CustomError } from '../types/custom-errors.js';
import { DbClient } from '../shared/db.js';

export default class RaceRepository {
    public db: DbClient;
    public tableName: string;

    constructor(dbClient: DbClient) {
        if (!dbClient || typeof dbClient !== 'function') {
            throw new Error('Invalid database client provided. Expected a function.');
        }
        this.db = dbClient;
        this.tableName = 'public.races';
    }

    async findAll(): Promise<Race[] | null> {
        const { rows } = await this.db`SELECT * FROM public.races;`;
        if (rows.length === 0) {
            return null;
        }
        // O banco retorna 'bonus' e 'pdd' achatados, o construtor da classe Race os aninha corretamente.
        return rows.map((row: any) => new Race(row.name, row.bonus, row.pdd));
    }

    async findByName(name: string): Promise<Race | null> {
        const { rows } = await this.db`SELECT * FROM public.races WHERE name = ${name.toLowerCase()};`;
        if (rows.length === 0) {
            return null;
        }
        return new Race(rows[0].name, rows[0].bonus, rows[0].pdd);
    }

    /**
     * Cria uma nova raça, "achatando" a estrutura para o banco.
     */
    async create(name: string, raceData: IRace['raceData']): Promise<Race> {
        const { bonus, pdd } = raceData;

        // Validação básica para garantir que os objetos não são nulos/undefined.
        if (!bonus || !pdd) {
            const error = new Error('Bonus and PDD data are required.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const { rows } = await this.db`
            INSERT INTO public.races (name, bonus, pdd)
            VALUES (${name.toLowerCase()}, ${JSON.stringify(bonus)}, ${JSON.stringify(pdd)})
            RETURNING name, bonus, pdd;`;

        if (rows.length === 0) {
            const error = new Error('Failed to create race: No row returned.') as CustomError;
            error.statusCode = 500;
            throw error;
        }
        return new Race(rows[0].name, rows[0].bonus, rows[0].pdd);
    }

    /**
     * Atualiza uma raça existente.
     * Este método agora lida com a limitação da biblioteca Vercel/Postgres.
     */
    async update(name: string, updatedFields: Partial<IRace['raceData']>): Promise<Race | null> {
        const lowerCaseName = name.toLowerCase();
        const { bonus, pdd } = updatedFields;
        const hasBonus = bonus !== undefined;
        const hasPdd = pdd !== undefined;

        if (!hasBonus && !hasPdd) {
            const error = new Error('No valid fields to update (only bonus or pdd expected).') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        let queryResult;

        if (hasBonus && !hasPdd) {
            queryResult = await this.db`
                UPDATE public.races
                SET bonus = ${JSON.stringify(bonus)}
                WHERE name = ${lowerCaseName}
                RETURNING name, bonus, pdd;
            `;
        } else if (!hasBonus && hasPdd) {
            queryResult = await this.db`
                UPDATE public.races
                SET pdd = ${JSON.stringify(pdd)}
                WHERE name = ${lowerCaseName}
                RETURNING name, bonus, pdd;
            `;
        } else { // hasBonus && hasPdd
            queryResult = await this.db`
                UPDATE public.races
                SET bonus = ${JSON.stringify(bonus)}, pdd = ${JSON.stringify(pdd)}
                WHERE name = ${lowerCaseName}
                RETURNING name, bonus, pdd;
            `;
        }

        const { rows } = queryResult;

        if (rows.length === 0) {
            // Isso pode acontecer se a raça for deletada entre a verificação no serviço e o update.
            return null;
        }

        return new Race(rows[0].name, rows[0].bonus, rows[0].pdd);
    }

    async delete(name: string): Promise<boolean> {
        const { rowCount } = await this.db`DELETE FROM public.races WHERE name = ${name.toLowerCase()};`;
        return rowCount > 0;
    }
}