import React, { useEffect, useState } from 'react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Task } from '@/types/task';
import { Plus, ListTodo, Filter, ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, Trophy } from 'lucide-react';
import { PageProps } from '@/types';

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
}

export default function TasksIndex() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const { auth } = usePage<PageProps>().props;
    const canCreate = auth.user.role === 'superadmin' || auth.user.role === 'hr';

    const fetchTasks = (page: number, priority: string) => {
        setLoading(true);
        axios.get(`/api/tasks`, {
            params: {
                page: page,
                priority: priority !== '' ? priority : undefined
            }
        }).then((res) => {
            setTasks(res.data.data);
            setMeta(res.data.meta);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchTasks(currentPage, priorityFilter);
    }, [currentPage, priorityFilter]);

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical':
                return 'bg-rose-500/10 text-rose-700 border-rose-200';
            case 'high':
                return 'bg-orange-500/10 text-orange-700 border-orange-200';
            case 'medium':
                return 'bg-blue-500/10 text-blue-700 border-blue-200';
            case 'low':
                return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'text-emerald-600';
            case 'in_progress':
            case 'in progress':
                return 'text-blue-600';
            default:
                return 'text-slate-500';
        }
    };

    return (
        <AppSidebarLayout>
            <Head title="Tasks" />
            
            {/* Main Wrapper with decorative glassmorphism background */}
            <div className="relative flex flex-1 flex-col min-h-screen overflow-hidden bg-slate-50 pb-20 sm:pb-8">
                
                {/* Background Blur Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-300/30 rounded-full blur-[100px] mix-blend-multiply pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-300/30 rounded-full blur-[100px] mix-blend-multiply pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 h-full">
                    
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-xl">
                                    <ListTodo className="w-6 h-6 text-indigo-600" />
                                </div>
                                Tasks
                            </h1>
                            <p className="text-slate-500 font-medium mt-1 text-sm">Manage and track project assignments.</p>
                        </div>

                        {/* Mobile Actions Stack */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Filter Dropdown */}
                            <div className="flex-1 sm:flex-none relative flex items-center bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400">
                                <div className="pl-4 pointer-events-none">
                                    <Filter className="w-4 h-4 text-slate-400" />
                                </div>
                                <select 
                                    value={priorityFilter} 
                                    onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                                    className="w-full bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer outline-none py-3 pr-8 pl-3 appearance-none"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                    <option value="critical">Critical Priority</option>
                                </select>
                            </div>

                            {/* Desktop Create Button */}
                            <Link 
                                href="/tasks/leaderboard" 
                                className="hidden sm:flex bg-amber-50 hover:bg-amber-100 text-amber-700 px-5 py-3 rounded-2xl items-center gap-2 font-bold shadow-sm transition-all active:scale-95 border border-amber-200"
                            >
                                <Trophy className="w-4 h-4" /> Leaderboard
                            </Link>

                            {canCreate && (
                                <Link 
                                    href="/tasks/create" 
                                    className="hidden sm:flex bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-2xl items-center gap-2 font-bold shadow-lg shadow-slate-800/20 transition-all active:scale-95 border border-slate-700"
                                >
                                    <Plus className="w-4 h-4" /> New Task
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center min-h-[400px]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Tasks...</p>
                            </div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center px-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-sm">
                            <div className="w-20 h-20 bg-white/80 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white">
                                <ListTodo className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800">No tasks found</h3>
                            <p className="text-slate-500 mt-2 max-w-sm">There are no tasks matching your current filters. Try adjusting them or create a new task.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {tasks.map(task => (
                                <Link 
                                    href={`/tasks/${task.id}`} 
                                    key={task.id} 
                                    className="group bg-white/60 backdrop-blur-xl p-5 sm:p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:bg-white transition-all duration-300 hover:shadow-lg active:scale-[0.98] flex flex-col relative overflow-hidden"
                                >
                                    {/* Inner Glass Highlight */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                                    
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <h3 className="font-extrabold text-lg text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {task.title}
                                            </h3>
                                            <span className={`shrink-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl border ${getPriorityColor(task.priority)} shadow-sm`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-2 leading-relaxed flex-1">
                                            {task.description}
                                        </p>
                                        
                                        <div className="pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                                            <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-white shadow-sm">
                                                <AlertCircle className={`w-3.5 h-3.5 ${getStatusColor(task.status)}`} />
                                                <span className={`uppercase tracking-wider ${getStatusColor(task.status)}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            
                                            {task.deadline && (
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && meta && meta.last_page > 1 && (
                        <div className="mt-4 sm:mt-auto flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] shadow-sm border border-white/80">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center sm:text-left">
                                Page <span className="text-slate-800">{meta.current_page}</span> of <span className="text-slate-800">{meta.last_page}</span> 
                                <span className="ml-2 opacity-60">({meta.total} tasks)</span>
                            </span>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={meta.current_page === 1}
                                    className="flex-1 sm:flex-none flex items-center justify-center p-3 sm:p-2.5 rounded-xl border border-white bg-slate-100/50 hover:bg-white text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100/50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(meta.last_page, p + 1))}
                                    disabled={meta.current_page === meta.last_page}
                                    className="flex-1 sm:flex-none flex items-center justify-center p-3 sm:p-2.5 rounded-xl border border-white bg-slate-100/50 hover:bg-white text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100/50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Floating Action Buttons (FAB) */}
                <div className="sm:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                    {/* <Link 
                        href="/tasks/leaderboard" 
                        className="flex items-center justify-center w-14 h-14 bg-amber-400 text-amber-900 rounded-full shadow-[0_8px_30px_rgba(251,191,36,0.4)] active:scale-90 transition-transform border border-amber-300"
                    >
                        <Trophy className="w-6 h-6" />
                    </Link> */}
                    {canCreate && (
                        <Link 
                            href="/tasks/create" 
                            className="flex items-center justify-center w-14 h-14 bg-slate-800 text-white rounded-full shadow-[0_8px_30px_rgba(30,41,59,0.4)] active:scale-90 transition-transform border border-slate-600"
                        >
                            <Plus className="w-6 h-6" />
                        </Link>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}