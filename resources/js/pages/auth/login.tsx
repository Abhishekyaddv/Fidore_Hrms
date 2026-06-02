import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { LoaderCircle, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        post(route('login'), {
            onFinish: () => {
                reset('password');
            },
        });
    };

    if (!mounted) return null;

    return (
        <>
            <Head title="Log In" />
            <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4 sm:p-8 font-sans">
                {/* Main Container */}
                <div className="w-full max-w-[1100px] h-full min-h-[650px] bg-surface-0 rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-700 ease-out">
                    
                    {/* Left Side - Illustration & Branding */}
                    <div className="w-full lg:w-1/2 relative bg-brand-50/50 hidden lg:flex flex-col items-center justify-center p-12 border-r border-border overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-400/20 rounded-full blur-3xl mix-blend-multiply animate-pulse duration-10000"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-400/20 rounded-full blur-3xl mix-blend-multiply animate-pulse duration-10000 delay-1000"></div>
                        
                        <div className="absolute top-8 left-8 z-20 flex items-center gap-2.5 font-bold text-2xl tracking-tight text-brand-900">
                            {/* <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg">
                                
                            </div> */}
                            
                        </div>

                        <div className="relative z-10 w-full max-w-[400px] mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            <img 
                                src="/images/login_illustration.svg" 
                                alt="Login Illustration" 
                                className="w-full h-auto drop-shadow-xl hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        
                        <div className="relative z-10 mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                            <h2 className="text-2xl font-bold text-brand-900 mb-3">Welcome to HRMS Portal</h2>
                            <p className="text-text-secondary text-sm max-w-[300px] mx-auto leading-relaxed">
                                Manage your attendance, leaves, and team collaboration all in one secure place.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 relative bg-surface-0">
                        {/* Mobile Header */}
                        <div className="lg:hidden flex items-center gap-2.5 font-bold text-2xl tracking-tight text-brand-900 mb-10 w-full max-w-[400px]">
                            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                                    <circle cx="7" cy="17" r="2"/>
                                    <path d="M9 17h6"/>
                                    <circle cx="17" cy="17" r="2"/>
                                    <path d="M14 10h5.5"/>
                                    <path d="m5 10 1.5-3"/>
                                </svg>
                            </div>
                            JETVIN
                        </div>

                        <div className="w-full max-w-[400px]">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight mb-2">Sign in</h1>
                                <p className="text-text-secondary mb-8">Please enter your credentials to access your account.</p>
                            </div>

                            {status && (
                                <div className="mb-6 p-4 rounded-xl bg-success-bg border border-success-text/20 text-success-text text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="flex flex-col gap-5">
                                {/* Email Field */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                    <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-brand-600 transition-colors">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => {
                                                setData('email', e.target.value);
                                                clearErrors();
                                            }}
                                            placeholder="name@company.com"
                                            className={`w-full pl-11 pr-4 py-3 bg-surface-1 border rounded-xl text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 focus:bg-surface-0 focus:ring-2 ${
                                                errors.email 
                                                    ? 'border-danger-text/50 focus:border-danger-text focus:ring-danger-text/20' 
                                                    : 'border-border focus:border-brand-500 focus:ring-brand-500/20 hover:border-brand-300'
                                            }`}
                                            autoComplete="username"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1.5 text-sm font-medium text-danger-text animate-in fade-in">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                                    <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-brand-600 transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => {
                                                setData('password', e.target.value);
                                                clearErrors();
                                            }}
                                            placeholder="••••••••"
                                            className={`w-full pl-11 pr-12 py-3 bg-surface-1 border rounded-xl text-text-primary placeholder:text-text-muted outline-none transition-all duration-200 focus:bg-surface-0 focus:ring-2 ${
                                                errors.password 
                                                    ? 'border-danger-text/50 focus:border-danger-text focus:ring-danger-text/20' 
                                                    : 'border-border focus:border-brand-500 focus:ring-brand-500/20 hover:border-brand-300'
                                            }`}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-sm font-medium text-danger-text animate-in fade-in">{errors.password}</p>
                                    )}
                                </div>

                                {/* Remember & Forgot Password */}
                                <div className="flex items-center justify-between mt-1 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <div className="relative flex items-center justify-center w-5 h-5 rounded-md border transition-colors duration-200 group-hover:border-brand-500 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-600 border-border bg-surface-1">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                            />
                                            {data.remember && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in duration-200">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">Remember me</span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm font-semibold text-brand-600 hover:text-brand-500 hover:underline transition-all"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative w-full flex justify-center py-3.5 px-4 mt-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 animate-in fade-in slide-in-from-bottom-4 delay-500"
                                >
                                    {processing ? (
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            Sign in to Dashboard
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
