# ORO - Trading Platform

A comprehensive cryptocurrency trading platform with a high-performance matching engine and web client.

## Project Structure

The project is organized into two main components:

- **engine/** - A high-performance trading engine for order matching
- **web-client/** - A Next.js web application for the trading interface

## Engine

### Features

- Processes order creation and cancellation
- Implements price-time priority matching algorithm
- Generates executed trades
- Maintains an order book

### Installation & Usage

```bash
cd engine
npm install
npm run build
npm start
```

The engine reads orders from `src/input/orders.json` and outputs to:
- `outputs/orderbook.json` - The current state of the order book
- `outputs/trades.json` - All executed trades

### Order Format

```json
{
  "type_op": "CREATE",
  "account_id": "1",
  "amount": "0.00230",
  "order_id": "1",
  "pair": "BTC/USDC",
  "limit_price": "63500.00",
  "side": "SELL"
}
```

The `type_op` field can be either `CREATE` to place a new order or `DELETE` to cancel an existing order.

### Testing the Engine

```bash
cd engine
npm test
```

## Web Client

The web client is built with Next.js.

### Getting Started

```bash
cd web-client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Deployment

The easiest way to deploy the Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- TypeScript
