// Importa o "cérebro" da aplicação (Service), onde ficam os dados e a lógica real
import { simulacao } from '../services/SimulacaoService.js';
// Importa a biblioteca para gerar IDs únicos (ex: 'a1b2-c3d4...')
import { v4 as uuidv4 } from 'uuid';

class PedidoController {

    /**
     * GET /dashboard
     * Endpoint principal consumido pelo Frontend (React).
     * Retorna uma prévia completa do sistema: métricas, fila, histórico e posição dos drones.
     * Usado para atualização em tempo real (Polling).
     */
    getDashboard(req, res) {
        // Busca os dados brutos do serviço e devolve direto como JSON
        return res.json(simulacao.getDashboardData());
    }

    /**
     * GET /drones/status
     * REQUISITO DO CASE: Endpoint específico para monitoramento de frota.
     * Retorna uma lista simplificada contendo apenas o essencial sobre os drones.
     */
    getDronesStatus(req, res) {
        const data = simulacao.getDashboardData();

        // Mapeia (transforma) os dados complexos em um formato mais simples
        // Focando apenas em ID, Status, Bateria e Capacidade
        const statusSimplificado = data.drones.map(d => ({
            id: d.id,
            status: d.status,
            bateria: d.bateria,
            capacidade: d.capacidadeRestante
        }));

        return res.json(statusSimplificado);
    }

    /**
     * GET /entregas/rota
     * REQUISITO DO CASE: Endpoint para rastrear entregas ativas.
     * Filtra apenas os drones que estão voando e mostra seus destinos e cargas.
     */
    getEntregasRota(req, res) {
        const data = simulacao.getDashboardData();

        // 1. Filtra: Pega apenas drones que estão 'EM_VOO' ou 'RETORNANDO'
        const emRota = data.drones
            .filter(d => d.status === 'EM_VOO' || d.status === 'RETORNANDO')
            .map(d => ({
                droneId: d.id,
                status: d.status,
                destino: d.rota, // Mostra se está indo para o cliente ou para a base
                eta: d.eta,      // Tempo estimado de chegada (Cálculo matemático)
                pedidos: d.pedidos.map(p => p.id) // Lista apenas os IDs dos pacotes a bordo
            }));

        return res.json(emRota);
    }

    /**
     * POST /pedidos
     * Cria um novo pedido na fila.
     * Inclui validações de segurança e regras de negócio.
     */
    criarPedido(req, res) {
        try {
            // Desestrutura os dados vindos do corpo da requisição (JSON)
            const { endereco, bairro, numero, coordenadas, peso, prioridade } = req.body;

            // --- VALIDAÇÃO DE REGRA DE NEGÓCIO (Requisito Crítico) ---
            // Impede que cargas acima da capacidade do drone entrem no sistema.
            // Retorna erro 400 (Bad Request) se violar a regra.
            if (Number(peso) > 12.0) {
                return res.status(400).json({
                    erro: "Peso excede a capacidade máxima do drone (12kg)."
                });
            }

            // Validação de campos obrigatórios para garantir integridade
            if (!endereco || !coordenadas) {
                return res.status(400).json({
                    erro: "Endereço e coordenadas são obrigatórios."
                });
            }

            // Cria o objeto do pedido
            const novoPedido = {
                id: uuidv4(), // Gera um ID único universal
                endereco: `${endereco}, ${numero || 's/n'}`,
                bairro,
                coordenadas: coordenadas, // Objeto { lat, lng } vindo do Front
                peso: Number(peso),
                prioridade,
                status: 'Aguardando' // Estado inicial padrão
            };

            // Envia para o Service processar (colocar na fila e ordenar)
            simulacao.adicionarPedido(novoPedido);

            // Retorna 201 (Created) confirmando o sucesso
            return res.status(201).json({
                mensagem: 'Pedido criado e processado.',
                pedido: novoPedido
            });

        } catch (erro) {
            // Captura qualquer erro inesperado e retorna 500 (Server Error)
            // Isso evita que o servidor "caia" (crash)
            return res.status(500).json({ erro: erro.message });
        }
    }
}

// Exporta uma instância única (Singleton) do Controller
export const pedidoController = new PedidoController();