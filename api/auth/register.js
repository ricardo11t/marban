import { sql } from '../../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler';
import UserRepository from '../modules/users/user.repository.js';
import AuthService from '../modules/auth/auth.service.js';
import AuthController from '../modules/auth/auth.controller.js';

const userRepository = new UserRepository(sql);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            await authController.register(req, res);
        } catch (err) {
            errorHandler(err, res);
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}