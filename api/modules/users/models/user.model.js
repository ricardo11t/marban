export default class User {
    constructor ({ id, username, email, hash_senha, data_criacao, data_atualizacao, ativo, ultimo_login, email_verificado }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.hash_senha = hash_senha;
        this.data_criacao = data_criacao;
        this.data_atualizacao = data_atualizacao;
        this.ativo = ativo;
        this.ultimo_login = ultimo_login;
        this.email_verificado = email_verificado;
    }

    toClientJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            ativo: this.ativo,
            ultimo_login: this.ultimo_login,
            data_criacao: this.data_criacao
        }
    }
}