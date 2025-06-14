import UserRepository from './user.repository'; // Importa o UserRepository tipado
import User, { IUser } from './models/user.model'; // Importa a classe User e a interface IUser
import { CustomError } from '../types/custom-errors'; // Importa a interface CustomError

export default class UserService {
    private userRepository: UserRepository; // Tipagem para o repositório

    constructor(userRepository: UserRepository) { // Tipagem do parâmetro do construtor
        if (!userRepository) {
            throw new Error('UserRepository must be provided.');
        }
        this.userRepository = userRepository;
    }

    /**
     * Retorna todos os usuários no formato para cliente.
     * @returns Um array de objetos de usuário no formato de cliente.
     */
    async getAllUsers(): Promise<Omit<IUser, 'hash_senha' | 'data_atualizacao' | 'email_verificado'>[]> {
        // O repositório já retorna no formato toClientJSON()
        return await this.userRepository.findAll();
    }

    /**
     * Busca um usuário pelo ID.
     * @param id O ID do usuário (string ou número).
     * @returns Uma instância de User no formato de cliente.
     * @throws CustomError se o usuário não for encontrado.
     */
    async getById(id: string | number): Promise<Omit<IUser, 'hash_senha' | 'data_atualizacao' | 'email_verificado'>> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            // Lança um CustomError para ser pego pelo errorHandler
            const error = new Error('User not found.') as CustomError;
            error.statusCode = 404; // Not Found
            error.path = `/users/${id}`; // Adiciona o path para o errorHandler
            throw error;
        }
        return user; // O findById já retorna no formato toClientJSON()
    }

    /**
     * Cria um novo usuário.
     * @param userData Dados para criação do usuário.
     * @returns A instância completa do User criado.
     * @throws CustomError se o email já estiver em uso.
     */
    async createUser(userData: Pick<IUser, 'username' | 'email' | 'hash_senha' | 'role'>): Promise<User> {
        // Validações de dados básicos
        if (!userData.username || !userData.email || !userData.hash_senha) {
            const error = new Error('Username, email, and password are required.') as CustomError;
            error.statusCode = 400; // Bad Request
            throw error;
        }

        // Verifica se o email já existe para evitar duplicatas
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            const error = new Error('Email already in use.') as CustomError;
            error.statusCode = 409; // Conflict
            error.path = `/users/create`; // Exemplo de path
            throw error;
        }

        return await this.userRepository.create(userData);
    }

    /**
     * Deleta um usuário.
     * @param email O email do usuário a ser deletado.
     * @returns True se o usuário foi deletado com sucesso, false caso contrário.
     * @throws CustomError se o usuário não for encontrado ou se houver falha na exclusão.
     */
    async deleteUser(email: string): Promise<boolean> {
        // Validação básica do email
        if (typeof email !== 'string' || email.trim() === '') {
            const error = new Error('Email must be a non-empty string.') as CustomError;
            error.statusCode = 400; // Bad Request
            throw error;
        }

        // Verifica se o usuário existe antes de tentar deletar
        const userToDelete = await this.userRepository.findByEmail(email);
        if (!userToDelete) {
            const error = new Error('User not found for deletion.') as CustomError;
            error.statusCode = 404; // Not Found
            error.path = `/users/delete?email=${email}`; // Adiciona o path
            throw error;
        }

        try {
            const isDeleted = await this.userRepository.delete(email);

            if (isDeleted) {
                console.log(`Usuário com email '${email}' deletado com sucesso.`);
                return true;
            } else {
                // Se o repositório retornar false (e não lançar erro), é uma falha interna
                const error = new Error('Failed to delete user.') as CustomError;
                error.statusCode = 500; // Internal Server Error
                throw error;
            }
        } catch (err: any) {
            console.error(`[UserService deleteUser] Falha ao deletar usuário com email '${email}':`, err);
            // Relança o erro para ser pego pelo errorHandler, garantindo o tipo CustomError
            const customErr = err instanceof Error ? (err as CustomError) : new Error('Unknown error during user deletion.') as CustomError;
            customErr.statusCode = customErr.statusCode || 500; // Garante um statusCode
            throw customErr;
        }
    }

    /**
     * Atualiza a role de um usuário.
     * @param userId O ID do usuário.
     * @param newRole A nova role.
     * @returns O usuário atualizado no formato de cliente, ou null se não encontrado.
     * @throws CustomError se a role for inválida ou usuário não encontrado.
     */
    async updateRole(userId: string | number, newRole: IUser['role']): Promise<Omit<IUser, 'hash_senha' | 'data_atualizacao' | 'email_verificado'> | null> {
        // Validação da role
        const validRoles: IUser['role'][] = ['admin', 'user', 'guest'];
        if (!validRoles.includes(newRole)) {
            const error = new Error(`Invalid role: '${newRole}'. Valid roles are: ${validRoles.join(', ')}.`) as CustomError;
            error.statusCode = 400; // Bad Request
            throw error;
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            const error = new Error(`User with ID '${userId}' not found.`) as CustomError;
            error.statusCode = 404; // Not Found
            error.path = `/users/role?id=${userId}`; // Exemplo de path
            throw error;
        }

        return await this.userRepository.updateRole(userId, newRole);
    }

    /**
     * Atualiza a data do último login para um usuário.
     * @param username O nome de usuário.
     * @returns Objeto com username e ultimo_login atualizados, ou null.
     * @throws CustomError se o username for inválido.
     */
    async updateLastLogin(username: string): Promise<Pick<IUser, 'username' | 'ultimo_login'> | null> {
        if (typeof username !== 'string' || username.trim() === '') {
            const error = new Error('Username must be a non-empty string.') as CustomError;
            error.statusCode = 400; // Bad Request
            throw error;
        }
        return await this.userRepository.updateLastLogin(username);
    }
}