import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log In" />
            <div className="min-h-screen bg-[#F4F7F9] flex items-center justify-center p-4 lg:p-8 font-sans text-[#2A2A2A]">
                {/* Main Card */}
                <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-[1200px] flex flex-col lg:flex-row overflow-hidden relative min-h-[700px]">
                    
                    {/* Header Logo - Absolute positioned */}
                    <div className="absolute top-8 left-8 z-20 flex items-center gap-2 font-bold text-xl tracking-wider text-[#051C3F]">
                        {/* A generic car logo icon placeholder */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#051C3F]">
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
                            <circle cx="7" cy="17" r="2"/>
                            <path d="M9 17h6"/>
                            <circle cx="17" cy="17" r="2"/>
                            <path d="M14 10h5.5"/>
                            <path d="m5 10 1.5-3"/>
                        </svg>
                        JETVIN
                    </div>

                    {/* Left Side - Illustration */}
                    <div className="w-full lg:w-[45%] relative bg-[#F8FAFC] flex items-end justify-center pt-24 pb-8 lg:pb-0 px-8 rounded-r-[4rem] z-10 hidden lg:flex">
                        {/* Light blue abstract background blob */}
                        <div className="absolute inset-0 overflow-hidden rounded-r-[4rem]">
                            <div className="absolute top-0 left-0 w-full h-full bg-[#EEF2F6] rounded-br-[8rem]"></div>
                        </div>
                        <img 
                            src="/images/login_illustration.png" 
                            alt="Login Illustration" 
                            className="relative z-10 w-full max-w-[450px] object-contain object-bottom"
                        />
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full lg:w-[55%] flex flex-col justify-center px-8 lg:px-24 py-16 relative">
                        
                        {/* Top Right - Language Selector */}
                        <div className="absolute top-8 right-8 z-20 flex items-center gap-1.5 text-sm font-semibold text-[#2A2A2A] cursor-pointer hover:text-[#1DC660] transition-colors">
                            IND
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 mt-[2px]">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            <span className="ml-1 text-lg">🇮🇳</span>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}

                        <div className="max-w-[420px] w-full mx-auto">
                            <h1 className="text-3xl font-bold mb-2 text-[#051C3F]">Login</h1>
                            <p className="text-[#8895A7] text-sm mb-10">
                                Welcome back! Please login to your account.
                            </p>

                            <form onSubmit={submit} className="flex flex-col gap-6">
                                {/* Email Field */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-xs font-semibold text-[#8895A7] uppercase tracking-wide">
                                        Your email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="lrobbertalex99@gmail.com"
                                        className={`w-full px-4 py-3 rounded-md border text-sm outline-none transition-colors ${
                                            errors.email ? 'border-red-500' : 'border-[#1DC660] focus:border-[#1DC660] focus:ring-1 focus:ring-[#1DC660]'
                                        }`}
                                        autoComplete="username"
                                        autoFocus
                                    />
                                    {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                                </div>

                                {/* Password Field */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="password" className="text-xs font-semibold text-[#8895A7] uppercase tracking-wide">
                                        Your Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-3 rounded-md border text-sm outline-none transition-colors tracking-widest ${
                                            errors.password ? 'border-red-500' : 'border-gray-200 focus:border-[#1DC660] focus:ring-1 focus:ring-[#1DC660]'
                                        }`}
                                        autoComplete="current-password"
                                    />
                                    {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <div className="relative flex items-center justify-center w-4 h-4 rounded-[4px] border border-[#1DC660] bg-[#1DC660]">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) => setData('remember', e.target.checked)}
                                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                            />
                                            {data.remember && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="pointer-events-none text-white stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="1 4 4 7 9 1"></polyline>
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-[#2A2A2A]">Keep me logged in</span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#1DC660] hover:bg-[#1ab557] text-white font-semibold rounded-md py-3.5 mt-2 transition-colors flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(29,198,96,0.6)]"
                                >
                                    {processing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : 'Login'}
                                </button>
                                
                                {/* Forgot Password */}
                                {canResetPassword && (
                                    <div className="text-center mt-6">
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm text-[#1DC660] hover:underline font-medium"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                )}
                            </form>
                        </div>
                        
                        {/* Footer Rights */}
                        <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-[#A0AAB8] font-medium hidden lg:block border-t border-gray-100 max-w-[420px] mx-auto pt-6">
                            @ 2020 All rights reserved.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
