import { sql as vercelSqlTag } from '@vercel/postgres';
import { QdrantClient } from '@qdrant/qdrant-js';

// --- DEFINIÇÃO DA INTERFACE DBCLIENT ---
// Mova esta interface para cá e exporte-a
export interface DbClient {
    (strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: any[]; rowCount: number; }>;
    // Se você precisar de outros métodos do Pool (como .query), você os adicionaria aqui.
    // query: (queryText: string, values?: any[]) => Promise<QueryResult<any>>;
}

// Inicialização do SQL (Vercel Postgres): Exporta a *função template literal*
export const sql: DbClient = async (strings, ...values) => {
    const result = await vercelSqlTag(strings, ...values);
    return {
        rows: result.rows,
        rowCount: result.rowCount ?? 0, // Garante que rowCount nunca seja null
    };
};

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