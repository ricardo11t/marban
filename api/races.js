import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            // 1. SELECT a coluna 'pdd' também
            const { rows } = await sql`SELECT name, bonus, pdd FROM races;`;

            // Transforma o array de resultados no objeto que o frontend espera
            const racesData = rows.reduce((acc, row) => {
                acc[row.name] = {
                    bonus: row.bonus,
                    pdd: row.pdd // 2. Adiciona 'pdd' ao objeto da raça
                };
                return acc;
            }, {});
            res.status(200).json(racesData);
        }
        else if (req.method === 'PUT') {
            // 3. Extrai 'pdd' do corpo da requisição
            const { name, bonus, pdd } = req.body;

            // 4. Valida a presença de 'name', 'bonus', e 'pdd'
            //    Considerando que 'pdd' pode ser um objeto (mesmo com valores padrão/nulos) ou null.
            //    Se 'pdd' for sempre um objeto enviado pelo frontend, 'pdd === undefined' é uma boa checagem.
            if (!name || bonus === undefined || pdd === undefined) {
                return res.status(400).json({ message: 'Nome, bônus e PdD são obrigatórios.' });
            }

            const raceNameDB = name.toLowerCase();

            // 5. Inclui 'pdd' no INSERT e UPDATE
            //    JSON.stringify(pdd) vai lidar corretamente com objetos PdD ou se pdd for null.
            await sql`
                INSERT INTO races (name, bonus, pdd) 
                VALUES (${raceNameDB}, ${JSON.stringify(bonus)}, ${JSON.stringify(pdd)})
                ON CONFLICT (name) 
                DO UPDATE SET 
                    bonus = ${JSON.stringify(bonus)}, 
                    pdd = ${JSON.stringify(pdd)};
            `;
            res.status(200).json({ message: 'Raça salva com sucesso!' });
        }
        else if (req.method === 'DELETE') {
            const { name } = req.query;
            if (!name) {
                return res.status(400).json({ message: 'Nome da raça é obrigatório para deletar.' });
            }
            const result = await sql`DELETE FROM races WHERE name = ${name.toLowerCase()};`;
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Raça não encontrada para deletar.' });
            }
            res.status(200).json({ message: 'Raça deletada com sucesso!' });
        }
        else {
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Erro na API /api/races:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}