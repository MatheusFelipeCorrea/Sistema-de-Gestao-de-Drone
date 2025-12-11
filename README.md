# 🚁 Drone e CIA - Sistema de Logística Inteligente

Este repositório contém uma solução completa para simulação e gerenciamento de entregas por drones em áreas urbanas. O sistema resolve o desafio de alocação de cargas utilizando algoritmos de otimização (1:N), gerenciamento de bateria e visualização em tempo real via mapa interativo.

O foco deste projeto vai além da lógica: entrega uma **experiência de usuário (UX) fluida**, com validações de segurança, feedback visual imediato e design responsivo (Mobile-First).

## 🎯 Funcionalidades e Diferenciais

  * **Otimização Logística (1:N):** Algoritmo que agrupa múltiplos pedidos na mesma viagem, respeitando a capacidade de carga (12kg).
  * **Dashboard em Tempo Real:**
      * Mapa interativo (Leaflet) com rastreamento ao vivo da frota.
      * Cálculo de **ETA (Estimativa de Chegada)** dinâmico.
      * Histórico com tempo real de entrega cronometrado.
      * Notificações visuais ("Toasts") ao concluir entregas.
  * **Simulação Realista:**
      * Máquina de estados completa: *Aguardando* → *Em Preparo* → *Carregando* → *Em Transporte* → *Entregando*.
      * Consumo de bateria baseado na distância percorrida.
  * **UX/UI Avançada:**
      * **Responsividade Total:** Interface adaptada para Desktop, Tablets e Celulares.
      * **Smart Forms:** Busca automática de CEP e coordenadas, com travas de segurança para peso excedente.

## 🚀 Tecnologias Utilizadas

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Interface reativa com **TailwindCSS v4** e componentes **Lucide**. |
| **Mapas** | Leaflet + OSM | Renderização de mapas e pinos personalizados. |
| **Backend** | Node.js (Express) | API RESTful com arquitetura MVC simplificada. |
| **Simulação** | GeoLib + Custom Logic | "Game Loop" para movimentação e cálculos geodésicos em tempo real. |
| **Testes** | Jest | Testes unitários para validação de regras de negócio (Capacidade e Prioridade). |

## 📝 Documentação e Links Úteis

Toda a documentação técnica, manuais de execução e registros do uso de IA estão organizados na pasta `Documents`:

  * **[Como Rodar o Projeto](https://www.google.com/search?q=./Documents/Rodando%2520o%2520Projeto/README.md)** (Passo a passo Backend/Frontend e Testes)
  * **[Documentação da API](https://www.google.com/search?q=./Documents/Documenta%C3%A7%C3%A3o%2520API/README.md)** (Endpoints e Estrutura de Dados)
  * **[IAs Utilizadas](https://www.google.com/search?q=./Documents/IAs%2520Utilizadas/README.md)** (Prompts, regras e contexto utilizados)
  * **[Wireframes](https://www.google.com/search?q=./Documents/Wireframes/README.md)** (Desenhos das telas e protótipos)

-----
