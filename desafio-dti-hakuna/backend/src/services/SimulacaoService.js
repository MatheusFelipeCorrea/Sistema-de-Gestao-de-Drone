import { getDistance } from 'geolib';
import { Drone } from '../models/Drone.js';

class SimulacaoService {
    constructor() {
        // Inicializa Drones (Deixei 1 ativo para teste, pode descomentar os outros)
        this.frota = [
            new Drone('4562256'),
            new Drone('0293201'),
            new Drone('4590902'),
            new Drone('3466703'),
            new Drone('7642304'),

            // new Drone('8812005'),
            // new Drone('1100206'),
            // new Drone('9934107'),
            // new Drone('5543208'),
            // new Drone('2211909')
        ];

        this.pedidosFila = [];      // Pedidos pendentes/ativos
        this.pedidosConcluidos = []; // NOVA LISTA: Histórico

        this.historicoViagens = 0;
        this.historicoEntregas = 0;

        setInterval(() => this.atualizarFrota(), 1000);
    }

    adicionarPedido(pedido) {
        this.pedidosFila.push({
            ...pedido,
            status: 'Aguardando',
            criadoEm: Date.now()
        });
        console.log(`📦 Novo pedido recebido: ${pedido.endereco}`);
    }

    atualizarFrota() {
        this.alocarPedidos();

        this.frota.forEach(drone => {
            if (drone.status === 'EM_VOO') {
                this.moverDrone(drone, drone.destinoAtual);
                drone.rota = 'Próximo ao Destino';
            }
            else if (drone.status === 'RETORNANDO') {
                this.moverDrone(drone, drone.baseLocation);
                drone.rota = 'Próximo à Base';
            }
            else if (drone.status === 'CARREGANDO') {
                drone.rota = 'Na Base';
                if (!drone.tempoCarregamento) drone.tempoCarregamento = 3;
                drone.tempoCarregamento--;
                if (drone.tempoCarregamento <= 0) {
                    drone.status = 'EM_VOO';
                    delete drone.tempoCarregamento;
                }
            }
            else if (drone.status === 'ENTREGANDO') {
                if (!drone.tempoEntrega) drone.tempoEntrega = 2;
                drone.tempoEntrega--;
                if (drone.tempoEntrega <= 0) {
                    this.concluirEntrega(drone);
                }
            }
        });
    }

    alocarPedidos() {
        const prioridadeMap = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
        this.pedidosFila.sort((a, b) => prioridadeMap[b.prioridade] - prioridadeMap[a.prioridade]);

        const dronesLivres = this.frota.filter(d => d.status === 'IDLE' && d.bateria > 20);

        dronesLivres.forEach(drone => {
            if (this.pedidosFila.length === 0) return;

            const pedidoPrincipal = this.pedidosFila[0];

            // Só aloca se o pedido estiver com status 'Aguardando' (evita pegar os que já estão em 'Entregue')
            if (pedidoPrincipal.status !== 'Aguardando') return;

            if (pedidoPrincipal.peso <= drone.capacidadeMax) {
                let melhorCombinacao = [pedidoPrincipal];
                let pesoCombinado = pedidoPrincipal.peso;

                // Otimização 1:N
                for (let i = 1; i < this.pedidosFila.length; i++) {
                    const pedidoCandidato = this.pedidosFila[i];
                    if (pedidoCandidato.status !== 'Aguardando') continue;

                    if (pesoCombinado + pedidoCandidato.peso > drone.capacidadeMax) continue;

                    melhorCombinacao.push(pedidoCandidato);
                    pesoCombinado += pedidoCandidato.peso;

                    if (pesoCombinado >= drone.capacidadeMax || melhorCombinacao.length >= 3) break;
                }

                // Atualiza status na fila principal
                melhorCombinacao.forEach(p => p.status = 'Carregando');

                drone.status = 'CARREGANDO';
                drone.pedidos = [...melhorCombinacao]; // Copia para o drone
                drone.cargaAtual = pesoCombinado;
                drone.destinoAtual = melhorCombinacao[0].coordenadas;

                console.log(`🚀 ${drone.id} ALOCADO! Viagem com ${melhorCombinacao.length} pacotes.`);
            }
        });
    }

    moverDrone(drone, destino) {
        const latDiff = destino.lat - drone.localizacao.lat;
        const lngDiff = destino.lng - drone.localizacao.lng;

        drone.localizacao.lat += latDiff * 0.1;
        drone.localizacao.lng += lngDiff * 0.1;

        drone.bateria -= 0.5;
        if(drone.bateria < 0) drone.bateria = 0;

        const dist = getDistance(drone.localizacao, destino);
        if (dist < 50) {
            if (drone.status === 'EM_VOO') {
                drone.status = 'ENTREGANDO';
            } else if (drone.status === 'RETORNANDO') {
                drone.status = 'IDLE';
                drone.rota = 'Na Base';
                drone.bateria = 100;
                drone.cargaAtual = 0;
            }
        }
    }

    concluirEntrega(drone) {
        const pedidoEntregue = drone.pedidos.shift();

        if (pedidoEntregue) {
            this.historicoEntregas++;

            // 1. Remove da Fila de Pendentes
            this.pedidosFila = this.pedidosFila.filter(p => p.id !== pedidoEntregue.id);

            // 2. Adiciona no Histórico de Concluídos
            const agora = new Date();
            this.pedidosConcluidos.unshift({
                ...pedidoEntregue,
                status: 'Concluído',
                entregueEm: agora.toLocaleTimeString('pt-BR')
            });

            // Limita o histórico aos últimos 50 pedidos (pra não travar a memória)
            if (this.pedidosConcluidos.length > 50) this.pedidosConcluidos.pop();
        }

        if (drone.pedidos.length > 0) {
            console.log(`🔄 ${drone.id} concluiu 1 entrega. Próximo...`);
            drone.status = 'EM_VOO';
            drone.destinoAtual = drone.pedidos[0].coordenadas;
        } else {
            console.log(`🏠 ${drone.id} retornando.`);
            drone.status = 'RETORNANDO';
            drone.cargaAtual = 0;
            this.historicoViagens++;
        }
    }

    getDashboardData() {
        const eficiencia = this.historicoViagens > 0
            ? Math.round((this.historicoEntregas / (this.historicoViagens/2)) * 100)
            : 100;

        return {
            metricas: {
                entregas: this.historicoEntregas,
                viagens: this.historicoViagens,
                eficiencia: `${eficiencia}%`,
                droneEficiente: '4562256',
                tempoMedio: '2 seg'
            },
            drones: this.frota.map(d => ({
                id: d.id,
                status: d.status,
                capacidadeRestante: d.getCapacidadeRestante(),
                bateria: d.getStatusBateria(),
                bateriaPercentual: Math.floor(d.bateria),
                rota: d.rota,
                lat: d.localizacao.lat,
                lng: d.localizacao.lng,
                pedidos: d.pedidos
            })),
            pedidos: this.pedidosFila,
            historico: this.pedidosConcluidos // <--- Enviando histórico pro front
        };
    }
}

export const simulacao = new SimulacaoService();