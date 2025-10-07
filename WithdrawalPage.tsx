import React, { useState, useMemo, useEffect } from 'react';
import { useMarketData } from '../contexts/MarketDataContext';
import { ArrowLeftIcon, ClipboardPasteIcon, WalletIcon, CloseIcon, HistoryIcon } from './icons';
import { View, ViewContext } from '../types';

// A locally defined Card component for consistent styling without creating a new file
const Card: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg">
    <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
    </div>
    <div className="p-4 sm:p-6 space-y-6">
      {children}
    </div>
  </div>
);


const ConfirmationModal: React.FC<{
    assetSymbol: string;
    amount: string;
    address: string;
    onConfirm: () => void;
    onClose: () => void;
    isProcessing: boolean;
    isSuccess: boolean;
    txDetails: { id: string; timestamp: string } | null;
}> = ({ assetSymbol, amount, address, onConfirm, onClose, isProcessing, isSuccess, txDetails }) => {
     useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const renderContent = () => {
        if (isSuccess && txDetails) {
            return (
                <div className="text-center p-6 animate-fade-in-fast">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Withdrawal Successful</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your transaction is on its way.</p>
                    <div className="text-left bg-slate-100 dark:bg-slate-700/50 rounded-md p-3 mt-4 space-y-2 text-xs">
                         <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Amount:</span><span className="font-mono text-slate-800 dark:text-slate-200">{amount} {assetSymbol}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">TX ID:</span><span className="font-mono text-slate-800 dark:text-slate-200 truncate">{txDetails.id}</span></div>
                         <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Timestamp:</span><span className="font-mono text-slate-800 dark:text-slate-200">{txDetails.timestamp}</span></div>
                    </div>
                </div>
            );
        }
        if (isProcessing) {
             return (
                <div className="text-center p-6 h-64 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Processing Withdrawal</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Please wait a moment...</p>
                </div>
            );
        }
        return (
            <>
                <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirm Withdrawal</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please review the details below carefully.</p>
                    <div className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Amount:</span><span className="font-bold font-mono text-slate-800 dark:text-slate-200">{amount} {assetSymbol}</span></div>
                        <div className="flex justify-between items-start"><span className="text-slate-500 dark:text-slate-400 flex-shrink-0 mr-4">To Address:</span><span className="font-mono text-slate-800 dark:text-slate-200 break-all text-right">{address}</span></div>
                    </div>
                </div>
                <div className="p-4 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-md transition-colors">Confirm</button>
                </div>
            </>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close modal"><CloseIcon className="w-5 h-5" /></button>
                {renderContent()}
            </div>
        </div>
    );
};

interface WithdrawalPageProps {
    onBack: () => void;
    onNavigate: (view: View, context?: ViewContext) => void;
}

const WithdrawalPage: React.FC<WithdrawalPageProps> = ({ onBack, onNavigate }) => {
  const { assets } = useMarketData();
  const withdrawableAssets = assets;

  const [selectedAssetId, setSelectedAssetId] = useState(withdrawableAssets.find(a => a.symbol === 'USDT')?.id || withdrawableAssets[0]?.id || '');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ address?: string; amount?: string; password?: string; }>({});
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txDetails, setTxDetails] = useState<{ id: string; timestamp: string } | null>(null);

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);
  const availableBalance = selectedAsset?.amount || 0;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipientAddress(text);
      setErrors(e => ({ ...e, address: undefined }));
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      setErrors(e => ({ ...e, address: 'Could not paste from clipboard.' }));
    }
  };
  
  const validate = () => {
    const newErrors: { address?: string; amount?: string; password?: string; } = {};
    if (!recipientAddress.trim()) newErrors.address = 'Recipient address is required.';
    else if (selectedAsset?.symbol === 'BTC' && !(recipientAddress.startsWith('bc1') || recipientAddress.startsWith('1') || recipientAddress.startsWith('3'))) newErrors.address = 'Invalid Bitcoin address format.';
    else if (['ETH', 'USDT'].includes(selectedAsset?.symbol || '') && !recipientAddress.startsWith('0x')) newErrors.address = 'Invalid Ethereum-based address format.';

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) newErrors.amount = 'Please enter a valid amount.';
    else if (numAmount > availableBalance) newErrors.amount = 'Amount exceeds available balance.';

    if (!password) newErrors.password = 'Transaction password is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirmation(true);
    }
  };
  
  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        setTxDetails({
            id: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            timestamp: new Date().toLocaleString()
        });
        // In a real app, update balance via context
        setTimeout(() => handleCloseModal(), 4000); // Auto close success modal
    }, 2000);
  };
  
  const handleCloseModal = () => {
    setShowConfirmation(false);
    if(isSuccess) {
        onBack();
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center space-x-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors p-2 -ml-2 rounded-md">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>
         <button onClick={() => onNavigate('history', { initialTab: 'withdrawals' })} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="View withdrawal history">
            <HistoryIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        <WalletIcon className="w-8 h-8 text-sky-500 dark:text-sky-400" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Withdraw Crypto</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Enter Withdrawal Details">
            {/* Asset Selector */}
            <div>
                <label htmlFor="asset-select" className="text-sm font-medium text-slate-600 dark:text-slate-300">Select Asset</label>
                <div className="relative mt-2">
                    <select id="asset-select" value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-3 pl-12 pr-4 text-slate-900 dark:text-white font-semibold appearance-none focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer">
                        {withdrawableAssets.map(asset => (<option key={asset.id} value={asset.id}>{asset.name}</option>))}
                    </select>
                    {selectedAsset && <img src={`https://picsum.photos/seed/${selectedAsset.symbol}/24`} alt={selectedAsset.name} className="w-6 h-6 rounded-full absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"/>}
                </div>
            </div>
            {/* Recipient Address */}
            <div>
                <label htmlFor="address" className="text-sm font-medium text-slate-600 dark:text-slate-300">Recipient Address</label>
                <div className="relative mt-2">
                    <input id="address" type="text" value={recipientAddress} onChange={(e) => { setRecipientAddress(e.target.value); setErrors(err => ({...err, address: undefined})); }} placeholder="Enter wallet address" className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 pl-3 pr-12 text-slate-900 dark:text-white font-mono text-sm ${errors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`} />
                    <button type="button" onClick={handlePaste} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400" aria-label="Paste address"><ClipboardPasteIcon className="w-5 h-5" /></button>
                </div>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            {/* Amount */}
            <div>
                <div className="flex justify-between items-baseline">
                    <label htmlFor="amount" className="text-sm font-medium text-slate-600 dark:text-slate-300">Amount</label>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Balance: <span className="font-mono">{availableBalance.toFixed(6)}</span></span>
                </div>
                <div className="relative mt-2">
                    <input id="amount" type="text" value={amount} onChange={(e) => { if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) { setAmount(e.target.value); setErrors(err => ({...err, amount: undefined})); }}} placeholder="0.00" className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 pl-3 pr-24 text-slate-900 dark:text-white font-mono text-sm ${errors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`} />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                        <span className="text-slate-400 dark:text-slate-500 px-3">{selectedAsset?.symbol}</span>
                        <button type="button" onClick={() => setAmount(String(availableBalance))} className="h-full border-l border-slate-200 dark:border-slate-600 px-3 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors">Max</button>
                    </div>
                </div>
                 {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
             {/* Password */}
            <div>
                <label htmlFor="password" className="text-sm font-medium text-slate-600 dark:text-slate-300">Transaction Password</label>
                <div className="relative mt-2">
                    <input id="password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors(err => ({...err, password: undefined})); }} placeholder="••••••••" className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 px-3 text-slate-900 dark:text-white font-mono text-sm ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`} />
                </div>
                 {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
        </Card>
        <div className="flex justify-end mt-6">
            <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-sky-500 text-white font-semibold rounded-md hover:bg-sky-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
              Submit Withdraw
            </button>
        </div>
      </form>
      
      {showConfirmation && (
          <ConfirmationModal 
            assetSymbol={selectedAsset?.symbol || ''}
            amount={amount}
            address={recipientAddress}
            onConfirm={handleConfirm}
            onClose={handleCloseModal}
            isProcessing={isProcessing}
            isSuccess={isSuccess}
            txDetails={txDetails}
          />
      )}
      <style>{`
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};


export default WithdrawalPage;
