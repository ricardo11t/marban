// Define a interface para o objeto logger, descrevendo seus métodos
interface Logger {
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    log: (...args: any[]) => void;
}

// Implementa o logger customizado
const logger: Logger = {
    /**
     * Registra mensagens de erro. Tenta formatar objetos e erros para melhor visualização.
     * @param args Argumentos a serem registrados.
     */
    error: (...args: any[]) => { // Usamos 'any[]' para permitir múltiplos tipos de argumentos
        const stringArgs = args.map(arg => {
            if (arg instanceof Error) {
                // Para erros, inclua a mensagem e o stack trace
                return `Error: ${arg.message}\nStack: ${arg.stack || 'No stack trace'}`;
            }
            if (typeof arg === 'object' && arg !== null) {
                try {
                    // Tenta serializar objetos para JSON
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    // Se a serialização falhar, indica que o objeto não é serializável
                    return '[Object non-serializable]';
                }
            }
            // Para outros tipos, converte para string
            return String(arg);
        });
        console.error(`[ERROR] [${new Date().toISOString()}]`, ...stringArgs); // Adiciona timestamp
    },

    /**
     * Registra mensagens de aviso.
     * @param args Argumentos a serem registrados.
     */
    warn: (...args: any[]) => {
        const stringArgs = args.map(arg => String(arg));
        console.warn(`[WARN] [${new Date().toISOString()}]`, ...stringArgs); // Adiciona timestamp
    },

    /**
     * Registra mensagens informativas.
     * @param args Argumentos a serem registrados.
     */
    info: (...args: any[]) => {
        const stringArgs = args.map(arg => String(arg));
        console.info(`[INFO] [${new Date().toISOString()}]`, ...stringArgs); // Adiciona timestamp
    },

    /**
     * Registra mensagens de depuração, geralmente desativadas em produção.
     * @param args Argumentos a serem registrados.
     */
    debug: (...args: any[]) => {
        // O logging de debug pode ser condicional. Use process.env.NODE_ENV
        // ou uma variável de ambiente customizada como LOG_LEVEL.
        if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
            const stringArgs = args.map(arg => String(arg));
            console.debug(`[DEBUG] [${new Date().toISOString()}]`, ...stringArgs); // Adiciona timestamp
        }
    },

    /**
     * Um alias para console.log ou info, para uso geral.
     * @param args Argumentos a serem registrados.
     */
    log: (...args: any[]) => {
        const stringArgs = args.map(arg => String(arg));
        console.log(`[LOG] [${new Date().toISOString()}]`, ...stringArgs); // Adiciona timestamp
    }
};

export default logger;