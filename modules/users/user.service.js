export default class UserService {
    constructor (userRepository) {
        this.userRepository = userRepository;
    }

    async getAllUsers() {
        return await this.userRepository.findAll();
    }

    async getById (id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        return user;
    }

    async createUser(userData) {
        return await this.userRepository.create(userData);
    }

    async deleteUser(email) {
        const user = await this.userRepository.findByEmail(email);
        
    }
}