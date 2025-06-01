import logger from './logger';

export default function errorHandler(error, res) {
    logger.error({
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        details: error.details,
        path: error.path
    });

    const statusCode = error.statusCode || 500;
    let message = error.message || `An internal server error occured.`;

    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'An unexpected error ocurred. Please, try again later.'
    }

    if (!res.headersSent) {
        res.status(statusCode).json({
            status: 'error',
            statusCode,
            message,
            ...((statusCode !== 500 || process.env.NODE_ENV !== 'production') && error.details ? { details: error.details } : {})
        })
    } else {
        logger.warn('errorHandler was called, but the headers were areadly sent');
    }
}