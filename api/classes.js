import { sql } from '../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler.js';
import { verifyTokenAndExtractUser, isAdmin } from '../modules/shared/authorization.utils.js';

import ClassRepository from '../modules/classes/class.repository.js'; // Supondo que você criou estes
import ClassService from '../modules/classes/class.service.js';
import ClassController from '../modules/classes/class.controller.js';

const classRepository = new ClassRepository(sql);
const classService = new ClassService(classRepository);
const classController = new ClassController(classService);

export default async function handler(req, res) {
    try {
        const userDataFromToken = verifyTokenAndExtractUser(req); // Todos os endpoints de classes exigem login

        if (req.method === 'GET') {
            // Qualquer usuário logado pode ver as classes
            if (req.query.name) {
                await classController.getByName(req, res);
            } else {
                await classController.getAll(req, res);
            }
        } else if (req.method === 'POST') {
            isAdmin(userDataFromToken); // Apenas admin pode criar
            await classController.create(req, res);
        } else if (req.method === 'PUT') {
            isAdmin(userDataFromToken); // Apenas admin pode atualizar
            await classController.update(req, res);
        } else if (req.method === 'DELETE') {
            isAdmin(userDataFromToken); // Apenas admin pode deletar
            await classController.delete(req, res);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}