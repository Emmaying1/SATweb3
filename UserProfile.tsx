import React, { useState } from 'react';
import { LockIcon, PhoneIcon, ShieldCheckIcon, ArrowLeftIcon, InfoIcon, ChevronRightIcon, CloseIcon, ChevronDownIcon, QuestionMarkCircleIcon, LifebuoyIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons';
import ChangePasswordModal from './ChangePasswordModal';
import SetTransactionPasswordModal from './SetTransactionPasswordModal';
import VerifyPhoneNumberModal from './VerifyPhoneNumberModal';

const UserProfile: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isSecuritySectionOpen, setIsSecuritySectionOpen] = useState(false);
    const [isTradingStatsOpen, setIsTradingStatsOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isSetTxPasswordModalOpen, setIsSetTxPasswordModalOpen] = useState(false);
    const [isVerifyPhoneModalOpen, setIsVerifyPhoneModalOpen] = useState(false);

    const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
    const [showTxPasswordSuccess, setShowTxPasswordSuccess] = useState(false);
    const [showPhoneSuccess, setShowPhoneSuccess] = useState(false);
    
    const [transactionPasswordSet, setTransactionPasswordSet] = useState(true);
    const [userPhoneNumber, setUserPhoneNumber] = useState('');
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);


    const user = {
        name: 'Alex Johnson',
        username: 'alexj',
        email: 'alex.j@example.com',
        avatarUrl: 'https://picsum.photos/seed/alexj/128',
        memberSince: 'July 15, 2022',
        verificationStatus: 'Verified Tier 2',
        totalTrades: 1245,
        winRate: '68.5%',
        totalVolume: 1578903.45,
        passwordLastChanged: '1 month ago',
    };
    
    const handleChangePasswordSuccess = () => {
        setIsChangePasswordModalOpen(false);
        setShowPasswordSuccess(true);
        setTimeout(() => {
            setShowPasswordSuccess(false);
        }, 4000); // Hide after 4 seconds
    };

    const handleSetTxPasswordSuccess = () => {
        setIsSetTxPasswordModalOpen(false);
        setTransactionPasswordSet(true);
        setShowTxPasswordSuccess(true);
        setTimeout(() => {
            setShowTxPasswordSuccess(false);
        }, 4000);
    };

    const maskPhoneNumber = (phone: string): string => {
        if (phone.length > 10) {
            return `${phone.substring(0, phone.length - 7)}***-${phone.substring(phone.length - 4)}`;
        }
        return phone;
    };
    
    const handlePhoneVerificationSuccess = (newPhoneNumber: string) => {
        setIsVerifyPhoneModalOpen(false);
        setUserPhoneNumber(maskPhoneNumber(newPhoneNumber));
        setIsPhoneVerified(true);
        setShowPhoneSuccess(true);
        setTimeout(() => {
            setShowPhoneSuccess(false);
        }, 4000);
    };

    const CompactInfoRow: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
        <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{value}</span>
        </div>
    );
    
    const SecurityRow: React.FC<{
        icon: React.ReactNode;
        label: string;
        status: React.ReactNode;
        buttonText: string;
        onClick?: () => void;
    }> = ({ icon, label, status, buttonText, onClick }) => (
        <div className="flex items-center py-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <div className="flex items-center space-x-4 flex-grow">
                <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
                    {icon}
                </div>
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{status}</div>
                </div>
            </div>
            <button
                onClick={onClick}
                className="flex-shrink-0 ml-4 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 rounded-md transition-colors"
            >
                {buttonText}
            </button>
        </div>
    );

    const CompactStat: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
        <div className="text-center">
            <p className="text-2xl font-bold text-sky-500 dark:text-sky-400 font-mono">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        </div>
    );

    const AboutUsModal = () => (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={() => setIsAboutUsOpen(false)}>
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-lg w-full max-w-3xl m-4 relative animate-scale-in max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">About Us</h2>
                    <button onClick={() => setIsAboutUsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>SmartAirTrade is a brand of the Singaporean company Bit Matrix Pte Ltd. with registration number 201727630E, and is a member company of the Association of Cryptocurrency and Blockchain Industries of Singapore (ACCESS). Biyin Asia has extensive experience in financial product development and operations and is composed of professionals with an international perspective. It focuses on providing reliable digital asset financial services to digital asset traders worldwide. Currently, it mainly pushes digital asset product services such as CoinsBank Wallet App and CoinsDo Digital Asset Payment System.</p>

                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">The SmartAirTrade Protocol</h3>
                    <p>The SmartAirTrade protocol is a peer-to-peer system for trading cryptocurrencies on the ethereum blockchain (ERC-20 token).The SmartAirTrade protocol consists of an immutable, persistent and upgradable definition of a smart contract. It is designed to be independent of any trusted intermediaries that may selectively restrict access to the transaction environment. The SmartAirTrade protocol is designed to be censorship-resistant, secure and self-regulating. The code is open source and available for all to read and verify. Due to these design principles, the SmartAirTrade protocol will operate permanently with 100% uptime.</p>
                    <p>Speaking of the ethereum network continuing to operate; most open markets use a central limit order book where buyers and sellers create groups organized by price level with orders being filled gradually as demand changes. Anyone who has traded stocks through a brokerage firm will be familiar with understanding the order book system. The SmartAirTrade protocol uses a different approach, using an automated market maker (AMM), sometimes called a constant letter number of market makers, instead of order books.</p>
                    <p>At a very high level, AMM replaces the order market buy with a liquidity pool of both assets. For sell orders, the value of the two assets is relative to each other. When one asset trades the other, the relative prices of the two assets will change, thus determining the NMM for both. In this dynamic, the buy side or sell side trades directly with the pool rather than with a specific order left by the other party. Increasingly, the advantages and disadvantages of automated market makers and traditional order book counterparts are being actively studied. We are examining some notable examples, collected on the web page.</p>

                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">The SmartAirTrade Ecosystem</h3>
                    <p>The SmartAirTrade ecosystem includes three types of users:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li><strong>Liquidity Provider (LP):</strong> An individual or entity that contributes ERC-20 tokens to the public liquidity pool.</li>
                        <li><strong>Trader:</strong> An individual or entity that exchanges one token for another.</li>
                        <li><strong>Developers:</strong> Individuals or individuals who integrate with SmartAirTrade protocol smart contracts to provide exciting new experiences.</li>
                    </ul>
                    <p>In general, the interaction between these categories creates a positive feedback loop that facilitates the digital economy by defining a common language through which tokens can be collected, traded and used.</p>
                    
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">Your Wallet</h3>
                    <p>Your wallet is an application that allows you to interact with Ethereum. The main difference between the SmartAirTrade protocol and centralized cryptocurrency services is who controls your wallet - in other words, it is kept secure. Most centralized cryptocurrency services offer hosted wallets that store your private key on your behalf. Typically, publicly traded companies use usernames and passwords to protect your wallet, but in the event of a hack or data breach, your assets could be at risk. On the other hand, decentralized applications (dapps) are non-custodial: you have full ownership, property rights and responsibility for your private keys and assets. There are different types of wallets, extending from browsers to mobile app sequences and then to USB-like hardware.</p>
                    <p>There are roughly three types of wallets:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li><strong>Hardware wallet:</strong> A physical device stores your private key offline. This type of wallet is considered to be the most secure. Show examples include Ledger and Trezor.</li>
                        <li><strong>Web wallet:</strong> A self-hosted wallet allows you to interact with your Ether account through a web browser. For example, you can download MetaMask as a browser plugin and create a wallet to store Ether and other ERC-20 tokens.</li>
                        <li><strong>Smart contract wallets:</strong> These wallets exist as programs on the blockchain, rather than providing users with public and private keys. Key pairs, usually associated with a specific application. Examples include InstaDapp's DeFi smart account Households, Argent, Dharma, Gnosis Safe, etc.</li>
                    </ul>

                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">TAX DISCLAIMER</h3>
                    <p>SmartAirTrade does not provide tax or investment advice. Depending on the regulatory policies of the relevant jurisdiction, you may be subject to taxation when you trade commodities and incur gains (or losses). Digital currency tax policies vary by jurisdiction, so we strongly recommend that you contact your personal tax advisor for further information regarding your personal tax situation. It is your personal obligation to select the correct jurisdiction for your tax return. By using SmartAirTrade's tax filing tool, you agree that SmartAirTrade does not make any form of promotion/solicitation and that this tool is only for the convenience of users in filing their tax returns.</p>

                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">TAX RISK WARNING</h3>
                    <p>Trading in digital currencies carries significant risks. Please purchase with caution and be aware of the risks involved in your transactions. SmartAirTrade will follow the selection of high quality currencies, but is not responsible for any of your transactions, such as guarantees, indemnities, etc.</p>

                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pt-2">Risk warning and exemption treaties</h3>
                    <p>This case is for information purposes only and the contents of the document are for reference only and do not constitute investment advice. SmartAirTrade team will continue to make reasonable attempts. During the development process, the platform may be updated, including but not to limited to the Taiwan mechanism, tokens and their mechanisms, token issuance. Parts of the document may change as the project progresses the team will adjust accordingly and the team will make updates available to the public through the help center. SmartAirTrade expressly disclaims any reliance by participants on the content of this document, for inaccuracies in the information contained herein, and for any inaccuracies caused by the Loss of this document. The SmartAirTrade platform provides participants clearly communicated the possible risks. By participating in an exchange, participants acknowledge that they understand and agree to the terms and conditions set forth in the detailed rules.</p>
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

    const HelpModal = () => {
        const AccordionItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => {
            const [isOpen, setIsOpen] = useState(false);
            return (
                <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="w-full flex justify-between items-center text-left py-4"
                        aria-expanded={isOpen}
                    >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{question}</span>
                        <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                        <div className="pb-4 text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
                            {children}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-fast" onClick={() => setIsHelpModalOpen(false)}>
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-lg w-full max-w-2xl m-4 relative animate-scale-in max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Help & FAQ</h2>
                        <button onClick={() => setIsHelpModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto text-sm">
                        <AccordionItem question="How do I deposit funds?">
                            <p>To deposit, go to the Dashboard and click the 'Deposit' button. Select your desired asset, and you'll be shown a unique wallet address. Send your funds to this address from your personal wallet or another exchange. Your balance will be updated after the required number of network confirmations.</p>
                        </AccordionItem>
                        <AccordionItem question="How long do withdrawals take?">
                            <p>Withdrawal times can vary depending on network congestion. Typically, withdrawals are processed within 5-30 minutes. You can check the status of your withdrawal in the 'History' page, accessible from the withdrawal screen.</p>
                        </AccordionItem>
                        <AccordionItem question="Is my account secure?">
                            <p>We take security very seriously. We recommend enabling all available security features in the 'Security & Verification' section, including setting a strong password and a unique transaction password. Never share your password with anyone.</p>
                        </AccordionItem>
                        <AccordionItem question="What are options trades?">
                            <p>Options trading allows you to speculate on whether the price of a cryptocurrency will be higher or lower than the current price after a fixed period (e.g., 30s, 60s). If your prediction is correct, you win a fixed payout. If it's incorrect, you lose the amount you traded. It's a high-risk, high-reward form of trading.</p>
                        </AccordionItem>
                         <AccordionItem question="How does Lock-up Mining work?">
                            <p>Lock-up mining allows you to earn a fixed yield by locking your USDT for a specific period (e.g., 3, 10, or 30 days). During this period, your funds are used in our arbitrage system to generate returns. Your principal and profits are returned to your account at the end of the cycle.</p>
                        </AccordionItem>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {isAboutUsOpen && <AboutUsModal />}
            {isHelpModalOpen && <HelpModal />}
            <div className="flex items-center">
                <button onClick={onBack} className="flex items-center space-x-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors p-2 -ml-2 rounded-md">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back</span>
                </button>
            </div>
            {/* Main Profile Card */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
                    <img src={user.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full mb-4 sm:mb-0 flex-shrink-0 border-4 border-slate-200 dark:border-slate-700 shadow-lg"/>
                    <div className="flex flex-col text-center sm:text-left w-full">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">{user.email}</p>
                        <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                            <CompactInfoRow label="Username" value={`@${user.username}`} />
                            <CompactInfoRow label="Member Since" value={user.memberSince} />
                            <CompactInfoRow label="Verification Status" value={user.verificationStatus} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Security and Verification */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                <button
                    onClick={() => setIsSecuritySectionOpen(!isSecuritySectionOpen)}
                    className="w-full flex justify-between items-center text-left p-4 sm:p-6"
                    aria-expanded={isSecuritySectionOpen}
                    aria-controls="security-section-content"
                >
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security & Verification</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account's security settings.</p>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isSecuritySectionOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                    id="security-section-content"
                    className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${isSecuritySectionOpen ? 'max-h-[300px]' : 'max-h-0'}`}
                >
                    <div className="px-4 sm:px-6 pb-2 border-t border-slate-200 dark:border-slate-700">
                        <SecurityRow
                            icon={<LockIcon className="w-6 h-6" />}
                            label="Password"
                            status={`Last changed ${user.passwordLastChanged}`}
                            buttonText="Change"
                            onClick={() => setIsChangePasswordModalOpen(true)}
                        />
                        <SecurityRow
                            icon={<PhoneIcon className="w-6 h-6" />}
                            label="Phone Number"
                            status={isPhoneVerified ? (
                                <div className="flex items-center space-x-2">
                                    <span>{userPhoneNumber}</span>
                                    <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-500/20 rounded-full">
                                        Verified
                                    </span>
                                </div>
                            ) : "Not Verified"}
                            buttonText={isPhoneVerified ? "Manage" : "Verify"}
                            onClick={() => setIsVerifyPhoneModalOpen(true)}
                        />
                        <SecurityRow
                            icon={<ShieldCheckIcon className="w-6 h-6" />}
                            label="Transaction Password"
                            status={transactionPasswordSet ? "Enabled" : "Not Set"}
                            buttonText={transactionPasswordSet ? "Reset" : "Set Up"}
                            onClick={() => setIsSetTxPasswordModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* Trading Statistics */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg">
                <button
                    onClick={() => setIsTradingStatsOpen(!isTradingStatsOpen)}
                    className="w-full flex justify-between items-center text-left p-6"
                    aria-expanded={isTradingStatsOpen}
                    aria-controls="trading-stats-content"
                >
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center sm:text-left">Trading Statistics</h2>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isTradingStatsOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                    id="trading-stats-content"
                    className={`transition-all duration-300 ease-in-out grid ${isTradingStatsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                    <div className="min-h-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 px-6 pb-6">
                            <CompactStat label="Total Trades" value={user.totalTrades.toLocaleString()} />
                            <CompactStat label="Win Rate" value={user.winRate} />
                            <CompactStat label="Total Volume (USD)" value={`$${(user.totalVolume / 1_000_000).toFixed(2)}M`} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Links Section */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg divide-y divide-slate-200 dark:divide-slate-700">
                <button onClick={() => setIsAboutUsOpen(true)} className="w-full flex items-center p-4 sm:p-6 text-left hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-t-xl transition-colors">
                    <div className="flex items-center space-x-4 flex-grow">
                        <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
                            <InfoIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">About Us</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Learn more about our company and protocol.</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4" />
                </button>
                 <button onClick={() => setIsHelpModalOpen(true)} className="w-full flex items-center p-4 sm:p-6 text-left hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-4 flex-grow">
                        <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
                            <QuestionMarkCircleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Help & FAQ</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Find answers to common questions.</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4" />
                </button>
                 <button onClick={() => window.dispatchEvent(new CustomEvent('open-contact-support-modal'))} className="w-full flex items-center p-4 sm:p-6 text-left hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-4 flex-grow">
                        <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
                            <LifebuoyIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Contact Support</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Get help via email.</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4" />
                </button>
                 <button onClick={() => window.dispatchEvent(new CustomEvent('open-chat-modal'))} className="w-full flex items-center p-4 sm:p-6 text-left hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-b-xl transition-colors">
                    <div className="flex items-center space-x-4 flex-grow">
                        <div className="text-slate-400 dark:text-slate-500 flex-shrink-0">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Live Chat</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Chat with a support agent.</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4" />
                </button>
            </div>


            <div className="flex justify-end pt-2">
                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('logout'))}
                    className="px-8 py-3 bg-red-600/90 text-white font-semibold rounded-md hover:bg-red-600 transition"
                >
                    Logout
                </button>
            </div>

            {isChangePasswordModalOpen && (
                <ChangePasswordModal
                    onClose={() => setIsChangePasswordModalOpen(false)}
                    onSuccess={handleChangePasswordSuccess}
                />
            )}

            {isSetTxPasswordModalOpen && (
                <SetTransactionPasswordModal
                    onClose={() => setIsSetTxPasswordModalOpen(false)}
                    onSuccess={handleSetTxPasswordSuccess}
                    isReset={transactionPasswordSet}
                />
            )}
            
            {isVerifyPhoneModalOpen && (
                <VerifyPhoneNumberModal
                    onClose={() => setIsVerifyPhoneModalOpen(false)}
                    onSuccess={handlePhoneVerificationSuccess}
                />
            )}
            
            {showPasswordSuccess && (
                <div className="fixed top-20 right-6 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out z-50">
                    Password changed successfully!
                </div>
            )}

            {showTxPasswordSuccess && (
                <div className="fixed top-20 right-6 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out z-50">
                    Transaction password set successfully!
                </div>
            )}
            
            {showPhoneSuccess && (
                <div className="fixed top-20 right-6 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out z-50">
                    Phone number verified successfully!
                </div>
            )}

             <style>{`
                @keyframes fade-in-out {
                  0% { opacity: 0; transform: translateY(-20px); }
                  10% { opacity: 1; transform: translateY(0); }
                  90% { opacity: 1; transform: translateY(0); }
                  100% { opacity: 0; transform: translateY(-20px); }
                }
                .animate-fade-in-out {
                  animation: fade-in-out 4s ease-in-out forwards;
                }
              `}</style>
        </div>
    );
};


export default UserProfile;
