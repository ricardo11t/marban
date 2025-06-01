import { sql } from '../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler.js';
import { verifyTokenAndExtractUser, isAdmin } from '../modules/shared/authorization.utils.js'; // Importe as novas funções

import UserRepository from '../modules/users/user.repository.js';
import UserService from '../modules/users/user.service.js';
import UserController from '../modules/users/user.controller.js';

// Injeção de Dependência
const userRepository = new UserRepository(sql);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export default async function handler(req, res) {
    try {
        const userDataFromToken = verifyTokenAndExtractUser(req); // Etapa 1: Autenticação (quem é você?)

        // Etapa 2: Autorização (o que você pode fazer?)
        if (req.method === 'GET') {
            // Exemplo: Apenas admins podem listar todos os usuários
            isAdmin(userDataFromToken); // Lança erro 403 se não for admin
            if (req.query.id) {
                // Se buscar por ID, talvez um usuário comum possa ver seu próprio perfil,
                // ou um admin possa ver qualquer um. Adicionar essa lógica se necessário.
                // Ex: if (userDataFromToken.role === 'admin' || userDataFromToken.userId === parseInt(req.query.id))
                await userController.getUserById(req, res); // Ajuste o controller para usar o ID do token se for para o próprio usuário
            } else {
                await userController.getAllUsers(req, res);
            }
        } else if (req.method === 'DELETE') {
            // Exemplo: Apenas admins podem deletar usuários
            isAdmin(userDataFromToken); // Lança erro 403 se não for admin
            // O controller.delete precisará do ID do usuário a ser deletado (via req.query ou req.body)
            await userController.deleteUser(req, res);
        }
        // Adicione lógica para POST e PUT com as verificações de role apropriadas
        // Ex: Usuários comuns podem atualizar seu próprio perfil, admins podem atualizar qualquer um.
        else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']); // Atualize conforme os métodos implementados
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        errorHandler(error, res); // O errorHandler pegará erros 401 (não autenticado) e 403 (não autorizado)
    }
}