import React, { useState, useMemo, useEffect } from 'react';
import { CloseIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import type { CryptoPair, OptionTrade } from '../types';
import { useMarketData } from '../contexts/MarketDataContext';
import { OPTIONS_CONFIG } from './OptionsTrading';

type Timeframe = 30 | 60 | 90;
type TradeStatus = 'setup' | 'active' | 'finished';


interface TradeExecutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    direction: 'higher' | 'lower';
    pair: CryptoPair;
    onTradeStart: (trade: OptionTrade) => void;
    currentPrice: number;
}

const TradeExecutionModal: React.FC<TradeExecutionModalProps> = ({ isOpen, onClose, direction, pair, onTradeStart, currentPrice }) => {
    // State for the whole modal lifecycle
    const [status, setStatus] = useState<TradeStatus>('setup');
    const [countdown, setCountdown] = useState(0);

    // State for the 'setup' phase
    const { assets } = useMarketData();
    const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(30);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    // State for the 'active'/'finished' phases
    const [entryPrice, setEntryPrice] = useState<number | null>(null);
    const [finalPrice, setFinalPrice] = useState<number | null>(null);
    const [activeConfig, setActiveConfig] = useState(OPTIONS_CONFIG[30]);

    const usdtAsset = assets.find(a => a.symbol === 'USDT');
    const usdtBalance = usdtAsset ? usdtAsset.amount : 0;
    const isRise = direction === 'higher';

    // Reset state when modal is opened/closed
    useEffect(() => {
        if (isOpen) {
            setStatus('setup');
            setAmount('');
            setError(null);
            setSelectedTimeframe(30);
            setEntryPrice(null);
            setFinalPrice(null);
            setCountdown(0);
        }
    }, [isOpen]);

    // Countdown logic for 'active' phase
    useEffect(() => {
        if (status !== 'active') return;
        if (countdown <= 0) {
            setFinalPrice(currentPrice); // Capture the price at the moment countdown ends
            setStatus('finished');
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, status, currentPrice]);

    const handleStartTrade = () => {
        setError(null);
        const tradeAmount = parseFloat(amount);
        const config = OPTIONS_CONFIG[selectedTimeframe];

        if (isNaN(tradeAmount) || tradeAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (tradeAmount < config.minAmount) {
            setError(`Minimum amount for this timeframe is ${config.minAmount} USDT.`);
            return;
        }
        if (tradeAmount > usdtBalance) {
            setError('Insufficient USDT balance.');
            return;
        }

        const now = Date.now();
        const entry = currentPrice;

        const newTrade: OptionTrade = {
            id: `opt-${now}`,
            pair: `${pair.base}/${pair.quote}`,
            direction,
            entryPrice: entry,
            amount: tradeAmount,
            profitPercentage: config.profit,
            payout: tradeAmount * (1 + config.profit / 100),
            status: 'active',
            entryTime: now,
            expiryTime: now + config.duration * 1000,
        };

        onTradeStart(newTrade);

        setEntryPrice(entry);
        setActiveConfig(config);
        setCountdown(config.duration);
        setStatus('active');
    };

    const payout = useMemo(() => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return 0;
        return numAmount * (1 + OPTIONS_CONFIG[selectedTimeframe].profit / 100);
    }, [amount, selectedTimeframe]);

    // --- RENDER LOGIC ---
    if (!isOpen) return null;
    
    const themeColor = isRise ? 'text-green-500' : 'text-red-500';
    const bgColor = isRise ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
    const headerBgClass = isRise ? 'bg-green-500/10' : 'bg-red-500/10';

    // P/L Calculation for active/finished states
    const tradeAmountNum = entryPrice !== null ? parseFloat(amount) : 0;
    const profitAmount = tradeAmountNum * (activeConfig.profit / 100);
    const displayPrice = status === 'finished' ? finalPrice! : currentPrice;
    
    let pnl = -tradeAmountNum;
    if (entryPrice !== null && ((direction === 'higher' && displayPrice > entryPrice) || (direction === 'lower' && displayPrice < entryPrice))) {
        pnl = profitAmount;
    }
    const isWinning = pnl > 0;
    
    // Countdown Circle props
    const initialCountdown = activeConfig.duration;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (countdown / initialCountdown) * circumference;

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
            role="dialog" aria-modal="true" onClick={status !== 'active' ? onClose : undefined}
        >
            <div
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                 <header className={`p-4 rounded-t-2xl ${headerBgClass}`}>
                    <div className="flex justify-between items-center">
                        <div className={`flex items-center gap-2 text-xl font-bold ${themeColor}`}>
                            {isRise ? <ArrowUpIcon className="w-6 h-6"/> : <ArrowDownIcon className="w-6 h-6" />}
                            <span>{status === 'setup' ? (isRise ? 'Buy Rise' : 'Buy Low') : `${pair.base}/${pair.quote}`}</span>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close modal">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                 </header>

                {status === 'setup' ? (
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="text-sm text-slate-500 dark:text-slate-400 mb-2 block">Timeframe</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(OPTIONS_CONFIG) as unknown as Timeframe[]).map(tf => (
                                    <button key={tf} onClick={() => setSelectedTimeframe(tf)} className={`py-3 rounded-md text-sm font-semibold transition-all ${selectedTimeframe === tf ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>
                                        {tf}s
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-md p-3 text-sm flex justify-between items-center">
                            <p className="text-slate-600 dark:text-slate-300">Profit: <span className="font-bold text-slate-900 dark:text-white">{OPTIONS_CONFIG[selectedTimeframe].profit}%</span></p>
                            <p className="text-slate-600 dark:text-slate-300">Min Amount: <span className="font-bold text-slate-900 dark:text-white">{OPTIONS_CONFIG[selectedTimeframe].minAmount.toLocaleString()} USDT</span></p>
                        </div>
                        <div>
                            <div className="flex justify-between items-baseline mb-1"><label htmlFor="amount" className="text-sm text-slate-500 dark:text-slate-400">Amount</label><span className="text-xs text-slate-500 dark:text-slate-400">Balance: {usdtBalance.toFixed(2)} USDT</span></div>
                            <div className="relative">
                                <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Min. ${OPTIONS_CONFIG[selectedTimeframe].minAmount}`} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-3 pl-4 pr-24 text-slate-900 dark:text-white font-mono text-base"/>
                                <div className="absolute inset-y-0 right-0 flex items-center"><span className="text-slate-400 dark:text-slate-500 px-3">USDT</span><div className="h-2/3 border-l border-slate-200 dark:border-slate-600"></div><button type="button" onClick={() => setAmount(usdtBalance.toFixed(2))} className="h-full px-3 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors">Max</button></div>
                            </div>
                            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                        </div>
                        <div className="text-sm text-center text-slate-500 dark:text-slate-400 pt-2">Payout: <span className="font-mono text-slate-900 dark:text-white text-base">{payout.toFixed(2)} USDT</span></div>
                        <button onClick={handleStartTrade} className={`w-full font-bold py-3 rounded-lg transition-colors text-base text-white ${bgColor}`}>Confirm {isRise ? 'Buy Rise' : 'Buy Low'}</button>
                    </div>
                ) : ( // 'active' or 'finished' states
                    <div className="p-6 flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32">
                             <svg className="w-full h-full" viewBox="0 0 100 100"><circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-200 dark:text-slate-700" /><circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" transform="rotate(-90 50 50)" className={themeColor} strokeDasharray={circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }} /></svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${themeColor}`}>{countdown}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">SECONDS</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full text-center">
                             <div><p className="text-sm text-slate-500 dark:text-slate-400">Entry Price</p><p className="text-lg font-mono text-slate-900 dark:text-white">{entryPrice?.toFixed(2)}</p></div>
                             <div><p className="text-sm text-slate-500 dark:text-slate-400">{status === 'active' ? 'Current Price' : 'Closing Price'}</p><p className="text-lg font-mono text-slate-900 dark:text-white">{displayPrice.toFixed(2)}</p></div>
                        </div>
                         <div className="text-center pt-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{status === 'active' ? 'Potential P/L' : 'Final P/L'}</p>
                            <p className={`text-3xl font-mono ${isWinning ? 'text-green-500' : 'text-red-500'}`}>{isWinning ? '+' : ''}{pnl.toFixed(2)} <span className="text-lg">USDT</span></p>
                        </div>
                        <button onClick={onClose} disabled={status === 'active'} className={`w-full font-bold py-3 mt-2 rounded-lg transition-colors text-base text-white ${status === 'finished' ? (isWinning ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700') : 'bg-slate-500'} disabled:cursor-not-allowed`}>
                            {status === 'active' ? 'Trade in Progress...' : 'Close'}
                        </button>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default TradeExecutionModal;

