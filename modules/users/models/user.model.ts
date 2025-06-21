export interface IUser {
    id: string | number;
    username: string;
    email: string;
    hash_senha: string; // Hash da senha, deve ser uma string
    role: 'admin' | 'user' | 'guest'; // Exemplo de enumeração de roles, ajuste conforme seu sistema
    data_criacao: Date | string; // Pode ser Date object ou string ISO (se vier do DB)
    data_atualizacao: Date | string | null; // Pode ser null ou string ISO
    ativo: boolean;
    ultimo_login: Date | string | null; // Pode ser null ou string ISO
    email_verificado: boolean;
}

// 2. Defina uma interface para os dados que o construtor espera
// Pode ser a mesma que IUser ou uma subconjunto se algumas propriedades forem opcionais no construtor
interface UserConstructorParams {
    id: string | number;
    username: string;
    email: string;
    hash_senha: string;
    role: 'admin' | 'user' | 'guest';
    data_criacao: Date | string;
    data_atualizacao: Date | string | null;
    ativo: boolean;
    ultimo_login: Date | string | null;
    email_verificado: boolean;
}

export default class User implements IUser {
    public id: string | number;
    public username: string;
    public email: string;
    public hash_senha: string;
    public role: 'admin' | 'user' | 'guest';
    public data_criacao: Date | string;
    public data_atualizacao: Date | string | null;
    public ativo: boolean;
    public ultimo_login: Date | string | null;
    public email_verificado: boolean;

    constructor({
        id,
        username,
        email,
        hash_senha,
        role,
        data_criacao,
        data_atualizacao,
        ativo,
        ultimo_login,
        email_verificado
    }: UserConstructorParams) { // Tipado o parâmetro do construtor
        // Validações básicas (opcional, mas recomendado para modelos)
        if (typeof id === 'undefined' || id === null) throw new Error('User ID is required.');
        if (typeof username !== 'string' || username.trim() === '') throw new Error('Username is required and must be a string.');
        if (typeof email !== 'string' || !email.includes('@')) throw new Error('Valid email is required.');

        this.id = id;
        this.username = username;
        this.email = email;
        this.hash_senha = hash_senha;
        this.role = role;
        this.data_criacao = data_criacao;
        this.data_atualizacao = data_atualizacao;
        this.ativo = ativo;
        this.ultimo_login = ultimo_login;
        this.email_verificado = email_verificado;
    }

    /**
     * Retorna uma representação do usuário segura para ser enviada ao cliente (sem hash de senha, por exemplo).
     * @returns Um objeto com dados do usuário para o cliente.
     */
    toClientJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            role: this.role,
            ativo: this.ativo,
            ultimo_login: this.ultimo_login,
            data_criacao: this.data_criacao,
            email_verificado: this.email_verificado, // Adicionado aqui, pois parece ser relevante para o cliente
        };
    }

    /**
     * Retorna todos os dados do usuário, incluindo informações sensíveis (como hash de senha).
     * Ideal para uso interno no backend.
     * @returns Um objeto com todos os dados do usuário.
     */
    getFullData() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            hash_senha: this.hash_senha,
            role: this.role,
            ativo: this.ativo,
            ultimo_login: this.ultimo_login,
            data_criacao: this.data_criacao,
            data_atualizacao: this.data_atualizacao,
            email_verificado: this.email_verificado
        };
    }
}