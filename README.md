# ORO Trading Engine

A high-performance matching engine for cryptocurrency trading built with TypeScript.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- TypeScript installed

## Installation

```bash
cd engine
npm install
```

## Running the Engine

Build the TypeScript code:
```bash
npm run build
```

Start the engine:
```bash
npm start
```

## Input and Output

The engine reads orders from `src/input/orders.json` and outputs to:
- `outputs/orderbook.json` - The current state of the order book
- `outputs/trades.json` - All executed trades

## Order Format

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

## Order Book Structure

The order book maintains buy orders (bids) and sell orders (asks) sorted by price:
- Bids are sorted in descending order (highest price first)
- Asks are sorted in ascending order (lowest price first)

## Trade Matching

Orders are matched when:
1. A buy order's price meets or exceeds a sell order's price
2. Orders are for the same trading pair

When orders match, trades are executed at the price of the pre-existing order in the book.

## Example Orders

### Place a Buy Order
```json
{
  "type_op": "CREATE",
  "account_id": "2",
  "amount": "0.5",
  "order_id": "11",
  "pair": "BTC/USDC",
  "limit_price": "66577.30",
  "side": "BUY"
}
```

### Place a Sell Order
```json
{
  "type_op": "CREATE",
  "account_id": "1",
  "amount": "0.2",
  "order_id": "6",
  "pair": "BTC/USDC",
  "limit_price": "47500",
  "side": "SELL"
}
```

### Cancel an Order
```json
{
  "type_op": "DELETE",
  "account_id": "1",
  "amount": "0.12785",
  "order_id": "5",
  "pair": "BTC/USDC",
  "limit_price": "61577.30",
  "side": "SELL"
}
```
