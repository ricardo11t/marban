import { Request, Response } from "express";
import AuthService from "./auth.service";

export default class AuthController {
    public authService: AuthService;
    constructor(authService: AuthService) {
        this.authService = authService;
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
    }

    async register(req: Request, res: Response) {
        let { username, email, senha, role} = req.body;
        if (!username || !email || !senha) {
            const error = new Error('Username, Email and Password are obrigatory.');
            throw error;
        }
        if (!role) {
            role = 'user';
        }

        const result = await this.authService.register( {username, email, senha, role} );

        res.status(201).json({ message: 'User successfully registered.', user: result });
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        if (!email || !password) {
            const error = new Error('Campos de email e senha são obrigatórios.'); // Mensagem original
            throw error;
        }

        const { token, user } = await this.authService.login(email, password);

        res.status(200).json({
            message: 'Login efetuado com sucesso.',
            token,
            user
        })
    }
}