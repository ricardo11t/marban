import { sql } from '../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler.js';

import ClassRepository from '../modules/classes/class.repository.js';
import ClassService from '../modules/classes/class.service.js';
import ClassController from '../modules/classes/class.controller.js';
import { authMiddleware, roleMiddleware, runMiddleware } from '../modules/shared/authMiddleware.js';

const classRepository = new ClassRepository(sql);
const classService = new ClassService(classRepository);
const classController = new ClassController(classService);

export default async function handler(req, res) {
    try {
        await runMiddleware(req, res, authMiddleware());

        switch (req.method) {
            case 'GET':
                await runMiddleware(req, res, roleMiddleware('user'));

                if (req.query.name) {
                    req.query.name = decodeURIComponent(req.query.name);
                    return classController.getByName(req, res);
                } else {
                    return classController.getAll(req, res);
                }

            case 'POST':
                await runMiddleware(req, res, roleMiddleware('admin'));

                if (req.query.name) {
                    req.query.name = decodeURIComponent(req.query.name);
                    return classController.create(req, res);
                } else {
                    return res.status(400).json({ message: 'O parâmetro "name" é obrigatório para criar uma classe.' });
                }

            case 'PUT':
                await runMiddleware(req, res, roleMiddleware('admin'));
                return classController.update(req, res);

            case 'DELETE':
                await runMiddleware(req, res, roleMiddleware('admin'));
                return classController.delete(req, res);

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        errorHandler(error, res);
    }
}