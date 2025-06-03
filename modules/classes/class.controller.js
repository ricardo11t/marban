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
        res.status(200).json(classes);
    }

    async getByName(req, res) {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({message: '"name" param is obrigatory.'});
        }
        const classe = await this.classService.getClassByName(name);
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
        const { name: nameFromQuery } = req.query; // Nome da classe a ser atualizada (identificador)
        const classDataForUpdate = req.body;   // Novos dados para a classe

        if (!nameFromQuery) {
            return res.status(400).json({ message: 'Parâmetro "name" na query é obrigatório para identificar a classe a ser atualizada.' });
        }
        if (Object.keys(classDataForUpdate).length === 0) {
            return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio para atualização.' });
        }

        // Chame o método correto do service para ATUALIZAR
        const updatedClass = await this.classService.updateClass(nameFromQuery, classDataForUpdate);

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