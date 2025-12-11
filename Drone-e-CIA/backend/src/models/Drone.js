export class Drone {
    /**
     * Construtor: Inicializa um novo drone com valores padrão.
     * @param {string} id - Identificador único do drone (ex: '4562256')
     */
    constructor(id) {
        this.id = id;

        // --- REGRAS DE NEGÓCIO (Do Case) ---
        this.capacidadeMax = 12.0; // Limite físico de 12kg

        // Velocidade de deslocamento no mapa a cada 'tick' do loop.
        // Ajustado para 0.0005 para o movimento ser visível mas suave no Frontend.
        this.velocidade = 0.0005;

        // --- ESTADO INICIAL ---
        // Máquina de estados: IDLE -> CARREGANDO -> EM_VOO -> ENTREGANDO -> RETORNANDO
        this.status = 'IDLE';
        this.bateria = 100; // Começa com carga total
        this.cargaAtual = 0; // Começa vazio

        // --- GEOLOCALIZAÇÃO ---
        // Ponto de partida fixo: Praça Raul Soares, BH (Centro da operação)
        this.baseLocation = { lat: -19.9208, lng: -43.9378 };

        // A posição atual começa na base, mas vai mudar a cada segundo
        this.localizacao = { ...this.baseLocation };
        this.destinoAtual = null; // Para onde ele está indo agora?

        // --- DADOS PARA VISUALIZAÇÃO ---
        this.rota = 'Na Base'; // Texto amigável para exibir na tabela do Dashboard
        this.pedidos = []; // Lista dos objetos de pedido que estão a bordo
    }

    /**
     * Método Auxiliar: Traduz a bateria numérica para texto.
     * Facilita a renderização de cores/barras no Frontend.
     */
    getStatusBateria() {
        if (this.bateria > 50) return 'Alta';   // Verde
        if (this.bateria > 25) return 'Média';  // Amarelo
        return 'Baixa';                         // Vermelho
    }

    /**
     * Método de Cálculo: Quanto peso ainda cabe neste drone?
     * Usado pelo algoritmo de otimização (1:N) para saber se cabe mais um pacote.
     * @returns {string} Valor formatado com 2 casas decimais (ex: "3.50")
     */
    getCapacidadeRestante() {
        return (this.capacidadeMax - this.cargaAtual).toFixed(2);
    }
}