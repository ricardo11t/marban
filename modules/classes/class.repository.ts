// src/modules/classes/class.repository.ts

import ClassModel, { IClass } from './models/class.model.js'; // Importa o modelo e a interface da classe
import { DbClient } from '../shared/db.js'; // Importa a interface DbClient
import { CustomError } from '../types/custom-errors.js'; // Importa CustomError

export default class ClassRepository {
    public db: DbClient; // Tipagem para o cliente de banco de dados
    public tableName: string;

    constructor(dbClient: DbClient) { // Tipado o dbClient
        if (!dbClient || typeof dbClient !== 'function') {
            throw new Error('Invalid database client provided. Expected a function.');
        }
        this.db = dbClient;
        this.tableName = 'public.classes';
    }

    /**
     * Busca todas as classes.
     * @returns Um array de instâncias de ClassModel, ou null se nenhuma for encontrada.
     */
    async findAll(): Promise<ClassModel[] | null> {
        try {
            const { rows } = await this.db`SELECT name, bonus, tipo FROM public.classes;`;
            if (rows.length === 0) {
                return null;
            }
            // Mapeia cada linha para uma instância de ClassModel
            return rows.map(row => new ClassModel(row.name, row.bonus, row.tipo));
        } catch (error) {
            console.error('[ClassRepository findAll] Erro ao buscar todas as classes:', error);
            throw error;
        }
    }

    /**
     * Busca uma classe pelo nome.
     * @param name O nome da classe.
     * @returns Uma instância de ClassModel ou null se não encontrada.
     */
    async findByName(name: string): Promise<ClassModel | null> {
        try {
            if (typeof name !== 'string' || name.trim() === '') {
                throw new Error('Class name must be a non-empty string.');
            }
            const { rows } = await this.db`SELECT name, bonus, tipo FROM public.classes WHERE name = ${name.toLowerCase()};`;
            if (rows.length === 0) {
                return null;
            }
            const { name: className, bonus, tipo } = rows[0];
            return new ClassModel(className, bonus, tipo);
        } catch (error) {
            console.error('[ClassRepository findByName] Erro na query =', error);
            throw error;
        }
    }

    /**
     * Cria uma nova classe.
     * @param name O nome da classe.
     * @param classData Os dados da classe (bonus, tipo).
     * @returns A instância de ClassModel criada.
     */
    async create(name: string, classData: Pick<IClass, 'bonus' | 'tipo'>): Promise<ClassModel> {
        try {
            if (typeof name !== 'string' || !name.trim()) throw new Error('Class name is required.');
            if (typeof classData.bonus !== 'object' || classData.bonus === null) throw new Error('Class bonus is required.');
            if (typeof classData.tipo !== 'object' || classData.tipo === null) throw new Error('Class tipo is required.');

            const { rows } = await this.db`
                INSERT INTO public.classes (name, bonus, tipo)
                VALUES (${name.toLowerCase()}, ${JSON.stringify(classData.bonus)}, ${JSON.stringify(classData.tipo)})
                RETURNING name, bonus, tipo;`;

            if (rows.length === 0) {
                throw new Error('Failed to create class: No row returned.');
            }
            const row = rows[0];
            const { name: className, bonus: classBonus, tipo: classTipo } = row;
            // Certifique-se de que bonus e tipo são objetos ao passar para o ClassModel
            return new ClassModel(className, classBonus, classTipo);
        } catch (error) {
            console.error('[ClassRepository create] Erro ao criar classe:', error);
            throw error;
        }
    }

    /**
     * Atualiza uma classe existente pelo nome.
     * @param name O nome da classe a ser atualizada.
     * @param classData Os campos a serem atualizados (bonus, tipo).
     * @returns A instância de ClassModel atualizada ou null se não encontrada.
     * @throws CustomError se a classe não for encontrada.
     */
    async update(name: string, classData: Partial<Pick<IClass, 'bonus' | 'tipo'>>): Promise<ClassModel | null> {
        try {
            if (typeof name !== 'string' || name.trim() === '') {
                throw new Error('Class name is required for update.');
            }
            if (Object.keys(classData).length === 0) {
                throw new Error('No fields provided for update.');
            }

            const updateParts: string[] = [];
            const updateValues: any[] = [];
            let i = 1;

            // Se bonus ou tipo forem objetos, serializá-los para JSON para o DB
            if (classData.bonus !== undefined) {
                updateParts.push(`bonus = $${i++}`);
                updateValues.push(JSON.stringify(classData.bonus));
            }
            if (classData.tipo !== undefined) {
                updateParts.push(`tipo = $${i++}`);
                updateValues.push(JSON.stringify(classData.tipo));
            }

            if (updateParts.length === 0) {
                throw new Error('No valid fields to update (only bonus or tipo expected).');
            }

            updateValues.push(name.toLowerCase()); // Último valor é o nome para a cláusula WHERE

            const setClause = updateParts.join(', ');
            const { rows } = await this.db`
                            UPDATE public.classes
                            SET ${setClause}
                            WHERE name = ${name.toLowerCase()}
                            RETURNING name, bonus, tipo;
                        `;

            if (rows.length === 0) {
                const error = new Error(`Class with name '${name}' not found for update.`) as CustomError;
                error.statusCode = 404; // Not Found
                throw error;
            }
            const { name: className, bonus: classBonus, tipo: classTipo } = rows[0];
            return new ClassModel(className, classBonus, classTipo);
        } catch (error) {
            console.error(`[ClassRepository update] Erro ao atualizar classe ${name}:`, error);
            throw error;
        }
    }

    /**
     * Deleta uma classe pelo nome.
     * @param name O nome da classe a ser deletada.
     * @returns True se a classe foi deletada, false caso contrário.
     */
    async delete(name: string): Promise<boolean> {
        try {
            if (typeof name !== 'string' || name.trim() === '') {
                throw new Error('Class name is required for deletion.');
            }
            console.log(`[ClassRepository delete] Deleting class with name: ${name}`);
            const { rowCount } = await this.db`DELETE FROM public.classes WHERE name = ${name.toLowerCase()};`;
            return rowCount > 0;
        } catch (error) {
            console.error(`[ClassRepository delete] Erro ao deletar classe ${name}:`, error);
            throw error;
        }
    }
}