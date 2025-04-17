export interface Order {
  type_op: string;
  account_id: string;
  amount: string;
  order_id: string;
  pair: string;
  limit_price: string;
  side: string;
}

export interface Trade {
  trade_id: string;
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface OrderBook {
  buy: Order[];
  sell: Order[];
} 