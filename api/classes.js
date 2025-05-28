import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export default async function handler(req, res) {
    try {
        const fileData = fs.readFileSync(dbPath);
        const db = JSON.parse(fileData);

        if (req.method === 'GET') {
            res.status(200).json(db.classes); // Retorna db.classes
        }
        else if (req.method === 'PUT') {
            db.classes = req.body; // Atualiza db.classes
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            res.status(200).json({ message: 'Classes updated successfully!' });
        }
        else {
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}