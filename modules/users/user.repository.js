import User from "./models/user.model.js";
import { sql } from '../shared/db.js' 

export default class UserRepository {
    constructor() {
        this.db = sql;
        this.tableName = 'private.users';
        console.log('[UserRepository CONSTRUCTOR] typeof this.db:', typeof this.db);
    }

    async create({ nome_completo, email, hash_senha, role = 'user' }) { // Adicionei nome_completo
        console.log('[UserRepository create] Criando usuário:', { nome_completo, email, role });
        try {
            const { rows } = await this.db`
                INSERT INTO private.users (nome_completo, email, hash_senha, role) 
                VALUES (${nome_completo}, ${email.toLowerCase()}, ${hash_senha}, ${role}) 
                RETURNING id, nome_completo, email, role, ativo, data_criacao;`;

            console.log('[UserRepository create] Usuário criado no DB:', rows[0]);
            return new User(rows[0]); // Retorne a instância completa para o AuthService
        } catch (error) {
            console.error('[UserRepository create] Erro ao criar usuário:', error);
            throw error;
        }
    }

    async findAll() {
        console.log('[UserRepository findAll] Buscando todos os usuários...');
        try {
            const { rows } = await this.db`SELECT id, nome_completo, email, role, ativo, data_criacao, ultimo_login FROM private.users;`;
            return rows.map(row => new User(row).toClientJSON());
        } catch (error) {
            console.error('[UserRepository findAll] Erro ao buscar todos os usuários:', error);
            throw error;
        }
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