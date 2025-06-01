import logger from './logger.js'; // <--- CERTIFIQUE-SE QUE TEM '.js' AQUI

export default function errorHandler(error, res) {
    // Log detalhado do erro no servidor
    // O logger.error agora espera múltiplos argumentos e os formata
    logger.error(
        `Message: ${error.message}`,
        `StatusCode: ${error.statusCode || 500}`,
        `Path: ${error.path || (res && req ? req.url : 'N/A')}`, // Adicionando req.url se disponível
        `Details: ${error.details ? JSON.stringify(error.details) : 'N/A'}`,
        `Stack: ${error.stack}`
    );

    const statusCode = error.statusCode || 500;
    let message = error.message || `An internal server error occurred.`; // Corrigido 'occured' para 'occurred'

    // Em produção, para erros 500, não exponha a mensagem de erro original detalhada
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'An unexpected error occurred. Please, try again later.'; // Corrigido 'ocurred' para 'occurred'
    }

    // Verifica se os headers já foram enviados antes de tentar enviar uma resposta
    if (res && !res.headersSent) {
        const responseBody = {
            status: 'error',
            statusCode,
            message,
        };

        // Apenas adiciona detalhes ao corpo da resposta se não for um erro 500 em produção
        // ou se error.details existir
        if ((statusCode !== 500 || process.env.NODE_ENV !== 'production') && error.details) {
            responseBody.details = error.details;
        }

        res.status(statusCode).json(responseBody);
    } else if (res && res.headersSent) {
        logger.warn('errorHandler was called, but the headers were already sent.');
    } else {
        // Se res não for fornecido (ex: erro em um script de background, improvável no contexto da Vercel API)
        logger.error('errorHandler was called without a response object, or headers were already sent.');
    }
}