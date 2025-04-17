'use client';

import React, { useState, useEffect } from 'react';
import { TradesTable } from '@/components/TradesTable';
import { getTrades } from '@/lib/api';
import { Trade } from '@/lib/types';

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      }
      
      const tradesData = await getTrades();
      // Ensure we have an array
      const safeTradesData = Array.isArray(tradesData) ? tradesData : [];
      
      setTrades(safeTradesData);
    } catch (error) {
      console.error('Error fetching trades:', error);
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trades History</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <TradesTable trades={trades} />
          
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Trades Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Total Trades</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{trades.length}</p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Total Volume</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {trades.reduce((acc, trade) => acc + trade.quantity, 0).toFixed(8)}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Avg. Price</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {trades.length > 0 
                    ? (trades.reduce((acc, trade) => acc + trade.price, 0) / trades.length).toFixed(2)
                    : "0.00"
                  }
                </p>
              </div>
            </div>
          </div>
          
          {trades.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latest Trade</h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Trade ID:</span>
                      <span className="text-sm font-medium">{trades[0].trade_id}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {trades[0].price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Quantity:</span>
                      <span className="text-sm font-medium">
                        {trades[0].quantity.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 8 })}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Time:</span>
                      <span className="text-sm font-medium">
                        {new Date(trades[0].timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Trend (Last 5 Trades)</h4>
                  <div className="h-24 flex items-end justify-between">
                    {trades.slice(0, 5).map((trade, index) => {
                      // Calculate height based on min/max price in the set
                      const prices = trades.slice(0, 5).map(t => t.price);
                      const maxPrice = Math.max(...prices);
                      const minPrice = Math.min(...prices);
                      const range = maxPrice - minPrice || 1;
                      const height = ((trade.price - minPrice) / range) * 80 + 10; // 10% to 90% height
                      
                      return (
                        <div key={`${trade.trade_id}-${index}`} className="flex flex-col items-center">
                          <div 
                            className={`w-10 ${index === 0 ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-700'} rounded-t-sm`}
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                            {index === 0 ? 'Latest' : `${index + 1}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 