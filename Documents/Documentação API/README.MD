Perfeito\! Manter o padrão de documentação é essencial. Adaptei o seu esboço do "Mercado Digital" para o contexto do **Sistema de Drones**, mantendo exatamente a mesma estrutura visual e nível de detalhe.

Isso deve ser salvo em: **`Documents/Documentação API/README.md`**.

-----

# API - Sistema de Gestão de Drones (DTI)

Esta é a documentação para a API do backend do simulador de logística de drones, construída em Node.js com Express.

## Informações Gerais

* **URL Base:** `http://localhost:3000`
* **Autenticação:** Nenhuma. API pública para fins de simulação.
* **Formato dos Dados:** Todas as requisições (`POST`) devem enviar `Content-Type: application/json` e todos os dados no corpo devem ser JSON. Todas as respostas são em JSON.

-----

## Estrutura dos Dados

### Objeto de Dashboard (Retorno Principal)

O endpoint `/dashboard` retorna o estado completo da simulação ("snapshot"), que é consumido pelo frontend a cada 1 segundo. Ele segue esta estrutura:

```json
{
  "metricas": {
    "entregas": 12,
    "viagens": 5,
    "eficiencia": "100%",
    "droneEficiente": "4562256",
    "tempoMedio": "2 seg"
  },
  "drones": [
    {
      "id": "4562256",
      "status": "EM_VOO",
      "capacidadeRestante": "8.50",
      "bateria": "Alta",
      "bateriaPercentual": 85,
      "rota": "Próximo ao Destino",
      "lat": -19.9208,
      "lng": -43.9378,
      "pedidos": []
    }
  ],
  "pedidos": [
    {
      "id": "uuid-1234",
      "endereco": "Av. Amazonas, 100",
      "peso": 2.5,
      "prioridade": "Alta",
      "status": "Aguardando"
    }
  ],
  "historico": [
    {
      "id": "uuid-5678",
      "endereco": "Praça da Liberdade",
      "entregueEm": "14:30:00",
      "status": "Concluído"
    }
  ]
}
```

### Objeto de Erro

Quando uma requisição falha (ex: validação de peso), a API retorna:

```json
{
  "erro": "Peso excede a capacidade máxima do drone (12kg)."
}
```

-----

## Endpoints de Pedidos

Estes endpoints gerenciam a entrada de novas demandas logísticas.

### 1\. `POST /pedidos`

* **Propósito:** Cadastra uma nova entrega na fila. O sistema automaticamente tentará alocar este pedido a um drone disponível baseando-se na prioridade.
* **Validação:** O peso não pode exceder 12kg.

**Corpo da Requisição (JSON):**

```json
{
  "endereco": "Av. Afonso Pena, 1500",
  "bairro": "Centro",
  "numero": "1500",
  "coordenadas": {
    "lat": -19.9245,
    "lng": -43.9352
  },
  "peso": 5.5,
  "prioridade": "Alta"
}
```

* **Resposta de Sucesso (201):**

<!-- end list -->

```json
{
  "mensagem": "Pedido criado e processado.",
  "pedido": {
    "id": "uuid-gerado...",
    "status": "PENDENTE",
    ...
  }
}
```

* **Resposta de Erro (400):**

<!-- end list -->

```json
{
  "erro": "Peso excede a capacidade máxima do drone (12kg)."
}
```

-----

## Endpoints de Monitoramento

Estes endpoints fornecem dados em tempo real para a interface visual.

### 1\. `GET /dashboard`

* **Propósito:** Retorna o "estado do mundo" da simulação. Inclui posição de todos os drones, nível exato de bateria, fila de espera e histórico.

* **Frequência:** O Frontend consome este endpoint via *polling* (intervalo de 1 segundo).

* **Corpo da Requisição:** Nenhum.

* **Resposta de Sucesso (200):** Retorna o Objeto de Dashboard (ver estrutura acima).

### 2\. `GET /health`

* **Propósito:** Endpoint simples para verificar se o servidor está online.

* **Corpo da Requisição:** Nenhum.

* **Resposta de Sucesso (200):**

<!-- end list -->

```json
{
  "status": "API Drones Online 🚁",
  "time": "2023-12-10T14:00:00.000Z"
}
```