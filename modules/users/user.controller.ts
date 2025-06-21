import { Request, Response } from "express";
import errorHandler from "../shared/errorHandler.js";
import responseHandler from "../shared/responseHandler.js";
import UserService from "./user.service.js";

export default class UserController {
    public userService: UserService;
    constructor (userService: UserService) {
        this.userService = userService;
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.createUser = this.createUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    async getAllUsers(req: Request, res: Response) {
        const users = await this.userService.getAllUsers();
        responseHandler.success(res, users, 'Users had a succesfully get.')
    }

    async getUserById(req: Request, res: Response) {
        const { id } = req.query;
        if (!id) {
            const error = new Error('User id is required.');
            return errorHandler(error, res, req);
        }
        // If id is an array, take the first element
        const userId = Array.isArray(id) ? id[0] : id;
        // Ensure userId is string or number
        let parsedId: string | number;
        if (typeof userId === 'string' && !isNaN(Number(userId))) {
            parsedId = Number(userId);
        } else if (typeof userId === 'string') {
            parsedId = userId;
        } else {
            const error = new Error('Invalid user id type.');
            return errorHandler(error, res, req);
        }
        const user = await this.userService.getById(parsedId);
        responseHandler.success(res, user, 'User had a successfully get.');
    }

    async createUser(req: Request, res: Response) {
        const newUser = await this.userService.createUser(req.body);
        responseHandler.created(res, newUser, 'User successfully created.');
    }

    async updateUserRole(req: Request, res: Response) {
        const currentUserData = localStorage.getItem('userData');
        const currentUser = currentUserData ? JSON.parse(currentUserData) : null;
        const userToUpdate = await this.userService.getById(req.body.id);
        if (userToUpdate && currentUser && userToUpdate.id === currentUser.id) {
            const error = new Error('Não é possível alterar a própria role');
            return errorHandler(error, res, req);
        }

        responseHandler.success(res, userToUpdate, 'User successfully updated.');
    }

    async deleteUser(req: Request, res: Response) {
        const result = await this.userService.deleteUser(req.body);
        responseHandler.success(res, null, 'Usuário deletado com sucesso.');
    }
}