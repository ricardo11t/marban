// api.ts (VERSÃO CORRIGIDA E ESTRUTURADA)

// =================================================================
// 1. IMPORTAÇÕES
// =================================================================
import 'dotenv/config';
import express, { Request, Response, Router, NextFunction } from 'express'; // Importar NextFunction

// Módulos Compartilhados
import { sql as dbSqlFunction, qdrantClient as initialQdrantClient } from '../modules/shared/db.js';
// O errorHandler que você usa aqui precisa ser o global de 4 argumentos
// import errorHandler from '../modules/shared/errorHandler.js'; // REMOVER ESTA IMPORTAÇÃO SE O ERRORHANDLER FOR GLOBAL

// Importar os middlewares de autenticação
import { authMiddleware, roleMiddleware } from '../modules/shared/authMiddleware.js';
import { CustomError } from '../modules/types/custom-errors'; // Importar CustomError para o global error handler

// Módulos de Autenticação/Usuários
import UserRepository from '../modules/users/user.repository.js';
import UserService from '../modules/users/user.service.js';
import UserController from '../modules/users/user.controller.js';
import AuthService from '../modules/auth/auth.service.js';
import AuthController from '../modules/auth/auth.controller.js';

// Módulos de Raças
import RaceRepository from '../modules/races/race.repository.js';
import RaceService from '../modules/races/race.service.js';
import RaceController from '../modules/races/race.controller.js';

// Módulos de Classes
import ClassRepository from '../modules/classes/class.repository.js';
import ClassService from '../modules/classes/class.service.js';
import ClassController from '../modules/classes/class.controller.js';

// Módulos do Qdrant (Embeddings)
import QdrantRepository from '../modules/qdrant/qdrant.repository.js';
import QdrantService from '../modules/qdrant/qdrant.service.js';
// import { ILoreDocument } from '../modules/qdrant/models/qdrant.models.js'; // Não utilizado aqui

// =================================================================
// 2. INICIALIZAÇÕES (Instâncias de Classes)
// =================================================================
const QDRANT_HOST = process.env.QDRANT_HOST || 'localhost';
const QDRANT_PORT = parseInt(process.env.QDRANT_PORT || '6333', 10);
const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'rpg_lore';
const QDRANT_VECTOR_SIZE = parseInt(process.env.QDRANT_VECTOR_SIZE || '768', 10);

const userRepository = new UserRepository(dbSqlFunction);
const raceRepository = new RaceRepository(dbSqlFunction);
const classRepository = new ClassRepository(dbSqlFunction);
const qdrantRepository = new QdrantRepository(QDRANT_COLLECTION_NAME); // Passar o nome da coleção

const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const raceService = new RaceService(raceRepository);
const classService = new ClassService(classRepository);
const qdrantService = new QdrantService(qdrantRepository); // Corrigir instanciacao

const authController = new AuthController(authService);
const userController = new UserController(userService);
const raceController = new RaceController(raceService);
const classController = new ClassController(classService);

// =================================================================
// 3. CONFIGURAÇÃO DO EXPRESS
// =================================================================
const app = express();
const apiRouter = Router(); // Crie o router da API

app.use(express.json()); // Middleware para parsear JSON globalmente

// =================================================================
// 4. DEFINIÇÃO DAS ROTAS (Tudo no apiRouter) - PADRÃO ASYNC/AWAIT CORRIGIDO
// =================================================================

// --- ROTAS DE AUTENTICAÇÃO ---
// Não precisam de try...catch individual se os controllers e middlewares chamam next(error)
apiRouter.post('/auth/login', authController.login); // Controller method can be async
apiRouter.post('/auth/register', authController.register);

// --- ROTAS DE USUÁRIOS ---
apiRouter.get('/users', authMiddleware(), async (req, res, next) => {
    try {
        if (req.query.id) {
            await userController.getUserById(req, res);
        } else {
            await userController.getAllUsers(req, res);
        }
    } catch (err: any) {
        next(err);
    }
});

// Nota: Para controladores como userController.updateUserRole, eles também precisam ser async
// e chamar next(error) se houver um erro, ou você os encapsula em um try/catch como acima.
// A abordagem mais limpa é o controlador também chamar next(error) para erros internos.
apiRouter.post('/users/role', authMiddleware(), roleMiddleware('admin'), userController.updateUserRole);
apiRouter.delete('/users/:id', authMiddleware(), roleMiddleware('admin'), userController.deleteUser);

// --- ROTAS DE RAÇAS ---
apiRouter.get('/races', authMiddleware(), async (req, res, next) => {
    try {
        if (req.query.name) {
            req.query.name = decodeURIComponent(req.query.name as string);
            await raceController.getByName(req, res);
        } else {
            await raceController.getAll(req, res);
        }
    } catch (err: any) {
        next(err);
    }
});

apiRouter.post('/races', authMiddleware(), roleMiddleware('admin'), async (req, res, next) => {
    try {
        if (!req.body.name) {
            const error = new Error('O parâmetro "name" é obrigatório para criar uma raça.') as CustomError;
            error.statusCode = 400;
            return next(error);
        }
        req.body.name = decodeURIComponent(req.body.name as string);
        await raceController.create(req, res);
    } catch (err: any) {
        next(err);
    }
});

apiRouter.put('/races/:name', authMiddleware(), roleMiddleware('admin'), raceController.update);
apiRouter.delete('/races/:name', authMiddleware(), roleMiddleware('admin'), raceController.delete);

// --- ROTAS DE CLASSES ---
apiRouter.get('/classes', authMiddleware(), async (req, res, next) => {
    try {
        if (req.query.name) {
            req.query.name = decodeURIComponent(req.query.name as string);
            await classController.getByName(req, res);
        } else {
            await classController.getAll(req, res);
        }
    } catch (err: any) {
        next(err);
    }
});

apiRouter.post('/classes', authMiddleware(), roleMiddleware('admin'), async (req, res, next) => {
    try {
        if (!req.body.name) {
            const error = new Error('O parâmetro "name" é obrigatório para criar uma classe.') as CustomError;
            error.statusCode = 400;
            return next(error);
        }
        req.body.name = decodeURIComponent(req.body.name as string);
        await classController.create(req, res);
    } catch (err: any) {
        next(err);
    }
});

apiRouter.put('/classes/:name', authMiddleware(), roleMiddleware('admin'), async (req, res, next) => {
    try {
        if (!req.query.name) {
            const error = new Error('O parâmetro "name" é obrigatório para criar uma classe.') as CustomError;
            error.statusCode = 400;
            return next(error);
        }
        await classController.update(req, res);
    } catch (err) {
        next(err);
    }
});
apiRouter.delete('/classes/:name', authMiddleware(), roleMiddleware('admin'), async (req, res, next) => {
    try {
        if (!req.query.name) {
            const error = new Error('O parâmetro "name" é obrigatório para criar uma classe.') as CustomError;
            error.statusCode = 400;
            return next(error);
        }
        await classController.delete(req, res);
    } catch (err) {
        next(err);
    }
});

// --- ROTAS DE EMBEDDINGS (Qdrant) ---
apiRouter.post('/embeddings', authMiddleware(), roleMiddleware('admin'), async (req, res, next) => {
    try {
        const newPoint = await qdrantService.addLoreDocument(req.body);
        res.status(201).json({ message: "Embedding adicionado/atualizado com sucesso.", data: newPoint });
    } catch (err: any) {
        next(err);
    }
});

apiRouter.get('/embeddings/search', authMiddleware(), async (req, res, next) => {
    try {
        const queryText = req.query.query as string;
        if (!queryText) {
            const error = new Error('O parâmetro "query" é obrigatório para a busca de embeddings.') as CustomError;
            error.statusCode = 400;
            return next(error);
        }
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
        const searchResults = await qdrantService.searchLore(queryText, limit);
        res.status(200).json({ message: "Busca de embeddings realizada com sucesso.", data: searchResults });
    } catch (err: any) {
        next(err);
    }
});

apiRouter.put('/embeddings/:id', authMiddleware(), roleMiddleware('admin'), async (req, res, next) => {
    try {
        const id = req.params.id;
        const payload = req.body.payload;
        if (!id || !payload) {
            const error = new Error('ID do documento e um "payload" válido são obrigatórios.') as CustomError;
            error.statusCode = 400;
            return next(error);
        }
        const parsedId: string | number = isNaN(Number(id)) ? id : Number(id);
        const updateResult = await qdrantService.updateLoreMetadata(parsedId, payload);
        res.status(200).json({ message: "Payload de embedding atualizado com sucesso.", data: updateResult });
    } catch (err: any) {
        next(err);
    }
});

apiRouter.delete('/embeddings', authMiddleware(), roleMiddleware('admin'), async (req, res, next) => {
    try {
        const ids = req.body.ids as (string | number)[];
        if (!Array.isArray(ids) || ids.length === 0) {
            const error = new Error('Um array de IDs é obrigatório para deletar embeddings.') as CustomError;
            error.statusCode = 400;
            return next(error);
        }
        const deleteResult = await qdrantService.deleteLoreDocuments(ids);
        res.status(200).json({ message: "Embeddings deletados com sucesso.", data: deleteResult });
    } catch (err: any) {
        next(err);
    }
});

// =================================================================
// 5. MONTAGEM DO ROUTER E HANDLER 404
// =================================================================

// Monta todas as rotas definidas acima sob o prefixo /api
app.use('/api', apiRouter);

// Manipulador de 404 customizado (para rotas NÃO encontradas dentro do /api)
app.use((req, res, next) => { // Adicionar next aqui
    // Se a requisição chegou até aqui e o path é /api/algo que não existe
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: `Rota da API '${req.path}' não encontrada.` });
    } else {
        // Para outras rotas que não são da API, passe para o próximo handler
        // (ex: para servir arquivos estáticos, ou um SPA fallback)
        next();
    }
});

// =================================================================
// 6. HANDLER GLOBAL DE ERROS (ÚLTIMO MIDDLEWARE A SER REGISTRADO)
// =================================================================
// Este middleware captura todos os erros passados com next(error)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('--- GLOBAL ERROR HANDLER ---');
    console.error(`Status: ${err.statusCode || 500}`);
    console.error(`Message: ${err.message}`);
    console.error('Error stack:', err.stack); // Descomente para stack trace em desenvolvimento

    const status = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor.';

    res.status(status).json({
        message: message,
        details: err.details || undefined, // Incluir detalhes se existirem
        path: err.path || undefined, // Incluir path se existirem
    });
});


// =================================================================
// 7. HANDLER DA SERVERLESS FUNCTION (Ponto de Entrada)
// =================================================================
let collectionInitialized = false;

export default async function handler(req: Request, res: Response) {
    try {
        if (!collectionInitialized) {
            console.log("Qdrant: Initializing collection for cold start...");
            // Ensure qdrantRepository is properly initialized for serverless context
            await qdrantRepository.createCollectionIfNotExists();
            collectionInitialized = true;
            console.log("Qdrant: Collection initialized.");
        }

        // 'app' is your Express instance
        // Calling it like this runs the Express application for the current req/res cycle.
        return app(req, res);

    } catch (err: any) {
        console.error('Fatal Error during Qdrant initialization or handler start:', err);
        const status = err.statusCode || 500;
        const message = err.message || 'Erro fatal na inicialização do servidor.';
        res.status(status).json({ message: message });
    }
}