import logger from './logger'; // Importa o logger.
import { Request, Response } from 'express'; // Importa os tipos do Express

// CORREÇÃO DA IMPORTAÇÃO: Caminho correto para custom-errors
import { CustomError } from '../types/custom-errors'; // <--- CORREÇÃO AQUI

// Use a interface CustomError que definimos
export default function errorHandler(
    error: CustomError, // Erro agora é tipado como CustomError
    res: Response,
    req?: Request // `req` é opcional, como você indicou na sua versão
) {
    // Garantir que error.message e error.stack existam, pois Error os possui
    const errorMessage = error.message || 'An unknown error occurred.';
    const errorStack = error.stack || 'No stack trace available.';

    // Pega o caminho do erro; prioriza error.path, senão req.url (se req existe), senão 'N/A'
    const path = error.path || (req ? req.url : 'N/A');

    // Registra o erro usando o logger
    logger.error(
        `Message: ${errorMessage}`,
        `StatusCode: ${error.statusCode || 500}`,
        `Path: ${path}`,
        `Details: ${error.details ? JSON.stringify(error.details) : 'N/A'}`,
        `Stack: ${errorStack}`
    );

    const statusCode = error.statusCode || 500;
    let message = errorMessage; // Usa a mensagem do erro, ou a padrão

    // Mensagem genérica para erros 500 em produção
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'An unexpected error occurred. Please, try again later.';
    }

    // Envia a resposta ao cliente se 'res' existir e os cabeçalhos ainda não foram enviados
    if (res && !res.headersSent) {
        const responseBody: {
            status: string;
            statusCode: number;
            message: string;
            details?: any; // Adiciona 'details' como opcional
        } = {
            status: 'error',
            statusCode,
            message,
        };

        // Adiciona detalhes do erro se não for um erro 500 em produção
        if ((statusCode !== 500 || process.env.NODE_ENV !== 'production') && error.details) {
            responseBody.details = error.details;
        }

        res.status(statusCode).json(responseBody);
    } else if (res && res.headersSent) {
        // Log de aviso se o errorHandler for chamado mas a resposta já foi enviada
        logger.warn('errorHandler was called, but the headers were already sent.');
    } else {
        // Log de erro se o errorHandler for chamado sem um objeto de resposta
        logger.error('errorHandler was called without a response object. Original error path:', path);
    }
}