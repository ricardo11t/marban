import { sql } from '../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler.js';
import { verifyTokenAndExtractUser, isAdmin } from '../modules/shared/authorization.utils.js';

import ClassRepository from '../modules/classes/class.repository.js' 
import ClassService from '../modules/classes/class.service.js';
import ClassController from '../modules/classes/class.controller.js';

const classRepository = new ClassRepository(sql);
const classService = new ClassService(classRepository);
const classController = new ClassController(classService);

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            if (req.query.name) {
                await classController.getByName(req, res);
            } else {
                await classController.getAll(req, res);
            }
        } else if (req.method === 'POST') {
            const userDataFromToken = verifyTokenAndExtractUser(req);
            isAdmin(userDataFromToken); 
            await classController.create(req, res);
        } else if (req.method === 'PUT') {
            const userDataFromToken = verifyTokenAndExtractUser(req);
            isAdmin(userDataFromToken);
            await classController.update(req, res);
        } else if (req.method === 'DELETE') {
            const userDataFromToken = verifyTokenAndExtractUser(req);
            isAdmin(userDataFromToken);
            await classController.delete(req, res);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}