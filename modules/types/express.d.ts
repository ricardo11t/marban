// modules/shared/types/express.d.ts (Versão Alternativa)

// A interface permanece a mesma
interface IUsuarioToken {
    id: number;
    email: string;
    role: 'admin' | 'user';
}

// A mudança está aqui: envolvendo em 'declare global'
declare global {
    namespace Express {
        export interface Request {
            usuario?: IUsuarioToken;
        }
    }
  }