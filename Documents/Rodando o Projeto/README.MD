# Instruções de Execução do Sistema de Drones (Drone e CIA)

Este guia detalha os passos necessários para configurar e rodar a simulação de logística de drones, incluindo o servidor de simulação (Node.js) e o dashboard de controle (React).

## 1. Pré-requisitos

- **Node.js**: Versão 18.x ou superior.
- **NPM**: Gerenciador de pacotes.

## 2. Estrutura do Projeto

O projeto é dividido em duas camadas principais:

| Pasta | Conteúdo | Porta de Execução |
|-------|----------|-------------------|
| `backend/` | Servidor Node.js, Express, GeoLib (Simulação) | 3000 |
| `frontend/` | Dashboard React, Leaflet, TailwindCSS | 5173 (Vite) |

## 3. Configuração Inicial e Instalação

Abra o terminal na raiz do projeto **(`Drone-e-CIA/`)** e execute os comandos abaixo para instalar as dependências de cada camada:

### 3.1. Instalar dependências do Backend (Simulador):

```bash
cd backend
npm install
````

### 3.2. Instalar dependências do Frontend (Dashboard):

```bash
cd ../frontend
npm install
```

*Volte para a raiz do projeto antes de prosseguir.*

## 4\. Inicialização do Banco de Dados

*Nota: Este projeto utiliza persistência em memória (Array em tempo de execução) para garantir a velocidade da simulação em tempo real, portanto **não há necessidade** de rodar migrations ou configurar bancos externos (SQLite/Postgres).*

## 5\. Execução do Projeto

Para que o sistema funcione corretamente, o Backend (Cérebro) e o Frontend (Visualização) devem estar rodando **simultaneamente**.

**Recomendação**: Use dois terminais separados no VS Code.

### 5.1. Terminal 1: Iniciar o Backend

1.  Navegue até a pasta `backend`:

<!-- end list -->

```bash
cd backend
```

2.  **Iniciar o Servidor:**

<!-- end list -->

```bash
npm run dev
```

**Resultado esperado**: Você verá a mensagem `🚀 Servidor rodando em http://localhost:3000` e logs indicando que a simulação dos drones começou.

### 5.2. Terminal 2: Iniciar o Frontend

1.  Navegue para a pasta `frontend`:

<!-- end list -->

```bash
cd frontend
```

2.  **Iniciar o Dashboard React:**

<!-- end list -->

```bash
npm run dev
```

**Resultado esperado**: A aplicação será aberta no navegador (geralmente em `http://localhost:5173/`), exibindo o mapa de Belo Horizonte.

## 6\. Execução dos Testes Automatizados

O projeto inclui suítes de testes unitários para validar as regras de negócio críticas (Capacidade e Prioridade).

### 6.1. Testes do Backend (Jest)

No terminal, navegue até a pasta `backend`:

```bash
cd backend
```

Rode o script de teste:

```bash
npm test
```

  * **Resultado esperado:** O Jest será executado e mostrará **PASS** para a suíte de testes de regras de negócio (`regras.test.js`).

## 7\. Roteiro de Teste (Validação dos Requisitos)

Siga este roteiro para validar todas as funcionalidades, incluindo as regras de negócio e a experiência do usuário (UX).

### 7.1. Validação da Otimização 1:N (Combo de Entregas)

  * **Ação:** Cadastre rapidamente 3 pedidos pequenos (ex: 2kg cada) no formulário `/cadastrar`.
  * **Observação:** No Dashboard, os pedidos ficarão como "Aguardando" na fila enquanto o drone estiver ocupado ou carregando.
  * **Resultado Esperado:** Assim que um drone for alocado, ele pegará **todos os 3 pedidos de uma vez** (desde que a soma seja \< 12kg) e iniciará uma rota única. O status mudará em bloco: `Em Preparo` -\> `Carregando` -\> `Em Transporte`.

### 7.2. Validação de UX e Segurança (Formulário)

  * **Ação:** Tente cadastrar um pedido com peso **15kg**.
  * **Resultado Esperado:** O campo de input travará o valor em **12** e um modal de alerta aparecerá informando o limite de segurança.
  * **Ação:** Preencha um CEP válido (ex: `30190-060`).
  * **Resultado Esperado:** O endereço e as coordenadas (Lat/Long) serão preenchidos automaticamente.

### 7.3. Validação de Tempo Real e Bateria

  * **Ação:** Cadastre um pedido para um local distante (ex: Betim ou Nova Lima). Você pode usar o CEP `32655-505` (Betim).
  * **Observação:** Acompanhe a tabela de "Status dos Drones" no Dashboard.
  * **Resultado Esperado:** 1. A coluna **ETA** mostrará uma estimativa regressiva (ex: "45 s").
    2\. A barra de bateria diminuirá gradualmente conforme a distância percorrida.
    3\. Ao clicar no drone no mapa, o popup exibirá as mesmas informações.

### 7.4. Conclusão e Feedback

  * **Ação:** Aguarde o drone chegar ao destino e retornar.
  * **Resultado Esperado:** 1. Uma notificação visual (**Toast**) aparecerá no canto inferior direito: *"Entrega Confirmada\!"*.
    2\. O pedido vai para a tabela "Histórico" com o **Tempo Total Real** da operação cronometrado.

<!-- end list -->

