# 🤖 Documentação de Uso de IA e Engenharia de Prompt

Este documento registra a metodologia utilizada para o desenvolvimento acelerado do **Sistema de Gestão de Drones**, demonstrando o uso de Inteligência Artificial Generativa (LLMs) como ferramenta de *pair programming*, arquitetura de software e controle de qualidade.

---

## 1. Ferramentas de IA Utilizadas

O desenvolvimento contou com o suporte estratégico de ferramentas de IA para otimizar o ciclo de vida do software:

* **Gemini (Google):** Utilizada como assistente principal para programação (Full Stack), depuração (Debugging), arquitetura de software e geração de documentação.

---

## 2. Detalhamento de Uso: Gemini

A IA generativa foi empregada não apenas para "escrever código", mas para validar lógica de negócios complexa e garantir a qualidade da entrega.

### 2.1. Organização de Pastas e Arquitetura
A IA foi consultada para definir uma estrutura escalável para o desafio, garantindo a separação de responsabilidades entre a simulação no Backend e a visualização no Frontend.

* **Contexto:** Necessidade de um *Loop* de simulação rodando no servidor independente do cliente.
* **Prompt de Exemplo:** *"Estou criando um simulador de logística com React (Vite) e Node.js. Como organizar a estrutura para que o Backend rode um 'Game Loop' de atualização de drones a cada segundo, enquanto o Frontend apenas consome esses dados via polling?"*

### 2.2. Implementação e Configuração de Testes
Auxílio na configuração do ambiente de testes unitários para validar as regras críticas do desafio (Capacidade de Carga e Prioridade).

* **Contexto:** Garantir que um drone nunca leve mais de 12kg.
* **Prompt de Exemplo:** *"Preciso validar a regra de negócio da classe Drone. Escreva um teste unitário usando Jest que falhe caso tente-se adicionar um pacote que exceda a capacidade restante de 12kg."*

### 2.3. Gerenciamento de Requisitos e Tarefas
A IA atuou como *Project Manager*, analisando o PDF do desafio e transformando-o em checklists acionáveis.

* **Contexto:** Controle do escopo (Obrigatório vs. Diferencial).
* **Prompt de Exemplo:** *"Com base nesta lista de requisitos do desafio técnico (PDF) e no código que já desenvolvemos até agora (Simulação, Mapa, API), gere um checklist tabular do que está 'Feito', 'Pendente' e o que é 'Diferencial'."*

### 2.4. Suporte Geral ao Desenvolvimento (Depuração)
Atuação como *Pair Programmer* para identificar bugs silenciosos e erros de compatibilidade.

* **Contexto:** Erro de atualização de estado no React em dispositivos móveis.
* **Prompt de Exemplo:** *"O campo de coordenadas do formulário funciona no Desktop, mas no Mobile ele fica vazio mesmo após o CEP preencher o endereço. Analise este componente `Cadastro.jsx` e me explique por que o evento `onBlur` pode estar falhando no celular e como corrigir."*

---

## 3. Definição de Contexto e Regras (System Rules)

Para garantir a qualidade e manutenibilidade do código gerado, a IA foi instruída a operar sob as seguintes diretrizes estritas:

* **Role (Papel):** Engenheiro de Software Sênior / Arquiteto de Soluções.
* **Stack Tecnológica:**
    * Frontend: React (Vite) + TailwindCSS v4.
    * Backend: Node.js + Express (ES Modules).
    * Mapas: Leaflet + OpenStreetMap.
* **Restrições:**
    * Código limpo e comentado (Clean Code).
    * Evitar bibliotecas depreciadas.
    * Tratamento de erros (Try/Catch) obrigatório em chamadas assíncronas.

---

## 4. Estratégias de Prompting Utilizadas

Foram utilizadas técnicas de *Chain-of-Thought* (Cadeia de Pensamento) para resolver os problemas mais complexos.

### 🧠 Lógica Complexa (Otimização 1:N)
**Objetivo:** Implementar o algoritmo que agrupa pedidos.

> **Prompt:** "Preciso de uma lógica de otimização para alocação de pedidos. Crie um método `alocarPedidos` que receba uma fila priorizada e tente agrupar o máximo de pacotes em um único drone (Capacidade 12kg), reduzindo o número total de viagens."

### 🔋 Simulação de Bateria e Física
**Objetivo:** Tornar a simulação visualmente realista no mapa.

> **Prompt:** "Implemente um método na classe Drone que, a cada 'tick' do servidor, calcule a distância percorrida usando a lib `geolib` e reduza a bateria proporcionalmente. Se a bateria chegar a 20%, o drone deve mudar o status para 'RETORNANDO'."

---

## 5. "Memórias" do Projeto

Durante a sessão, a IA manteve o contexto das seguintes decisões críticas:

1.  **Persistência em Memória:** Optou-se por arrays em memória (`this.frota = []`) em vez de banco de dados para garantir a performance do *Game Loop* de 1 segundo sem latência de disco.
2.  **Validação UX:** Decisão de usar "Trava no Input" para o peso (impedir >12kg) em vez de apenas validar no backend, melhorando a experiência do usuário.
3.  **Fallback de Geolocalização:** Implementação de tratamento de erro caso a API *Nominatim* falhe, garantindo que o sistema não quebre.

---

## 6. Conclusão

O uso de IA permitiu focar na **Regra de Negócio** e na **Experiência do Usuário**, reduzindo o tempo gasto com implementação, verificação de requisitos e configuração de ambiente em cerca de 70%, permitindo entregar um projeto completo com testes e documentação em tempo recorde.
