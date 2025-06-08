import errorHandler from '../modules/shared/errorHandler.js';
import { sql } from '../modules/shared/db.js'

import RaceRepository from '../modules/races/race.repository.js';
import RaceService from '../modules/races/race.service.js';
import RaceController from '../modules/races/race.controller.js';
import { authMiddleware, roleMiddleware, runMiddleware } from '../modules/shared/authMiddleware.js';

const raceRepository = new RaceRepository(sql);
const raceService = new RaceService(raceRepository);
const raceController = new RaceController(raceService);

export default async function handler(req, res) {
    try {
        await runMiddleware(req, res, authMiddleware());

        switch (req.method) {
            case 'GET':
                await runMiddleware(req, res, roleMiddleware('user'));

                if (req.query.name) {
                    req.query.name = decodeURIComponent(req.query.name);
                    return raceController.getByName(req, res);
                } else {
                    return raceController.getAll(req, res);
                }

            case 'POST':
                await runMiddleware(req, res, roleMiddleware('admin'));

                if (req.query.name) {
                    req.query.name = decodeURIComponent(req.query.name);
                    return raceController.create(req, res);
                } else {
                    return res.status(400).json({ message: 'O parâmetro "name" é obrigatório para criar uma raça.' });
                }

            case 'PUT':
                await runMiddleware(req, res, roleMiddleware('admin'));
                return raceController.update(req, res);
            case 'DELETE':
                await runMiddleware(req, res, roleMiddleware('admin'));
                return raceController.delete(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (err) {
        errorHandler(err, res);
    }
}