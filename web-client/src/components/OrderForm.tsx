import React, { useState } from 'react';
import { submitOrder } from '@/lib/api';
import { Order } from '@/lib/types';

interface OrderFormProps {
  onOrderSubmitted: (order: Order) => void;
}

export function OrderForm({ onOrderSubmitted }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type_op: 'CREATE',
    account_id: '1',
    amount: '',
    pair: 'BTC/USDC',
    limit_price: '',
    side: 'BUY'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.limit_price) return;
    
    try {
      setIsSubmitting(true);
      const newOrder = await submitOrder(formData);
      onOrderSubmitted(newOrder);
      
      setFormData(prev => ({
        ...prev,
        amount: '',
        limit_price: ''
      }));
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20">
        <h3 className="text-lg font-medium text-purple-700 dark:text-purple-400">
          Create New Order
        </h3>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account ID
              </label>
              <input
                type="text"
                name="account_id"
                id="account_id"
                value={formData.account_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="pair" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trading Pair
              </label>
              <select
                name="pair"
                id="pair"
                value={formData.pair}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white sm:text-sm"
              >
                <option value="BTC/USDC">BTC/USDC</option>
                <option value="ETH/USDC">ETH/USDC</option>
                <option value="SOL/USDC">SOL/USDC</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                id="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.00001"
                min="0.00001"
                placeholder="0.00000"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="limit_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Limit Price
              </label>
              <input
                type="number"
                name="limit_price"
                id="limit_price"
                value={formData.limit_price}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="side" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Side
              </label>
              <div className="mt-1 flex">
                <div className="flex items-center">
                  <input
                    id="side-buy"
                    name="side"
                    type="radio"
                    value="BUY"
                    checked={formData.side === 'BUY'}
                    onChange={handleChange}
                    className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
                  />
                  <label htmlFor="side-buy" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Buy
                  </label>
                </div>
                <div className="flex items-center ml-6">
                  <input
                    id="side-sell"
                    name="side"
                    type="radio"
                    value="SELL"
                    checked={formData.side === 'SELL'}
                    onChange={handleChange}
                    className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300"
                  />
                  <label htmlFor="side-sell" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Sell
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="type_op" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Operation
              </label>
              <select
                name="type_op"
                id="type_op"
                value={formData.type_op}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white sm:text-sm"
              >
                <option value="CREATE">Create</option>
                <option value="DELETE">Delete</option>
              </select>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                ${formData.side === 'BUY' 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : formData.side === 'BUY' ? 'Place Buy Order' : 'Place Sell Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 