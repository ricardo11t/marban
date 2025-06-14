import 'dotenv/config'; // Mantenha isso no topo para carregar .env
import express, { Request, Response, NextFunction } from 'express';
import { QdrantClient } from '@qdrant/qdrant-js';

// --- Módulos Compartilhados ---
// Caminho CORRETO: api/api.ts -> ../modules/shared/db (APENAS UM NÍVEL ACIMA E DEPOIS PARA 'modules')
import { sql as dbSqlFunction, qdrantClient as initialQdrantClient, DbClient } from '../modules/shared/db.js';
import errorHandler from '../modules/shared/errorHandler.js';
import { authMiddleware, roleMiddleware, runMiddleware } from '../modules/shared/authMiddleware.js';

// --- Módulos de Autenticação/Usuários ---
import UserRepository from '../modules/users/user.repository.js';
import UserService from '../modules/users/user.service.js';
import UserController from '../modules/users/user.controller.js';
import AuthService from '../modules/auth/auth.service.js';
import AuthController from '../modules/auth/auth.controller.js';

// --- Módulos de Raças ---
import RaceRepository from '../modules/races/race.repository.js';
import RaceService from '../modules/races/race.service.js';
import RaceController from '../modules/races/race.controller.js';

// --- Módulos de Classes ---
import ClassRepository from '../modules/classes/class.repository.js';
import ClassService from '../modules/classes/class.service.js';
import ClassController from '../modules/classes/class.controller.js';

// --- Módulos do Qdrant (Embeddings) ---
import QdrantRepository from '../modules/qdrant/qdrant.repository.js';
import QdrantService from '../modules/qdrant/qdrant.service.js';
// Caminho para o modelo qdrant.models
import { ILoreDocument } from '../modules/qdrant/models/qdrant.models.js';


// --- CONFIGURAÇÃO QDRANT ---
const QDRANT_HOST = process.env.QDRANT_HOST || 'localhost';
const QDRANT_PORT = parseInt(process.env.QDRANT_PORT || '6333', 10);
const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'rpg_lore';
const QDRANT_VECTOR_SIZE = parseInt(process.env.QDRANT_VECTOR_SIZE || '768', 10);

// --- Inicialização de Repositórios ---
const userRepository = new UserRepository(dbSqlFunction);
const raceRepository = new RaceRepository(dbSqlFunction);
const classRepository = new ClassRepository(dbSqlFunction);
const qdrantRepository = new QdrantRepository(initialQdrantClient, QDRANT_COLLECTION_NAME, QDRANT_VECTOR_SIZE);

// --- Inicialização de Serviços ---
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository); // <-- Descomente esta
const raceService = new RaceService(raceRepository);
const classService = new ClassService(classRepository);
const qdrantService = new QdrantService(qdrantRepository);

// --- Inicialização de Controladores ---
const authController = new AuthController(authService);
const userController = new UserController(userService); // <-- Descomente esta
const raceController = new RaceController(raceService);
const classController = new ClassController(classService);


// --- Inicialização do Express App ---
const app = express();

app.use(express.json()); // Middleware para parsear JSON no corpo da requisição

let collectionInitialized = false;

// --- HANDLER PRINCIPAL DA SERVERLESS FUNCTION ---
export default async function handler(req: Request, res: Response) {
    try {
        if (!collectionInitialized) {
            console.log("Qdrant: Initializing collection for cold start...");
            await qdrantRepository.createCollectionIfNotExists();
            collectionInitialized = true;
            console.log("Qdrant: Collection initialized.");
        }

        app(req, res); // Esta linha passa a requisição para o Express

    } catch (err: any) {
        errorHandler(err, res);
    }
}

// --- DEFINIÇÃO DAS ROTAS ---
// Os caminhos aqui são relativos à base da sua API no Vercel, que é /api/
// Por exemplo, uma rota para /auth/login será acessada via /api/auth/login

// --- ROTAS DE AUTENTICAÇÃO ---
app.post('/auth/login', async (req: Request, res: Response) => {
    try {
        await authController.login(req, res);
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.post('/auth/register', async (req: Request, res: Response) => {
    try {
        await authController.register(req, res);
    } catch (err: any) {
        errorHandler(err, res);
    }
});

// --- ROTAS DE USUÁRIOS ---
app.get('/users', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));

        if (req.query.id) {
            // Se o seu controller.getUserById espera req.params.id, você precisaria
            // ajustar a rota para '/users/:id' e usar req.params.id
            // Ou o controller.getUserById precisa ser adaptado para req.query.id
            await (userController as any).getUserById(req, res);
        } else {
            await (userController as any).getAllUsers(req, res);
        }
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.post('/users/role', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));
        await (userController as any).updateUserRole(req, res);
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));
        await (userController as any).deleteUser(req, res);
    } catch (err: any) {
        errorHandler(err, res);
    }
});


// --- ROTAS DE RAÇAS ---
app.get('/races', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware()); // Middleware de autenticação
        if (req.query.name) {
            req.query.name = decodeURIComponent(req.query.name as string);
            // CORREÇÃO: Apenas chame o método e retorne sem valor
            await (raceController as any).getByName(req, res);
            return; // Importante para sair da função após o controller enviar a resposta
        } else {
            // CORREÇÃO: Apenas chame o método e retorne sem valor
            await (raceController as any).getAll(req, res);
            return; // Importante para sair da função
        }
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.post('/races', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));

        if (req.body.name) { // Use req.body para POST data
            req.body.name = decodeURIComponent(req.body.name as string);
            // CORREÇÃO: Apenas chame o método e retorne sem valor
            await (raceController as any).create(req, res);
            return; // Importante para sair da função
        } else {
            // CORREÇÃO: Apenas chame res.status().json() e retorne sem valor
            res.status(400).json({ message: 'O parâmetro "name" é obrigatório para criar uma raça.' });
            return; // Importante para sair da função
        }
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.put('/races/:id', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));
        await (raceController as any).update(req, res);
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.delete('/races/:id', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));
        await (raceController as any).delete(req, res);
    } catch (err: any) {
        errorHandler(err, res);
    }
});


// --- ROTAS DE CLASSES ---
app.get('/classes', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        if (req.query.name) {
            req.query.name = decodeURIComponent(req.query.name as string);
            await (classController as any).getByName(req, res);
        } else {
            await (classController as any).getAll(req, res);
        }
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.post('/classes', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));

        if (req.body.name) { // Use req.body para POST data
            req.body.name = decodeURIComponent(req.body.name as string);
            // CORREÇÃO: Apenas chame o método e retorne sem valor
            await (classController as any).create(req, res);
            return; // Importante para sair da função
        } else {
            // CORREÇÃO: Apenas chame res.status().json() e retorne sem valor
            res.status(400).json({ message: 'O parâmetro "name" é obrigatório para criar uma classe.' });
            return; // Importante para sair da função
        }
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.put('/classes/:id', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));
        await (classController as any).update(req, res);
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.delete('/classes/:id', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));
        await (classController as any).delete(req, res);
    } catch (err: any) {
        errorHandler(err, res);
    }
});


// --- ROTAS DE EMBEDDINGS (Qdrant) ---
app.post('/embeddings', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));
        const newPoint = await qdrantService.addLoreDocument(req.body);
        res.status(201).json({ message: "Embedding adicionado/atualizado com sucesso.", data: newPoint });
        return; 
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.get('/embeddings/search', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        const queryText = req.query.query as string;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
        if (!queryText) {
            res.status(400).json({ message: 'O parâmetro "query" é obrigatório para a busca de embeddings.' });
            return;
        }
        const searchResults = await qdrantService.searchLore(queryText, limit);
        res.status(200).json({ message: "Busca de embeddings realizada com sucesso.", data: searchResults });
        return;
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.put('/embeddings/:id', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));

        const id = req.params.id;
        const payload = req.body.payload;

        if (!id || !payload) {
            res.status(400).json({ message: 'ID do documento e um "payload" válido são obrigatórios.' });
            return; // **CORREÇÃO AQUI:** Retorna para sair da função
        }

        const parsedId: string | number = isNaN(Number(id)) ? id : Number(id); // Converte ID
        const updateResult = await qdrantService.updateLoreMetadata(parsedId, payload);

        // **CORREÇÃO AQUI:** Apenas chame res.status().json() e depois retorne.
        res.status(200).json({ message: "Payload de embedding atualizado com sucesso.", data: updateResult });
        return; // **Importante:** Finaliza a execução da função após enviar a resposta
    } catch (err: any) {
        errorHandler(err, res);
    }
});

app.delete('/embeddings', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));
        const ids = req.body.ids as (string | number)[];
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: 'Um array de IDs é obrigatório para deletar embeddings.' });
            return; // Garante que a função termina aqui
        }
        const deleteResult = await qdrantService.deleteLoreDocuments(ids);
        res.status(200).json({ message: "Embeddings deletados com sucesso.", data: deleteResult });
        return; // Garante que a função termina aqui
    } catch (err: any) {
        errorHandler(err, res);
    }
});

// --- Handle para rotas não encontradas ---
app.use((req: Request, res: Response) => {
    // Isso deve ser um middleware final, então pode enviar a resposta diretamente
    res.status(404).json({ error: `Rota '${req.path}' não encontrada.`, method: req.method });
});

process.on('uncaughtException', (err: any) => {
    console.error('Unhandled Exception Caught!');
    console.error('Error Name:', err.name || 'N/A');
    console.error('Error Message:', err.message || 'N/A');
    console.error('Error Stack:', err.stack || 'N/A');
    console.error('Full Error Object:', err);
    // IMPORTANTE: Em produção, você pode querer encerrar o processo com um código de erro
    // process.exit(1);
});

// Adicionar um handler para pegar Promises rejeitadas não tratadas
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Promise Rejection Caught!');
    console.error('Reason:', reason instanceof Error ? reason.message : reason);
    console.error('Stack:', reason instanceof Error ? reason.stack : 'N/A');
    console.error('Promise:', promise);
    // IMPORTANTE: Em produção, você pode querer encerrar o processo com um código de erro
    // process.exit(1);
});