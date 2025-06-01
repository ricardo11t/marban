const config = {
    jwtSecret: process.env.JWT_SECRET || 'DEV_SECRET_KEY_ONLY_FOR_DEVELOPMENT',
};

if (config.jwtSecret === 'DEV_SECRET_KEY_ONLY_FOR_DEVELOPMENT' && process.env.NODE_ENV === 'production') {
    console.error('ERRO FATAL: JWT_SECRET não configurada para produção!');
    // Em um cenário real, você poderia até fazer o processo sair aqui para evitar rodar inseguro.
}

export default config;