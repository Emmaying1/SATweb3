import React, { useState, useEffect } from 'react';
import { CloseIcon, CopyIcon, MailIcon } from './icons';

interface ContactSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose }) => {
    const supportEmail = 'SmartAirTradeCustomerService@outlook.com';
    const mailtoLink = `mailto:${supportEmail}?subject=SmartAirTrade%20Support%20Request&body=Hello%20Support%2C%0A%0AI%20need%20help%20with%3A%20`;
    const [copyStatus, setCopyStatus] = useState('Copy');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isOpen && event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(supportEmail);
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2500);
        } catch (err) {
            setCopyStatus('Failed!');
            setTimeout(() => setCopyStatus('Copy'), 2500);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-support-modal-title"
            onClick={onClose}
        >
            <div
                className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Close">
                    <CloseIcon className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h2 id="contact-support-modal-title" className="text-xl font-bold text-slate-900 dark:text-white mb-2">Contact Support</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">We're here to help — email us or copy the address below.</p>
                    
                    <div className="flex gap-2 items-center">
                        <a href={mailtoLink} className="font-semibold text-sky-600 dark:text-sky-400 hover:underline break-all">
                            {supportEmail}
                        </a>
                        <button 
                            onClick={handleCopy}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-60"
                        >
                            <CopyIcon className="w-3 h-3"/>
                            <span>{copyStatus}</span>
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <a href={mailtoLink} aria-label="Send email" className="inline-block text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors">
                            <MailIcon className="w-12 h-12" />
                        </a>
                    </div>
                </div>
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


export default ContactSupportModal;
