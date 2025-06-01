import Race from './models/race.model.js';

export default class RaceRepository {
    constructor(dbClient) {
        this.db = dbClient;
        this.tableName = 'public.races'
    }

    async findAll() {
        const { rows } = await this.db`SELECT * FROM public.races;`;
        if (rows.length === 0) {
            return null;
        } 
        return rows.map(row => new Race(row));
    }

    async findByName(name) {
        const { rows } = await this.db`SELECT * FROM public.races WHERE name = ${name.toLowerCase()};`;
        if (rows.length === 0) {
            return null;
        }
        return new Race(rows[0]);
    }

    async create({name, bonus, pdd}) {
        const { rows } = await this.db`
            INSERT INTO public.races (name, bonus, pdd)
            VALUES (${name.toLowerCase()}, ${bonus}, ${pdd})
            RETURNING name, bonus, pdd;`
        return new Race(rows[0]);
    }

    async update(name, { bonus, pdd }) {
        const { rows } = await this.db`
            UPDATE public.races 
            SET bonus = ${bonus}, pdd = ${pdd}
            WHERE name = ${name}
            RETURNING name, bonus, pdd;`;
        if (rows.length === 0) {
            const error = new Error('Race not found.')
            error.statusCode = 404;
            throw error;
        }
        return new Race(rows[0])
    }

    async delete(name) {
        const { rowCount } = await this.db`DELETE FROM public.races WHERE name = ${name};`;
        return rowCount > 0;
    }
}