import ClassModel from './models/class.model.js';

export default class ClassRepository {
    constructor(dbClient) {
        this.db = dbClient;
        this.tableName = 'public.classes';
    }

    async findAll() {
        const { rows } = await this.db`SELECT name, bonus, tipo FROM public.classes`;
        return rows.map(row => new ClassModel(row));
    }

    async findByName(name) {
        const { rows } = await this.db`SELECT name, bonus, tipo FROM public.classes WHERE name = ${name}`;
        if (rows.length === 0) {
            return null;
        }
        return new ClassModel(rows[0]);
    }

    async create({ name, bonus, tipo }) {

        const { rows } = await this.db`
            INSERT INTO public.classes (name, bonus, tipo) 
            VALUES (${name}, ${bonus}, ${tipo}) 
            RETURNING name, bonus, tipo`;
        return new ClassModel(rows[0]);
    }

    async update(name, { bonus, tipo }) { 
        const { rows } = await this.db`
            UPDATE public.classes 
            SET bonus = ${bonus}, tipo = ${tipo}
            WHERE name = ${name}  // Usa o 'name' parâmetro para o WHERE
            RETURNING name, bonus, tipo`;
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