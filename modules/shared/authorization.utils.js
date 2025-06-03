import jwt from 'jsonwebtoken';
import config from './config.js'; // Para JWT_SECRET
import errorHandler from '../shared/errorHandler.js';

/**
 * Verifica o token JWT da requisição e retorna o payload do usuário.
 * Lança um erro se o token for inválido, expirado ou não fornecido.
 * @param {object} req - O objeto de requisição do Next.js/Vercel.
 * @returns {object} O payload decodificado do token (contendo userId, email, role, etc.).
 */
export function verifyTokenAndExtractUser(req) {
    console.log('[AuthUtil] Headers recebidos pela função verifyToken:', JSON.stringify(req.headers));

    // Node.js (e frameworks como Express/Next.js API routes)
    // geralmente normalizam os nomes dos headers para minúsculas.
    const authHeader = req.headers['authorization']; // Acessar com colchetes e minúsculas é mais seguro

    console.log('[AuthUtil] Valor do header "authorization":', authHeader);

    if (!authHeader) {
        console.error('[AuthUtil] Erro: Cabeçalho "authorization" não encontrado.');
        const error = new Error('Token de autenticação não fornecido.');
        error.statusCode = 401;
        throw error;
    }

    if (!authHeader.startsWith('Bearer ')) {
        console.error('[AuthUtil] Erro: Cabeçalho "authorization" não começa com "Bearer ". Valor recebido:', authHeader);
        const error = new Error('Formato do token de autenticação inválido.');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    console.log('[AuthUtil] Token extraído:', token);

    try {
        const decoded = jwt.verify(token, config.jwtSecret || process.env.JWT_SECRET);
        console.log('[AuthUtil] Token decodificado com sucesso:', decoded);
        return decoded;
    } catch (err) {
        console.error('[AuthUtil] Erro ao verificar JWT:', err.name, err.message);
        const error = new Error('Token inválido ou expirado.');
        error.statusCode = 401;
        if (err.name === 'TokenExpiredError') {
            error.message = 'Sessão expirada, por favor faça login novamente.';
        } else if (err.name === 'JsonWebTokenError') {
            error.message = 'Token de autenticação inválido.';
        }
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