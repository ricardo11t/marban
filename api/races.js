// Cole este código limpo em api/races.js

import fs from 'fs';
import path from 'path';

// Constrói o caminho para o arquivo db.json na raiz do projeto
const dbPath = path.join(process.cwd(), 'db.json');

// Função principal que a Vercel irá executar
export default async function handler(req, res) {
    try {
        const fileData = fs.readFileSync(dbPath);
        const db = JSON.parse(fileData);

        // Garante que a chave "racas" exista no db.json
        const racesData = db.racas || {};

        // Se a requisição for GET, retorna apenas as raças
        if (req.method === 'GET') {
            res.status(200).json(racesData);
        }
        // Se a requisição for PUT, atualiza as raças
        else if (req.method === 'PUT') {
            db.racas = req.body; // Substitui o objeto de raças pelo que veio na requisição
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            res.status(200).json({ message: 'Races updated successfully!' });
        }
        // Outros métodos não são permitidos
        else {
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Erro na API /api/races:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}