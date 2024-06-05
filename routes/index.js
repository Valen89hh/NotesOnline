import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta para el Home
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta para About
router.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/join.html'));
});

// Ruta para Contact
router.get('/sala/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/sala.html'));
});

export default router;