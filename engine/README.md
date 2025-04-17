# Trading Engine

A high-performance trading engine for order matching.

## Features

- Processes order creation and cancellation
- Implements price-time priority matching algorithm
- Generates executed trades
- Maintains an order book

## Installation

```bash
npm install
```

## Usage

### Building the application

```bash
npm run build
```

### Running the application

```bash
npm start
```

The application reads orders from `src/input/orders.json` and produces two output files:
- `outputs/orderbook.json`: The current state of the order book
- `outputs/trades.json`: The list of trades that were executed

## Testing

The trading engine is thoroughly tested with Jest. To run the tests:

```bash
npm test
```

### Test Coverage

The test suite includes tests for:
- Order model validation
- Order matching logic for buy and sell orders
- Order cancellation
- Partial fills
- Edge cases (no match, price mismatch)
- Main application workflow

## Project Structure

```
engine/
├── src/
│   ├── controllers/   # Business logic controllers
│   ├── models/        # Data models
│   ├── services/      # Core services (MatchingEngine)
│   ├── views/         # View-related code
│   ├── input/         # Input files
│   └── index.ts       # Main application entry point
├── test/
│   ├── models/        # Tests for models
│   ├── services/      # Tests for services
│   └── index.test.ts  # Tests for main application
├── outputs/           # Generated output files
└── dist/              # Compiled JavaScript code
```

## Development

### Adding New Tests

To add new tests:

1. Create a test file in the appropriate directory (e.g., `test/services/NewService.test.ts`)
2. Write your tests using Jest's describe/it pattern
3. Run `npm test` to validate your tests