import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { LoaderCircle, Eye, EyeOff, ShieldPlus, LockKeyhole, HeartPulse } from 'lucide-react';

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
            <Head title="Provider Log In" />
            
            {/* Background Wrapper */}
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-500/30">
                
                {/* Main Card (Mimicking Mobile App Reference) */}
                <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-6 sm:p-10 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Premium Medical Security Illustration */}
                    <div className="relative w-40 h-40 mx-auto mb-4">
                        {/* Soft Glow */}
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
                        
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                            {/* Medical Shield Element */}
                            <div className="absolute -left-2 top-8 w-12 h-12 bg-blue-100 rounded-2xl -rotate-12 flex items-center justify-center shadow-sm border border-white">
                                <ShieldPlus className="text-blue-600 w-6 h-6" />
                            </div>
                            
                            {/* Main Lock Element */}
                            <div className="absolute z-20 w-20 h-24 bg-gradient-to-b from-blue-500 to-blue-600 rounded-[1.5rem] shadow-xl shadow-blue-500/30 flex flex-col items-center justify-center border-4 border-white">
                                <div className="w-6 h-6 border-4 border-white/80 rounded-t-full rounded-b-none border-b-0 -mt-8 absolute -top-4"></div>
                                <LockKeyhole className="text-white w-8 h-8 mt-2" strokeWidth={2.5} />
                            </div>
                            
                            {/* Pulse/Care Element */}
                            <div className="absolute -right-2 bottom-8 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-50">
                                <HeartPulse className="text-rose-500 w-7 h-7" />
                            </div>
                        </div>
                    </div>

                    {/* Greetings */}
                    <div className="text-center mb-6">
                        <h1 className="text-[22px] font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-2">
                            Welcome back <span className="text-2xl animate-in wave origin-bottom-right">👋</span>
                        </h1>
                        <p className="text-gray-500 text-[13px] mt-1.5 font-medium">
                            Enter your details to access your account
                        </p>
                    </div>

                    {/* Login Indicator Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-100/80 rounded-2xl border border-gray-200/50 shadow-sm">
                            <span className="text-sm font-bold text-gray-800">
                                Log into your account
                            </span>
                        </div>
                    </div>

                    {status && (
                        <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={submit} className="flex flex-col gap-4">
                        
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-[13px] font-medium text-gray-500 mb-1.5 ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => {
                                        setData('email', e.target.value);
                                        clearErrors('email');
                                    }}
                                    placeholder="Enter your email address"
                                    className={`w-full px-4 py-3.5 bg-white border rounded-2xl text-gray-900 placeholder:text-gray-300 outline-none transition-all duration-200 focus:ring-4 ${
                                        errors.email 
                                            ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10' 
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10 hover:border-gray-300'
                                    }`}
                                    autoComplete="username"
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-[13px] font-medium text-gray-500 mb-1.5 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) => {
                                        setData('password', e.target.value);
                                        clearErrors('password');
                                    }}
                                    placeholder="••••••••"
                                    className={`w-full pl-4 pr-12 py-3.5 bg-white border rounded-2xl text-gray-900 placeholder:text-gray-300 outline-none transition-all duration-200 focus:ring-4 ${
                                        errors.password 
                                            ? 'border-red-300 focus:border-red-400 focus:ring-red-500/10' 
                                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10 hover:border-gray-300'
                                    }`}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs font-medium text-red-500 ml-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Additional Options */}
                        <div className="flex items-center justify-between mt-1 px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded-[4px] border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-colors cursor-pointer"
                                />
                                <span className="text-[13px] font-medium text-gray-500 group-hover:text-gray-800 transition-colors">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-[13px] font-extrabold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                    Forgot Password
                                </Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-6 w-full flex justify-center items-center py-4 px-4 rounded-[2rem] text-[15px] font-bold text-white bg-gradient-to-b from-[#2A2A2A] to-[#0A0A0A] hover:from-[#3A3A3A] hover:to-[#1A1A1A] border border-gray-800 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.4)] focus:outline-none focus:ring-4 focus:ring-gray-900/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                        >
                            {processing ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}