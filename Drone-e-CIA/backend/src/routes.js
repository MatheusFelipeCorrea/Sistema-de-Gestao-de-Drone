import { Router } from 'express';
import { pedidoController } from './controllers/PedidoController.js';

const routes = Router();

// Rota de Saúde
routes.get('/health', (req, res) => {
    return res.json({
        status: 'API Drones Online 🚁',
        time: new Date()
    });
});

// --- Rotas do Dashboard (Frontend) ---
routes.get('/dashboard', (req, res) => pedidoController.getDashboard(req, res));

// --- Rotas Obrigatórias do Desafio ---
routes.post('/pedidos', (req, res) => pedidoController.criarPedido(req, res));
routes.get('/drones/status', (req, res) => pedidoController.getDronesStatus(req, res));
routes.get('/entregas/rota', (req, res) => pedidoController.getEntregasRota(req, res));

export default routes;