"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingEngine = void 0;
const uuid_1 = require("uuid");
class MatchingEngine {
    constructor() {
        this.buyOrders = new Map();
        this.sellOrders = new Map();
        this.buyPrices = [];
        this.sellPrices = [];
        this.trades = [];
    }
    processOrders(orders) {
        for (const order of orders) {
            if (order.type_op === 'CREATE') {
                this.processOrder(order);
            }
            else if (order.type_op === 'DELETE') {
                this.cancelOrder(order);
            }
        }
    }
    processOrder(order) {
        const isBuy = order.side === 'BUY';
        let remainingQuantity = parseFloat(order.amount);
        const price = parseFloat(order.limit_price);
        if (isBuy) {
            remainingQuantity = this.matchWithSellOrders(order, price, remainingQuantity);
        }
        else {
            remainingQuantity = this.matchWithBuyOrders(order, price, remainingQuantity);
        }
        if (remainingQuantity > 0) {
            this.addToOrderBook(order, remainingQuantity);
        }
    }
    matchWithSellOrders(buyOrder, buyPrice, quantity) {
        let remainingQty = quantity;
        while (remainingQty > 0 && this.sellPrices.length > 0) {
            const bestPrice = this.sellPrices[0];
            if (bestPrice.price > buyPrice)
                break;
            const orderIds = [...bestPrice.orderIds];
            for (let i = 0; i < orderIds.length && remainingQty > 0; i++) {
                const sellOrderId = orderIds[i];
                const sellOrder = this.sellOrders.get(sellOrderId);
                if (!sellOrder)
                    continue;
                const sellQuantity = parseFloat(sellOrder.amount);
                const matchedQuantity = Math.min(remainingQty, sellQuantity);
                this.trades.push({
                    trade_id: (0, uuid_1.v4)(),
                    buyOrderId: buyOrder.order_id,
                    sellOrderId: sellOrder.order_id,
                    price: bestPrice.price,
                    quantity: matchedQuantity,
                    timestamp: Date.now()
                });
                remainingQty -= matchedQuantity;
                const remainingSellQty = sellQuantity - matchedQuantity;
                if (remainingSellQty <= 0) {
                    this.sellOrders.delete(sellOrderId);
                    bestPrice.orderIds.splice(bestPrice.orderIds.indexOf(sellOrderId), 1);
                }
                else {
                    sellOrder.amount = remainingSellQty.toString();
                }
            }
            if (bestPrice.orderIds.length === 0) {
                this.sellPrices.shift();
            }
        }
        return remainingQty;
    }
    matchWithBuyOrders(sellOrder, sellPrice, quantity) {
        let remainingQty = quantity;
        while (remainingQty > 0 && this.buyPrices.length > 0) {
            const bestPrice = this.buyPrices[0];
            if (bestPrice.price < sellPrice)
                break;
            const orderIds = [...bestPrice.orderIds];
            for (let i = 0; i < orderIds.length && remainingQty > 0; i++) {
                const buyOrderId = orderIds[i];
                const buyOrder = this.buyOrders.get(buyOrderId);
                if (!buyOrder)
                    continue;
                const buyQuantity = parseFloat(buyOrder.amount);
                const matchedQuantity = Math.min(remainingQty, buyQuantity);
                this.trades.push({
                    trade_id: (0, uuid_1.v4)(),
                    buyOrderId: buyOrder.order_id,
                    sellOrderId: sellOrder.order_id,
                    price: bestPrice.price,
                    quantity: matchedQuantity,
                    timestamp: Date.now()
                });
                remainingQty -= matchedQuantity;
                const remainingBuyQty = buyQuantity - matchedQuantity;
                if (remainingBuyQty <= 0) {
                    this.buyOrders.delete(buyOrderId);
                    bestPrice.orderIds.splice(bestPrice.orderIds.indexOf(buyOrderId), 1);
                }
                else {
                    buyOrder.amount = remainingBuyQty.toString();
                }
            }
            if (bestPrice.orderIds.length === 0) {
                this.buyPrices.shift();
            }
        }
        return remainingQty;
    }
    addToOrderBook(order, quantity) {
        const isBuy = order.side === 'BUY';
        const priceFloat = parseFloat(order.limit_price);
        const newOrder = { ...order, amount: quantity.toString() };
        const orderMap = isBuy ? this.buyOrders : this.sellOrders;
        orderMap.set(order.order_id, newOrder);
        const priceLevels = isBuy ? this.buyPrices : this.sellPrices;
        let priceLevel = priceLevels.find(p => p.price === priceFloat);
        if (!priceLevel) {
            priceLevel = { price: priceFloat, orderIds: [] };
            if (isBuy) {
                const index = priceLevels.findIndex(p => p.price < priceFloat);
                if (index === -1) {
                    priceLevels.push(priceLevel);
                }
                else {
                    priceLevels.splice(index, 0, priceLevel);
                }
            }
            else {
                const index = priceLevels.findIndex(p => p.price > priceFloat);
                if (index === -1) {
                    priceLevels.push(priceLevel);
                }
                else {
                    priceLevels.splice(index, 0, priceLevel);
                }
            }
        }
        priceLevel.orderIds.push(order.order_id);
    }
    cancelOrder(order) {
        const isBuy = order.side === 'BUY';
        const orderMap = isBuy ? this.buyOrders : this.sellOrders;
        const priceLevels = isBuy ? this.buyPrices : this.sellPrices;
        const existingOrder = orderMap.get(order.order_id);
        if (!existingOrder)
            return;
        orderMap.delete(order.order_id);
        const price = parseFloat(existingOrder.limit_price);
        const priceLevel = priceLevels.find(p => p.price === price);
        if (priceLevel) {
            const index = priceLevel.orderIds.indexOf(order.order_id);
            if (index !== -1) {
                priceLevel.orderIds.splice(index, 1);
                if (priceLevel.orderIds.length === 0) {
                    const levelIndex = priceLevels.indexOf(priceLevel);
                    priceLevels.splice(levelIndex, 1);
                }
            }
        }
    }
    getOrderBook() {
        return {
            buy: Array.from(this.buyOrders.values()),
            sell: Array.from(this.sellOrders.values())
        };
    }
    getTrades() {
        return this.trades;
    }
}
exports.MatchingEngine = MatchingEngine;
