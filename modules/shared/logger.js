const logger = {
    error: (...args) => {
        // Converte todos os argumentos para string para melhor visualização de objetos/erros
        const stringArgs = args.map(arg => {
            if (arg instanceof Error) {
                return `Error: ${arg.message}\nStack: ${arg.stack}`;
            }
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return '[Object non-serializable]';
                }
            }
            return String(arg);
        });
        console.error('[ERROR]', ...stringArgs);
    },
    warn: (...args) => {
        const stringArgs = args.map(arg => String(arg));
        console.warn('[WARN]', ...stringArgs);
    },
    info: (...args) => {
        const stringArgs = args.map(arg => String(arg));
        console.info('[INFO]', ...stringArgs);
    },
    debug: (...args) => {
        // O logging de debug pode ser condicional
        if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
            const stringArgs = args.map(arg => String(arg));
            console.debug('[DEBUG]', ...stringArgs);
        }
    },
    log: (...args) => { // Um alias para console.log ou info
        const stringArgs = args.map(arg => String(arg));
        console.log(...stringArgs);
    }
};

export default logger;