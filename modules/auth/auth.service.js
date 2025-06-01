import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import config from '../shared/config';

export default class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async register(userData) {
        const { username, email, senha } = userData;

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            const error = new Error('Este email já está cadastrado.');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hash_senha = await bcrypt.hash(senha, salt);

        // O repositório ou o DB definirão a role como 'user' por padrão
        return await this.userRepository.create({ username, email, hash_senha });
    }

    async login(email, senha) {
        const userInstance = await this.userRepository.findByEmail(email); // Retorna instância de User

        if (!userInstance || !userInstance.hash_senha) {
            const error = new Error('Credenciais inválidas.');
            error.statusCode = 401;
            throw error;
        }
        const user = userInstance.getFullData(); // Pega todos os dados, incluindo role e hash_senha

        if (!user.ativo) {
            const error = new Error('Esta conta está desativada.');
            error.statusCode = 403;
            throw error;
        }

        const isMatch = await bcrypt.compare(senha, user.hash_senha);
        if (!isMatch) {
            const error = new Error('Credenciais inválidas.');
            error.statusCode = 401;
            throw error;
        }

        const payload = {
            userId: user.id,
            email: user.email,
            nomeCompleto: user.nome_completo,
            role: user.role // <<< ADICIONADO A ROLE AO PAYLOAD DO JWT
        };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' }); // Use config.jwtSecret

        // Atualizar ultimo_login (pode ser um método no userRepository)
        // await this.userRepository.updateLastLogin(user.id);

        return { token, user: userInstance.toClientJSON() }; // Retorna dados seguros do usuário
    }
}