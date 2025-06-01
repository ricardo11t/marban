import User from "./models/user.model.js";
import { sql } from '../shared/db.js' 

export default class UserRepository {
    constructor () {
        this.db = sql;
        this.tableName = 'private.users'
    }

    async findAll() {
        const { rows } = await this.db`SELECT id, username, email, ativo, data_criacao, ultimo_login FROM ${this.db(this.tableName)};`;
        return rows.map(row => new User(row).toClientJSON());
    }

    async findByEmail(email) {
        // Esta é a linha 16, presumivelmente
        const { rows } = await this.db`SELECT * FROM ${this.db(this.tableName)} WHERE email = ${email.toLowerCase()}`;
        if (rows.length === 0) return null;
        // ATENÇÃO: Para o fluxo de autenticação, você precisa do hash da senha.
        // toClientJSON() provavelmente o remove.
        return new User(rows[0]); // MODIFICADO: Retorna a instância completa do User
    }

    async findById(id) {
        const { rows } = await this.db`SELECT id, username, email, ativo, data_criacao, ultimo_login FROM ${this.db(this.tableName)} WHERE id = ${id};`;
        if (rows.length === 0) return null;
        return new User(rows[0]).toClientJSON();
    }

    async create({ username, email, hash_senha }) {
        const { rows } = await this.db`
            INSERT INTO ${this.db(this.tableName)} (username, email, hash_senha)
            VALUES (${username}, ${email}, ${hash_senha})
            RETURNING id, username, email, ativo, data_criacao;`;
        return new User(rows[0]).toClientJSON();
    }

    async updateRole(userId, newRole) {
        const { rows } = await this.db`
            UPDATE ${this.db(this.tableName)}
            SET role = ${newRole}, data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ${userId}
            RETURNING id, username, email, role;`;
        if (rows.length === 0) return null;
        return new User(rows[0]).toClientJSON();
    }
}