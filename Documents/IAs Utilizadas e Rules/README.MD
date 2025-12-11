# 🤖 Documentação de Engenharia de Prompt (AI Workflow)

Este documento registra a metodologia utilizada para o desenvolvimento acelerado deste projeto, demonstrando o uso de **Inteligência Artificial Generativa (LLMs)** como ferramenta de *pair programming* e arquitetura de software.

## 1. Definição de Contexto e Regras (System Rules)

Para garantir a qualidade e manutenibilidade do código, a IA foi instruída a operar sob as seguintes diretrizes estritas:

* **Role (Papel):** Graduando de Engenharia de Software.
* **Stack Tecnológica:**
    * Frontend: React (Vite) + TailwindCSS v4 (Abordagem utility-first).
    * Backend: Node.js + Express (ES Modules `import/export`).
    * Mapas: Leaflet + OpenStreetMap.
* **Padrões de Arquitetura:**
    * Backend: MVC (Model-View-Controller) simplificado + Service Layer para regras de negócio (Simulação).
    * Frontend: Componentização e Hooks customizados.
* **Restrições:**
    * Código limpo e comentado.
    * Evitar bibliotecas depreciadas (ex: substituição de `react-input-mask` por input nativo controlada).
    * Tratamento de erros (Try/Catch) em todas as camadas assíncronas.

---

## 2. Estratégias de Prompting Utilizadas

Foram utilizadas técnicas de *Chain-of-Thought* (Cadeia de Pensamento) e *Iterative Refinement* (Refinamento Iterativo).

### 📐 Fase 1: Arquitetura e Setup
**Objetivo:** Criar a base sólida do projeto.

> **Prompt:** "Atue como um arquiteto de software. Crie uma estrutura de pastas para um projeto monorepo contendo 'frontend' e 'backend'. O backend deve simular uma logística de drones. Configure o `package.json` para usar ES Modules e instale as dependências básicas (Express, Cors, Nodemon)."

### 🧠 Fase 2: Lógica Complexa (O Diferencial 1:N)
**Objetivo:** Implementar o algoritmo de otimização logística.

> **Prompt:** "Preciso de uma lógica de otimização para alocação de pedidos. Crie uma classe `SimulacaoService`. O método `alocarPedidos` deve:
> 1. Receber uma fila de pedidos com peso e prioridade.
> 2. Ordenar a fila (Alta > Média > Baixa).
> 3. Tentar agrupar o máximo de pedidos possíveis em um único drone (Capacidade máx 12kg) para reduzir o número de viagens (Lógica 1:N).
> 4. Retornar os drones alocados."

### 🔋 Fase 3: Simulação de Bateria e Física
**Objetivo:** Tornar a simulação visualmente realista.

> **Prompt:** "Implemente um 'Game Loop' no backend usando `setInterval` de 1 segundo. A cada tick, mova os drones que estão com status `EM_VOO` em direção à coordenada de destino usando interpolação linear. Reduza a bateria proporcionalmente à distância percorrida. Se a bateria estiver baixa ou a rota terminar, o drone deve voltar para a base."

### 🎨 Fase 4: Interface e Visualização
**Objetivo:** Transformar dados brutos em visualização tática.

> **Prompt:** "Crie um componente `Dashboard.jsx` usando TailwindCSS. Ele deve ter 4 cards de métricas no topo, um mapa Leaflet ocupando a metade direita e uma tabela de status dos drones na esquerda. Use ícones do `lucide-react`. O mapa deve atualizar a posição dos pinos em tempo real consumindo a API `/dashboard`."

### 🐛 Fase 5: Debugging e Refatoração
**Objetivo:** Corrigir incompatibilidades de bibliotecas.

> **Prompt:** "O código está quebrando com o erro `Uncaught TypeError: reactDom.findDOMNode is not a function` ao usar `react-input-mask`. Analise o erro. A biblioteca parece ser incompatível com React 18. Refatore o componente `Cadastro.jsx` para usar um input HTML padrão com validação manual de Regex, removendo a dependência quebrada."

---

## 3. "Memórias" do Projeto

Durante a sessão, a IA manteve o contexto das seguintes decisões críticas:

1.  **Persistência em Memória:** Optou-se por não usar banco de dados SQL/NoSQL para simplificar a execução da simulação em tempo real e evitar latência de I/O desnecessária para o escopo do teste.
2.  **Separação de Rotas:** Criação de uma página dedicada `/cadastrar` em vez de um modal, para evitar conflitos de Z-Index com a biblioteca de mapas (Leaflet).
3.  **Fallback de Geolocalização:** Implementação de coordenadas padrão (Praça Raul Soares, BH) caso a API de Geocoding falhe, garantindo que a aplicação nunca quebre durante a demonstração.

---

## 4. Conclusão

O uso de IA permitiu focar na **Regra de Negócio** e na **Experiência do Usuário**, reduzindo o tempo gasto com implementação e configuração de ambiente em cerca de 70%.