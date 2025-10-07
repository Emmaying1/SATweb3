import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TradeIcon, DashboardIcon, AiAssistantIcon, UserIcon, SettingsIcon, LogoIcon, OptionsIcon, ChevronDownIcon, MarketIcon } from './components/icons';
import Dashboard from './components/Dashboard';
import TradePage from './components/SpotTrading';
import AIAssistant from './components/AIAssistant';
import OptionsTrading from './components/OptionsTrading';
import Settings from './components/Settings';
import UserProfile from './components/UserProfile';
import MarketPage from './components/MarketPage';
import WithdrawalPage from './components/WithdrawalPage';
import MiningPage from './components/MiningPage';
import MiningRulesPage from './components/MiningRulesPage';
import MiningOrdersPage from './components/MiningOrdersPage';
import MiningInvestmentPage from './components/MiningInvestmentPage';
import HistoryPage from './components/HistoryPage';
import LiveChatModal from './components/LiveChatModal';
import ContactSupportModal from './components/ContactSupportModal';
import LoginModal from './components/LoginModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import Toast from './components/Toast';
import { useTheme } from './contexts/ThemeContext';
import { View, ViewContext } from './types';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh-HK', name: 'Chinese (HK)', flag: '🇭🇰' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelectLanguage = (lang: typeof languages[0]) => {
    setSelectedLanguage(lang);
    setIsOpen(false);
    // In a real app, you would call a function here to change the app's language globally
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{selectedLanguage.flag}</span>
        <span className="hidden sm:inline">{selectedLanguage.name}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50 origin-top-right animate-scale-in-fast"
          role="menu"
          aria-orientation="vertical"
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelectLanguage(lang)}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              role="menuitem"
            >
              <span className="mr-3 text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
       <style>{`
        @keyframes scale-in-fast {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in-fast {
            animation: scale-in-fast 0.1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [history, setHistory] = useState<({view: View, context: ViewContext})[]>([{view: 'dashboard', context: {}}]);
  const { view: activeView, context: viewContext } = history[history.length - 1];
  
  const { theme } = useTheme();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isContactSupportModalOpen, setIsContactSupportModalOpen] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
      const openChat = () => setIsChatOpen(true);
      window.addEventListener('open-chat-modal', openChat);

      const openContactSupport = () => setIsContactSupportModalOpen(true);
      window.addEventListener('open-contact-support-modal', openContactSupport);
      
      const handleLogout = () => {
          setIsAuthenticated(false);
          setToastMessage('You have been logged out.');
          // In a real app, you would also clear tokens/session here.
      };
      window.addEventListener('logout', handleLogout);
      
      return () => {
        window.removeEventListener('open-chat-modal', openChat);
        window.removeEventListener('open-contact-support-modal', openContactSupport);
        window.removeEventListener('logout', handleLogout);
      }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setToastMessage('Welcome back!');
  };

  const handleOpenResetPassword = () => {
    setIsResetPasswordModalOpen(true);
  };

  const handleCloseResetPassword = () => {
    setIsResetPasswordModalOpen(false);
  };
  
  const navigate = (view: View, context: ViewContext = {}) => {
    const current = history[history.length - 1];
    if (current.view === view && JSON.stringify(current.context) === JSON.stringify(context)) {
        return; // Don't do anything if view and context are identical
    }
    
    // For main navigation items, we reset the history to start fresh
    const mainViews: View[] = ['dashboard', 'market', 'trade', 'options', 'ai_assistant'];
    if (mainViews.includes(view)) {
        setHistory([{ view, context }]);
        return;
    }
    
    if (current.view === view) {
        // Same view, but new context. Replace the top of the history stack.
        setHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { view, context };
            return newHistory;
        });
    } else {
        // New view, push to history stack.
        setHistory(prev => [...prev, { view, context }]);
    }
  };

  const handleBack = useCallback(() => {
    if (history.length > 1) {
        setHistory(prevHistory => prevHistory.slice(0, -1));
    }
  }, [history.length]);

  const renderView = useCallback(() => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'market':
        return <MarketPage onNavigate={navigate} />;
      case 'trade':
        return <TradePage />;
      case 'options':
        return <OptionsTrading initialPair={viewContext.pair} />;
      case 'ai_assistant':
        return <AIAssistant />;
      case 'settings':
        return <Settings onBack={handleBack} />;
      case 'profile':
        return <UserProfile onBack={handleBack} />;
      case 'withdraw':
        return <WithdrawalPage onBack={handleBack} onNavigate={navigate} />;
      case 'mining':
        return <MiningPage onBack={handleBack} onNavigate={navigate} />;
      case 'mining_rules':
        return <MiningRulesPage onBack={handleBack} onNavigate={navigate} />;
      case 'mining_orders':
        return <MiningOrdersPage onBack={handleBack} />;
      case 'mining_investment':
        return <MiningInvestmentPage onBack={handleBack} onNavigate={navigate} plan={viewContext.plan!} />;
      case 'history':
        return <HistoryPage onBack={handleBack} initialTab={viewContext.initialTab} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  }, [activeView, viewContext, handleBack]);

  const NavItem: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => navigate(view)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeView === view
          ? 'bg-sky-500 text-white'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
      aria-current={activeView === view ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const BottomNavItem: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => navigate(view)}
      className={`flex flex-col items-center justify-center space-y-1 w-full pt-2 pb-1 text-xs font-medium transition-colors ${
        activeView === view
          ? 'text-sky-500 dark:text-sky-400'
          : 'text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400'
      }`}
      aria-current={activeView === view ? 'page' : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-300 font-sans">
      <header className="bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <a href="https://smartairtrade.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sky-500 dark:text-sky-400">
                <LogoIcon />
                <span className="font-semibold text-lg text-slate-900 dark:text-white tracking-tight">SmartAirTrade</span>
              </a>
              <nav className="hidden md:flex items-center space-x-4">
                <NavItem view="dashboard" label="Dashboard" icon={<DashboardIcon />} />
                <NavItem view="market" label="Market" icon={<MarketIcon />} />
                <NavItem view="trade" label="Trade" icon={<TradeIcon />} />
                <NavItem view="options" label="Options" icon={<OptionsIcon />} />
                <NavItem view="ai_assistant" label="AI Assistant" icon={<AiAssistantIcon />} />
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSelector />
              <button onClick={() => navigate('settings')} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" aria-label="Settings">
                <SettingsIcon />
              </button>
              <button onClick={() => navigate('profile')} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors" aria-label="User Profile">
                <UserIcon />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {renderView()}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 flex justify-around z-50">
        <BottomNavItem view="dashboard" label="Dashboard" icon={<DashboardIcon />} />
        <BottomNavItem view="market" label="Market" icon={<MarketIcon />} />
        <BottomNavItem view="trade" label="Trade" icon={<TradeIcon />} />
        <BottomNavItem view="options" label="Options" icon={<OptionsIcon />} />
        <BottomNavItem view="ai_assistant" label="AI" icon={<AiAssistantIcon />} />
      </nav>

      <LiveChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <ContactSupportModal isOpen={isContactSupportModalOpen} onClose={() => setIsContactSupportModalOpen(false)} />
      
      {!isAuthenticated && !isResetPasswordModalOpen && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onOpenResetPassword={handleOpenResetPassword}
        />
      )}
      
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={handleCloseResetPassword}
      />
      
      <Toast message={toastMessage} onClear={() => setToastMessage('')} />

    </div>
  );
};


export default App;
