import jwt from 'jsonwebtoken';
import config from './config';

export function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        const error = new Error('Authentication token not provided or malformatted.');
        error.statusCode = 401;
        throw error;
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        return decoded;
    } catch (err) {
        const error = new Error('Invalid token or expired.');
        error.statusCode = 401;
        if (err.name === 'TokenExpiredError') {
            error.message = 'Expired Token.'
        }
        throw error;
    }
}