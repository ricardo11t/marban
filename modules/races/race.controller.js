import responseHandler from "../shared/responseHandler.js";

export default class RaceController {
    constructor(raceService) {
        this.raceService = raceService;
        this.getAll = this.getAll.bind(this);
        this.getByName = this.getByName.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req, res) {
        const races = await this.raceService.getAllRaces();
        responseHandler.success(res, races, 200);
    }

    async getByName(req, res) {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: '"Name" Param is obrigatory.' });
        }
        const race = await this.raceService.getRaceByName(name);
        res.status(200).json(race);
    }

    async create(req, res) {
        const raceData = req.body;
        if (!raceData.name) {
            throw {statusCode: 400, message: 'Name text field is obrigatory.'};
        }
        const newRace = await this.raceService.createRace(raceData);
        res.status(201).json(newRace);
    }

    async update(req, res) {
        const { name } = req.query;
        const raceData = req.body;
        if (!name) {
            return res.status(400).json({ message: '"Name" Param in query is obrigatory to identify race to update.' });
        }
        if (Object.keys(raceData).length === 0) {
            return res.status(400).json({ message: 'Request body cannot be empty for update.' });
        }
        const updatedRace = await this.raceService.updateRace(name, raceData);
        res.status(200).json(updatedRace);
    }

    async delete(req, res) {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: '"Name" Param is obrigatory to exclude.' })
        }
        const result = this.raceService.deleteRace(name);
        res.status(200).json(result);
    }
}