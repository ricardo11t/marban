import { Response } from 'express'; // Importa o tipo Response do Express

/**
 * Envia uma resposta de sucesso padrão.
 * @param res O objeto Response do Express.
 * @param data Os dados a serem incluídos na resposta.
 * @param message A mensagem de sucesso.
 * @param statusCode O código de status HTTP (padrão: 200).
 */
const sendSuccess = (
    res: Response, // Tipado como Response do Express
    data: any,     // O tipo de 'data' pode ser mais específico se você souber (ex: UserData | RaceData)
    message: string = 'Successful Operation.',
    statusCode: number = 200
): void => { // A função não retorna nada explicitamente
    // Verifica se os cabeçalhos da resposta já foram enviados para evitar erros.
    if (!res.headersSent) {
        res.status(statusCode).json({
            status: 'success', // Status customizado 'success'
            message,          // Mensagem para o cliente
            data,             // Dados da resposta
        });
    }
    // Opcional: Você pode adicionar um log aqui se os headers já foram enviados
    // else {
    //     console.warn('sendSuccess called but headers already sent.');
    // }
};

/**
 * Envia uma resposta de "Recurso Criado" (HTTP 201).
 * @param res O objeto Response do Express.
 * @param data Os dados a serem incluídos na resposta.
 * @param message A mensagem de sucesso (padrão: 'Created Resource.').
 */
const sendCreated = (
    res: Response,
    data: any,
    message: string = 'Created Resource.'
): void => {
    sendSuccess(res, data, message, 201); // Reutiliza a função sendSuccess com status 201
};

/**
 * Envia uma resposta de "Sem Conteúdo" (HTTP 204).
 * Usado para operações bem-sucedidas que não retornam nenhum corpo de resposta.
 * @param res O objeto Response do Express.
 * @param message Mensagem opcional para logs (não enviada ao cliente com 204).
 */
const sendNoContent = (
    res: Response,
    message: string = 'Operação realizada com sucesso, sem conteúdo para retornar.'
): void => {
    // Verifica se os cabeçalhos da resposta já foram enviados.
    if (!res.headersSent) {
        res.status(204).end(); // O método .end() envia uma resposta vazia
    }
    // Opcional: Você pode adicionar um log aqui para a mensagem interna se os headers já foram enviados
    // else {
    //     console.warn('sendNoContent called but headers already sent.');
    // }
};

// Exporta um objeto contendo todas as funções de resposta padronizadas
export default {
    success: sendSuccess,
    created: sendCreated,
    noContent: sendNoContent,
};