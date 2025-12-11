import express from 'express';
import cors from 'cors';
import { router } from './routes.js'; // <--- IMPORTANTE: Importar as rotas

const app = express();

app.use(cors());
app.use(express.json());

app.use(router); // <--- IMPORTANTE: Usar as rotas

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
});