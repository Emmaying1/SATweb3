import React, { useState, useMemo } from 'react';
import { ArrowLeftIcon } from './icons';
import { useMarketData } from '../contexts/MarketDataContext';
import { MINING_PLANS_DATA } from '../services/mockData';
import { Investment } from '../types';

const MiningOrdersPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'hosting' | 'completed'>('hosting');
    const { investments } = useMarketData();

    const { activeOrders, completedOrders } = useMemo(() => {
        const now = Date.now();
        const active: Investment[] = [];
        const completed: Investment[] = [];

        investments.forEach(inv => {
            const plan = MINING_PLANS_DATA.find(p => p.id === inv.planId);
            if (!plan) return;

            const expiryTime = inv.startTime + plan.cycle * 24 * 60 * 60 * 1000;
            if (now > expiryTime) {
                completed.push(inv);
            } else {
                active.push(inv);
            }
        });
        return { activeOrders: active, completedOrders: completed };
    }, [investments]);

    const TabButton: React.FC<{ label: string; tabKey: 'hosting' | 'completed' }> = ({ label, tabKey }) => (
        <button
            onClick={() => setActiveTab(tabKey)}
            className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${
                activeTab === tabKey
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-slate-400'
            }`}
        >
            {label}
        </button>
    );
    
    const OrderCard: React.FC<{ investment: Investment }> = ({ investment }) => {
        const plan = MINING_PLANS_DATA.find(p => p.id === investment.planId);
        if (!plan) return null;

        const startDate = new Date(investment.startTime).toLocaleDateString();
        const profit = (investment.amount * plan.yield / 100).toFixed(2);

        return (
            <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white">{plan.cycle}-Day Mining Plan</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activeTab === 'hosting' ? 'bg-sky-500/20 text-sky-400' : 'bg-green-500/20 text-green-400'}`}>
                        {activeTab === 'hosting' ? 'Active' : 'Completed'}
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-slate-400 text-xs">Invested Amount</p>
                        <p className="font-mono text-white">{investment.amount.toLocaleString()} USDT</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs">Total Yield</p>
                        <p className="font-mono text-cyan-400">{plan.yield}%</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs">Est. Profit</p>
                        <p className="font-mono text-green-400">+{profit} USDT</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <p className="text-slate-400 text-xs">Start Date</p>
                        <p className="font-mono text-white">{startDate}</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        const ordersToShow = activeTab === 'hosting' ? activeOrders : completedOrders;
        if (ordersToShow.length === 0) {
            return (
                <div className="text-center py-16">
                    <p className="text-slate-500">No History</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 pt-6">
                {ordersToShow.map(inv => <OrderCard key={inv.id} investment={inv} />)}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto dark text-white">
            <header className="flex items-center justify-between py-4">
                <button onClick={onBack} className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-md">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">My Hosting</h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            <main>
                <div className="border-b border-slate-700 flex">
                    <TabButton label="Hosting" tabKey="hosting" />
                    <TabButton label="Completed" tabKey="completed" />
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

export default MiningOrdersPage;

