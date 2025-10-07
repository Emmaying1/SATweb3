import React from 'react';
import type { Order } from '../types';

interface OrderBookProps {
  bids: Order[];
  asks: Order[];
}

const OrderBookRow: React.FC<{ order: Order; type: 'bid' | 'ask'; maxTotal: number; }> = ({ order, type, maxTotal }) => {
  const percentage = (order.total / maxTotal) * 100;
  const bgColor = type === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10';
  const textColor = type === 'bid' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  
  return (
    <div className="relative grid grid-cols-3 gap-2 px-3 py-1 font-mono text-xs hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer">
      <div
        className={`absolute top-0 bottom-0 left-0 ${bgColor}`}
        style={{ width: `${percentage}%` }}
      ></div>
      <span className={`z-10 ${textColor}`}>{order.price.toFixed(2)}</span>
      <span className="z-10 text-right text-slate-800 dark:text-white">{order.amount.toFixed(4)}</span>
      <span className="z-10 text-right text-slate-500 dark:text-slate-400">{order.total.toFixed(2)}</span>
    </div>
  );
};

const OrderBook: React.FC<OrderBookProps> = ({ bids, asks }) => {
  const maxTotal = Math.max(
    bids[0]?.total || 0,
    asks[0]?.total || 0,
  );

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white p-3 border-b border-slate-200 dark:border-slate-700">Order Book</h2>
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400 px-3 py-2">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-grow overflow-y-auto">
        {/* Asks */}
        <div className="flex flex-col-reverse">
            {asks.slice(0, 12).map((ask, index) => (
                <OrderBookRow key={index} order={ask} type="ask" maxTotal={maxTotal} />
            ))}
        </div>

        <div className="py-2 px-3 border-y border-slate-200 dark:border-slate-700">
            <p className="text-lg font-bold text-green-500 dark:text-green-400 font-mono">68,430.12</p>
        </div>
        
        {/* Bids */}
        <div>
            {bids.slice(0, 12).map((bid, index) => (
                <OrderBookRow key={index} order={bid} type="bid" maxTotal={maxTotal} />
            ))}
        </div>
      </div>
    </div>
  );
};


export default OrderBook;
