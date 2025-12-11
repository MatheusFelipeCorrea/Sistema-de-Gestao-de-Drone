export class Drone {
    constructor(id) {
        this.id = id;
        this.capacidadeMax = 12.0; // 12kg
        this.velocidade = 0.0005;  // Velocidade simulada de movimento (graus lat/long por tick)

        // Estado Inicial
        this.status = 'IDLE'; // IDLE, CARREGANDO, EM_VOO, ENTREGANDO, RETORNANDO
        this.bateria = 100; // %
        this.cargaAtual = 0;

        // Localização (Base: Praça Raul Soares, BH)
        this.baseLocation = { lat: -19.9208, lng: -43.9378 };
        this.localizacao = { ...this.baseLocation };
        this.destinoAtual = null;

        // Dados para o Dashboard
        this.rota = 'Na Base'; // Texto descritivo
        this.pedidos = []; // Pedidos carregados
    }

    // Calcula o status da bateria para o front (Regra do Wireframe)
    getStatusBateria() {
        if (this.bateria > 50) return 'Alta';
        if (this.bateria > 25) return 'Média';
        return 'Baixa';
    }

    // Capacidade Restante (Regra do Wireframe)
    getCapacidadeRestante() {
        return (this.capacidadeMax - this.cargaAtual).toFixed(2);
    }
}