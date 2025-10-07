import React, { useState, useEffect } from 'react';
import { CloseIcon, ShieldCheckIcon } from './icons';

interface SetTransactionPasswordModalProps {
    onClose: () => void;
    onSuccess: () => void;
    isReset: boolean;
}

const InputField: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}> = ({ id, label, value, onChange, error }) => (
    <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
        <input
            id={id}
            type="password"
            value={value}
            onChange={onChange}
            maxLength={6}
            autoComplete="new-password"
            className={`mt-1 w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2 px-3 text-slate-900 dark:text-white font-mono text-sm tracking-[.5em] text-center ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

const SetTransactionPasswordModal: React.FC<SetTransactionPasswordModalProps> = ({ onClose, onSuccess, isReset }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{ password?: string; confirm?: string; }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'password' | 'confirm') => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) {
            if (field === 'password') {
                setPassword(value);
            } else {
                setConfirmPassword(value);
            }
        }
    };

    const validate = () => {
        const newErrors: { password?: string; confirm?: string } = {};
        if (!password) newErrors.password = 'Password is required.';
        else if (password.length !== 6) newErrors.password = 'Password must be 6 digits.';
        if (password !== confirmPassword) newErrors.confirm = 'Passwords do not match.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            onSuccess();
        }, 1500);
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tx-password-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="tx-password-modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5" />
                        {isReset ? 'Reset' : 'Set'} Transaction Password
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 space-y-4">
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Please set a 6-digit password for transactions.</p>
                        <InputField
                            id="transaction-password"
                            label="Password"
                            value={password}
                            onChange={(e) => handlePasswordChange(e, 'password')}
                            error={errors.password}
                        />
                        <InputField
                            id="confirm-transaction-password"
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => handlePasswordChange(e, 'confirm')}
                            error={errors.confirm}
                        />
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                        <button type="submit" disabled={isSubmitting} className="w-full font-bold py-2.5 rounded-md transition-colors bg-sky-500 hover:bg-sky-600 text-white text-sm disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
                            {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
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


export default SetTransactionPasswordModal;
