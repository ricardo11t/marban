import logger from './logger.js';

export default function errorHandler(error, res, req) { // Adicione req como parâmetro opcional
    const path = error.path || (req && req.url ? req.url : 'N/A'); // Use o req passado

    logger.error(
        `Message: ${error.message}`,
        `StatusCode: ${error.statusCode || 500}`,
        `Path: ${path}`, // Usa a variável path
        `Details: ${error.details ? JSON.stringify(error.details) : 'N/A'}`,
        `Stack: ${error.stack}`
    );

    const statusCode = error.statusCode || 500;
    let message = error.message || `An internal server error occurred.`;

    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'An unexpected error occurred. Please, try again later.';
    }

    if (res && !res.headersSent) {
        const responseBody = {
            status: 'error',
            statusCode,
            message,
        };

        if ((statusCode !== 500 || process.env.NODE_ENV !== 'production') && error.details) {
            responseBody.details = error.details;
        }

        res.status(statusCode).json(responseBody);
    } else if (res && res.headersSent) {
        logger.warn('errorHandler was called, but the headers were already sent.');
    } else {
        logger.error('errorHandler was called without a response object, or headers were already sent. Original error path:', path);
    }
}