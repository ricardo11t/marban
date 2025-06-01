import errorHandler from './modules/shared/errorHandler.js';
import { sql } from './modules/shared/db.js'

import RaceRepository from './modules/races/race.repository.js';
import RaceService from './modules/races/race.service.js';
import RaceController from './modules/races/race.controller.js';

const raceRepository = new RaceRepository(sql);
const raceService = new RaceService(raceRepository);
const raceController = new RaceController(raceService);

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            if (req.query.name) {
                await raceController.getByName(req, res);
            } else {
                await raceController.getAll(req, res);
            }
        } else if (req.method === 'POST') {
            await raceController.create(req, res);
        } else if (req.method === 'PUT') {
            await raceController.update(req, res);
        } else if (req.method === 'DELETE') {
            await raceController.delete(req, res);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (err) {
        errorHandler(err, res);
    }
}