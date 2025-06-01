import ClassModel from './models/class.model.js';

export default class ClassRepository {
    constructor(dbClient) {
        this.db = dbClient;
        this.tableName = 'public.classes';
    }

    async findAll() {
        const { rows } = await this.db`SELECT name, bonus, pdd FROM public.classes`;
        return rows.map(row => new ClassModel(row));
    }

    async findByName(name) {
        const { rows } = await this.db`SELECT name, bonus, pdd FROM public.classes WHERE name = ${name}`;
        if (rows.length === 0) {
            return null;
        }
        return new ClassModel(rows[0]);
    }

    async create({ name, bonus, pdd }) {

        const { rows } = await this.db`
            INSERT INTO public.classes (name, bonus, pdd) 
            VALUES (${name}, ${bonus}, ${pdd}) 
            RETURNING name, bonus, pdd`;
        return new ClassModel(rows[0]);
    }

    async update(name, { bonus, pdd }) {
        const { rows } = await this.db`
            UPDATE public.classes 
            SET bonus = ${bonus}, pdd = ${pdd}
            WHERE name = ${name}
            RETURNING name, bonus, pdd`;
        if (rows.length === 0) {
            return null;
        }
        return new ClassModel(rows[0]);
    }

    async delete(name) {
        const { rowCount } = await this.db`DELETE FROM public.classes WHERE name = ${name};`;
        return rowCount > 0;
    }
}