import User from "./models/user.model.js";
import { sql } from '../shared/db.js' 

export default class UserRepository {
    constructor() {
        this.db = sql;
        this.tableName = 'privado.users'; // Corrigido para 'privado.users' se for o schema correto
        console.log('[UserRepository] Constructor: typeof this.db =', typeof this.db);
    }

    async findAll() {
        const { rows } = await this.db`SELECT id, username, email, ativo, data_criacao, ultimo_login FROM ${this.db(this.tableName)};`;
        return rows.map(row => new User(row).toClientJSON());
    }

    async findByEmail(email) {
        console.log('[UserRepository] findByEmail: Buscando por email =', email);
        console.log('[UserRepository] findByEmail: typeof this.db =', typeof this.db);
        try {
            const query = `SELECT * FROM <span class="math-inline">\{this\.tableName\} WHERE email \= '</span>{email.toLowerCase().replace(/'/g, "''")}'`; // Logging da query (cuidado com SQL injection aqui, apenas para log)
            console.log('[UserRepository] findByEmail: Query construída (para log) =', query);

            const { rows } = await this.db`SELECT * FROM ${this.db(this.tableName)} WHERE email = ${email.toLowerCase()}`;

            console.log('[UserRepository] findByEmail: Rows encontradas =', rows);
            if (rows.length === 0) {
                console.log('[UserRepository] findByEmail: Nenhum usuário encontrado.');
                return null;
            }
            console.log('[UserRepository] findByEmail: Usuário encontrado, dados brutos =', rows[0]);
            return new User(rows[0]); // Retorna a instância completa
        } catch (error) {
            console.error('[UserRepository] findByEmail: Erro na query =', error);
            throw error; // Re-lança o erro para ser pego pelo errorHandler
        }
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