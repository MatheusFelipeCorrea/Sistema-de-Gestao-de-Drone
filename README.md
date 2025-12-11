# Drone e CIA

Este repositório contém uma solução completa para simulação de logística urbana com drones autônomos. O sistema resolve o desafio de alocação de cargas utilizando algoritmos de otimização (1:N), gerenciamento de bateria e visualização em tempo real via mapa interativo.

O foco deste projeto é a **otimização logística** (menor número de viagens) e a **experiência do usuário** (Dashboard rico em dados).

## 🚀 Tecnologias Utilizadas

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Interface interativa com **TailwindCSS v4** e Mapa dinâmico (**Leaflet**). |
| **Backend** | Node.js (Express) | API RESTful com arquitetura MVC simplificada. |
| **Simulação** | Lógica Customizada | Algoritmo de "Game Loop" para movimentação e consumo de bateria em tempo real. |
| **Geolocalização** | Nominatim / GeoLib | Conversão de endereços em coordenadas reais e cálculo de distâncias. |
| **Testes** | Jest | Testes unitários para regras de negócio (Capacidade e Prioridade). |

## 📝 Documentação e Links Úteis

Toda a documentação técnica, manuais de execução e registros do uso de IA estão organizados na pasta `Documents`:

* **[Como Rodar o Projeto](./Documents/Rodando%20o%20Projeto/README.md)** (Passo a passo Backend/Frontend e Testes)
* **[Documentação da API](./Documents/Documentação%20API/README.md)** (Endpoints e Estrutura de Dados)
* **[IAs Utilizadas](./Documents/IAs%20Utilizadas/README.md)** (Prompts, regras e contexto utilizados)
* **[Wireframes](Documents/Wireframes Iniciais/README.md)** (Desenhos das telas)

---
Desenvolvido por Matheus Felipe para o Desafio Técnico DTI.