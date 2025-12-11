import { simulacao } from '../services/SimulacaoService.js';
import { v4 as uuidv4 } from 'uuid';

class PedidoController {

    // GET /dashboard (Mantém para o Frontend)
    getDashboard(req, res) {
        return res.json(simulacao.getDashboardData());
    }

    // --- NOVOS ENDPOINTS DO REQUISITO ---

    // GET /drones/status
    getDronesStatus(req, res) {
        const data = simulacao.getDashboardData();
        // Retorna apenas a lista de drones e seus status
        return res.json(data.drones.map(d => ({
            id: d.id,
            status: d.status,
            bateria: d.bateria,
            capacidade: d.capacidadeRestante
        })));
    }

    // GET /entregas/rota
    getEntregasRota(req, res) {
        const data = simulacao.getDashboardData();
        // Filtra drones que estão voando e mostra suas rotas/destinos
        const emRota = data.drones
            .filter(d => d.status === 'EM_VOO' || d.status === 'RETORNANDO')
            .map(d => ({
                droneId: d.id,
                status: d.status,
                destino: d.rota, // "Próximo ao Destino" ou coordenada
                eta: d.eta,
                pedidos: d.pedidos.map(p => p.id) // IDs dos pedidos a bordo
            }));

        return res.json(emRota);
    }
    // ------------------------------------

    // POST /pedidos
    criarPedido(req, res) {
        try {
            const { endereco, bairro, numero, coordenadas, peso, prioridade } = req.body;

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

            const novoPedido = {
                id: uuidv4(),
                endereco: `${endereco}, ${numero || 's/n'}`,
                bairro,
                coordenadas: coordenadas,
                peso: Number(peso),
                prioridade,
                status: 'Aguardando'
            };

            simulacao.adicionarPedido(novoPedido);

            return res.status(201).json({
                mensagem: 'Pedido criado e processado.',
                pedido: novoPedido
            });

        } catch (erro) {
            return res.status(500).json({ erro: erro.message });
        }
    }
}

export const pedidoController = new PedidoController();