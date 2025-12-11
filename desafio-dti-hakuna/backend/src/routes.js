import { Router } from 'express';
import { pedidoController } from './controllers/PedidoController.js';

const router = Router();

// --- Rotas Principais (Requisitos do PDF) ---

// 1. Dashboard Completo (Alimenta os Cards, Tabela de Drones, Mapa e Fila)
// O Frontend chama isso a cada 1 segundo para atualizar a tela
router.get('/dashboard', (req, res) => pedidoController.getDashboard(req, res));

// 2. Criar Novo Pedido (Vem do Modal)
// Recebe endereço, peso, prioridade e coloca na fila de espera
router.post('/pedidos', (req, res) => pedidoController.criarPedido(req, res));


// --- Rotas de Suporte/Teste ---

// Health Check (Para saber se o servidor caiu)
router.get('/health', (req, res) => {
    res.json({ status: 'API Drones Online 🚁', time: new Date() });
});

export { router };