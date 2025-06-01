import userController from './modules/users/user.controller';
import authMiddleware from './modules/shared/authMiddleware'; // Exemplo
import errorHandler from './modules/shared/errorHandler';

export default async function handler(req, res) {
    try {
        // Exemplo de como proteger todas as sub-rotas de /api/users
        await authMiddleware(req, res);

        if (req.method === 'GET') {
            if (req.query.id) { // Ex: /api/users?id=123
                await userController.getUserById(req, res);
            } else { // Ex: /api/users
                await userController.getAllUsers(req, res);
            }
        } else if (req.method === 'POST') { // Ex: /api/users
            await userController.createUser(req, res);
        } else if (req.method === 'PUT') { // Ex: /api/users?id=123 (ou id no body)
            await userController.updateUser(req, res);
        } else if (req.method === 'DELETE') { // Ex: /api/users?id=123
            await userController.deleteUser(req, res);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}