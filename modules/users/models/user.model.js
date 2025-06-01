export default class User {
    constructor({ id, username, email, hash_senha, role, data_criacao, data_atualizacao, ativo, ultimo_login, email_verificado }) { // Alterado aqui
        this.id = id;
        this.username = username; // Alterado aqui
        this.email = email;
        this.hash_senha = hash_senha;
        this.role = role;
        this.data_criacao = data_criacao;
        this.data_atualizacao = data_atualizacao;
        this.ativo = ativo;
        this.ultimo_login = ultimo_login;
        this.email_verificado = email_verificado;
    }

    toClientJSON() {
        return {
            id: this.id,
            username: this.username, // Alterado aqui
            email: this.email,
            role: this.role,
            ativo: this.ativo,
            ultimo_login: this.ultimo_login,
            data_criacao: this.data_criacao
        };
    }

    getFullData() { // Para uso interno do backend
        return {
            id: this.id,
            username: this.username, // Alterado aqui
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