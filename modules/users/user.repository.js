import User from "./models/user.model.js";
import { sql } from '../shared/db.js' 

export default class UserRepository {
    constructor() {
        this.db = sql;
        this.tableName = 'private.users';
        console.log('[UserRepository CONSTRUCTOR] typeof this.db:', typeof this.db);
    }

    async findAll() {
        const { rows } = await this.db`SELECT id, username, email, ativo, data_criacao, ultimo_login FROM ${this.db(this.tableName)};`;
        return rows.map(row => new User(row).toClientJSON());
    }

    async findByEmail(email) {
        console.log('[UserRepository findByEmail] Buscando por email =', email);
        console.log('[UserRepository findByEmail] typeof this.db:', typeof this.db);

        try {
            // VERSÃO SIMPLIFICADA PARA TESTE:
            const nomeDaTabelaHardcoded = 'privado.users'; // OU 'public.users', QUAL FOR O CORRETO
            console.log(`[UserRepository findByEmail] Tentando query com tabela hardcoded: ${nomeDaTabelaHardcoded}`);

            // Tente esta linha, substituindo ${this.db(this.tableName)} pelo nome da tabela diretamente
            const { rows } = await this.db`SELECT * FROM ${this.db(nomeDaTabelaHardcoded)} WHERE email = ${email.toLowerCase()}`;
            // OU, mais direto ainda, sem a função sql para o nome da tabela, já que é um nome fixo no exemplo:
            // const { rows } = await this.db`SELECT * FROM privado.users WHERE email = ${email.toLowerCase()}`;
            // Por favor, teste primeiro a linha acima com this.db(nomeDaTabelaHardcoded)
            // Se ela ainda falhar, tente a próxima com o nome totalmente hardcoded.

            console.log('[UserRepository findByEmail] Rows encontradas =', rows);
            if (rows.length === 0) {
                console.log('[UserRepository findByEmail] Nenhum usuário encontrado.');
                return null;
            }
            console.log('[UserRepository findByEmail] Usuário encontrado, dados brutos =', rows[0]);
            return new User(rows[0]);
        } catch (error) {
            console.error('[UserRepository findByEmail] Erro na query =', error);
            console.error('[UserRepository findByEmail] Stack do erro na query =', error.stack);
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