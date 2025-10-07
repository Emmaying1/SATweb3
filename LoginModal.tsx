import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CloseIcon, EyeIcon, EyeOffIcon } from './icons';

interface LoginModalProps {
    onLoginSuccess: () => void;
    onOpenResetPassword: () => void;
}

type FormType = 'login' | 'register';

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onOpenResetPassword }) => {
    // State for login form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    
    // State for registration form
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regCode, setRegCode] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string; api?: string; regUsername?: string; regEmail?: string; regCode?: string; regPassword?: string; }>({});

    // New state to toggle between login and register
    const [formType, setFormType] = useState<FormType>('login');

    const emailInputRef = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Autofocus appropriate input on mount/form type change
        if (formType === 'login') {
            emailInputRef.current?.focus();
        } else {
            usernameInputRef.current?.focus();
        }
    }, [formType]);
    
    // Countdown timer effect
    useEffect(() => {
        if (countdown === 0) return;
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const validateEmail = (emailStr: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    };

    const isLoginDisabled = useMemo(() => {
        return isLoading || !validateEmail(email) || password.length === 0 || !agreedToTerms;
    }, [isLoading, email, password, agreedToTerms]);
    
    const isRegisterDisabled = useMemo(() => {
        return isLoading || !regUsername || !validateEmail(regEmail) || regCode.length !== 6 || regPassword.length < 8;
    }, [isLoading, regUsername, regEmail, regCode, regPassword]);

    const handleGetCode = () => {
        if (!validateEmail(regEmail)) {
            setErrors({ regEmail: 'Please enter a valid email to get the code.' });
            return;
        }
        setErrors({});
        setIsSendingCode(true);
        // Simulate API call
        setTimeout(() => {
            setIsSendingCode(false);
            setCountdown(60);
        }, 1000);
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const currentErrors: typeof errors = {};

        if (!validateEmail(email)) {
            currentErrors.email = 'Please enter a valid email address.';
        }
        if (!password) {
            currentErrors.password = 'Password is required.';
        }
        if (!agreedToTerms) {
            currentErrors.terms = 'You must agree to the rules and regulations.';
        }
        
        setErrors(currentErrors);

        if (Object.keys(currentErrors).length > 0) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        // Simulate API call
        setTimeout(() => {
            if (email === 'user@example.com' && password === 'password123') {
                onLoginSuccess();
            } else {
                setErrors({ api: 'Invalid email or password. Please try again.' });
            }
            setIsLoading(false);
        }, 1500);
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const currentErrors: typeof errors = {};

        if (!regUsername) currentErrors.regUsername = 'Username is required.';
        if (!validateEmail(regEmail)) currentErrors.regEmail = 'Please enter a valid email address.';
        if (regCode.length !== 6) currentErrors.regCode = 'Verification code must be 6 digits.';
        if (regPassword.length < 8) currentErrors.regPassword = 'Password must be at least 8 characters.';

        setErrors(currentErrors);
        if (Object.keys(currentErrors).length > 0) return;

        setIsLoading(true);
        setErrors({});

        // Simulate API call
        setTimeout(() => {
            if (regCode !== '123456') { // Mock success code
                setErrors({ regCode: 'Invalid verification code.' });
                setIsLoading(false);
            } else {
                // Success
                onLoginSuccess(); // This will close modal and show dashboard
            }
        }, 1500);
    };
    
    const renderLoginForm = () => (
        <form onSubmit={handleLoginSubmit} noValidate>
            <div className="p-4 space-y-4">
                {errors.api && (
                    <div className="bg-red-500/10 text-red-500 dark:text-red-400 text-sm p-3 rounded-md text-center">
                        {errors.api}
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        ref={emailInputRef}
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 px-3 text-slate-900 dark:text-white text-sm ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                        aria-invalid={!!errors.email}
                    />
                     {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                     <label htmlFor="password" className="sr-only">Password</label>
                     <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 px-3 text-slate-900 dark:text-white text-sm ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                            aria-invalid={!!errors.password}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                     </div>
                     {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="text-right -mt-2">
                     <button type="button" onClick={onOpenResetPassword} className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline">
                        Forgot password?
                    </button>
                </div>
                
                <div className="flex items-start space-x-3">
                    <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className={`mt-1 h-4 w-4 flex-shrink-0 rounded border-2 ${errors.terms ? 'border-red-500' : 'border-slate-400 dark:border-slate-500'} bg-slate-100 dark:bg-slate-700 text-sky-500 focus:ring-sky-500/50 cursor-pointer`}
                        aria-required="true"
                        aria-invalid={!!errors.terms}
                    />
                    <div className="text-sm">
                        <label htmlFor="terms" className="text-slate-600 dark:text-slate-300">
                            I have read the <button type="button" onClick={() => alert('This would open the rules and regulations page.')} className="font-medium text-sky-600 dark:text-sky-400 hover:underline">rule and regulations</button>.
                        </label>
                         {errors.terms && <p className="text-red-500 text-xs mt-1">{errors.terms}</p>}
                    </div>
                </div>
                 <div className="text-center pt-2">
                    <button type="button" onClick={() => { setFormType('register'); setErrors({}); }} className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline">
                        Create New Account
                    </button>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                <button type="submit" disabled={isLoginDisabled} className="w-full font-bold py-3 rounded-md transition-colors bg-sky-500 hover:bg-sky-600 text-white text-base disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
                    {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </form>
    );

     const renderRegisterForm = () => (
         <form onSubmit={handleRegisterSubmit} noValidate>
            <div className="p-4 space-y-4">
                {errors.api && (
                    <div className="bg-red-500/10 text-red-500 dark:text-red-400 text-sm p-3 rounded-md text-center">
                        {errors.api}
                    </div>
                )}
                <div>
                    <label htmlFor="reg-username" className="sr-only">Username</label>
                    <input
                        ref={usernameInputRef}
                        id="reg-username"
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="Username"
                        required
                        className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 px-3 text-slate-900 dark:text-white text-sm ${errors.regUsername ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                    />
                     {errors.regUsername && <p className="text-red-500 text-xs mt-1">{errors.regUsername}</p>}
                </div>

                <div>
                    <label htmlFor="reg-email" className="sr-only">Email</label>
                    <input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="Email"
                        required
                        className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 px-3 text-slate-900 dark:text-white text-sm ${errors.regEmail ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                    />
                     {errors.regEmail && <p className="text-red-500 text-xs mt-1">{errors.regEmail}</p>}
                </div>
                
                 <div>
                    <label htmlFor="reg-code" className="sr-only">Code</label>
                    <div className="flex items-start gap-2">
                        <div className="flex-grow">
                             <input
                                id="reg-code"
                                type="text"
                                value={regCode}
                                onChange={(e) => /^\d*$/.test(e.target.value) && e.target.value.length <= 6 && setRegCode(e.target.value)}
                                placeholder="Code from email"
                                required
                                maxLength={6}
                                className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 px-3 text-slate-900 dark:text-white text-sm ${errors.regCode ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                            />
                            {errors.regCode && <p className="text-red-500 text-xs mt-1">{errors.regCode}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={handleGetCode}
                            disabled={isSendingCode || countdown > 0}
                            className="px-4 py-2.5 text-sm font-semibold rounded-md transition-colors bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 disabled:opacity-50 flex-shrink-0 w-28 text-center"
                        >
                            {isSendingCode ? 'Sending...' : countdown > 0 ? `${countdown}s` : 'Get Code'}
                        </button>
                    </div>
                </div>

                <div>
                     <label htmlFor="reg-password" className="sr-only">Password</label>
                     <div className="relative">
                        <input
                            id="reg-password"
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className={`w-full bg-slate-100 dark:bg-slate-700 border rounded-md py-2.5 px-3 text-slate-900 dark:text-white text-sm ${errors.regPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400"
                            aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                        >
                            {showRegPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                     </div>
                     {errors.regPassword && <p className="text-red-500 text-xs mt-1">{errors.regPassword}</p>}
                </div>
                
                <div className="text-center pt-2">
                    <button type="button" onClick={() => { setFormType('login'); setErrors({}); }} className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline">
                        Already have an account? Sign In
                    </button>
                </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
                <button type="submit" disabled={isRegisterDisabled} className="w-full font-bold py-3 rounded-md transition-colors bg-sky-500 hover:bg-sky-600 text-white text-base disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
                    {isLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                    {isLoading ? 'Registering...' : 'Registration'}
                </button>
            </div>
        </form>
    );


    return (
        <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
        >
            <div
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg w-full max-w-sm m-4 relative animate-scale-in"
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 text-center">
                    <h2 id="login-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
                         {formType === 'login' ? 'Login' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formType === 'login' ? 'Please sign in to continue.' : 'Join us to start trading.'}
                    </p>
                </div>
                {formType === 'login' ? renderLoginForm() : renderRegisterForm()}
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


export default LoginModal;
