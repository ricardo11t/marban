// src/modules/classes/class.service.ts

import ClassRepository from "./class.repository";
import ClassModel, { IClass } from './models/class.model'; // Importe o modelo e a interface da classe
import { CustomError } from '../types/custom-errors'; // Importa a interface CustomError

export default class ClassService {
    public classRepository: ClassRepository;

    constructor(classRepository: ClassRepository) {
        if (!classRepository) {
            throw new Error('ClassRepository is required');
        }
        this.classRepository = classRepository;
    }

    /**
     * Retorna todas as classes, convertidas para o formato de cliente.
     * @returns Um array de objetos de classe no formato de cliente.
     */
    async getAllClasses(): Promise<IClass[]> {
        const classes = await this.classRepository.findAll();
        if (!classes) { // Se findAll retornar null (nenhuma classe)
            return [];
        }
        // CORREÇÃO: classes.map(classe => classe.toClientJSON());
        // `classes` é um array de ClassModel, então mapeie diretamente
        return classes.map((classe: {name: string, bonus: object, tipo: object}) => classe);
    }

    /**
     * Busca uma classe pelo nome, retornando-a no formato de cliente.
     * @param name O nome da classe.
     * @returns Um objeto de classe no formato de cliente.
     * @throws CustomError se a classe não for encontrada.
     */
    async getClassByName(name: string): Promise<IClass> {
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Class name is required.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const classes = await this.classRepository.findByName(name);
        if (!classes) {
            const error = new Error('Classe não encontrada.') as CustomError;
            error.statusCode = 404;
            error.path = `/classes?name=${name}`;
            throw error;
        }
        return classes.toClientJSON();
    }

    /**
     * Cria uma nova classe.
     * @param name O nome da classe.
     * @param classData Os dados da classe (bonus, tipo).
     * @returns A classe criada no formato de cliente.
     * @throws CustomError se a classe já existir.
     */
    async createClass(name: string, classData: { bonus: object; tipo: object }): Promise<IClass> {
        if (typeof name !== 'string' || name.trim() === '' || !classData.bonus || !classData.tipo) {
            const error = new Error('Name, bonus, and tipo are required to create a class.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const existingClass = await this.classRepository.findByName(name);
        if (existingClass) {
            const error = new Error(`Class with name '${name}' already exists.`) as CustomError;
            error.statusCode = 409;
            error.path = `/classes`;
            throw error;
        }

        const newClass = await this.classRepository.create(name, classData);
        // Assumindo que newClass já é uma instância de ClassModel que tem toClientJSON()
        return newClass;
    }

    /**
     * Atualiza uma classe existente.
     * @param name O nome da classe a ser atualizada.
     * @param classData Os dados a serem atualizados (bonus, tipo).
     * @returns A classe atualizada no formato de cliente.
     * @throws CustomError se a classe não for encontrada.
     */
    async updateClass(name: string, classData: { bonus: object, tipo: object }): Promise<IClass> {
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Class name is required for update.') as CustomError;
            error.statusCode = 400;
            throw error;
        }
        if (Object.keys(classData).length === 0) {
            const error = new Error('No fields provided for update.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const existingClass = await this.classRepository.findByName(name);
        if (!existingClass) {
            const error = new Error(`Class with name '${name}' not found for update.`) as CustomError;
            error.statusCode = 404;
            error.path = `/classes/${name}`;
            throw error;
        }

        const updatedClass = await this.classRepository.update(name, classData);
        if (!updatedClass) {
            const error = new Error(`Failed to update class '${name}'. It might not exist or no changes were made.`) as CustomError;
            error.statusCode = 500;
            throw error;
        }
        return updatedClass; // Retorna no formato de cliente
    }

    /**
     * Deleta uma classe.
     * @param name O nome da classe a ser deletada.
     * @returns Um objeto de sucesso (true)
     * @throws CustomError se a classe não for encontrada para exclusão.
     */
    async deleteClass(name: string): Promise<boolean> {
        if (typeof name !== 'string' || name.trim() === '') {
            const error = new Error('Class name is required for deletion.') as CustomError;
            error.statusCode = 400;
            throw error;
        }

        const wasDeleted = await this.classRepository.delete(name);
        if (!wasDeleted) {
            const error = new Error(`Class with name '${name}' not found or could not be deleted.`) as CustomError;
            error.statusCode = 404;
            error.path = `/classes/${name}`;
            throw error;
        }
        return true; // Retorna true para indicar que foi deletada
    }
}