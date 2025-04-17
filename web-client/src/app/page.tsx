'use client';

import React, { useState, useEffect } from 'react';
import { OrderBookTable } from '@/components/OrderBookTable';
import { TradesTable } from '@/components/TradesTable';
import { OrderForm } from '@/components/OrderForm';
import { FileUploader } from '@/components/FileUploader';
import { Notification } from '@/components/Notification';
import { getOrderBook, getTrades } from '@/lib/api';
import { Order, Trade } from '@/lib/types';

export default function Home() {
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    show: false,
    type: 'info',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      }
      
      const [orderBookResponse, tradesResponse] = await Promise.all([
        getOrderBook(),
        getTrades(),
      ]);
      
      const buyOrdersData = Array.isArray(orderBookResponse?.buy) ? orderBookResponse.buy : [];
      const sellOrdersData = Array.isArray(orderBookResponse?.sell) ? orderBookResponse.sell : [];
      const tradesData = Array.isArray(tradesResponse) ? tradesResponse : [];
      
      setBuyOrders(buyOrdersData);
      setSellOrders(sellOrdersData);
      setTrades(tradesData);
      
      console.log(`Fetched data - Buy orders: ${buyOrdersData.length}, Sell orders: ${sellOrdersData.length}, Trades: ${tradesData.length}`);
    } catch (error) {
      console.error('Error fetching data:', error);
      setBuyOrders([]);
      setSellOrders([]);
      setTrades([]);
      showNotification('error', 'Failed to load data. Please refresh the page.');
    } finally {
      if (showLoadingState) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(true);

    const intervalId = setInterval(() => fetchData(false), 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({
      show: true,
      type,
      message,
    });
  };

  const handleOrderSubmitted = (order: Order) => {
    fetchData();
    showNotification('success', `${order.side} order created successfully!`);
  };

  const handleFileUploaded = (success: boolean, message: string) => {
    if (success) {
      fetchData();
      showNotification('success', message);
    } else {
      showNotification('error', message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Dashboard</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-6">
              <OrderBookTable orders={buyOrders} title="Buy Orders" side="BUY" />
              <OrderForm onOrderSubmitted={handleOrderSubmitted} />
            </div>
            <div className="flex flex-col space-y-6">
              <OrderBookTable orders={sellOrders} title="Sell Orders" side="SELL" />
              <FileUploader onFileUploaded={handleFileUploaded} />
            </div>
          </div>
          
          <div className="mt-8">
            <TradesTable trades={trades} />
          </div>
        </>
      )}
      
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        duration={5000}
      />
    </div>
  );
}
