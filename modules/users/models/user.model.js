export default class User {
    constructor({ id, username, email, hash_senha, role, data_criacao, data_atualizacao, ativo, ultimo_login, email_verificado }) { // Adicionado 'role'
        this.id = id;
        this.username = username;
        this.email = email;
        this.hash_senha = hash_senha; // Lembre-se de não expor isso
        this.role = role; // Nova propriedade
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
            role: this.role, // Expor a role para o cliente pode ser útil
            ativo: this.ativo,
            ultimo_login: this.ultimo_login,
            data_criacao: this.data_criacao
        };
    }

    // Este método é mais para uso interno do backend, por isso pode conter hash_senha
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