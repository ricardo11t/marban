const sendSuccess = (res, data, message = 'Successful Operation.', statusCode = 200) => {
    if (!res.headersSent) {
        res.status(statusCode).json({
            status: 'success',
            message,
            data,
        });
    }
};

const sendCreated = (res, data, message = 'Created Resource.') => {
    sendSuccess(res, data, message, 201);
}

const sendNoContent = (res, message = 'Operação realizada com sucesso, sem conteúdo para retornar.') => {
    if (!res.headersSent) {
        res.status(204).end();
    }
};

export default {
    success: sendSuccess,
    created: sendCreated,
    noContent: sendNoContent,
};