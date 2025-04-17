"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const matchingEngine_1 = require("./matchingEngine");
describe('MatchingEngine', () => {
    let engine;
    beforeEach(() => {
        engine = new matchingEngine_1.MatchingEngine();
    });
    test('should match buy and sell orders correctly', () => {
        const orders = [
            {
                order_id: '1',
                type_op: 'CREATE',
                account_id: '1',
                amount: '10',
                pair: 'BTC/USDC',
                limit_price: '100',
                side: 'SELL'
            },
            {
                order_id: '2',
                type_op: 'CREATE',
                account_id: '2',
                amount: '5',
                pair: 'BTC/USDC',
                limit_price: '100',
                side: 'BUY'
            }
        ];
        engine.processOrders(orders);
        const orderBook = engine.getOrderBook();
        const trades = engine.getTrades();
        expect(trades).toHaveLength(1);
        expect(trades[0].price).toBe(100);
        expect(trades[0].quantity).toBe(5);
        expect(orderBook.sells).toHaveLength(1);
        expect(parseFloat(orderBook.sells[0].amount)).toBe(5);
    });
});
