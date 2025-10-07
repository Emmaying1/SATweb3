import React, { useState, useEffect, useMemo } from 'react';
import { useMarketData } from '../contexts/MarketDataContext';
import { ArrowLeftIcon } from './icons';
import { MiningPlan } from '../types';

interface MiningInvestmentPageProps {
  onBack: () => void;
  onNavigate: (view: 'mining_rules') => void;
  plan: MiningPlan;
}

const MiningInvestmentPage: React.FC<MiningInvestmentPageProps> = ({ onBack, onNavigate, plan }) => {
  const { assets, addMiningInvestment } = useMarketData();
  const [amount, setAmount] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const usdtBalance = useMemo(() => assets.find(a => a.symbol === 'USDT')?.amount || 0, [assets]);

  const dailyRevenue = useMemo(() => {
    if (!plan || plan.cycle === 0) return 0;
    return plan.yield / plan.cycle;
  }, [plan]);

  const estimatedEarnings = useMemo(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !plan) return 0;
    return (numAmount * plan.yield) / 100;
  }, [amount, plan]);
  
  const handleBuy = () => {
    const numAmount = parseFloat(amount);
    if (isBuyButtonDisabled || isSubmitting || isNaN(numAmount)) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
        addMiningInvestment({ amount: numAmount, planId: plan.id });
        setIsSubmitting(false);
        setIsSuccess(true);
        
        setTimeout(() => {
            onBack();
        }, 2000);
    }, 1500);
  };

  const isBuyButtonDisabled = useMemo(() => {
    const numAmount = parseFloat(amount);
    return (
      !agreedToTerms ||
      isNaN(numAmount) ||
      numAmount <= 0 ||
      numAmount < plan.minLimit ||
      numAmount > usdtBalance
    );
  }, [amount, agreedToTerms, plan, usdtBalance]);

  // Fallback if the component is rendered without a plan
  useEffect(() => {
    if (!plan) {
      onBack();
    }
  }, [plan, onBack]);

  if (!plan) {
    return null;
  }

  const InfoRow: React.FC<{ label: string; value: string; className?: string; }> = ({ label, value, className = '' }) => (
    <div className={className}>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto text-white dark font-sans antialiased">
      <header className="flex items-center justify-between py-4">
        <button onClick={onBack} className="p-2 -ml-2 rounded-md text-slate-300 hover:text-white">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Buy</h1>
        <button onClick={() => onNavigate('mining_rules')} className="px-2 py-1 rounded-md text-slate-300 hover:text-white">
          <span className="text-base font-semibold">Rules</span>
        </button>
      </header>

      <main className="space-y-6 p-1">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <InfoRow label={`Financing for ${plan.cycle} days`} value={`${plan.cycle} days cycle`} />
            <InfoRow label="Daily Revenue" value={`~ ${dailyRevenue.toFixed(2)}%`} className="text-right" />
            <InfoRow label="Payout Period" value="Daily Return" />
          </div>
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm px-1">
                <div>
                    <p className="text-slate-400">Balance [USDT]</p>
                    <p className="font-mono text-lg text-green-400">{usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}</p>
                </div>
                 <div className="text-right">
                    <p className="text-slate-400">Estimated Earnings [USDT]</p>
                    <p className="font-mono text-lg text-white">{estimatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div>
                <label htmlFor="custody-amount" className="text-sm font-medium text-slate-300 mb-2 block px-1">Custody Amount</label>
                <div className="relative">
                    <input
                        id="custody-amount"
                        type="text"
                        value={amount}
                        onChange={(e) => /^[0-9]*\.?[0-9]*$/.test(e.target.value) && setAmount(e.target.value)}
                        placeholder="Enter your amount"
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg py-4 pl-4 pr-28 text-white font-mono text-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center rounded-r-lg overflow-hidden">
                        <span className="text-slate-400 font-semibold px-3">USDT</span>
                        <div className="h-2/3 border-l border-slate-600"></div>
                        <button
                            type="button"
                            onClick={() => setAmount(String(usdtBalance.toFixed(2)))}
                            className="h-full px-4 text-sm font-semibold text-sky-400 hover:text-white transition-colors"
                        >
                            All
                        </button>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 px-1">Minimum amount: {plan.minLimit.toLocaleString()} USDT</p>
            </div>
        </div>
        
        <div className="flex items-start space-x-3 pt-4 px-1">
            <input
                id="terms-agreement"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-slate-500 bg-slate-700 text-green-500 focus:ring-green-500/50 cursor-pointer checked:bg-green-500 checked:border-green-500 appearance-none"
            />
            <label htmlFor="terms-agreement" className="text-sm text-slate-400">
                I have read and agree to the <a href="#" className="text-sky-400 hover:underline">terms and conditions of the SmartAirTrade Financial Management Service Agreement</a>
            </label>
        </div>
        
        <div className="pt-6">
             <button
                onClick={handleBuy}
                disabled={isBuyButtonDisabled || isSubmitting || isSuccess}
                className="w-full text-center py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-b from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 shadow-lg shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-slate-600 disabled:to-slate-700"
            >
                {isSubmitting ? 'Processing...' : isSuccess ? 'Success!' : 'Buy'}
            </button>
        </div>
      </main>
      <style>{`
        input[type="checkbox"]:checked {
            background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
            background-size: 100% 100%;
            background-position: center;
            background-repeat: no-repeat;
        }
      `}</style>
    </div>
  );
};


export default MiningInvestmentPage;
