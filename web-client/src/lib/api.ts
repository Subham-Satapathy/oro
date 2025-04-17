import { Order, OrderBook, Trade } from './types';

const API_BASE = '/api';
const ENDPOINTS = {
  ORDERS: `${API_BASE}/orders`,
  ORDERBOOK: `${API_BASE}/orderbook`,
  TRADES: `${API_BASE}/trades`,
  UPLOAD: `${API_BASE}/upload`
};

export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetch(ENDPOINTS.ORDERS);
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getOrderBook(): Promise<OrderBook> {
  try {
    const response = await fetch(ENDPOINTS.ORDERBOOK);
    if (!response.ok) {
      throw new Error(`Failed to fetch order book: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching order book:', error);
    return { buy: [], sell: [] };
  }
}

export async function getTrades(): Promise<Trade[]> {
  try {
    const response = await fetch(ENDPOINTS.TRADES);
    if (!response.ok) {
      throw new Error(`Failed to fetch trades: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
}

export async function submitOrder(order: Omit<Order, 'order_id'>): Promise<Order> {
  try {
    const response = await fetch(ENDPOINTS.ORDERS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit order: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}

export async function cancelOrder(orderId: string): Promise<boolean> {
  try {
    const response = await fetch(`${ENDPOINTS.ORDERS}/${orderId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error canceling order:', error);
    throw error;
  }
}

export async function uploadOrdersFile(file: File): Promise<{ success: boolean, message: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(ENDPOINTS.UPLOAD, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
} 