import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const { rows } = await sql`SELECT name, bonus FROM races;`;
            // Transforma o array de resultados no objeto que o frontend espera
            const racesData = rows.reduce((acc, row) => {
                acc[row.name] = { bonus: row.bonus };
                return acc;
            }, {});
            res.status(200).json(racesData);
        }
        else if (req.method === 'PUT') {
            // A requisição PUT agora deve enviar UM objeto de raça para adicionar/atualizar
            // Ex: req.body = { name: "novaRaca", bonus: { ... } }
            const { name, bonus } = req.body;
            if (!name || bonus === undefined) { // Verifica se bonus existe, mesmo que seja um objeto vazio
                return res.status(400).json({ message: 'Nome e bônus são obrigatórios.' });
            }

            // UPSERT: Insere se não existir, atualiza se existir
            // Garante que o nome seja salvo em minúsculas para consistência
            const raceNameDB = name.toLowerCase();
            await sql`
        INSERT INTO races (name, bonus) 
        VALUES (${raceNameDB}, ${JSON.stringify(bonus)})
        ON CONFLICT (name) 
        DO UPDATE SET bonus = ${JSON.stringify(bonus)};
      `;
            res.status(200).json({ message: 'Raça salva com sucesso!' });
        }
        else if (req.method === 'DELETE') {
            // Espera um parâmetro 'name' na URL query para deletar
            // Ex: /api/races?name=nomedaraca
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