import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon, HistoryIcon } from './icons';
import { useMarketData } from '../contexts/MarketDataContext';
import { Investment, OptionTrade } from '../types';
import { MINING_PLANS_DATA } from '../services/mockData';

type HistoryTab = 'deposits' | 'withdrawals' | 'mining' | 'options';

interface HistoryPageProps {
  onBack: () => void;
  initialTab?: HistoryTab;
}

// Mock Data for demonstration purposes
const MOCK_DEPOSIT_HISTORY = [
    { id: 'dep-1', asset: 'BTC', amount: 0.5, date: '2025-09-10 14:30', status: 'Completed', txId: 'abc...123' },
    { id: 'dep-2', asset: 'ETH', amount: 10, date: '2025-09-08 09:15', status: 'Completed', txId: 'def...456' },
    { id: 'dep-3', asset: 'USDT', amount: 5000, date: '2025-09-05 18:45', status: 'Completed', txId: 'ghi...789' },
];
const MOCK_WITHDRAWAL_HISTORY = [
    { id: 'wd-1', asset: 'USDT', amount: 1200.50, date: '2025-09-09 11:05', status: 'Completed', address: '0x123...abc' },
    { id: 'wd-2', asset: 'BTC', amount: 0.1, date: '2025-09-02 21:20', status: 'Completed', address: 'bc1q...xyz' },
];
const MOCK_OPTIONS_HISTORY: OptionTrade[] = [
    { id: 'opt-1', pair: 'BTC/USDT', direction: 'higher', entryPrice: 125000, closePrice: 125100, amount: 100, profitPercentage: 85, payout: 185, status: 'win', entryTime: 0, expiryTime: 0 },
    { id: 'opt-2', pair: 'ETH/USDT', direction: 'lower', entryPrice: 8200, closePrice: 8250, amount: 200, profitPercentage: 85, payout: 0, status: 'loss', entryTime: 0, expiryTime: 0 },
    { id: 'opt-3', pair: 'SOL/USDT', direction: 'higher', entryPrice: 440, closePrice: 450.5, amount: 50, profitPercentage: 90, payout: 95, status: 'win', entryTime: 0, expiryTime: 0 },
];


const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, initialTab = 'deposits' }) => {
    const [activeTab, setActiveTab] = useState<HistoryTab>(initialTab);
    const { investments } = useMarketData();

    const completedMiningOrders = useMemo(() => {
        const now = Date.now();
        return investments.filter(inv => {
            const plan = MINING_PLANS_DATA.find(p => p.id === inv.planId);
            if (!plan) return false;
            const expiryTime = inv.startTime + plan.cycle * 24 * 60 * 60 * 1000;
            return now > expiryTime;
        });
    }, [investments]);

    const TabButton: React.FC<{ label: string; tabKey: HistoryTab }> = ({ label, tabKey }) => (
        <button
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-3 text-sm font-semibold transition-colors flex-grow text-center ${
                activeTab === tabKey
                    ? 'text-slate-900 dark:text-white border-b-2 border-sky-500'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
        >
            {label}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'deposits':
                return (
                    <div className="space-y-3">
                        {MOCK_DEPOSIT_HISTORY.map(item => (
                            <div key={item.id} className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-slate-900 dark:text-white">{item.asset} Deposit</p>
                                    <p className="font-mono font-semibold text-green-500 dark:text-green-400">+{item.amount} {item.asset}</p>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>{item.date}</span>
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'withdrawals':
                 return (
                    <div className="space-y-3">
                        {MOCK_WITHDRAWAL_HISTORY.map(item => (
                            <div key={item.id} className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-slate-900 dark:text-white">{item.asset} Withdrawal</p>
                                    <p className="font-mono font-semibold text-red-500 dark:text-red-400">-{item.amount} {item.asset}</p>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>{item.date}</span>
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'mining':
                 return (
                    <div className="space-y-3">
                        {completedMiningOrders.map((investment: Investment) => {
                             const plan = MINING_PLANS_DATA.find(p => p.id === investment.planId);
                             if (!plan) return null;
                             const profit = (investment.amount * plan.yield / 100);
                             return (
                                <div key={investment.id} className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-slate-900 dark:text-white">{plan.cycle}-Day Mining</p>
                                        <p className="font-mono font-semibold text-green-500 dark:text-green-400">+{profit.toFixed(2)} USDT</p>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                        <span>Completed on {new Date(investment.startTime + plan.cycle * 24*60*60*1000).toLocaleDateString()}</span>
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">Completed</span>
                                    </div>
                                </div>
                             );
                        })}
                         {completedMiningOrders.length === 0 && <p className="text-center text-slate-500 py-8">No completed mining history.</p>}
                    </div>
                );
            case 'options':
                return (
                     <div className="space-y-3">
                        {MOCK_OPTIONS_HISTORY.map(trade => (
                            <div key={trade.id} className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg text-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-slate-900 dark:text-white">{trade.pair} - <span className={`capitalize ${trade.direction === 'higher' ? 'text-green-500' : 'text-red-500'}`}>{trade.direction}</span></p>
                                    <p className={`font-mono font-semibold ${trade.status === 'win' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {trade.status === 'win' ? `+${(trade.payout - trade.amount).toFixed(2)}` : `-${trade.amount.toFixed(2)}`} USDT
                                    </p>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>{new Date().toLocaleDateString()}</span>
                                    <span className={`px-2 py-0.5 rounded-full ${trade.status === 'win' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{trade.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <button onClick={onBack} className="flex items-center space-x-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors p-2 -ml-2 rounded-md mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <div className="flex items-center space-x-3">
                    <HistoryIcon className="w-8 h-8 text-sky-500 dark:text-sky-400" />
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">History</h1>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                <div className="border-b border-slate-200 dark:border-slate-700 flex">
                    <TabButton label="Deposits" tabKey="deposits" />
                    <TabButton label="Withdrawals" tabKey="withdrawals" />
                    <TabButton label="Mining" tabKey="mining" />
                    <TabButton label="Options" tabKey="options" />
                </div>
                <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};


export default HistoryPage;
