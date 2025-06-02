import errorHandler from "../shared/errorHandler.js";
import responseHandler from "../shared/responseHandler.js";

export default class UserController {
    constructor (userService) {
        this.userService = userService;
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.createUser = this.createUser.bind(this);
    }

    async getAllUsers(req, res) {
        const users = await this.userService.getAllUsers();
        responseHandler.success(res, users, 'Users had a succesfully get.')
    }

    async getUserById(req, res) {
        const { id } = req.query;
        const user = await this.userService.getUserById(id);
        responseHandler.success(res, user, 'User had a successfully get.');
    }

    async createUser(req, res) {
        const newUser = await this.userService.createUser(req.body);
        responseHandler.created(res, newUser, 'User successfully created.');
    }

    async updateUserRole(req, res) {
        const currentUser = localStorage.getItem('userData');
        const userToUpdate = await this.userService.getUserById(req.body);
        if (userToUpdate ===  currentUser) {
            const error = new Error('Não é possível alterar a própria role');
            error.statusCode = 400;
            return errorHandler(error, res, req);
        }

        responseHandler.success(res, user, 'User successfully updated.');
    }

    async deleteUser(req, res) {
        
    }
}