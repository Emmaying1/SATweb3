import React, { useState } from 'react';

type OrderType = 'limit' | 'market';
type ActiveTab = 'buy' | 'sell';

const OrderForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');

  const InputField: React.FC<{ label: string; placeholder: string; unit: string }> = ({ label, placeholder, unit }) => (
    <div>
      <label className="text-xs text-slate-500 dark:text-slate-400">{label}</label>
      <div className="relative mt-1">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-2 pl-3 pr-12 text-slate-900 dark:text-white font-mono text-sm"
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500 text-sm">{unit}</span>
      </div>
    </div>
  );
  
  const PercentageButtons: React.FC = () => (
    <div className="grid grid-cols-4 gap-2">
        {[25,50,75,100].map(p => (
            <button key={p} className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded px-2 py-1 text-slate-800 dark:text-slate-300 transition-colors">{p}%</button>
        ))}
    </div>
  );

  const isBuy = activeTab === 'buy';

  return (
    <div className="p-4 h-full flex flex-col">
        <div className="flex mb-4">
            <button 
                onClick={() => setActiveTab('buy')}
                className={`w-1/2 pb-2 text-center text-base font-bold transition-colors ${isBuy ? 'text-green-500 border-b-2 border-green-500' : 'text-slate-400 dark:text-slate-500'}`}>
                Buy
            </button>
            <button 
                onClick={() => setActiveTab('sell')}
                className={`w-1/2 pb-2 text-center text-base font-bold transition-colors ${!isBuy ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                Sell
            </button>
        </div>
      
        <div className="flex flex-col space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available: <span className="font-mono text-slate-800 dark:text-slate-200">{isBuy ? '1,234.56 USDT' : '0.5432 BTC'}</span></p>
            
            <div className="flex border border-slate-200 dark:border-slate-600 rounded-md p-1 bg-slate-100 dark:bg-slate-700">
                <button 
                    onClick={() => setOrderType('limit')}
                    className={`w-1/2 py-1 text-center rounded text-sm ${orderType === 'limit' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}>Limit</button>
                <button 
                    onClick={() => setOrderType('market')}
                    className={`w-1/2 py-1 text-center rounded text-sm ${orderType === 'market' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}>Market</button>
            </div>
            
            {orderType === 'limit' && <InputField label="Price" placeholder="68430.12" unit="USDT" />}
            <InputField label="Amount" placeholder="0.00" unit="BTC" />
            <PercentageButtons />
            <InputField label="Total" placeholder="0.00" unit="USDT" />
            
            <button className={`w-full font-bold py-3 rounded-md transition-colors ${isBuy ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
              {isBuy ? 'Buy BTC' : 'Sell BTC'}
            </button>
        </div>
    </div>
  );
};


export default OrderForm;
