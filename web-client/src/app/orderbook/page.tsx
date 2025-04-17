'use client';

import React, { useState, useEffect } from 'react';
import { OrderBookTable } from '@/components/OrderBookTable';
import { getOrderBook } from '@/lib/api';
import { Order } from '@/lib/types';

export default function OrderBookPage() {
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      }
      
      const orderBook = await getOrderBook();
      
      // Ensure we have arrays for buy and sell orders
      const buyOrdersData = Array.isArray(orderBook?.buy) ? orderBook.buy : [];
      const sellOrdersData = Array.isArray(orderBook?.sell) ? orderBook.sell : [];
      
      setBuyOrders(buyOrdersData);
      setSellOrders(sellOrdersData);
    } catch (error) {
      console.error('Error fetching order book:', error);
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial load with loading state
    fetchData(true);

    // Setup refresh interval (poll every 5 seconds)
    // Use silent refresh (no loading state) to prevent blinking
    const intervalId = setInterval(() => fetchData(false), 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Book</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderBookTable orders={buyOrders} title="Buy Orders" side="BUY" />
          <OrderBookTable orders={sellOrders} title="Sell Orders" side="SELL" />
          
          <div className="lg:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Book Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Total Buy Orders</h4>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{buyOrders.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total volume: {buyOrders.reduce((acc, order) => acc + parseFloat(order.amount), 0).toFixed(5)}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Total Sell Orders</h4>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{sellOrders.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total volume: {sellOrders.reduce((acc, order) => acc + parseFloat(order.amount), 0).toFixed(5)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 