import express from 'express';
import cors from 'cors';
import routes from './routes.js'; // <--- CORREÇÃO: Importação sem chaves { }

const app = express();
const PORT = 3000;

// Configuração de Middlewares
app.use(cors());
app.use(express.json());

// Usar as rotas importadas
app.use(routes);

// Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});