import { sql } from '../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler.js';
import { verifyTokenAndExtractUser, isAdmin, authMiddleware } from '../modules/shared/authorization.utils.js'; // Importe as novas funções

import express from 'express';

import UserRepository from '../modules/users/user.repository.js';
import UserService from '../modules/users/user.service.js';
import UserController from '../modules/users/user.controller.js';

const userRepository = new UserRepository(sql);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = express.Router();

router.get('/', authMiddleware, userController.getUserById())

export default async function handler(req, res) {
    try {
        const userDataFromToken = verifyTokenAndExtractUser(req);
        
        if (req.method === 'GET') {
            if (req.query.id) {
                await userController.getUserById(req, res);
            } else {
                await userController.getAllUsers(req, res);
            }
        } else if (req.method = 'POST') {
            isAdmin(userDataFromToken);
            await userController.updateUserRole(req, res);
        } else if (req.method === 'DELETE') {
            isAdmin(userDataFromToken);
            await userController.deleteUser(req, res);
        }
        else {
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}