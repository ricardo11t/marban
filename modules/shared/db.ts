import { sql as vercelSqlTag } from '@vercel/postgres';
import { QdrantClient } from '@qdrant/qdrant-js';

// Inicialização do SQL (Vercel Postgres): Exporta a *função template literal*
export const sql = vercelSqlTag; // <--- AGORA 'sql' É A FUNÇÃO QUE SEUS REPOSITÓRIOS ESPERAM

// Inicialização do Qdrant Client
const QDRANT_HOST = process.env.QDRANT_HOST || 'localhost';
const QDRANT_PORT = parseInt(process.env.QDRANT_PORT || '6333', 10);
const QDRANT_CLOUD_URL = process.env.QDRANT_CLOUD_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

export const qdrantClient = new QdrantClient({
    host: QDRANT_HOST,
    port: QDRANT_PORT,
    url: QDRANT_CLOUD_URL,
    apiKey: QDRANT_API_KEY,
});