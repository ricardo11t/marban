// api.ts (VERSÃO CORRIGIDA E ESTRUTURADA)

// =================================================================
// 1. IMPORTAÇÕES
// =================================================================
import 'dotenv/config';
import express, { Request, Response, Router } from 'express';

// Módulos Compartilhados
import { sql as dbSqlFunction, qdrantClient as initialQdrantClient } from '../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler.js';
// A função 'runMiddleware' não é mais necessária com esta estrutura
import { authMiddleware, roleMiddleware } from '../modules/shared/authMiddleware.js';

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
import { ILoreDocument } from '../modules/qdrant/models/qdrant.models.js';

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
const qdrantRepository = new QdrantRepository('rpg_lore');

const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const raceService = new RaceService(raceRepository);
const classService = new ClassService(classRepository);
const qdrantService = new QdrantService(qdrantRepository);

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
apiRouter.post('/auth/login', async (req, res) => {
    try {
        await authController.login(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});
apiRouter.post('/auth/register', async (req, res) => {
    try {
        await authController.register(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

// --- ROTAS DE USUÁRIOS ---
apiRouter.get('/users', async (req, res) => {
    try {
        if (req.query.id) {
            await userController.getUserById(req, res);
        } else {
            await userController.getAllUsers(req, res);
        }
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.post('/users/role', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        await userController.updateUserRole(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.delete('/users/:id', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        await userController.deleteUser(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

// --- ROTAS DE RAÇAS ---
apiRouter.get('/races', authMiddleware(), async (req, res) => {
    try {
        if (req.query.name) {
            req.query.name = decodeURIComponent(req.query.name as string);
            await raceController.getByName(req, res);
        } else {
            await raceController.getAll(req, res);
        }
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.post('/races', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        if (!req.body.name) {
            res.status(400).json({ message: 'O parâmetro "name" é obrigatório para criar uma raça.' });
            return;
        }
        req.body.name = decodeURIComponent(req.body.name as string);
        await raceController.create(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.put('/races/:id', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        await raceController.update(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.delete('/races/:id', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        await raceController.delete(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

// --- ROTAS DE CLASSES ---
apiRouter.get('/classes', authMiddleware(), async (req, res) => {
    try {
        if (req.query.name) {
            req.query.name = decodeURIComponent(req.query.name as string);
            await classController.getByName(req, res);
        } else {
            await classController.getAll(req, res);
        }
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.post('/classes', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        if (!req.body.name) {
            res.status(400).json({ message: 'O parâmetro "name" é obrigatório para criar uma classe.' });
            return;
        }
        req.body.name = decodeURIComponent(req.body.name as string);
        await classController.create(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.put('/classes/:name', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        await classController.update(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.delete('/classes/:id', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        await classController.delete(req, res);
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

// --- ROTAS DE EMBEDDINGS (Qdrant) ---
apiRouter.post('/embeddings', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        const newPoint = await qdrantService.addLoreDocument(req.body);
        res.status(201).json({ message: "Embedding adicionado/atualizado com sucesso.", data: newPoint });
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.get('/embeddings/search', authMiddleware(), async (req, res) => {
    try {
        const queryText = req.query.query as string;
        if (!queryText) {
            res.status(400).json({ message: 'O parâmetro "query" é obrigatório para a busca de embeddings.' });
            return;
        }
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
        const searchResults = await qdrantService.searchLore(queryText, limit);
        res.status(200).json({ message: "Busca de embeddings realizada com sucesso.", data: searchResults });
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.put('/embeddings/:id', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body.payload;
        if (!id || !payload) {
            res.status(400).json({ message: 'ID do documento e um "payload" válido são obrigatórios.' });
            return;
        }
        const parsedId: string | number = isNaN(Number(id)) ? id : Number(id);
        const updateResult = await qdrantService.updateLoreMetadata(parsedId, payload);
        res.status(200).json({ message: "Payload de embedding atualizado com sucesso.", data: updateResult });
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

apiRouter.delete('/embeddings', authMiddleware(), roleMiddleware('admin'), async (req, res) => {
    try {
        const ids = req.body.ids as (string | number)[];
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: 'Um array de IDs é obrigatório para deletar embeddings.' });
            return;
        }
        const deleteResult = await qdrantService.deleteLoreDocuments(ids);
        res.status(200).json({ message: "Embeddings deletados com sucesso.", data: deleteResult });
    } catch (err: any) { // CORREÇÃO AQUI
        errorHandler(err, res);
    }
});

// =================================================================
// 5. MONTAGEM DO ROUTER E HANDLER 404
// =================================================================

// Monta todas as rotas definidas acima sob o prefixo /api
app.use('/api', apiRouter);

// Manipulador de 404 customizado
// Só será executado se nenhuma rota dentro de '/api' for encontrada.
app.use((req, res) => {
    // Se a requisição chegou até aqui, é um 404 da nossa API
    res.status(404).json({ error: `Rota da API '${req.path}' não encontrada.` });
});

// =================================================================
// 6. HANDLER DA SERVERLESS FUNCTION (Ponto de Entrada)
// =================================================================
let collectionInitialized = false;

export default async function handler(req: Request, res: Response) {
    try {
        if (!collectionInitialized) {
            console.log("Qdrant: Initializing collection for cold start...");
            await qdrantRepository.createCollectionIfNotExists();
            collectionInitialized = true;
            console.log("Qdrant: Collection initialized.");
        }
        
        // Passa a requisição para a aplicação Express 100% organizada
        return app(req, res);

    } catch (err: any) {
        // Este catch agora é principalmente para erros na inicialização do Qdrant
        errorHandler(err, res);
    }
}