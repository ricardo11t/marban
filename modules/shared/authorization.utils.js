import jwt from 'jsonwebtoken';
import config from './config.js'; // Para JWT_SECRET

/**
 * Verifica o token JWT da requisição e retorna o payload do usuário.
 * Lança um erro se o token for inválido, expirado ou não fornecido.
 * @param {object} req - O objeto de requisição do Next.js/Vercel.
 * @returns {object} O payload decodificado do token (contendo userId, email, role, etc.).
 */
export function verifyTokenAndExtractUser(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('Token de autenticação não fornecido ou malformatado.');
        error.statusCode = 401; // Unauthorized
        throw error;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        return decoded; // ex: { userId: ..., email: ..., role: 'admin' }
    } catch (err) {
        const error = new Error('Token inválido ou expirado.');
        error.statusCode = 401; // Unauthorized
        if (err.name === 'TokenExpiredError') {
            error.message = 'Token expirado.';
        }
        throw error;
    }
}

/**
 * Verifica se o usuário (do payload do token decodificado) possui a role de 'admin'.
 * Lança um erro 403 Forbidden se não for admin.
 * @param {object} userData - O payload do usuário decodificado do token JWT.
 */
export function isAdmin(userData) {
    if (!userData || userData.role !== 'admin') {
        const error = new Error('Acesso negado. Requer privilégios de administrador.');
        error.statusCode = 403; // Forbidden
        throw error;
    }
    // Não retorna nada se for admin, a ausência de erro indica sucesso.
}

/**
 * Função fábrica para criar verificadores de role específicos.
 * @param {string} requiredRole - A role necessária.
 * @returns {function(object): void} Uma função que recebe userData e lança erro se a role não corresponder.
 */
export function hasRole(requiredRole) {
    return function (userData) {
        if (!userData || userData.role !== requiredRole) {
            const error = new Error(`Acesso negado. Requer role '${requiredRole}'.`);
            error.statusCode = 403; // Forbidden
            throw error;
        }
    };
}