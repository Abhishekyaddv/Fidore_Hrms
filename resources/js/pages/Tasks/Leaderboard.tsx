import React, { useState, useEffect } from 'react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { Trophy, Medal, Star, ChevronLeft, Award, Crown } from 'lucide-react';

interface LeaderboardEntry {
    user_id: number;
    completed_count: number;
    user: {
        id: number;
        name: string;
        avatar: string | null;
        role: string;
    };
}

export default function Leaderboard() {
    const [monthly, setMonthly] = useState<LeaderboardEntry[]>([]);
    const [overall, setOverall] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'monthly' | 'overall'>('monthly');

    useEffect(() => {
        axios.get('/api/leaderboard').then(res => {
            setMonthly(res.data.monthly);
            setOverall(res.data.overall);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    const data = view === 'monthly' ? monthly : overall;

    const renderPodium = () => {
        if (data.length === 0) return null;

        const first = data[0];
        const second = data[1];
        const third = data[2];

        return (
            <div className="flex flex-row justify-center items-end gap-2 sm:gap-6 mt-12 mb-10 sm:mb-16 px-2">
                {/* Silver - 2nd Place */}
                {second && (
                    <div className="flex flex-col items-center animate-fade-in-up z-10 w-24 sm:w-32" style={{ animationDelay: '100ms' }}>
                        <div className="relative mb-3 sm:mb-4">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 sm:border-4 border-slate-200 bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg z-10 relative">
                                {second.user.avatar ? (
                                    <img src={second.user.avatar} alt={second.user.name} className="w-full h-full object-cover rounded-full" />
                                ) : second.user.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white p-1 sm:p-1.5 rounded-full border border-slate-200 shadow-sm z-20">
                                <Medal className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-400" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-t from-slate-300/80 to-slate-100/40 backdrop-blur-md w-full h-24 sm:h-32 rounded-t-2xl flex flex-col items-center justify-start pt-3 sm:pt-4 shadow-inner border-x border-t border-white/60 relative overflow-hidden">
                            <span className="text-3xl sm:text-4xl font-black text-slate-500/20 absolute bottom-2 sm:bottom-4">2</span>
                            <span className="font-extrabold text-slate-700 text-center relative z-10 px-1 text-[10px] sm:text-sm truncate w-full">{second.user.name}</span>
                            <span className="text-[9px] sm:text-xs font-black text-indigo-600 bg-white/50 px-2 py-0.5 rounded-full mt-1">{second.completed_count} tasks</span>
                        </div>
                    </div>
                )}

                {/* Gold - 1st Place */}
                {first && (
                    <div className="flex flex-col items-center animate-fade-in-up z-20 w-28 sm:w-40" style={{ animationDelay: '0ms' }}>
                        <div className="relative mb-3 sm:mb-4">
                            <div className="absolute -top-7 sm:-top-9 left-1/2 -translate-x-1/2 z-30">
                                <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 drop-shadow-[0_4px_8px_rgba(251,191,36,0.5)]" fill="currentColor" />
                            </div>
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-[3px] sm:border-4 border-amber-200 bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl z-10 relative ring-4 ring-white/50">
                                {first.user.avatar ? (
                                    <img src={first.user.avatar} alt={first.user.name} className="w-full h-full object-cover rounded-full" />
                                ) : first.user.name.charAt(0)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-t from-amber-400/80 to-amber-200/40 backdrop-blur-md w-full h-32 sm:h-44 rounded-t-3xl flex flex-col items-center justify-start pt-3 sm:pt-5 shadow-[0_0_30px_rgba(251,191,36,0.2)] border-x border-t border-white/60 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10"></div>
                            <span className="text-4xl sm:text-5xl font-black text-amber-600/20 absolute bottom-2 sm:bottom-4">1</span>
                            <span className="font-extrabold text-slate-900 text-center relative z-10 px-1 text-xs sm:text-base truncate w-full">{first.user.name}</span>
                            <span className="text-[10px] sm:text-sm font-black text-amber-900 relative z-10 bg-white/60 px-3 py-1 rounded-full mt-1.5 shadow-sm border border-white/50">{first.completed_count} tasks</span>
                        </div>
                    </div>
                )}

                {/* Bronze - 3rd Place */}
                {third && (
                    <div className="flex flex-col items-center animate-fade-in-up z-0 w-24 sm:w-32" style={{ animationDelay: '200ms' }}>
                        <div className="relative mb-3 sm:mb-4">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 sm:border-4 border-orange-200 bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg z-10 relative">
                                {third.user.avatar ? (
                                    <img src={third.user.avatar} alt={third.user.name} className="w-full h-full object-cover rounded-full" />
                                ) : third.user.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -left-2 bg-white p-1 sm:p-1.5 rounded-full border border-orange-200 shadow-sm z-20">
                                <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-500" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-t from-orange-400/70 to-orange-200/40 backdrop-blur-md w-full h-20 sm:h-28 rounded-t-2xl flex flex-col items-center justify-start pt-3 sm:pt-4 shadow-inner border-x border-t border-white/60 relative overflow-hidden">
                            <span className="text-3xl sm:text-4xl font-black text-orange-700/20 absolute bottom-2 sm:bottom-4">3</span>
                            <span className="font-extrabold text-slate-700 text-center relative z-10 px-1 text-[10px] sm:text-sm truncate w-full">{third.user.name}</span>
                            <span className="text-[9px] sm:text-xs font-black text-orange-800 bg-white/50 px-2 py-0.5 rounded-full mt-1">{third.completed_count} tasks</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppSidebarLayout>
            <Head title="Leaderboard" />
            
            <div className="relative flex flex-1 flex-col min-h-screen overflow-hidden bg-slate-50 pb-12">
                
                {/* Premium Glassmorphism Background Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[30rem] sm:w-[40rem] h-[30rem] sm:h-[40rem] bg-amber-300/30 rounded-full blur-[80px] sm:blur-[100px] mix-blend-multiply pointer-events-none"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[25rem] sm:w-[35rem] h-[25rem] sm:h-[35rem] bg-indigo-300/20 rounded-full blur-[80px] sm:blur-[100px] mix-blend-multiply pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <Link href="/tasks" className="p-2 sm:p-2.5 bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white hover:bg-white transition-all active:scale-95 shrink-0">
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 drop-shadow-sm" />
                                    Leaderboard
                                </h1>
                                <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">Top performers in task completion.</p>
                            </div>
                        </div>

                        {/* Toggle Switch (Glass) */}
                        <div className="w-full sm:w-auto bg-white/40 backdrop-blur-xl p-1.5 rounded-2xl shadow-inner border border-white/60 flex items-center shrink-0">
                            <button 
                                onClick={() => setView('monthly')}
                                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'monthly' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                            >
                                This Month
                            </button>
                            <button 
                                onClick={() => setView('overall')}
                                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${view === 'overall' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
                            >
                                All Time
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh]">
                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Leaders...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] p-10 sm:p-16 text-center border border-white/80 shadow-sm mt-10">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                                <Star className="w-8 h-8 text-slate-300" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-700">No tasks completed yet.</h2>
                            <p className="text-sm font-medium text-slate-500 mt-2">Check back later when someone finishes a task!</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            
                            {/* Podium for Top 3 */}
                            {renderPodium()}

                            {/* List for Rankings */}
                            <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                                
                                <div className="px-5 sm:px-8 py-5 border-b border-white/60 bg-white/30 relative z-10 flex items-center justify-between">
                                    <h3 className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-widest">Global Rankings</h3>
                                </div>
                                
                                <div className="flex flex-col relative z-10">
                                    {data.map((entry, index) => (
                                        <div 
                                            key={entry.user_id} 
                                            className={`
                                                flex items-center gap-3 sm:gap-5 p-4 sm:p-5 border-b border-white/40 last:border-0 transition-colors duration-200 hover:bg-white/60 
                                                ${index < 3 ? 'bg-white/30' : ''}
                                            `}
                                        >
                                            <div className="w-8 sm:w-12 text-center font-black text-lg sm:text-2xl text-slate-300 shrink-0">
                                                {index + 1}
                                            </div>
                                            
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm sm:text-base border-2 border-white shadow-sm shrink-0 overflow-hidden">
                                                {entry.user.avatar ? (
                                                    <img src={entry.user.avatar} alt={entry.user.name} className="w-full h-full object-cover" />
                                                ) : entry.user.name.charAt(0)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="font-extrabold text-slate-800 text-sm sm:text-lg truncate">{entry.user.name}</div>
                                                <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mt-0.5">{entry.user.role}</div>
                                            </div>
                                            
                                            <div className="text-right shrink-0 bg-white/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white shadow-sm">
                                                <div className="text-lg sm:text-2xl font-black text-indigo-600 leading-none">{entry.completed_count}</div>
                                                <div className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Tasks</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }
                .animate-fade-in {
                    animation: fadeInUp 0.4s ease-out forwards;
                }
            `}} />
        </AppSidebarLayout>
    );
}