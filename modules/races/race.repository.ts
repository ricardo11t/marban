// src/modules/races/race.repository.ts

// A importação de 'sql' do @vercel/postgres já está correta no seu db.ts e DbClient.
// Não precisa importar diretamente aqui se você já a passa pelo construtor.
// Se a interface DbClient estiver em 'db.ts', você pode importá-la de lá.
import Race, { IRace } from './models/race.model';
import { CustomError } from '../types/custom-errors';
import { DbClient } from '../shared/db'; // Importa a interface DbClient do seu shared/db

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

    /**
     * Busca todas as raças no banco de dados.
     * @returns Um array de instâncias de Race, ou null se nenhuma for encontrada.
     */
    async findAll(): Promise<Race[] | null> {
        try {
            // Note: ${this.tableName} não precisa de sql() se DbClient já é o template literal
            const { rows } = await this.db`SELECT * FROM ${this.tableName};`;
            if (rows.length === 0) {
                return null;
            }
            return rows.map((row: {name: string, bonus: object, pdd: object}) => new Race(row.name, row.bonus, row.pdd) as Race);
        } catch (error) {
            console.error('[RaceRepository findAll] Erro ao buscar todas as raças:', error);
            throw error;
        }
    }

    /**
     * Busca uma raça pelo nome.
     * @param name O nome da raça a ser buscada.
     * @returns Uma instância de Race ou null se não encontrada.
     */
    async findByName(name: string): Promise<Race | null> {
        try {
            if (typeof name !== 'string' || name.trim() === '') {
                const error = new Error('Race name must be a non-empty string.') as CustomError;
                error.statusCode = 400; // Bad Request
                throw error;
            }
            const { rows } = await this.db`SELECT * FROM ${this.tableName} WHERE name = ${name.toLowerCase()};`;
            if (rows.length === 0) {
                return null;
            }
            return new Race(rows[0].name, rows[0].bonus, rows[0].pdd) as Race;
        } catch (error) {
            console.error('[RaceRepository findByName] Erro na query =', error);
            throw error;
        }
    }

    /**
     * Cria uma nova raça no banco de dados.
     * @param raceData Dados da raça a ser criada (name, bonus, pdd).
     * @returns A instância de Race criada.
     */
    async create(raceData: Pick<IRace, 'name' | 'bonus' | 'pdd'>): Promise<Race> {
        try {
            if (typeof raceData.name !== 'string' || !raceData.name.trim()) {
                const error = new Error('Race name is required.') as CustomError;
                error.statusCode = 400;
                throw error;
            }
            if (typeof raceData.bonus !== 'string') {
                const error = new Error('Race bonus is required.') as CustomError;
                error.statusCode = 400;
                throw error;
            }
            if (typeof raceData.pdd !== 'string') {
                const error = new Error('Race PDD is required.') as CustomError;
                error.statusCode = 400;
                throw error;
            }

            const { rows } = await this.db`
                INSERT INTO ${this.tableName} (name, bonus, pdd)
                VALUES (${raceData.name.toLowerCase()}, ${raceData.bonus}, ${raceData.pdd})
                RETURNING name, bonus, pdd;`;

            if (rows.length === 0) {
                const error = new Error('Failed to create race: No row returned.') as CustomError;
                error.statusCode = 500;
                throw error;
            }
            return new Race(rows[0].name, rows[0].bonus, rows[0].pdd) as Race;
        } catch (error) {
            console.error('[RaceRepository create] Erro ao criar raça:', error);
            throw error;
        }
    }

    /**
     * Atualiza uma raça existente pelo nome.
     * @param name O nome da raça a ser atualizada.
     * @param updatedFields Os campos a serem atualizados (bonus, pdd).
     * @returns A instância de Race atualizada ou null se não encontrada.
     * @throws CustomError se a raça não for encontrada ou dados inválidos.
     */
    async update(name: string, updatedFields: Partial<Omit<IRace, 'name'>>): Promise<Race | null> {
        try {
            if (typeof name !== 'string' || name.trim() === '') {
                const error = new Error('Race name is required for update.') as CustomError;
                error.statusCode = 400;
                throw error;
            }
            if (Object.keys(updatedFields).length === 0) {
                const error = new Error('No fields provided for update.') as CustomError;
                error.statusCode = 400;
                throw error;
            }

            // Construir a query de UPDATE dinamicamente com base nos campos fornecidos
            const updateParts: string[] = [];
            const updateValues: any[] = [];
            let i = 1;

            if (typeof updatedFields.bonus === 'string') {
                updateParts.push(`bonus = $${i++}`);
                updateValues.push(updatedFields.bonus);
            }
            if (typeof updatedFields.pdd === 'string') {
                updateParts.push(`pdd = $${i++}`);
                updateValues.push(updatedFields.pdd);
            }

            if (updateParts.length === 0) {
                const error = new Error('No valid fields to update (only bonus or pdd expected).') as CustomError;
                error.statusCode = 400;
                throw error;
            }

            updateValues.push(name.toLowerCase()); // Último valor é o nome para a cláusula WHERE

            const setClause = updateParts.join(', ');
            // Monta a query dinamicamente usando template string do dbClient
            const { rows } = await this.db`
                UPDATE ${this.tableName}
                SET ${setClause}
                WHERE name = ${name.toLowerCase()}
                RETURNING name, bonus, pdd;
            `;

            if (rows.length === 0) {
                const error = new Error(`Race with name '${name}' not found for update.`) as CustomError;
                error.statusCode = 404; // Not Found
                throw error;
            }
            return new Race(rows[0].name, rows[0].bonus, rows[0].pdd) as Race;
        } catch (error) {
            console.error(`[RaceRepository update] Erro ao atualizar raça ${name}:`, error);
            throw error;
        }
    }

    /**
     * Deleta uma raça pelo nome.
     * @param name O nome da raça a ser deletada.
     * @returns True se a raça foi deletada, false caso contrário.
     * @throws CustomError se o nome for inválido.
     */
    async delete(name: string): Promise<boolean> {
        try {
            if (typeof name !== 'string' || name.trim() === '') {
                const error = new Error('Race name is required for deletion.') as CustomError;
                error.statusCode = 400;
                throw error;
            }
            const { rowCount } = await this.db`DELETE FROM ${this.tableName} WHERE name = ${name.toLowerCase()};`;
            return rowCount > 0;
        } catch (error) {
            console.error(`[RaceRepository delete] Erro ao deletar raça ${name}:`, error);
            throw error;
        }
    }
}