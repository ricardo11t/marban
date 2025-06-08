import { sql } from '../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler.js';

import express from 'express';

import UserRepository from '../modules/users/user.repository.js';
import UserService from '../modules/users/user.service.js';
import UserController from '../modules/users/user.controller.js';
import { authMiddleware, roleMiddleware, runMiddleware } from '../modules/shared/authMiddleware.js';

const userRepository = new UserRepository(sql);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = express.Router();

router.get('/', userController.getUserById())

export default async function handler(req, res) {
    try {
        await runMiddleware(req, res, authMiddleware());

        if (req.method === 'GET') {
            runMiddleware(req, res, roleMiddleware('admin'));
            if (req.query.id) {
                await userController.getUserById(req, res);
            } else {
                await userController.getAllUsers(req, res);
            }
        } else if (req.method === 'POST') {
            runMiddleware(req, res, roleMiddleware('admin'));
            await userController.updateUserRole(req, res);
        } else if (req.method === 'DELETE') {
            runMiddleware(req, res, roleMiddleware('admin'));
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