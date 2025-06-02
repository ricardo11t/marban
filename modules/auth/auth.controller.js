export default class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    async register(req, res) {
        const { username, email, senha} = req.body;
        if (!username || !email || !senha) {
            const error = new Error('Username, Email and Password are obrigatory.');
            error.statusCode = 400;
            throw error;
        }

        const result = await this.authService.register( {username, email, senha} );

        res.status(201).json({ message: 'User successfully registered.', user: result });
    }

    async login(req, res) {
        // O Next.js/Vercel geralmente já faz o parse do corpo JSON para req.body
        // Adicione um log aqui para ver o que está chegando:
        console.log("REQ.BODY no AuthController.login:", req.body);

        const { email, password } = req.body; // A API espera 'email' e 'password' ou 'email' e 'senha'?
        if (!email || !password) {
            const error = new Error('Email and password are obrigatory.'); // Mensagem original
            error.statusCode = 400;
            throw error;
        }

        const { token, user } = await this.authService.login(email, password);

        res.status(200).json({
            message: 'Successful login',
            token,
            user
        })
    }
}