'use client';

import React, { useState } from 'react';
import { OrderForm } from '@/components/OrderForm';
import { FileUploader } from '@/components/FileUploader';
import { Notification } from '@/components/Notification';
import { Order } from '@/lib/types';

export default function NewOrderPage() {
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    show: false,
    type: 'info',
    message: '',
  });

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({
      show: true,
      type,
      message,
    });
  };

  const handleOrderSubmitted = (order: Order) => {
    showNotification('success', `${order.side} order created successfully!`);
  };

  const handleFileUploaded = (success: boolean, message: string) => {
    if (success) {
      showNotification('success', message);
    } else {
      showNotification('error', message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Order</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <OrderForm onOrderSubmitted={handleOrderSubmitted} />
          
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Types</h3>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">CREATE</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create a new order in the order book. If it matches with existing orders, trades will be executed.
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">DELETE</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Cancel an existing order from the order book. You need to specify the order ID.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <FileUploader onFileUploaded={handleFileUploaded} />
          
          <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bulk Upload Information</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can upload a JSON file containing multiple orders to process in bulk. The file should follow this format:
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto">
                <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre">
{`[
  {
    "type_op": "CREATE",
    "account_id": "1",
    "amount": "0.00230",
    "order_id": "1",
    "pair": "BTC/USDC",
    "limit_price": "63500.00",
    "side": "SELL"
  },
  {
    "type_op": "CREATE",
    "account_id": "2",
    "amount": "0.00230", 
    "order_id": "2",
    "pair": "BTC/USDC",
    "limit_price": "63500.00",
    "side": "BUY"
  }
]`}
                </pre>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                After processing, the system will generate an orderbook.json and trades.json file with the results.
              </p>
            </div>
          </div>
        </div>
      </div>
      
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