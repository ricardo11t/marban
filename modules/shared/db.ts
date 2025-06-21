import { sql as vercelSqlTag } from '@vercel/postgres';
// CORREÇÃO: Importa o QdrantClient da biblioteca correta.
import { QdrantClient } from '@qdrant/js-client-rest';

// --- DEFINIÇÃO DA INTERFACE DBCLIENT (Postgres) ---
export interface DbClient {
    (strings: TemplateStringsArray, ...values: any[]): Promise<{ rows: any[]; rowCount: number; }>;
}

export const sql: DbClient = async (strings, ...values) => {
    const result = await vercelSqlTag(strings, ...values);
    return {
        rows: result.rows,
        rowCount: result.rowCount ?? 0,
    };
};

// --- CLIENTE QDRANT (Singleton) ---
// CORREÇÃO: Adicionamos a porta 6334 para conexões seguras (HTTPS) com o Qdrant Cloud.
export const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    port: 6334 // Essencial para evitar o erro ERR_SSL_WRONG_VERSION_NUMBER
});