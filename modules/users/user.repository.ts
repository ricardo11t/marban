import { sql } from '@vercel/postgres'; // Importe o tipo SQL do Vercel Postgres
import User, { IUser } from "./models/user.model"; // Importa a classe User e a interface IUser

// Defina uma interface para o cliente de banco de dados, se ele não for diretamente tipado (ex: Pool)
// Ou use 'any' como fallback se a tipagem exata for difícil de obter
interface DbClient {
    // A interface para a função template literal `sql`
    // Ela aceita um TemplateStringsArray e outros argumentos, e retorna um Promise com { rows: any[] }
    (strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: any[]; rowCount: number; }>;
    // Se o seu 'dbClient' for um Pool, você pode tipar melhor:
    // query: (queryText: string, values?: any[]) => Promise<QueryResult<any>>;
}

export default class UserRepository {
    // Tipando 'db' como DbClient (ou Pool do @vercel/postgres se preferir)
    public db: DbClient; // Ou 'Pool' do '@vercel/postgres'
    public tableName: string;

    constructor(dbClient: DbClient) { // Tipado o dbClient no construtor
        if (!dbClient || typeof dbClient !== 'function') { // Vercel's `sql` is a function
            throw new Error('Invalid database client provided. Expected a function.');
        }
        this.db = dbClient;
        this.tableName = 'private.users'
    }

    /**
     * Busca todos os usuários, retornando a versão para cliente.
     * @returns Um array de objetos de usuário no formato de cliente.
     */
    async findAll(): Promise<Omit<IUser, 'hash_senha' | 'data_atualizacao' | 'email_verificado'>[]> {
        try {
            // As propriedades selecionadas devem corresponder ao que toClientJSON retorna.
            // Omit exclui as propriedades que não são retornadas pelo toClientJSON para o tipo de retorno.
            const { rows } = await this.db`SELECT id, username, email, role, ativo, data_criacao, ultimo_login FROM ${this.tableName};`;
            // Mapeia cada linha para uma instância de User e depois para o formato de cliente
            return rows.map(row => new User(row as IUser).toClientJSON()); // Casting para IUser pode ser necessário aqui
        } catch (error) {
            console.error('[UserRepository findAll] Erro ao buscar todos os usuários:', error);
            throw error;
        }
    }

    /**
     * Busca um usuário pelo email, retornando a instância completa do User.
     * @param email O email do usuário.
     * @returns Uma instância de User ou null se não encontrado.
     */
    async findByEmail(email: string): Promise<User | null> {
        try {
            if (typeof email !== 'string' || email.trim() === '') {
                throw new Error('Email must be a non-empty string.');
            }
            const { rows } = await this.db`SELECT * FROM ${this.tableName} WHERE email = ${email.toLowerCase()};`;

            if (rows.length === 0) {
                return null;
            }
            // Retorna a instância completa do User
            return new User(rows[0] as IUser); // Casting para IUser para o construtor do modelo
        } catch (error) {
            console.error('[UserRepository findByEmail] Erro na query =', error);
            throw error;
        }
    }

    /**
     * Busca um usuário pelo ID, retornando a versão para cliente.
     * @param id O ID do usuário (string ou número).
     * @returns Um objeto de usuário no formato de cliente ou null se não encontrado.
     */
    async findById(id: string | number): Promise<Omit<IUser, 'hash_senha' | 'data_atualizacao' | 'email_verificado'> | null> {
        try {
            if (typeof id !== 'string' && typeof id !== 'number') {
                throw new Error('ID must be a string or a number.');
            }
            const { rows } = await this.db`SELECT id, username, email, role, ativo, data_criacao, ultimo_login FROM${this.tableName} WHERE id = ${id};`;
            if (rows.length === 0) return null;
            return new User(rows[0] as IUser).toClientJSON(); // Casting para IUser
        } catch (error) {
            console.error('[UserRepository findById] Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    /**
     * Cria um novo usuário no banco de dados.
     * @param userData Dados para criação do usuário (username, email, hash_senha, role).
     * @returns A instância completa do User criado.
     */
    async create({ username, email, hash_senha, role = 'user' }: Pick<IUser, 'username' | 'email' | 'hash_senha'> & { role?: IUser['role'] }): Promise<User> {
        try {
            // Validações básicas (pode mover para o serviço ou validador)
            if (typeof username !== 'string' || !username.trim()) throw new Error('Username é obrigatório.');
            if (typeof email !== 'string' || !email.trim()) throw new Error('Email é obrigatório.');
            if (typeof hash_senha !== 'string' || !hash_senha.trim()) throw new Error('Hash da senha é obrigatório.');

            const { rows } = await this.db`
                INSERT INTO ${this.tableName} (username, email, hash_senha, role)
                VALUES (${username}, ${email.toLowerCase()}, ${hash_senha}, ${role})
                RETURNING id, username, email, role, ativo, data_criacao, data_atualizacao, ultimo_login, email_verificado;`; // Retorne todas as colunas para o modelo

            if (rows.length === 0) {
                throw new Error('Failed to create user: No row returned.');
            }

            console.log('[UserRepository create] Usuário criado no DB:', rows[0]);
            return new User(rows[0] as IUser); // Retorna a instância completa para o AuthService
        } catch (error) {
            console.error('[UserRepository create] Erro ao criar usuário:', error);
            throw error;
        }
    }

    /**
     * Atualiza a role de um usuário.
     * @param userId O ID do usuário.
     * @param newRole A nova role para o usuário.
     * @returns O objeto de usuário no formato de cliente atualizado ou null.
     */
    async updateRole(userId: string | number, newRole: IUser['role']): Promise<Omit<IUser, 'hash_senha' | 'data_atualizacao' | 'email_verificado'> | null> {
        try {
            if (typeof userId !== 'string' && typeof userId !== 'number') throw new Error('User ID must be valid.');
            if (typeof newRole !== 'string' || !['admin', 'user', 'guest'].includes(newRole)) throw new Error('Invalid role provided.'); // Validação da role

            const { rows } = await this.db`
                UPDATE ${this.tableName}
                SET role = ${newRole}, data_atualizacao = CURRENT_TIMESTAMP
                WHERE id = ${userId}
                RETURNING id, username, email, role, ativo, data_criacao, ultimo_login, email_verificado;`; // Retorne colunas para toClientJSON
            if (rows.length === 0) return null;
            return new User(rows[0] as IUser).toClientJSON();
        } catch (err) {
            console.error(`[UserRepository updateRole] Erro ao atualizar role para usuário ID ${userId}:`, err);
            throw err;
        }
    }

    /**
     * Atualiza a data do último login de um usuário.
     * @param username O nome de usuário do usuário.
     * @returns O objeto de usuário no formato de cliente com username e ultimo_login atualizados, ou null.
     */
    async updateLastLogin(username: string): Promise<Pick<IUser, 'username' | 'ultimo_login'> | null> {
        const now = new Date(); // Pode ser um objeto Date ou string ISO
        try {
            if (typeof username !== 'string' || username.trim() === '') throw new Error('Username is required.');

            const { rows } = await this.db`
                UPDATE ${this.tableName}
                SET ultimo_login = ${now.toISOString()} // Enviar como ISO string para o banco de dados
                WHERE username = ${username.toLowerCase()}
                RETURNING username, ultimo_login;`;
            if (rows.length === 0) return null;
            // Retorna apenas as propriedades necessárias para este método
            return {
                username: rows[0].username,
                ultimo_login: rows[0].ultimo_login
            } as Pick<IUser, 'username' | 'ultimo_login'>;
        } catch (err) {
            console.error(`[UserRepository updateLastLogin] Erro ao atualizar o ultimo login para usuário: ${username}`, err);
            throw err;
        }
    }

    /**
     * Deleta um usuário pelo email.
     * @param email O email do usuário a ser deletado.
     * @returns True se o usuário foi deletado, false caso contrário.
     */
    async delete(email: string): Promise<boolean> {
        try {
            if (typeof email !== 'string' || email.trim() === '') throw new Error('Email is required.');

            const { rowCount } = await this.db`DELETE FROM ${this.tableName} WHERE email = ${email.toLowerCase()};`;

            if (rowCount === 0) {
                console.warn(`[UserRepository delete] Usuário com email ${email} não encontrado para exclusão.`);
                return false; // Usuário não encontrado
            }
            console.log(`[UserRepository delete] Usuário com email ${email} deletado com sucesso.`);
            return true; // Usuário deletado
        } catch (err) {
            console.error('[UserRepository delete] Falha ao deletar usuário.', err);
            // Em caso de erro na query, lance o erro para ser tratado pelo errorHandler
            throw err;
        }
    }
}