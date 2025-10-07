import React, { useState, useEffect } from 'react';
import { CloseIcon, SwitchVerticalIcon } from './icons';
import { useMarketData } from '../contexts/MarketDataContext';

interface CoinExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CoinExchangeModal: React.FC<CoinExchangeModalProps> = ({ isOpen, onClose }) => {
    const { assets, simulateExchange } = useMarketData();
    const [amount, setAmount] = useState('1');
    const [fromAssetId, setFromAssetId] = useState('bitcoin');
    const [toAssetId, setToAssetId] = useState('tether');
    const [activeInput, setActiveInput] = useState<'from' | 'to'>('from');
    
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount('1');
            setFromAssetId('bitcoin');
            setToAssetId('tether');
            setActiveInput('from');
            setError('');
            setIsSubmitting(false);
            setIsSuccess(false);
        }
    }, [isOpen]);
    
    const fromAsset = assets.find(a => a.id === fromAssetId);
    const toAsset = assets.find(a => a.id === toAssetId);
    const availableBalance = fromAsset?.amount || 0;

    let fromAmountDisplay = '';
    let toAmountDisplay = '';

    if (fromAsset && toAsset) {
        const rate = fromAsset.priceUSD / toAsset.priceUSD;
        const parsedAmount = parseFloat(amount);

        if (isNaN(parsedAmount) || parsedAmount === 0) {
            fromAmountDisplay = activeInput === 'from' ? amount : '';
            toAmountDisplay = activeInput === 'to' ? amount : '';
        } else if (activeInput === 'from') {
            fromAmountDisplay = amount;
            const result = parsedAmount * rate;
            toAmountDisplay = result.toFixed(6).replace(/\.?0+$/, "");
        } else {
            toAmountDisplay = amount;
            const result = parsedAmount / rate;
            fromAmountDisplay = result.toFixed(6).replace(/\.?0+$/, "");
        }
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, inputType: 'from' | 'to') => {
        const value = e.target.value;
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
            setActiveInput(inputType);
            setAmount(value);
            setError('');
        }
    };

    const handleSwapAssets = () => {
        setFromAssetId(toAssetId);
        setToAssetId(fromAssetId);
    };

    const handleConvert = () => {
        const fromAmountNum = parseFloat(fromAmountDisplay);
        if (isNaN(fromAmountNum) || fromAmountNum <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (fromAmountNum > availableBalance) {
            setError(`Insufficient ${fromAsset?.symbol} balance.`);
            return;
        }
        setError('');
        setIsSubmitting(true);

        setTimeout(() => {
            const result = simulateExchange(fromAsset!.symbol, toAsset!.symbol, fromAmountNum);
            setIsSubmitting(false);
            if (result.success) {
                setIsSuccess(true);
                setTimeout(onClose, 2000);
            } else {
                setError(result.message || 'An unexpected error occurred.');
            }
        }, 1500);
    };

    if (!isOpen) return null;

    const exchangeRate = fromAsset && toAsset ? (fromAsset.priceUSD / toAsset.priceUSD) : 0;
    
    const CurrencyInputRow: React.FC<{
        label: string;
        amount: string;
        onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        selectedAssetId: string;
        onAssetChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
        balance?: number;
    }> = ({ label, amount, onAmountChange, selectedAssetId, onAssetChange, balance }) => (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</label>
                {balance !== undefined && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Balance: <span className="font-mono">{balance.toFixed(4)}</span>
                    </span>
                )}
            </div>
            <div className="flex items-stretch group">
                <input
                  type="text"
                  value={amount}
                  onChange={onAmountChange}
                  placeholder="0.00"
                  className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-l-md py-3 px-3 text-slate-900 dark:text-white font-mono text-lg focus:ring-2 focus:ring-sky-500 focus:outline-none z-10 transition"
                />
                <div className="relative">
                  <select
                    value={selectedAssetId}
                    onChange={onAssetChange}
                    className="h-full bg-slate-100 dark:bg-slate-700 border-y border-r border-slate-200 dark:border-slate-600 rounded-r-md py-3 pl-12 pr-4 text-slate-900 dark:text-white font-semibold appearance-none focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer transition"
                  >
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.symbol}</option>
                    ))}
                  </select>
                  <img 
                    src={`https://picsum.photos/seed/${assets.find(a => a.id === selectedAssetId)?.symbol}/20`} 
                    alt={selectedAssetId} 
                    className="w-5 h-5 rounded-full absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
            </div>
        </div>
    );
    
    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
            role="dialog" aria-modal="true" onClick={onClose}
        >
            <div 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Coin Exchange</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-6 animate-fade-in-fast">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Exchange Successful</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Your balances have been updated.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 space-y-2">
                             <CurrencyInputRow 
                                label="You send"
                                amount={fromAmountDisplay}
                                onAmountChange={(e) => handleAmountChange(e, 'from')}
                                selectedAssetId={fromAssetId}
                                onAssetChange={(e) => setFromAssetId(e.target.value)}
                                balance={availableBalance}
                            />
                            <div className="flex justify-center items-center py-2">
                                <button onClick={handleSwapAssets} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-sky-500 dark:hover:text-sky-400 transition-colors" aria-label="Swap currencies">
                                    <SwitchVerticalIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <CurrencyInputRow 
                                label="You receive"
                                amount={toAmountDisplay}
                                onAmountChange={(e) => handleAmountChange(e, 'to')}
                                selectedAssetId={toAssetId}
                                onAssetChange={(e) => setToAssetId(e.target.value)}
                            />
                            {error && <p className="text-sm text-red-500 dark:text-red-400 text-center pt-2">{error}</p>}
                        </div>
                         <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl space-y-3">
                            {fromAsset && toAsset && (
                                <div className="text-center text-sm text-slate-500 dark:text-slate-400 font-mono">
                                    1 {fromAsset.symbol} ≈ {exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toAsset.symbol}
                                </div>
                            )}
                            <button
                                onClick={handleConvert}
                                disabled={isSubmitting}
                                className="w-full font-bold py-3 rounded-md transition-colors bg-sky-500 hover:bg-sky-600 text-white text-base disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                                {isSubmitting ? 'Converting...' : 'Convert'}
                            </button>
                        </div>
                    </>
                )}
                 <style>{`
                    @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                    .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
                `}</style>
            </div>
        </div>
    );
};

export default CoinExchangeModal;

