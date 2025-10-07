import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, MailIcon } from './icons';

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const emailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setIsSubmitted(false);
            setEmail('');
            emailInputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1001]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 id="reset-password-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                        Reset Password
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {isSubmitted ? (
                    <div className="p-6 text-center">
                         <MailIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="font-semibold text-slate-900 dark:text-white">Check your email</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                            If an account with <span className="font-medium text-slate-700 dark:text-slate-300">{email}</span> exists, you will receive a password reset link.
                        </p>
                        <button onClick={onClose} className="mt-6 w-full font-bold py-2.5 rounded-md transition-colors bg-sky-500 hover:bg-sky-600 text-white text-sm">
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Enter your account's email address and we will send you a link to reset your password.
                            </p>
                            <div>
                                <label htmlFor="reset-email" className="sr-only">Email</label>
                                <input
                                    ref={emailInputRef}
                                    id="reset-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md py-2.5 px-3 text-slate-900 dark:text-white text-sm"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full font-bold py-2.5 rounded-md transition-colors bg-sky-500 hover:bg-sky-600 text-white text-sm disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
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


export default ResetPasswordModal;
