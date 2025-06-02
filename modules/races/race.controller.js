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
            return res.status(400).json({ message: '"Name" Param is obrigatory.'});
        }
        const race = await this.raceService.getRaceByName();
        res.status(200).json(race);
    }

    async create(req, res) {
        const raceData = req.body;
        if (!raceData.name) {
            throw {statusCode: 400, message: 'Name text field is obrigatory.'};
        }
        const newRace = await this.raceService.createRace(raceData);
        res.status(200).json(newRace);
    }

    async update(req, res) {
        const { name, stats } = req.query;
        if (!name) {
            return res.status(400).json({ message: '"Name" Param is obrigatory to exclude.' })
        }
        const result = this.raceService.updateRace(name, stats);
        res.status(200).json(result);
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