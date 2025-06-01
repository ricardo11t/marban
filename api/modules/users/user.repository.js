import User from "./models/user.model";
import { sql } from '../shared/db' 

export default class UserRepository {
    constructor () {
        this.db = sql;
    }

    async findAll() {
        const { rows } = await this.db`SELECT id, username, email, ativo, data_criacao, ultimo_login FROM private.users;`;
        return rows.map(row => new User(row).toClientJSON());
    }

    async findByEmail(email) {
        const { rows } = await this.db`SELECT * FROM private.users WHERE email = ${email.toLowerCase()};`;
        if (rows.length === 0) return null;
        return new User(rows[0]).toClientJSON();
    }

    async findById(id) {
        const { rows } = await this.db`SELECT id, username, email, ativo, data_criacao, ultimo_login FROM private.users WHERE id = ${id};`;
        if (rows.length === 0) return null;
        return new User(rows[0]).toClientJSON();
    }

    async create({ username, email, hash_senha }) {
        const { rows } = await this.db`
            INSERT INTO private.users (username, email, hash_senha)
            VALUES (${username}, ${email}, ${hash_senha})
            RETURNING id, username, email, ativo, data_criacao;`;
        return new User(rows[0]).toClientJSON();
    }
}