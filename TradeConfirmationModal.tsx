import React, { useState, useEffect } from 'react';
import { CloseIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import type { CryptoPair } from '../types';

interface TradeDetails {
    pair: CryptoPair;
    direction: 'higher' | 'lower';
    amount: number;
    entryPrice: number;
    config: {
        duration: number;
        profit: number;
        minAmount: number;
    };
}

interface TradeConfirmationModalProps {
    tradeDetails: TradeDetails;
    onConfirm: () => void;
    onClose: () => void;
    currentPrice: number;
}

const TradeConfirmationModal: React.FC<TradeConfirmationModalProps> = ({ tradeDetails, onConfirm, onClose, currentPrice }) => {
    const [status, setStatus] = useState<'confirming' | 'active' | 'finished'>('confirming');
    const [countdown, setCountdown] = useState(10);
    const [finalPrice, setFinalPrice] = useState<number | null>(null);

    const { pair, direction, amount, entryPrice, config } = tradeDetails;
    const isRise = direction === 'higher';
    const profitAmount = amount * (config.profit / 100);

    // Countdown Logic
    useEffect(() => {
        if (status === 'finished') return;

        if (countdown <= 0) {
            if (status === 'confirming') {
                onClose();
            } else if (status === 'active') {
                setFinalPrice(currentPrice);
                setStatus('finished');
            }
            return;
        }

        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, status, onClose, currentPrice]);

    // Handler for the main action button
    const handleConfirm = () => {
        onConfirm();
        setStatus('active');
        setCountdown(config.duration);
    };

    // P/L Calculation
    const displayPrice = status === 'finished' ? finalPrice! : currentPrice;
    let pnl = -amount;
    if ((direction === 'higher' && displayPrice > entryPrice) || (direction === 'lower' && displayPrice < entryPrice)) {
        pnl = profitAmount;
    }
    const isWinning = pnl > 0;

    // UI Variables
    const themeColor = isRise ? 'text-green-500' : 'text-red-500';

    let buttonContent: React.ReactNode;
    let buttonAction: () => void;
    let buttonDisabled = false;
    let buttonBgColor = isRise ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    switch (status) {
        case 'confirming':
            buttonContent = 'Continue';
            buttonAction = handleConfirm;
            break;
        case 'active':
            buttonContent = 'Trade in Progress...';
            buttonAction = () => {};
            buttonDisabled = true;
            buttonBgColor = 'bg-slate-500 dark:bg-slate-600';
            break;
        case 'finished':
            buttonContent = 'Close';
            buttonAction = onClose;
            buttonBgColor = isWinning ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';
            break;
    }

    const initialCountdown = status === 'confirming' ? 10 : config.duration;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (countdown / initialCountdown) * circumference;

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
            role="dialog"
            aria-modal="true"
            onClick={status !== 'active' ? onClose : undefined}
        >
            <div
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {status === 'finished' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 z-20">
                         <div className="sparkle-animation">
                            {isWinning ? (
                                <svg className="w-24 h-24 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-24 h-24 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {pair.base}/{pair.quote}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 flex flex-col items-center space-y-4">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-200 dark:text-slate-700" />
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                                className={themeColor}
                                strokeDasharray={circumference}
                                style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-4xl font-bold ${themeColor}`}>{countdown}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">SECONDS</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           {status === 'confirming' ? 'Entry Price' : status === 'active' ? 'Current Price' : 'Closing Price'}
                        </p>
                        <p className="text-2xl font-mono text-slate-900 dark:text-white">
                            {(status === 'finished' ? finalPrice! : status === 'active' ? currentPrice : entryPrice).toFixed(2)}
                        </p>
                    </div>

                    {status !== 'confirming' && (
                         <div className="text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{status === 'active' ? 'Potential P/L' : 'Final P/L'}</p>
                            <p className={`text-2xl font-mono ${isWinning ? 'text-green-500' : 'text-red-500'}`}>
                                {isWinning ? '+' : ''}{pnl.toFixed(2)} <span className="text-base">USDT</span>
                            </p>
                        </div>
                    )}

                    {status === 'confirming' && (
                        <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Type</span>
                                <span className={`font-semibold flex items-center gap-1 ${themeColor}`}>
                                    {isRise ? <ArrowUpIcon className="w-4 h-4"/> : <ArrowDownIcon className="w-4 h-4" />}
                                    {isRise ? 'Buy Rise' : 'Buy Low'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Amount</span>
                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{amount.toLocaleString()} USDT</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Timeframe</span>
                                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{config.duration}s</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4">
                     <button 
                        onClick={buttonAction}
                        disabled={buttonDisabled}
                        className={`w-full font-bold py-4 rounded-lg transition-colors text-lg text-white ${buttonBgColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {buttonContent}
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
                @keyframes sparkle {
                  0% { transform: scale(0.5); opacity: 0; }
                  50% { transform: scale(1.2); opacity: 1; }
                  100% { transform: scale(1); opacity: 1; }
                }
                .sparkle-animation {
                  animation: sparkle 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};


export default TradeConfirmationModal;
