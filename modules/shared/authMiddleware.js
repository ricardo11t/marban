import { verifyToken } from './authService.js';

export function authMiddleware() {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({message: 'Token de autenticação não fornecido no header.'});
            }
            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({message: 'Token de autenticação não fornecido.'});
            }
            const decoded = verifyToken(token);
            req.usuario = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ erro: 'Token inválido ou expirado.', message: err.message})
        }
    }
}

export function roleMiddleware(role) {
    return (req, res, next) => {
        if (!req.usuario || !req.usuario.role) {
            return res.status(403).json({ message: 'Acesso negado. Usuário não autenticado.' });
        }
        if (req.usuario.role !== role) {
            return res.status(403).json({ message: `Acesso negado. Usuário não possui a permissão necessária: ${role}.` });
        }
        next();
    }
}