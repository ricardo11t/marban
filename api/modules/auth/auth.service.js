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
            const error = new Error('Email areadly registered.');
            error.statusCode = 409;
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hash_senha = await bcrypt.hash(senha, salt);

        return await this.userRepository.create({username, email, hash_senha})
    };

    async login(email, senha) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.hash_senha) {
            const error = new Error('Wrong credentials.');
            error.statusCode = 401;
            throw error;
        }

        if (!user.ativo) {
            const error = new Error('This account is disabled.');
            error.statusCode = 403;
            throw error;
        }

        const isMatch = await bcrypt.compare(senha, user.hash_senha);
        if (!isMatch) {
            const error = new Error('Wrong credentials.')
            error.statusCode = 401;
            throw error;
        }

        const payload = { userId: user.id, email: user.email };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
        await this.userRepository.updateLastLogin(user.id);

        return { token, user: user.toClientJSON() };
    }
}