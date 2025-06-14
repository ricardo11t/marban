import bcrypt from "bcryptjs";
// Corrigido o caminho para corresponder à nossa estrutura de arquivos anterior.
// Supondo que 'authService.js' está agora no mesmo nível que este arquivo.
import { generateToken, JwtUserPayload } from '../shared/authorization.utils';
import  UserRepository from '../users/user.repository';

export default class AuthService {
    public userRepository: UserRepository;
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
        // Esses logs são ótimos para depuração!
        console.log('[AuthService CONSTRUCTOR] userRepository recebido:', this.userRepository);
        if (this.userRepository) {
            console.log('[AuthService CONSTRUCTOR] typeof this.userRepository.findByEmail:', typeof this.userRepository.findByEmail);
        }
    }

    /**
     * Registra um novo usuário no sistema.
     * @param {object} userData - Dados do usuário { username, email, senha }.
     * @returns {Promise<object>} O usuário criado.
     * @throws {Error} Se o email já estiver cadastrado.
     */
    async register(userData: { username: string; email: string; senha: string; role?: string }): Promise<any> {
        const { username, email, senha, role } = userData;

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            const error = new Error('Este email já está cadastrado.');
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hash_senha = await bcrypt.hash(senha, salt);

        const allowedRoles = ['user', 'admin', 'guest'] as const;
        const userRole: "user" | "admin" | "guest" = allowedRoles.includes(role as any) ? (role as "user" | "admin" | "guest") : 'user';
        return await this.userRepository.create({ username, email, hash_senha, role: userRole });
    }

    /**
     * Autentica um usuário e retorna um token JWT.
     * @param {string} email - O email do usuário.
     * @param {string} senha - A senha do usuário.
     * @returns {Promise<object>} Um objeto contendo o token e informações do usuário.
     * @throws {Error} Se as credenciais forem inválidas ou a conta estiver inativa.
     */
    async login(email: string, senha: string): Promise<any> {
        console.log(`[AuthService LOGIN] Tentando login para o email: ${email}`);
        if (this.userRepository) {
            console.log('[AuthService LOGIN] typeof this.userRepository.findByEmail:', typeof this.userRepository.findByEmail);
        }

        const userInstance = await this.userRepository.findByEmail(email);

        if (!userInstance || !userInstance.hash_senha) {
            const error = new Error('Credenciais inválidas.');
            throw error;
        }

        const user = userInstance.getFullData ? userInstance.getFullData() : userInstance;

        if (!user.ativo) {
            const error = new Error('Esta conta está desativada.');
            throw error;
        }

        const isMatch = await bcrypt.compare(senha, user.hash_senha);
        if (!isMatch) {
            const error = new Error('Credenciais inválidas.');
            throw error;
        }

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        };

        const token = generateToken(payload as JwtUserPayload);

        const { hash_senha, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    }
}