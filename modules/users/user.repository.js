import User from "./models/user.model.js";
import { sql } from '../shared/db.js'; // Certifique-se que o caminho está correto

export default class UserRepository {
    constructor() { // Removido dbClient do construtor se sql é importado diretamente
        this.db = sql;
        this.tableName = 'private.users'; // Schema 'private', tabela 'users'
        console.log('[UserRepository CONSTRUCTOR] typeof this.db:', typeof this.db);
    }

    async findAll() {
        console.log('[UserRepository findAll] Buscando todos os usuários...');
        try {
            // Alterado nome_completo para username
            const { rows } = await this.db`SELECT id, username, email, role, ativo, data_criacao, ultimo_login FROM private.users;`;
            return rows.map(row => new User(row).toClientJSON());
        } catch (error) {
            console.error('[UserRepository findAll] Erro ao buscar todos os usuários:', error);
            throw error;
        }
    }

    async findByEmail(email) {
        console.log('[UserRepository findByEmail] Buscando por email =', email);
        console.log('[UserRepository findByEmail] typeof this.db:', typeof this.db);
        try {
            // Seleciona todas as colunas para retornar a instância completa de User
            const { rows } = await this.db`SELECT * FROM private.users WHERE email = ${email.toLowerCase()}`;

            console.log('[UserRepository findByEmail] Rows encontradas =', rows);
            if (rows.length === 0) {
                console.log('[UserRepository findByEmail] Nenhum usuário encontrado.');
                return null;
            }
            console.log('[UserRepository findByEmail] Usuário encontrado, dados brutos =', rows[0]);
            return new User(rows[0]); // Retorna a instância completa do User
        } catch (error) {
            console.error('[UserRepository findByEmail] Erro na query =', error);
            throw error;
        }
    }

    async findById(id) {
        console.log('[UserRepository findById] Buscando por ID =', id);
        try {
            // Alterado nome_completo para username
            const { rows } = await this.db`SELECT id, username, email, role, ativo, data_criacao, ultimo_login FROM private.users WHERE id = ${id};`;
            if (rows.length === 0) return null;
            return new User(rows[0]).toClientJSON();
        } catch (error) {
            console.error('[UserRepository findById] Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    // Alterado nome_completo para username no parâmetro e na query
    async create({ username, email, hash_senha, role = 'admin' }) {
        console.log('[UserRepository create] Criando usuário:', { username, email, role });
        try {
            const { rows } = await this.db`
                INSERT INTO private.users (username, email, hash_senha, role) 
                VALUES (${username}, ${email.toLowerCase()}, ${hash_senha}, ${role}) 
                RETURNING id, username, email, role, ativo, data_criacao;`;

            console.log('[UserRepository create] Usuário criado no DB:', rows[0]);
            return new User(rows[0]); // Retorna a instância completa para o AuthService
        } catch (error) {
            console.error('[UserRepository create] Erro ao criar usuário:', error);
            throw error;
        }
    }

    async updateRole(userId, newRole) {
        console.log(`[UserRepository updateRole] Atualizando role para usuário ID ${userId} para ${newRole}`);
        try {
            // Alterado nome_completo para username no RETURNING
            const { rows } = await this.db`
                UPDATE private.users
                SET role = ${newRole}, data_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ${userId}
                RETURNING id, username, email, role;`;
            if (rows.length === 0) return null;
            return new User(rows[0]).toClientJSON();
        } catch (error) {
            console.error(`[UserRepository updateRole] Erro ao atualizar role para usuário ID ${userId}:`, error);
            throw error;
        }
    }
    // Adicione outros métodos como updateLastLogin, updateUser, deleteUser conforme necessário,
    // sempre usando 'username' onde for apropriado.
}