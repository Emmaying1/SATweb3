import React, { useState, useEffect, useMemo } from 'react';
import { CloseIcon, UploadIcon, CopyIcon, HistoryIcon } from './icons';
import { useMarketData } from '../contexts/MarketDataContext';
import { View, ViewContext } from '../types';

// A simple utility to generate a mock address
const generateMockAddress = (symbol: string): string => {
  const prefix = symbol === 'BTC' ? 'bc1q' : '0x';
  const chars = 'abcdefghijklmnopqrstuvwxyz01234forg9';
  let result = '';
  for (let i = 0; i < 38; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + result;
};

interface DepositModalProps {
    onClose: () => void;
    onNavigate: (view: View, context?: ViewContext) => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ onClose, onNavigate }) => {
  const { assets } = useMarketData();
  const depositableAssets = assets;
  const [selectedAssetId, setSelectedAssetId] = useState<string>(depositableAssets.length > 0 ? depositableAssets[0].id : '');
  const [amount, setAmount] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');

  const selectedAsset = useMemo(() => assets.find(a => a.id === selectedAssetId), [assets, selectedAssetId]);
  const depositAddress = useMemo(() => selectedAsset ? generateMockAddress(selectedAsset.symbol) : '', [selectedAsset]);

  const handleCopyAddress = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }).catch(err => {
      console.error('Failed to copy address: ', err);
      setCopyStatus('Failed');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    }, 1500);
  };
  
  // Effect to handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!selectedAsset) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-modal-title"
      onClick={onClose}
    >
      <div 
        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 id="deposit-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">Deposit</h2>
          <div className="flex items-center space-x-2">
            <button onClick={() => onNavigate('history', { initialTab: 'deposits' })} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="View deposit history">
              <HistoryIcon className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close modal">
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isSuccess ? (
             <div className="flex flex-col items-center justify-center h-64 text-center p-6 animate-fade-in-fast">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Deposit Submitted</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your deposit is being processed and will be reflected in your balance soon.</p>
            </div>
        ) : (
        <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Asset Selector */}
                <div>
                    <label htmlFor="asset-select" className="text-xs font-medium text-slate-600 dark:text-slate-300">Select Asset</label>
                    <div className="relative mt-1">
                    <select
                        id="asset-select"
                        value={selectedAssetId}
                        onChange={(e) => setSelectedAssetId(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-2 pl-9 pr-4 text-slate-900 dark:text-white font-medium text-sm appearance-none focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                    >
                        {depositableAssets.map(asset => (
                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                        ))}
                    </select>
                    <img 
                        src={`https://picsum.photos/seed/${selectedAsset.symbol}/16`} 
                        alt={selectedAsset.name} 
                        className="w-4 h-4 rounded-full absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    />
                    </div>
                </div>

                {/* Address */}
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{selectedAsset.name} Address</p>
                    <div className="bg-slate-100 dark:bg-slate-700/50 rounded-md p-2 flex items-center justify-between gap-2">
                        <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">{depositAddress}</p>
                        <button
                            type="button"
                            onClick={handleCopyAddress}
                            disabled={copyStatus !== 'Copy'}
                            className="flex-shrink-0 flex items-center space-x-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-colors bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 disabled:opacity-60"
                        >
                            <CopyIcon className="w-3 h-3" />
                            <span>{copyStatus}</span>
                        </button>
                    </div>
                </div>
                
                {/* Amount */}
                <div>
                    <label htmlFor="deposit-amount" className="text-xs font-medium text-slate-600 dark:text-slate-300">Amount</label>
                    <input
                        id="deposit-amount"
                        type="text"
                        value={amount}
                        onChange={(e) => /^[0-9]*\.?[0-9]*$/.test(e.target.value) && setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        className="mt-1 w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white font-mono text-sm"
                    />
                </div>

                {/* Upload */}
                <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Upload Proof (Optional)</label>
                    <label htmlFor="file-upload" className="mt-1 flex justify-center w-full px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-sky-400 dark:hover:border-sky-500 bg-slate-100/50 dark:bg-slate-700/30">
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />
                            <div className="flex text-xs text-slate-500 dark:text-slate-400">
                                <p className="pl-1">{fileName ? fileName : 'Click to upload a file'}</p>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                    </label>
                </div>
            </div>
            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                 <button type="submit" disabled={isSubmitting} className="w-full font-bold py-2.5 rounded-md transition-colors bg-sky-500 hover:bg-sky-600 text-white text-sm disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
                    {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
                </button>
            </div>
        </form>
        )}
      </div>
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-fast {
          animation: fade-in-fast 0.2s ease-out forwards;
        }
        .animate-scale-in {
            animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};


export default DepositModal;
