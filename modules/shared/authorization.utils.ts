import jwt, { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken'; // Importa tipos específicos do jsonwebtoken

// 1. Defina a interface para o objeto de configuração
// Certifique-se de que seu arquivo 'config.ts' exporta um objeto que adere a esta interface
interface AppConfig {
    jwtSecret: string; // A chave secreta do JWT
    EXPIRATION: string; // A duração da expiração, como '1h', '7d', '30m' ou número de segundos
    // Adicione outras propriedades de configuração se existirem
}
// 2. Importe a configuração. Se config.ts for um arquivo TS, não use .js
import { config } from './config'; // Assumindo que config.ts exporta a constante 'config'

// Defina a interface para o payload do JWT que você está gerando
export interface JwtUserPayload {
    id: string | number;
    email: string;
    username: string;
    role: string;
    // jwt.sign adicionará 'iat' e 'exp' automaticamente
}

// Defina a interface para o payload decodificado (o que verifyToken retorna)
// Ela inclui o payload do usuário MAIS as propriedades padrão do JWT (iat, exp)
export interface DecodedUserPayload extends JwtUserPayload {
    iat: number; // Issued At (timestamp)
    exp: number; // Expiration Time (timestamp)
}


/**
 * Gera um token JWT para o usuário fornecido.
 * @param userPayload O payload do usuário para incluir no token.
 * @returns O token JWT gerado (string).
 */
export function generateToken(userPayload: JwtUserPayload): string {
    // O payload já está formatado corretamente como JwtUserPayload
    const payload = {
        id: userPayload.id,
        email: userPayload.email,
        username: userPayload.username,
        role: userPayload.role
    };

    // CORREÇÕES AQUI:
    // 1. config.jwtSecret deve ser tipado como 'Secret' do jsonwebtoken.
    // 2. expiresIn espera uma STRING (ex: "1h", "7d") ou um número de segundos.
    //    Não use `String()`, apenas passe a string diretamente de `config.EXPIRATION`.
    const signOptions: SignOptions = {
        expiresIn: config.EXPIRATION as SignOptions['expiresIn'], // Já deve ser uma string como "1h" ou "7d"
        // algorithm: 'HS256', // Opcional: Especifique o algoritmo
    };

    return jwt.sign(payload, config.jwtSecret as Secret, signOptions);
}

/**
 * Verifica e decodifica um token JWT.
 * @param token O token JWT a ser verificado.
 * @returns O payload decodificado do token.
 * @throws Error se o token for inválido ou expirado.
 */
export function verifyToken(token: string): DecodedUserPayload {
    try {
        // CORREÇÃO AQUI:
        // 1. O segundo argumento também precisa ser tipado como 'Secret'.
        // 2. O retorno de jwt.verify pode ser string, object ou JsonWebTokenError.
        //    Precisamos garantir que é um objeto e depois tipá-lo como DecodedUserPayload.
        const decoded = jwt.verify(token, config.jwtSecret as Secret);

        if (typeof decoded === 'string') {
            throw new Error('Token inválido: formato inesperado (string).');
        }

        // Você pode adicionar mais validações aqui se precisar,
        // ex: verificar se o token não está revogado, se 'exp' é válido.
        return decoded as DecodedUserPayload; // Cast para sua interface DecodedUserPayload

    } catch (err: any) {
        // Lidar com diferentes tipos de erro do JWT
        if (err.name === 'TokenExpiredError') {
            throw new Error('Token expirado.'); // Lança um novo erro com mensagem customizada
        }
        if (err.name === 'JsonWebTokenError') {
            throw new Error('Token inválido ou malformado.'); // Lança um novo erro
        }
        // Para outros erros desconhecidos durante a verificação
        throw new Error(`Erro ao verificar token: ${err.message || 'Erro desconhecido.'}`);
    }
}