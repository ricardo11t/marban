export default class RaceService {
    constructor(raceRepository) {
        this.raceRepository = raceRepository;
    }
    
    async getAllRaces() {
        const races = await this.raceRepository.findAll();
        return races.map(race => race.toClientJSON());
    }

    async getRaceByName(name) {
        const race = await this.raceRepository.findByName(name);
        if (!race) {
            const error = new Error('Race not found.');
            error.statusCode = 404;
            throw error;
        }
        return race.toClientJSON();
    }

    async createRace(raceData) {
        const newRace = await this.raceRepository.create(raceData);
        return newRace.toClientJSON();
    }
    
    async updateRace(name, raceData) {
        const updatedRace = await this.raceRepository.update(name, raceData);
        if (!updatedRace) {
            const error = new Error('Raça não encontrada para atualização.');
            error.statusCode = 404;
            throw error;
        }
    }

    async deleteRace(name) {
        const wasDeleted = await this.raceRepository.delete(name);
        if (!wasDeleted) {
            const error = new Error('Raça não encontrada para exclusão.');
            error.statusCode = 404;
            throw error;
        }
        return {message: 'Race successfully deleted.'}
    }
}