import { NextFunction, Request, Response } from 'express';
// Caminho para authorization.utils (no mesmo diretório shared)
import { verifyToken, DecodedUserPayload } from './authorization.utils.js';
// CORREÇÃO FINAL AQUI: Caminho para CustomError
import { CustomError } from '../types/custom-errors'; // <--- AQUI ESTÁ O CAMINHO CORRETO

// Estende o objeto Request do Express (certifique-se de que src/types/express.d.ts existe e é similar a isto)
interface IUsuarioToken {
    id: number | string; // Aceita número OU string
    email: string;
    role: 'admin' | 'user';
  }

declare global {
    namespace Express {
        export interface Request {
            usuario?: IUsuarioToken;
        }
    }
  }

export function authMiddleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                const error = new Error('Token de autenticação (Bearer) não fornecido ou mal formatado. Formato esperado: "Bearer <token>"') as CustomError;
                error.statusCode = 401; // Unauthorized
                throw error;
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                const error = new Error('Token JWT ausente após "Bearer "') as CustomError;
                error.statusCode = 401; // Unauthorized
                throw error;
            }

            const decoded = verifyToken(token);

            req.usuario = decoded as IUsuarioToken;

            next();
        } catch (err: any) {
            console.error('Erro de autenticação no authMiddleware:', err.message);

            const customErr = err instanceof Error ? (err as CustomError) : new Error('Unknown authentication error.') as CustomError;
            customErr.statusCode = customErr.statusCode || 401;
            throw customErr;
        }
    };
}

export function roleMiddleware(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.usuario || !req.usuario.role) {
            const error = new Error('Acesso negado. Informações de usuário ou permissão não encontradas.') as CustomError;
            error.statusCode = 403; // Forbidden
            throw error;
        }

        if (req.usuario.role !== requiredRole) {
            const error = new Error(`Acesso negado. Requer permissão de '${requiredRole}', mas o usuário tem permissão de '${req.usuario.role}'.`) as CustomError;
            error.statusCode = 403; // Forbidden
            throw error;
        }

        next();
    };
}

export function runMiddleware(req: Request, res: Response, fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void): Promise<any> {
    return new Promise((resolve, reject) => {
        const customNext: NextFunction = (err?: any) => {
            if (err) {
                return reject(err);
            }
            return resolve(undefined);
        };

        const result = fn(req, res, customNext);

        if (result instanceof Promise) {
            result.then(() => { }).catch(reject);
        }
    });
}