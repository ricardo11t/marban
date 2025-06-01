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
        const { email, senha } = req.body;
        if (!email || !senha) {
            const error = new Error('Email and password are obrigatory.');
            error.statusCode = 400;
            throw error;
        }

        const { token, user } = await this.authService.login(email, senha);

        res.status(200).json({
            message: 'Successful login',
            token,
            user
        })
    }
}