export default class ClassController {
    constructor(classService) {
        this.classService = classService;
        this.getAll = this.getAll.bind(this);
        this.getByName = this.getByName.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req, res) {
        const classes = await this.classService.getAllClasses();
        res.status(200).json(res, classes, 200);
    }

    async getByName(req, res) {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({message: '"name" param is obrigatory.'});
        }
        const classe = await this.classService.getByName(name);
        res.status(200).json(classe);
    }

    async create(req, res) {
        const classData= req.body;
        if (!classData.name) {
            throw { statusCode: 400, message: 'Name field is obigatory.' };
        }
        const newClass = await this.classService.createClass(classData);
        res.status(200).json(newClass);
    }

    async update(req, res) {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({message: '"name" param is obrigatory.'})
        }
        const classData = req.body;
        const updatedClass = await this.classService.createClass(name, classData);
        res.status(200).json(updatedClass);
    }

    async delete(req, res) {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({message: '"name" param is obrigatory.'})
        }
        const result = this.classService.deleteClass(name);
        res.status(200).json(result);
    }
}