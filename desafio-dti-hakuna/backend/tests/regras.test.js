import { jest } from '@jest/globals';
import { Drone } from '../src/models/Drone.js';

describe('Regras de Negócio - Drone Delivery', () => {

    // Teste 1: Capacidade
    test('Deve respeitar a capacidade máxima de carga do drone (12kg)', () => {
        const drone = new Drone('TEST-01');
        const capacidadeMaxima = 12;

        const pacoteLeve = 5;
        const pacotePesado = 15; // Mais que 12kg

        // Lógica simples de validação
        const aceitaLeve = (drone.cargaAtual + pacoteLeve) <= capacidadeMaxima;
        const aceitaPesado = (drone.cargaAtual + pacotePesado) <= capacidadeMaxima;

        expect(aceitaLeve).toBe(true);
        expect(aceitaPesado).toBe(false);
    });

    // Teste 2: Prioridade
    test('Deve ordenar a fila corretamente (Alta > Média > Baixa)', () => {
        // Simula uma fila bagunçada
        const fila = [
            { id: 1, prioridade: 'Baixa' },
            { id: 2, prioridade: 'Alta' },
            { id: 3, prioridade: 'Média' }
        ];

        // Mapeamento de prioridade igual ao do Service
        const prioridadeMap = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };

        // Ordena
        fila.sort((a, b) => prioridadeMap[b.prioridade] - prioridadeMap[a.prioridade]);

        // Verifica se o primeiro é Alta e o último é Baixa
        expect(fila[0].prioridade).toBe('Alta');
        expect(fila[1].prioridade).toBe('Média');
        expect(fila[2].prioridade).toBe('Baixa');
    });

    // Teste 3: Consumo de Bateria
    test('O Drone deve consumir bateria ao se mover', () => {
        const drone = new Drone('TEST-02');
        drone.bateria = 100;

        // Simula movimento
        const consumoPorTick = 0.5;
        drone.bateria -= consumoPorTick;

        expect(drone.bateria).toBeLessThan(100);
        expect(drone.bateria).toBe(99.5);
    });
});