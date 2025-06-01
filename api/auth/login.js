import { sql } from '../shared/db.js';
import errorHandler from '../shared/errorHandler.js';
import UserRepository from '../users/user.repository.js';
import AuthService from './auth.service.js';
import AuthController from './auth.service.js';

const userRepository = new UserRepository(sql);
const authService = new AuthService(userRepository);
const authController =  new AuthController(authService);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            await authController.login(req, res);
        } catch (err) {
            errorHandler(err, res);
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed.`);
    }
}