import { getDistance } from 'geolib';
import { Drone } from '../models/Drone.js';

class SimulacaoService {
    constructor() {
        // Inicializa Frota (5 Drones)
        this.frota = [
            new Drone('4562256'),
            new Drone('0293201'),
            new Drone('4590902'),
            new Drone('3466703'),
            new Drone('7642304')
        ];

        this.pedidosFila = [];
        this.pedidosConcluidos = [];

        this.historicoViagens = 0;
        this.historicoEntregas = 0;
        this.somaTempoEntregas = 0; // Acumulador de tempo (segundos)

        // Game Loop (1 segundo)
        setInterval(() => this.atualizarFrota(), 1000);
    }

    adicionarPedido(pedido) {
        this.pedidosFila.push({
            ...pedido,
            status: 'Aguardando',
            criadoEm: Date.now() // Timestamp importante para o cálculo
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
            if (pedidoPrincipal.status !== 'Aguardando') return;

            if (pedidoPrincipal.peso <= drone.capacidadeMax) {
                let melhorCombinacao = [pedidoPrincipal];
                let pesoCombinado = pedidoPrincipal.peso;

                for (let i = 1; i < this.pedidosFila.length; i++) {
                    const pedidoCandidato = this.pedidosFila[i];
                    if (pedidoCandidato.status !== 'Aguardando') continue;
                    if (pesoCombinado + pedidoCandidato.peso > drone.capacidadeMax) continue;

                    melhorCombinacao.push(pedidoCandidato);
                    pesoCombinado += pedidoCandidato.peso;

                    if (pesoCombinado >= drone.capacidadeMax || melhorCombinacao.length >= 3) break;
                }

                melhorCombinacao.forEach(p => p.status = 'Carregando');

                drone.status = 'CARREGANDO';
                drone.pedidos = [...melhorCombinacao];
                drone.cargaAtual = pesoCombinado;
                drone.destinoAtual = melhorCombinacao[0].coordenadas;

                console.log(`🚀 ${drone.id} ALOCADO! Viagem com ${melhorCombinacao.length} pacotes.`);
            }
        });
    }

    moverDrone(drone, destino) {
        // Movimento (Interpolação)
        const latDiff = destino.lat - drone.localizacao.lat;
        const lngDiff = destino.lng - drone.localizacao.lng;
        drone.localizacao.lat += latDiff * 0.1;
        drone.localizacao.lng += lngDiff * 0.1;

        // Bateria
        drone.bateria -= 0.5;
        if(drone.bateria < 0) drone.bateria = 0;

        // Checagem de chegada
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

            // --- CÁLCULO DE TEMPO REAL ---
            const agora = Date.now();
            // Calcula quanto tempo demorou desde que foi criado (em segundos)
            const tempoDecorrido = (agora - pedidoEntregue.criadoEm) / 1000;
            this.somaTempoEntregas += tempoDecorrido;

            // Remove da fila e adiciona ao histórico
            this.pedidosFila = this.pedidosFila.filter(p => p.id !== pedidoEntregue.id);
            this.pedidosConcluidos.unshift({
                ...pedidoEntregue,
                status: 'Concluído',
                entregueEm: new Date().toLocaleTimeString('pt-BR'),
                tempoTotal: `${tempoDecorrido.toFixed(0)}s` // Guardamos para exibir se quiser
            });

            if (this.pedidosConcluidos.length > 50) this.pedidosConcluidos.pop();
        }

        if (drone.pedidos.length > 0) {
            drone.status = 'EM_VOO';
            drone.destinoAtual = drone.pedidos[0].coordenadas;
        } else {
            drone.status = 'RETORNANDO';
            drone.cargaAtual = 0;
            this.historicoViagens++;
        }
    }

    // Função Auxiliar para estimar tempo de chegada (ETA)
    calcularETA(drone) {
        if (drone.status !== 'EM_VOO' && drone.status !== 'RETORNANDO') return '-';

        const destino = drone.status === 'RETORNANDO' ? drone.baseLocation : drone.destinoAtual;
        if (!destino) return '-';

        const distMetros = getDistance(drone.localizacao, destino);

        // Estimativa: Velocidade média simulada de 100 metros por segundo (no mapa)
        // Isso é ajustado para a velocidade da nossa simulação visual
        const velocidadeMedia = 100;
        const segundos = Math.ceil(distMetros / velocidadeMedia);

        if (segundos > 60) {
            return `${Math.ceil(segundos/60)} min`;
        }
        return `${segundos} s`;
    }

    getDashboardData() {
        // Cálculo da Média Global
        const mediaSegundos = this.historicoEntregas > 0
            ? this.somaTempoEntregas / this.historicoEntregas
            : 0;

        // Formatação (Ex: "120s" ou "2 min")
        let tempoMedioFormatado = '-';
        if (mediaSegundos > 0) {
            tempoMedioFormatado = mediaSegundos > 60
                ? `${(mediaSegundos/60).toFixed(1)} min`
                : `${mediaSegundos.toFixed(0)} seg`;
        }

        const eficiencia = this.historicoViagens > 0
            ? Math.round((this.historicoEntregas / (this.historicoViagens)) * 100) // Ajustei a formula
            : 100;

        return {
            metricas: {
                entregas: this.historicoEntregas,
                viagens: this.historicoViagens,
                eficiencia: `${eficiencia}%`,
                droneEficiente: '4562256',
                tempoMedio: tempoMedioFormatado // <--- Valor Real Agora
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
                pedidos: d.pedidos,
                eta: this.calcularETA(d) // <--- Nova Propriedade ETA
            })),
            pedidos: this.pedidosFila,
            historico: this.pedidosConcluidos
        };
    }
}

export const simulacao = new SimulacaoService();