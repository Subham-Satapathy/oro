import React from 'react';
import { Order } from '@/lib/types';

interface OrderBookTableProps {
  orders: Order[];
  title: string;
  side: 'BUY' | 'SELL';
}

export function OrderBookTable({ orders, title, side }: OrderBookTableProps) {
  // Ensure orders is always an array
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  const reverseOrders = side === 'SELL';
  const displayOrders = reverseOrders ? [...safeOrders].reverse() : safeOrders;
  
  // Sort by price (highest to lowest for buy, lowest to highest for sell)
  const sortedOrders = [...displayOrders].sort((a, b) => {
    const priceA = parseFloat(a.limit_price);
    const priceB = parseFloat(b.limit_price);
    return side === 'BUY' ? priceB - priceA : priceA - priceB;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${side === 'BUY' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <h3 className={`text-lg font-medium ${side === 'BUY' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pair
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedOrders.length > 0 ? (
              sortedOrders.map((order, index) => (
                <tr key={`${order.order_id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {order.order_id}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${side === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {parseFloat(order.limit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {parseFloat(order.amount).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 8 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {order.pair}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No orders available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 