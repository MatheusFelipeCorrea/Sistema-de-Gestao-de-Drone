import { simulacao } from '../services/SimulacaoService.js';
import { v4 as uuidv4 } from 'uuid';

class PedidoController {

    // GET /dashboard
    getDashboard(req, res) {
        return res.json(simulacao.getDashboardData());
    }

    // POST /pedidos
    criarPedido(req, res) {
        try {
            const { endereco, bairro, numero, coordenadas, peso, prioridade } = req.body;

            // --- VALIDAÇÃO DE REGRA DE NEGÓCIO (Requisito 01 do PDF) ---
            // Isso garante que o erro 400 apareça se o usuário tentar burlar
            if (Number(peso) > 12.0) {
                return res.status(400).json({
                    erro: "Peso excede a capacidade máxima do drone (12kg)."
                });
            }

            if (!endereco || !coordenadas) {
                return res.status(400).json({
                    erro: "Endereço e coordenadas são obrigatórios."
                });
            }
            // -----------------------------------------------------------

            const novoPedido = {
                id: uuidv4(),
                endereco: `${endereco}, ${numero || 's/n'}`,
                bairro,
                coordenadas: coordenadas,
                peso: Number(peso),
                prioridade,
                status: 'Aguardando' // Importante para a fila
            };

            simulacao.adicionarPedido(novoPedido);

            return res.status(201).json({
                mensagem: 'Pedido criado e processado.',
                pedido: novoPedido
            });

        } catch (erro) {
            // Isso garante o erro 500 caso algo quebre no servidor
            return res.status(500).json({ erro: erro.message });
        }
    }
}

export const pedidoController = new PedidoController();