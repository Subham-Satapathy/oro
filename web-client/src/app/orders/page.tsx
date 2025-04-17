'use client';

import React, { useState, useEffect } from 'react';
import { getOrders, cancelOrder, uploadOrdersFile } from '@/lib/api';
import { Order } from '@/lib/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  
  const fetchData = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      }
      const ordersData = await getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
  
  const handleCancelOrder = async (orderId: string) => {
    try {
      const result = await cancelOrder(orderId);
      if (result) {
        // Refresh the orders list - use loading state for user-initiated actions
        fetchData(true);
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    try {
      setUploadStatus({ message: 'Uploading file...', success: true });
      const result = await uploadOrdersFile(file);
      
      setUploadStatus({
        message: result.message,
        success: result.success
      });
      
      if (result.success) {
        // Refresh the orders list with loading state since this is user-initiated
        fetchData(true);
        
        // Clear the upload status after a delay
        setTimeout(() => {
          setUploadStatus(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({
        message: 'Failed to upload file',
        success: false
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        
        <div className="flex items-center space-x-4">
          <div>
            <label 
              htmlFor="fileUpload" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
            >
              Upload Orders File
            </label>
            <input 
              id="fileUpload" 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>
          
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => fetchData(true)}
          >
            Refresh
          </button>
        </div>
      </div>
      
      {uploadStatus && (
        <div 
          className={`p-4 ${uploadStatus.success ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'} rounded-lg`}
        >
          {uploadStatus.message}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pair</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Side</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={`${order.order_id}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.account_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.pair}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.side === 'BUY' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {order.side}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {parseFloat(order.amount).toFixed(8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {parseFloat(order.limit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <button
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleCancelOrder(order.order_id)}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 