"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const MatchingEngine_1 = require("../services/MatchingEngine");
const OrderBookView_1 = require("../views/OrderBookView");
const TradeView_1 = require("../views/TradeView");
class OrderController {
    constructor() {
        this.matchingEngine = new MatchingEngine_1.MatchingEngine();
        this.orderBookView = new OrderBookView_1.OrderBookView();
        this.tradeView = new TradeView_1.TradeView();
    }
    async processOrders(orders) {
        this.matchingEngine.processOrders(orders);
        await Promise.all([
            this.orderBookView.render(this.matchingEngine.getOrderBook()),
            this.tradeView.render(this.matchingEngine.getTrades())
        ]);
    }
}
exports.OrderController = OrderController;
