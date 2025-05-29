// Em api/races.js

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // --- INÍCIO DO CÓDIGO DE DEBUG TEMPORÁRIO ---
    console.log("Função /api/races chamada (VERSÃO DEPLOYADA).");
    console.log("Variável POSTGRES_URL está presente:", !!process.env.POSTGRES_URL);
    console.log("POSTGRES_DATABASE (do env):", process.env.POSTGRES_DATABASE);
    console.log("POSTGRES_HOST (do env):", process.env.POSTGRES_HOST);
    console.log("POSTGRES_USER (do env):", process.env.POSTGRES_USER);

    try {
        console.log("Tentando query simples de teste (SELECT NOW()) no ambiente deployado...");
        const timeQuery = await sql`SELECT NOW();`;
        console.log("Resultado da query de teste (data/hora do banco):", timeQuery.rows[0]);
    } catch (e) {
        console.error("ERRO na query de teste simples (SELECT NOW()):", e);
        // Importante: Não retorne res.status(500) aqui ainda,
        // queremos ver se a query principal falha e qual o erro dela.
    }
    // --- FIM DO CÓDIGO DE DEBUG TEMPORÁRIO ---

    // SEU CÓDIGO ORIGINAL COMEÇA ABAIXO:
    try {
        if (req.method === 'GET') {
            console.log("Tentando query: SELECT name, bonus FROM races; (VERSÃO DEPLOYADA)");
            const { rows } = await sql`SELECT name, bonus FROM races;`;
            const racesData = rows.reduce((acc, row) => {
                acc[row.name] = { bonus: row.bonus };
                return acc;
            }, {});
            res.status(200).json(racesData);
        }
        // ... resto do seu código (PUT, DELETE, etc.)
    } catch (error) {
        console.error('Erro na API /api/races (query principal - VERSÃO DEPLOYADA):', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}