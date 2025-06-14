import { sql } from '@vercel/postgres'; // Importe o tipo SQL do Vercel Postgres
import Race, { IRace } from './models/race.model'; // Importa a classe Race e a interface IRace

// Defina uma interface para o cliente de banco de dados, se ele não for diretamente tipado (ex: Pool)
// Esta interface reflete a assinatura da função template literal `sql` do @vercel/postgres.
interface DbClient {
    (strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: any[]; rowCount: number; }>;
}

export default class RaceRepository {
    public db: DbClient;
    public tableName: string;

    constructor(dbClient: DbClient) { // Tipado o dbClient no construtor
        if (!dbClient || typeof dbClient !== 'function') {
            throw new Error('Invalid database client provided. Expected a function.');
        }
        this.db = dbClient;
        this.tableName = 'public.races'; // Nome da tabela
    }

    /**
     * Busca todas as raças no banco de dados.
     * @returns Um array de instâncias de Race, ou null se nenhuma for encontrada.
     */
    async findAll(): Promise<Race[] | null> {
        try {
            const { rows } = await this.db`SELECT * FROM ${this.tableName};`;
            if (rows.length === 0) {
                return null; // Retorna null se não houver raças
            }
            // Mapeia cada linha para uma instância de Race
            // O casting `as IRace` é importante para o construtor do modelo
            return rows.map(row => new Race(row.name, row.bonus, row.pdd) as Race);
            // OU, se seu construtor Race aceitar um objeto: new Race(row as IRace)
        } catch (error) {
            console.error('[RaceRepository findAll] Erro ao buscar todas as raças:', error);
            throw error; // Relança o erro para ser tratado na camada de serviço/controller
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
                throw new Error('Race name must be a non-empty string.');
            }
            const { rows } = await this.db`SELECT * FROM ${this.tableName} WHERE name = ${name.toLowerCase()};`;
            if (rows.length === 0) {
                return null; // Raça não encontrada
            }
            // Retorna a instância completa da Raça
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
            // Validações básicas (pode mover para o serviço)
            if (typeof raceData.name !== 'string' || !raceData.name.trim()) throw new Error('Race name is required.');
            if (typeof raceData.bonus !== 'string' || !raceData.bonus.trim()) throw new Error('Race bonus is required.');
            if (typeof raceData.pdd !== 'string' || !raceData.pdd.trim()) throw new Error('Race PDD is required.');

            const { rows } = await this.db`
                INSERT INTO ${this.tableName} (name, bonus, pdd)
                VALUES (${raceData.name.toLowerCase()}, ${raceData.bonus}, ${raceData.pdd})
                RETURNING name, bonus, pdd;`;

            if (rows.length === 0) {
                throw new Error('Failed to create race: No row returned.');
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
     * @throws  se a raça não for encontrada.
     */
    async update(name: string, updatedFields: Partial<Omit<IRace, 'name'>>): Promise<Race | null> {
        try {
            if (typeof name !== 'string' || name.trim() === '') {
                throw new Error('Race name is required for update.');
            }
            if (Object.keys(updatedFields).length === 0) {
                throw new Error('No fields provided for update.');
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
                throw new Error('No valid fields to update (only bonus or pdd expected).');
            }

            updateValues.push(name.toLowerCase()); // Último valor é o nome para a cláusula WHERE

            // Monta a query dinamicamente usando template string para o método this.db
            const setClause = updateParts.join(', ');
            const { rows } = await this.db`
                UPDATE ${this.tableName}
                SET ${setClause}
                WHERE name = ${name.toLowerCase()}
                RETURNING name, bonus, pdd;
            `;

            if (rows.length === 0) {
                // Lança um  para ser tratado pelo errorHandler global
                const error = new Error(`Race with name '${name}' not found for update.`);
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
     */
    async delete(name: string): Promise<boolean> {
        try {
            if (typeof name !== 'string' || name.trim() === '') {
                throw new Error('Race name is required for deletion.');
            }
            const { rowCount } = await this.db`DELETE FROM ${this.tableName} WHERE name = ${name.toLowerCase()};`;
            return rowCount > 0; // Retorna true se algo foi deletado, false caso contrário
        } catch (error) {
            console.error(`[RaceRepository delete] Erro ao deletar raça ${name}:`, error);
            throw error;
        }
    }
}