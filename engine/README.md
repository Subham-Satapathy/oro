# Trading Engine API

A high-performance trading engine with RESTful APIs built with Bun.

## Prerequisites

- [Bun](https://bun.sh/) runtime installed

## Installation

```bash
bun install
```

## Running the API server

Development mode with hot reloading:
```bash
bun dev
```

Production mode:
```bash
bun run build
bun start
```

The API server will be available at http://localhost:3000

## API Endpoints

### Health Check
```
GET /health
```

### Place an Order
```
POST /api/orders
```

Example request body:
```json
{
  "account_id": "user123",
  "amount": "1.5",
  "pair": "BTC-USD",
  "limit_price": "30000",
  "side": "buy",
  "type_op": "limit" 
}
```

### Get Order Book
```
GET /api/orderbook
```

### Get Trades
```
GET /api/trades
```

## Example cURL Commands

### Place a Buy Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "user123",
    "amount": "1.5",
    "pair": "BTC-USD",
    "limit_price": "30000",
    "side": "buy"
  }'
```

### Place a Sell Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "user456",
    "amount": "1.5",
    "pair": "BTC-USD",
    "limit_price": "30100",
    "side": "sell"
  }'
```

### Get Order Book
```bash
curl http://localhost:3000/api/orderbook
```

### Get Trades
```bash
curl http://localhost:3000/api/trades
```
