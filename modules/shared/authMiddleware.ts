import { NextFunction, Request, Response } from 'express';
// Ajuste o caminho para 'authorization.utils' se ele não estiver no mesmo diretório
import { verifyToken } from './authorization.utils'; // Importa a função verifyToken

// --- Funções de Middleware ---

export function authMiddleware() {
    // Retorna uma função assíncrona para ser usada como middleware do Express
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // Mensagem de erro mais descritiva
                return res.status(401).json({ message: 'Token de autenticação (Bearer) não fornecido ou mal formatado. Formato esperado: "Bearer <token>"' });
            }

            const token = authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ message: 'Token JWT ausente após "Bearer ".' });
            }

            // A função verifyToken deve retornar a interface DecodedUser
            const decoded = verifyToken(token) as DecodedUser; // Garante que 'decoded' tenha o tipo DecodedUser

            // Adiciona a informação do usuário decodificado ao objeto Request
            // Agora 'req.usuario' será tipado corretamente devido ao 'express.d.ts'
            req.usuario = decoded;

            next(); // Continua para o próximo middleware ou rota
        } catch (err: any) { // Captura o erro para enviar uma resposta de erro
            console.error('Erro de autenticação:', err.message); // Log do erro para depuração
            // Retorna um erro 401 para token inválido, expirado, etc.
            return res.status(401).json({ message: `Autenticação falhou: ${err.message}` });
        }
    };
}

export function roleMiddleware(requiredRole: string) { // Renomeado 'role' para 'requiredRole' para clareza
    // Retorna uma função de middleware do Express
    return (req: Request, res: Response, next: NextFunction) => {
        // Verifica se req.usuario existe e se tem uma role
        // A propriedade 'usuario' é opcional ('?'), então checamos sua existência
        if (!req.usuario || !req.usuario.role) {
            return res.status(403).json({ message: 'Acesso negado. Informações de usuário ou permissão não encontradas.' });
        }

        // Compara a role do usuário com a role requerida
        if (req.usuario.role !== requiredRole) {
            return res.status(403).json({ message: `Acesso negado. Requer permissão de '${requiredRole}', mas o usuário tem permissão de '${req.usuario.role}'.` });
        }

        next(); // Continua para o próximo middleware ou rota
    };
}

// --- Função runMiddleware ---
// Esta função é um wrapper para middlewares assíncronos em um contexto como Vercel/Next.js API Routes.
// Ela permite que middlewares assíncronos (que chamam next()) se comportem de forma síncrona para o switch case.
export function runMiddleware(req: Request, res: Response, fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void): Promise<any> {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => { // 'result' aqui pode ser um erro ou null/undefined
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result); // Ou resolve com o resultado do next(), se houver.
        });
    });
}