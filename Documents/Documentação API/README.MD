
# 📡 Documentação da API - Sistema de Gestão de Drones

Esta é a documentação técnica dos endpoints do backend (`Node.js/Express`), responsável pela simulação logística, regras de negócio e persistência em memória.

## ℹ️ Informações Gerais

* **URL Base:** `http://localhost:3000`
* **Autenticação:** Nenhuma (API pública para fins de simulação).
* **Formato dos Dados:** * Requisições (`POST`): `Content-Type: application/json`.
    * Respostas: Sempre em formato JSON.

---

## 📦 Estrutura dos Dados

### 1. Objeto de Dashboard (Retorno Principal)

O endpoint `/dashboard` retorna o "snapshot" (estado atual) da simulação. O Frontend consome este endpoint a cada 1 segundo (polling).

```json
{
  "metricas": {
    "entregas": 12,
    "viagens": 5,
    "eficiencia": "100%",
    "droneEficiente": "4562256",
    "tempoMedio": "45 seg"
  },
  "drones": [
    {
      "id": "4562256",
      "status": "EM_VOO",
      "capacidadeRestante": 8.50,
      "bateria": "Alta",
      "bateriaPercentual": 85,
      "rota": "Próximo ao Destino",
      "lat": -19.9208,
      "lng": -43.9378,
      "eta": "45 s", 
      "pedidos": []
    }
  ],
  "pedidos": [
    {
      "id": "uuid-1234",
      "endereco": "Av. Amazonas, 100",
      "peso": 2.5,
      "prioridade": "Alta",
      "status": "Em transporte"
    }
  ],
  "historico": [
    {
      "id": "uuid-5678",
      "endereco": "Praça da Liberdade",
      "entregueEm": "14:30:00",
      "tempoTotal": "52s",
      "status": "Concluído"
    }
  ]
}
````

### 2\. Status Possíveis do Pedido

O ciclo de vida de um pedido segue este fluxo:

1.  **`Aguardando`** (Fila de espera)
2.  **`Em Preparo`** (Separando carga na base)
3.  **`Carregando`** (Colocando no drone)
4.  **`Em transporte`** (Drone em voo)
5.  **`Entregue` / `Concluído`** (Finalizado)

-----

## 🚀 Endpoints de Pedidos

Gerenciam a entrada de novas demandas logísticas.

### `POST /pedidos`

  * **Propósito:** Cadastra uma nova entrega na fila de prioridade.
  * **Regras de Negócio:**
      * Peso máximo: **12kg**.
      * Campos obrigatórios: Endereço, Coordenadas, Peso.

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

  * **Resposta de Sucesso (201 Created):**

<!-- end list -->

```json
{
  "mensagem": "Pedido criado e processado.",
  "pedido": {
    "id": "uuid-gerado...",
    "status": "Aguardando",
    ...
  }
}
```

  * **Resposta de Erro (400 Bad Request):**

<!-- end list -->

```json
{
  "erro": "Peso excede a capacidade máxima do drone (12kg)."
}
```

-----

## 📊 Endpoints de Monitoramento

Fornecem dados em tempo real para a interface visual.

### `GET /dashboard`

  * **Propósito:** Retorna o estado completo da frota, filas e métricas.

  * **Detalhes:** Inclui o cálculo de **ETA** (Estimativa de Tempo de Chegada) para cada drone e o nível exato de bateria.

  * **Resposta de Sucesso (200 OK):** Retorna o Objeto de Dashboard (ver estrutura acima).

### `GET /health`

  * **Propósito:** Health check para verificar se a API está online.

  * **Resposta de Sucesso (200 OK):**

<!-- end list -->

```json
{
  "status": "API Drones Online 🚁",
  "time": "2023-12-10T14:00:00.000Z"
}
```

```
```
