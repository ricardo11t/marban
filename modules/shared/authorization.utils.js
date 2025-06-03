import jwt from 'jsonwebtoken';
import config from './config.js'; // Para JWT_SECRET
import errorHandler from '../shared/errorHandler.js';

/**
 * Verifica o token JWT do header Authorization da requisição e retorna o payload do usuário.
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

    // Extrai o token do header (removendo o prefixo "Bearer ")
    const token = authHeader.substring(7); 

    try {
        // Verifica o token usando a chave secreta
        // Certifique-se que config.jwtSecret ou process.env.JWT_SECRET está acessível e definido
        const decoded = jwt.verify(token, config.jwtSecret || process.env.JWT_SECRET);
        return decoded; // ex: { userId: ..., email: ..., role: 'admin', iat: ..., exp: ... }
    } catch (err) {
        const error = new Error('Token inválido ou expirado.');
        error.statusCode = 401; // Unauthorized
        if (err.name === 'TokenExpiredError') {
            error.message = 'Sessão expirada, por favor faça login novamente.';
        } else if (err.name === 'JsonWebTokenError') {
            error.message = 'Token inválido.';
        }
        // Você pode querer logar o erro original 'err' no servidor para debugging
        // logger.error('Falha na verificação do JWT:', err);
        throw error;
    }
}


export function requireAuth(req, res, next) {
    try {
        req.user = verifyTokenAndExtractUser(req);
        next();
    } catch (err) {
        errorHandler(err, res);
    }
}

export function requireAdmin(req, res, next) {
    try {
        req.user = verifyTokenAndExtractUser(req);
        isAdmin(req.user);
        next();
    } catch (err) {
        errorHandler(err, res);
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

export function authMiddleware(req, res, next) {
    const isPreview = process.env.VERCEL_ENV === 'preview';

    if (isPreview) {
        return next(); // pula autenticação no preview
    }

    const token = req.headers.authorization;

    if (!token || token !== 'seu-token-aqui') {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    next();
  }