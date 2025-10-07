import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { CryptoPair, View, ViewContext } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import DepositModal from './DepositModal';
import CoinExchangeModal from './CoinExchangeModal';
import { useMarketData } from '../contexts/MarketDataContext';
import { DepositIcon, WithdrawIcon, MiningIcon, ChatBubbleOvalLeftEllipsisIcon, TransferIcon, CloseIcon, SwitchVerticalIcon, WalletIcon, CoinExchangeIcon, EyeIcon, EyeOffIcon, HistoryIcon } from './icons';

interface TransferModalProps {
    onClose: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ onClose }) => {
    const { assets } = useMarketData();
    const usdtAsset = assets.find(a => a.symbol === 'USDT');
    const initialSpotBalance = usdtAsset ? usdtAsset.amount : 0;

    const [walletBalances, setWalletBalances] = useState({ spot: initialSpotBalance, option: 0.00 });
    const [fromWallet, setFromWallet] = useState<'spot' | 'option'>('spot');
    const [toWallet, setToWallet] = useState<'spot' | 'option'>('option');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferError, setTransferError] = useState('');
    const [transferSuccess, setTransferSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const availableBalance = fromWallet === 'spot' ? walletBalances.spot : walletBalances.option;

    const handleSwap = () => {
        setFromWallet(toWallet);
        setToWallet(fromWallet);
        setTransferError('');
        setTransferSuccess('');
    };

    const handleTransfer = () => {
        setTransferError('');
        setTransferSuccess('');
        const amount = parseFloat(transferAmount);

        if (isNaN(amount) || amount <= 0) {
            setTransferError('Please enter a valid amount.');
            return;
        }
        if (amount > availableBalance) {
            setTransferError('Insufficient funds for this transfer.');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setWalletBalances(prev => {
                const newBalances = { ...prev };
                newBalances[fromWallet] -= amount;
                newBalances[toWallet] += amount;
                return newBalances;
            });
            setTransferSuccess(`Successfully transferred ${amount.toFixed(2)} USDT to ${toWallet} wallet.`);
            setTransferAmount('');
            setIsSubmitting(false);

            setTimeout(() => {
                setTransferSuccess('');
                onClose();
            }, 2000);
        }, 1000);
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-modal-title"
            onClick={onClose}
        >
            <div 
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="transfer-modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <WalletIcon className="w-6 h-6" />
                        <span>Fund Transfer</span>
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                     <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">From</label>
                        <div className="mt-1 bg-slate-100 dark:bg-slate-700/50 rounded-md p-3 flex justify-between items-center">
                            <span className="font-semibold text-lg text-slate-900 dark:text-white capitalize">{fromWallet}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                Available: {availableBalance.toFixed(2)} USDT
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex justify-center items-center">
                        <button onClick={handleSwap} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-sky-500 dark:hover:text-sky-400 transition-colors" aria-label="Swap transfer direction">
                           <SwitchVerticalIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">To</label>
                         <div className="mt-1 bg-slate-100 dark:bg-slate-700/50 rounded-md p-3 flex justify-between items-center">
                            <span className="font-semibold text-lg text-slate-900 dark:text-white capitalize">{toWallet}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                               Balance: {toWallet === 'spot' ? walletBalances.spot.toFixed(2) : walletBalances.option.toFixed(2)} USDT
                            </span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="transfer-amount" className="text-sm font-medium text-slate-500 dark:text-slate-400">Amount to Transfer</label>
                        <div className="relative mt-1">
                             <input
                                id="transfer-amount"
                                type="text"
                                value={transferAmount}
                                onChange={(e) => {
                                    setTransferError('');
                                    if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
                                        setTransferAmount(e.target.value);
                                    }
                                }}
                                placeholder="0.00"
                                className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-3 pl-4 pr-28 text-slate-900 dark:text-white font-mono text-base"
                            />
                             <div className="absolute inset-y-0 right-0 flex items-center rounded-r-md overflow-hidden">
                                <span className="text-slate-400 dark:text-slate-500 px-3">USDT</span>
                                 <button
                                    type="button"
                                    onClick={() => setTransferAmount(availableBalance.toFixed(2))}
                                    className="h-full bg-slate-200 dark:bg-slate-600/50 px-4 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Max
                                </button>
                            </div>
                        </div>
                    </div>
                    {transferError && <p className="text-sm text-red-500 dark:text-red-400 text-center">{transferError}</p>}
                    {transferSuccess && <p className="text-sm text-green-500 dark:text-green-400 text-center">{transferSuccess}</p>}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                    <button
                        onClick={handleTransfer}
                        disabled={isSubmitting}
                        className="w-full font-bold py-3 rounded-md transition-colors bg-sky-500 hover:bg-sky-600 text-white text-base disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                         {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                         {isSubmitting ? 'Transferring...' : 'Confirm Transfer'}
                    </button>
                </div>
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

const Sparkline: React.FC<{ data: number[]; isUp: boolean }> = ({ data, isUp }) => {
  const chartData = data.map(value => ({ value }));
  const color = isUp ? '#10b981' : '#ef4444';
  return (
    <div className="w-24 h-10 hidden sm:block">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const MarketMoverRow: React.FC<{ pair: CryptoPair }> = ({ pair }) => {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 items-center py-3 px-4 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
                <img src={`https://picsum.photos/seed/${pair.base}/32`} alt={pair.base} className="w-8 h-8 rounded-full" />
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{pair.base}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pair.id.split('-')[0].toUpperCase()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-mono text-sm ${pair.change7d >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {pair.change7d.toFixed(2)}%
                </p>
            </div>
            <div className="text-right">
                <p className={`font-mono text-sm ${pair.change24h >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {pair.change24h.toFixed(2)}%
                </p>
            </div>
            <div className="hidden sm:flex justify-end">
                <Sparkline data={pair.sparklineData} isUp={pair.change24h >= 0} />
            </div>
        </div>
    );
}

interface DashboardProps {
    onNavigate: (view: View, context?: ViewContext) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
    const { pairs, totalBalance } = useMarketData();
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);

    const marketMovers = useMemo(() => {
        if (!pairs) return [];
        return [...pairs]
            .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
            .slice(0, 5);
    }, [pairs]);

    const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
      <button onClick={onClick} className="flex flex-col items-center justify-center space-y-2 text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors group">
        <div className="flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-full group-hover:bg-sky-100 dark:group-hover:bg-sky-500/20 transition-colors">
          {icon}
        </div>
        <span className="text-xs font-medium">{label}</span>
      </button>
    );

    return (
        <>
            <div className="space-y-8">
                {/* Portfolio Overview */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Total Balance (USD)</p>
                        <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" aria-label="Toggle balance visibility">
                            {isBalanceVisible ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                        </button>
                    </div>

                    <p className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-8">
                        {isBalanceVisible ? `$${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '$***,***.**'}
                    </p>

                    <div className="grid grid-cols-3 gap-y-6 text-center">
                        <ActionButton icon={<DepositIcon className="w-6 h-6" />} label="Deposit" onClick={() => setIsDepositModalOpen(true)} />
                        <ActionButton icon={<WithdrawIcon className="w-6 h-6" />} label="Withdraw" onClick={() => onNavigate('withdraw')} />
                        <ActionButton icon={<TransferIcon className="w-6 h-6" />} label="Transfer" onClick={() => setIsTransferModalOpen(true)} />
                        <ActionButton icon={<CoinExchangeIcon className="w-6 h-6" />} label="Exchange" onClick={() => setIsExchangeModalOpen(true)} />
                        <ActionButton icon={<MiningIcon className="w-6 h-6" />} label="Mining" onClick={() => onNavigate('mining')} />
                        <ActionButton icon={<HistoryIcon className="w-6 h-6" />} label="History" onClick={() => onNavigate('history')} />
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Market Movers */}
                    <div className="lg:col-span-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Market Movers</h2>
                        <div className="space-y-1">
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-xs text-slate-500 dark:text-slate-400 px-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                                <div>Asset</div>
                                <div className="text-right">7d %</div>
                                <div className="text-right">Change (24h)</div>
                                <div className="hidden sm:block text-right">Chart</div>
                            </div>
                            {marketMovers.map(pair => <MarketMoverRow key={pair.id} pair={pair} />)}
                        </div>
                    </div>
                </div>
            </div>
            {isDepositModalOpen && <DepositModal onClose={() => setIsDepositModalOpen(false)} onNavigate={onNavigate} />}
            {isTransferModalOpen && <TransferModal onClose={() => setIsTransferModalOpen(false)} />}
            {isExchangeModalOpen && <CoinExchangeModal isOpen={isExchangeModalOpen} onClose={() => setIsExchangeModalOpen(false)} />}


            <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat-modal'))}
                className="fixed bottom-24 md:bottom-6 right-6 bg-sky-500 text-white rounded-full p-3 shadow-lg hover:bg-sky-600 transition-transform hover:scale-110 z-40 animate-fade-in-slow"
                aria-label="Open live chat"
            >
                <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7" />
            </button>
            <style>{`
                @keyframes fade-in-slow {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
};


export default Dashboard;
