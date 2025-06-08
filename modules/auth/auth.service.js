import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import config from '../shared/config.js';
import { generateToken } from '../shared/authorization.utils.js';

export default class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        console.log('[AuthService CONSTRUCTOR] userRepository recebido:', this.userRepository);
        if (this.userRepository) {
            console.log('[AuthService CONSTRUCTOR] typeof this.userRepository.findByEmail:', typeof this.userRepository.findByEmail);
        }
    }

    async register(userData) {
        const { username, email, senha } = userData; // Espera username aqui

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            const error = new Error('Este email já está cadastrado.');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hash_senha = await bcrypt.hash(senha, salt);

        return await this.userRepository.create({ username, email, hash_senha }); // Passa username
    }

    async login(email, senha) {
        if (this.userRepository) {
            console.log('[AuthService LOGIN] typeof this.userRepository.findByEmail:', typeof this.userRepository.findByEmail);
        }

        // Linha onde o erro acontece:
        const userInstance = await this.userRepository.findByEmail(email); 

        if (!userInstance || !userInstance.hash_senha) {
            const error = new Error('Credenciais inválidas.');
            error.statusCode = 401;
            throw error;
        }
        const user = userInstance.getFullData();

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
            username: user.username,
            role: user.role // <<< ADICIONADO A ROLE AO PAYLOAD DO JWT
        };
        
        const token = 

        return { token, user: userInstance.toClientJSON() }; // Retorna dados seguros do usuário
    }
}