export default class ClassService {
    constructor(classRepository) {
        this.classRepository = classRepository;
    }

    async getAllClasses() {
        const classes = await this.classRepository.findAll();
        return classes.map(classe => classe.toClientJSON());
    }

    async getClassByName(name) {
        const classes = await this.classRepository.findByName(name);
        if (!classes) {
            const error = new Error('Classe não encontrada.');
            error.statusCode = 404;
            throw error;
        }
        return classes.toClientJSON();
    }

    async createClass(classData) {
        const newClass = await this.classRepository.create(classData);
        return newClass.toClientJSON();
    }

    async updateClass(name, classData) {
        const updatedClass = await this.classRepository.update(name, classData);
        if (!updatedClass) {
            const error = new Error('Classe não encontrada para atualização.');
            error.statusCode = 404;
            throw error;
        }
        return updatedClass.toClientJSON();
    }

    async deleteClass(name) {
        const wasDeleted = await this.classRepository.delete(name);
        if (!wasDeleted) {
            const error = new Error('Classe não encontrada para exclusão.');
            error.statusCode = 404;
            throw error;
        }
        return { message: 'Classe deletada com sucesso.' };
    }
}