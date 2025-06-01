import User from "./models/user.model.js";
import { sql } from '../shared/db.js' 

export default class UserRepository {
    constructor() {
        this.db = sql;
        this.tableName = 'private.users';
        console.log('[UserRepository CONSTRUCTOR] typeof this.db:', typeof this.db);
    }

    async findAll() {
        console.log('[UserRepository findAll] typeof this.db:', typeof this.db);
        // Se this.tableName é 'private.users', você pode hardcodar temporariamente também:
        // const { rows } = await this.db`SELECT id, nome_completo, email, role, ativo, data_criacao, ultimo_login FROM private.users;`;
        // Ou, mantendo a forma correta com this.db(this.tableName) se a Variação 2 do findByEmail funcionar:
        const { rows } = await this.db`SELECT id, nome_completo, email, role, ativo, data_criacao, ultimo_login FROM ${this.db(this.tableName)};`;
        return rows.map(row => new User(row).toClientJSON());
    }

    async findByEmail(email) {
        console.log('[UserRepository findByEmail] Testando VARIAÇÃO 2');
        console.log('[UserRepository findByEmail] Buscando por email =', email);
        console.log('[UserRepository findByEmail] typeof this.db:', typeof this.db);

        try {
            console.log(`[UserRepository findByEmail] Tentando query com tabela TOTALMENTE hardcoded: private.users`);

            // VARIAÇÃO 2: Nome da tabela diretamente na string SQL
            const { rows } = await this.db`SELECT * FROM private.users WHERE email = ${email.toLowerCase()}`;

            console.log('[UserRepository findByEmail] Rows encontradas =', rows);
            if (rows.length === 0) {
                console.log('[UserRepository findByEmail] Nenhum usuário encontrado.');
                return null;
            }
            console.log('[UserRepository findByEmail] Usuário encontrado, dados brutos =', rows[0]);
            return new User(rows[0]); // Retorna a instância completa do User
        } catch (error) {
            console.error('[UserRepository findByEmail VARIAÇÃO 2] Erro na query =', error);
            console.error('[UserRepository findByEmail VARIAÇÃO 2] Stack do erro na query =', error.stack);
            throw error;
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