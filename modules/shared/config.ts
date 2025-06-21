import dotenv from 'dotenv';
dotenv.config();

export const config = {
    jwtSecret: process.env.JWT_SECRET || 'DEV_SECRET_KEY_ONLY_FOR_DEVELOPMENT',
    EXPIRATION: process.env.EXPIRATION || '1h'
};

if (config.jwtSecret === 'DEV_SECRET_KEY_ONLY_FOR_DEVELOPMENT' && process.env.NODE_ENV === 'production') {
    console.error('ERRO FATAL: JWT_SECRET não configurada para produção!');
    }