import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const { rows } = await sql`SELECT name, bonus, tipo FROM classes;`;
            const classesData = rows.reduce((acc, row) => {
                acc[row.name] = {
                    bonus: row.bonus,
                    tipo: row.tipo
                };
                return acc;
            }, {});
            res.status(200).json(classesData);
        }
        else if (req.method === 'PUT') {
            const { name, bonus, tipo } = req.body;
            if (!name || bonus === undefined || tipo === undefined) {
                return res.status(400).json({ message: 'Nome, bônus e tipo são obrigatórios.' });
            }
            const classNameDB = name.toLowerCase();
            await sql`
            INSERT INTO classes (name, bonus, tipo) 
            VALUES (${classNameDB}, ${JSON.stringify(bonus)}, ${JSON.stringify(tipo)})
            ON CONFLICT (name) 
            DO UPDATE SET 
                bonus = ${JSON.stringify(bonus)},
                tipo = ${JSON.stringify(tipo)};
        `;
            res.status(200).json({ message: 'Classe salva com sucesso!' });
        }
        else if (req.method === 'DELETE') {
            const { name } = req.query;
            if (!name) {
                return res.status(400).json({ message: 'Nome da classe é obrigatório para deletar.' });
            }
            const result = await sql`DELETE FROM classes WHERE name = ${name.toLowerCase()};`;
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Classe não encontrada para deletar.' });
            }
            res.status(200).json({ message: 'Classe deletada com sucesso!' });
        }
        else {
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Erro na API /api/classes:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}