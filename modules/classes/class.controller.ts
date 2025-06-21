import { Request, Response } from "express";
import ClassService from "./class.service.js";

export default class ClassController {
    private classService: ClassService;

    constructor(classService: ClassService) {
        this.classService = classService;
        this.getAll = this.getAll.bind(this);
        this.getByName = this.getByName.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async getAll(req: Request, res: Response) {
        const classes = await this.classService.getAllClasses();
        res.status(200).json(classes);
    }

    async getByName(req: Request, res: Response) {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({message: '"name" param is obrigatory.'});
        }
        if (typeof name !== "string") {
            return res.status(400).json({ message: '"name" param must be a string.' });
        }
        const classe = await this.classService.getClassByName(name);
        res.status(200).json(classe);
    }

    async create(req: Request, res: Response) {
        const classData= req.body;
        if (!classData.name) {
            throw { statusCode: 400, message: 'Name field is obigatory.' };
        }
        const newClass = await this.classService.createClass(classData.name, classData.classData);
        res.status(200).json(newClass);
    }

    async update(req: Request, res: Response) {
        const { name: nameFromQuery } = req.query;
        const classDataForUpdate = req.body;

        if (!nameFromQuery) {
            return res.status(400).json({ message: 'Parâmetro "name" na query é obrigatório para identificar a classe a ser atualizada.' });
        }
        if (Object.keys(classDataForUpdate).length === 0) {
            return res.status(400).json({ message: 'Corpo da requisição não pode ser vazio para atualização.' });
        }

        // Chame o método correto do service para ATUALIZAR
        if (typeof nameFromQuery !== "string") {
            return res.status(400).json({ message: 'Parâmetro "name" deve ser uma string.' });
        }
        const updatedClass = await this.classService.updateClass(nameFromQuery, classDataForUpdate);

        res.status(200).json(updatedClass);
    }

    async delete(req: Request, res: Response) {
        console.log('[ClassController delete] Deleting class...', req.query);
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({message: '"name" param is obrigatory.'})
        }
        if (typeof name !== "string") {
            return res.status(400).json({ message: '"name" param must be a string.' });
        }
        const result = await this.classService.deleteClass(name);
        res.status(200).json(result);
    }
}