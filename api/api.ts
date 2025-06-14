// api/index.ts

import express, { Request, Response, NextFunction } from 'express';

// --- Importações de seus módulos (corrigido com base na sua estrutura) ---
// Note que as importações para arquivos .ts não incluem a extensão no TypeScript.
// O compilador TS cuidará disso.

// Módulos Compartilhados
import { sql, qdrantClient as initialQdrantClient } from '../modules/shared/db'; // 'as' para evitar conflito de nome
import errorHandler from '../modules/shared/errorHandler';
import { authMiddleware, roleMiddleware, runMiddleware } from '../modules/shared/authMiddleware';

// Módulos de Autenticação/Usuários
import UserRepository from '../modules/users/user.repository';
import AuthService from '../modules/auth/auth.service';
import AuthController from '../modules/auth/auth.controller';

// Módulos de Raças
import RaceRepository from '../modules/races/race.repository';
import RaceService from '../modules/races/race.service';
import RaceController from '../modules/races/race.controller';

// Módulos de Classes
import ClassRepository from '../modules/classes/class.repository';
import ClassService from '../modules/classes/class.service';
import ClassController from '../modules/classes/class.controller';

// Módulos do Qdrant (Embeddings)
import QdrantRepository from '../modules/qdrant/qdrant.repository';
import QdrantService from '../modules/qdrant/qdrant.service';
import { ILoreDocument } from '../modules/qdrant/models/qdrant.models'; // Importar o tipo para uso
import UserController from '../modules/users/user.controller';
import UserService from '../modules/users/user.service';


// --- CONFIGURAÇÃO QDRANT (Pode vir de variáveis de ambiente Vercel) ---
const QDRANT_HOST = process.env.QDRANT_HOST || 'localhost';
const QDRANT_PORT = parseInt(process.env.QDRANT_PORT || '6333', 10);
const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'rpg_lore';
const QDRANT_VECTOR_SIZE = parseInt(process.env.QDRANT_VECTOR_SIZE || '768', 10);

// --- Inicialização de Repositórios ---
// Helper to normalize rowCount to number (never null)
function normalizeQueryResult<T extends { rows: any[]; rowCount: number | null }>(result: T): { rows: any[]; rowCount: number } {
    return {
        ...result,
        rowCount: result.rowCount ?? 0
    };
}

// Wrapper to ensure rowCount is always a number
const sqlNormalized = async (...args: Parameters<typeof sql>) => {
    const result = await (sql as any)(...args);
    return normalizeQueryResult(result);
};

const userRepository = new UserRepository(sqlNormalized);
const raceRepository = new RaceRepository(sqlNormalized);
const classRepository = new ClassRepository(sqlNormalized);
const qdrantRepository = new QdrantRepository(initialQdrantClient, QDRANT_COLLECTION_NAME, QDRANT_VECTOR_SIZE);

// --- Inicialização de Serviços ---
const authService = new AuthService(userRepository);
const raceService = new RaceService(raceRepository);
const classService = new ClassService(classRepository);
const qdrantService = new QdrantService(qdrantRepository);
const userService = new UserService(userRepository);

// --- Inicialização de Controladores ---
const authController = new AuthController(authService);
const raceController = new RaceController(raceService);
const classController = new ClassController(classService);
const userController = new UserController(userService);


// --- Inicialização do Express App ---
const app = express();

app.use(express.json()); // Middleware para parsear JSON no corpo da requisição

// Variável para controlar a inicialização da coleção Qdrant em "cold starts"
let collectionInitialized = false;

// --- HANDLER PRINCIPAL DA SERVERLESS FUNCTION ---
export default async function handler(req: Request, res: Response) {
    try {
        // Garante que a coleção Qdrant seja criada uma vez por cold start
        if (!collectionInitialized) {
            console.log("Qdrant: Initializing collection for cold start...");
            await qdrantRepository.createCollectionIfNotExists();
            collectionInitialized = true;
            console.log("Qdrant: Collection initialized.");
        }

        // O Express `app` é uma função que pode ser usada como handler.
        // Ele vai despachar a requisição para a rota correta.
        // É importante que todas as suas rotas estejam definidas ANTES desta chamada.
        (app as any)(req, res);

    } catch (err: any) {
        // Se algo der errado antes mesmo do Express processar, como na inicialização
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
        // Não retorne res.status().json(), apenas chame-o e retorne (void)
        res.status(201).json({ message: "Embedding adicionado/atualizado com sucesso.", data: newPoint });
        return; // Garante que a função termina aqui
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
            return; // Garante que a função termina aqui
        }
        const searchResults = await qdrantService.searchLore(queryText, limit);
        res.status(200).json({ message: "Busca de embeddings realizada com sucesso.", data: searchResults });
        return; // Garante que a função termina aqui
    } catch (err: any) {
        errorHandler(err, res);
    }
});

// A rota PUT que estava com o erro
app.put('/embeddings/:id', async (req: Request, res: Response) => {
    try {
        await runMiddleware(req, res, authMiddleware());
        await runMiddleware(req, res, roleMiddleware('admin'));

        const id = req.params.id; // Correção: ID vem de req.params.id para PUT /embeddings/:id
        const payload = req.body.payload; // Payload vem de req.body

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



// --- Handle para rotas não encontradas ---
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `Rota '${req.path}' não encontrada.`, method: req.method });
});