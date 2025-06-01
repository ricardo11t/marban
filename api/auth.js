import { sql } from '../modules/shared/db';
import errorHandler from '../modules/shared/errorHandler';

import UserRepository from '../modules/users/user.repository.js';
import AuthService from '../modules/auth/auth.service';
import AuthController from '../moduler/auth/auth.controller';

const userRepository = new UserRepository(sql);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

export default async function handler(req, res) {
    try {
        if (req.method === 'POST') {
            if (req.url.includes('/cadastro')) {
                await authController.register(req, res);
            } else if (req.url.includes('/login')) {
                await authController.login(req, res);
            } else {
                res.status(404).json({ message: 'Endpoint not found in /api/auth.' });
            }
        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed.`);
        }
    } catch (err) {
        errorHandler(err, res);
    }
}