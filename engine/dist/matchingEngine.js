"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingEngine = void 0;
const uuid_1 = require("uuid");
class OrderHeap {
    constructor(compareFn) {
        this.compareFn = compareFn;
        this.orders = [];
        this.orderMap = new Map();
    }
    size() {
        return this.orders.length;
    }
    peek() {
        return this.orders[0];
    }
    insert(order) {
        const index = this.orders.push(order) - 1;
        this.orderMap.set(order.order_id, index);
        this.siftUp(index);
    }
    extract() {
        if (this.orders.length === 0)
            return undefined;
        const top = this.orders[0];
        const last = this.orders.pop();
        if (this.orders.length > 0) {
            this.orders[0] = last;
            this.orderMap.set(last.order_id, 0);
            this.siftDown(0);
        }
        this.orderMap.delete(top.order_id);
        return top;
    }
    remove(orderId) {
        const index = this.orderMap.get(orderId);
        if (index === undefined)
            return false;
        if (index === this.orders.length - 1) {
            this.orders.pop();
            this.orderMap.delete(orderId);
            return true;
        }
        const last = this.orders.pop();
        this.orders[index] = last;
        this.orderMap.set(last.order_id, index);
        this.orderMap.delete(orderId);
        // Determine whether to sift up or down
        const parentIdx = Math.floor((index - 1) / 2);
        const parentPrice = parseFloat(this.orders[parentIdx]?.limit_price || '0');
        const currentPrice = parseFloat(last.limit_price);
        if (index > 0 && this.compareFn(currentPrice, parentPrice)) {
            this.siftUp(index);
        }
        else {
            this.siftDown(index);
        }
        return true;
    }
    update(orderId, newAmount) {
        const index = this.orderMap.get(orderId);
        if (index === undefined)
            return false;
        this.orders[index].amount = newAmount;
        return true;
    }
    toArray() {
        return [...this.orders];
    }
    siftUp(index) {
        const item = this.orders[index];
        const itemPrice = parseFloat(item.limit_price);
        while (index > 0) {
            const parentIdx = Math.floor((index - 1) / 2);
            const parent = this.orders[parentIdx];
            const parentPrice = parseFloat(parent.limit_price);
            if (!this.compareFn(itemPrice, parentPrice))
                break;
            this.orders[index] = parent;
            this.orderMap.set(parent.order_id, index);
            index = parentIdx;
        }
        this.orders[index] = item;
        this.orderMap.set(item.order_id, index);
    }
    siftDown(index) {
        const item = this.orders[index];
        const itemPrice = parseFloat(item.limit_price);
        const length = this.orders.length;
        while (index < length) {
            const leftIdx = 2 * index + 1;
            const rightIdx = leftIdx + 1;
            if (leftIdx >= length)
                break;
            // Find the better order
            let bestChildIdx = leftIdx;
            const leftPrice = parseFloat(this.orders[leftIdx].limit_price);
            if (rightIdx < length) {
                const rightPrice = parseFloat(this.orders[rightIdx].limit_price);
                if (this.compareFn(rightPrice, leftPrice)) {
                    bestChildIdx = rightIdx;
                }
            }
            const bestChildPrice = parseFloat(this.orders[bestChildIdx].limit_price);
            if (!this.compareFn(bestChildPrice, itemPrice))
                break;
            this.orders[index] = this.orders[bestChildIdx];
            this.orderMap.set(this.orders[bestChildIdx].order_id, index);
            index = bestChildIdx;
        }
        this.orders[index] = item;
        this.orderMap.set(item.order_id, index);
    }
}
class MatchingEngine {
    constructor() {
        this.buyOrders = new OrderHeap((a, b) => a > b); // Higher prices first for buy
        this.sellOrders = new OrderHeap((a, b) => a < b); // Lower prices first for sell
        this.trades = [];
    }
    processOrders(orders) {
        for (const order of orders) {
            this.processOrder(order);
        }
    }
    processOrder(order) {
        if (order.type_op === 'DELETE') {
            this.buyOrders.remove(order.order_id);
            this.sellOrders.remove(order.order_id);
            return;
        }
        if (order.type_op === 'CREATE') {
            this.matchOrder(order);
        }
    }
    matchOrder(order) {
        const isBuy = order.side === 'BUY';
        const oppositeHeap = isBuy ? this.sellOrders : this.buyOrders;
        let remainingAmount = parseFloat(order.amount);
        // Continue matching while we have remaining quantity and matching orders
        while (remainingAmount > 0) {
            const matchCandidate = oppositeHeap.peek();
            if (!matchCandidate)
                break;
            const orderPrice = parseFloat(order.limit_price);
            const matchPrice = parseFloat(matchCandidate.limit_price);
            if ((isBuy && orderPrice < matchPrice) || (!isBuy && orderPrice > matchPrice)) {
                break;
            }
            const matchAmount = parseFloat(matchCandidate.amount);
            const tradeQuantity = Math.min(remainingAmount, matchAmount);
            this.trades.push({
                trade_id: (0, uuid_1.v4)(),
                buy_order_id: isBuy ? order.order_id : matchCandidate.order_id,
                sell_order_id: isBuy ? matchCandidate.order_id : order.order_id,
                price: matchPrice,
                quantity: tradeQuantity,
                timestamp: new Date().toISOString(),
            });
            remainingAmount -= tradeQuantity;
            if (matchAmount <= tradeQuantity) {
                oppositeHeap.extract();
            }
            else {
                const newAmount = (matchAmount - tradeQuantity).toString();
                oppositeHeap.update(matchCandidate.order_id, newAmount);
                break;
            }
        }
        if (remainingAmount > 0) {
            const remainingOrder = { ...order, amount: remainingAmount.toString() };
            (isBuy ? this.buyOrders : this.sellOrders).insert(remainingOrder);
        }
    }
    getOrderBook() {
        return {
            buys: this.buyOrders.toArray(),
            sells: this.sellOrders.toArray(),
        };
    }
    getTrades() {
        return [...this.trades];
    }
}
exports.MatchingEngine = MatchingEngine;
