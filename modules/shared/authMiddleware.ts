// src/modules/shared/authMiddleware.ts
import { NextFunction, Request, Response } from 'express';
import { verifyToken, DecodedUserPayload } from './authorization.utils.js';
import { CustomError } from '../types/custom-errors';

// Extende o objeto Request do Express
interface IUsuarioToken {
    id: number | string;
    email: string;
    username: string;
    role: 'admin' | 'user';
}

declare global {
    namespace Express {
        export interface Request {
            usuario?: IUsuarioToken;
        }
    }
}

// **KEEP THIS FACTORY FUNCTION PATTERN**
export function authMiddleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('Token de autenticação (Bearer) não fornecido ou mal formatado. Formato esperado: "Bearer <token>"') as CustomError;
            error.statusCode = 401;
            console.error('[AuthMiddleware] ERROR: No Auth header or invalid format.');
            return next(error);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            const error = new Error('Token JWT ausente após "Bearer "') as CustomError;
            error.statusCode = 401;
            console.error('[AuthMiddleware] ERROR: Token is empty after split.');
            return next(error);
        }

        try {
            const decoded = verifyToken(token);

            req.usuario = {
                id: decoded.id,
                email: decoded.email,
                username: decoded.username,
                role: decoded.role as 'admin' | 'user'
            };

            next();
        } catch (err: any) {
            const customErr = err instanceof Error ? (err as CustomError) : new Error('Unknown authentication error.') as CustomError;

            if (err.name === 'TokenExpiredError') {
                customErr.message = 'Token de autenticação expirado. Por favor, faça login novamente.';
                customErr.statusCode = 401;
            } else if (err.name === 'JsonWebTokenError') {
                customErr.message = 'Token de autenticação inválido ou corrompido.';
                customErr.statusCode = 401;
            } else {
                customErr.statusCode = customErr.statusCode || 401;
                customErr.message = `Falha na autenticação: ${customErr.message || 'Erro desconhecido.'}`;
            }
            return next(customErr);
        }
    };
}

// roleMiddleware should also be a factory for consistency, as per previous corrections
export function roleMiddleware(requiredRole: 'admin' | 'user') {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.usuario || !req.usuario.role) {
            const error = new Error('Acesso negado. Informações de usuário ou permissão não encontradas.') as CustomError;
            error.statusCode = 403;
            console.error('[RoleMiddleware] ERROR: User info or role missing on request.');
            return next(error);
        }

        if (req.usuario.role !== requiredRole) {
            const error = new Error(`Acesso negado. Requer permissão de '${requiredRole}', mas o usuário tem permissão de '${req.usuario.role}'.`) as CustomError;
            error.statusCode = 403;
            console.error(`[RoleMiddleware] ERROR: Insufficient role. Required: ${requiredRole}, Actual: ${req.usuario.role}`);
            return next(error);
        }
        next();
    };
}