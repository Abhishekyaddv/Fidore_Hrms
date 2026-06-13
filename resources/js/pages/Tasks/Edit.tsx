import React, { useState, useEffect } from 'react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Task } from '@/types/task';
import { Loader2, Users, Briefcase, Calendar as CalendarIcon, AlignLeft, Check, ListTodo } from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function TaskEdit({ taskId }: { taskId: string }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [completionMode, setCompletionMode] = useState('all_must_complete');
    const [deadline, setDeadline] = useState('');
    const [assignees, setAssignees] = useState<number[]>([]);
    
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingTask, setLoadingTask] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        axios.get('/api/users').then(res => {
            setUsers(res.data);
            setLoadingUsers(false);
        }).catch(err => {
            console.error(err);
            setLoadingUsers(false);
        });

        axios.get(`/api/tasks/${taskId}`).then(res => {
            const task: Task = res.data.data;
            setTitle(task.title);
            setDescription(task.description || '');
            setPriority(task.priority);
            setCompletionMode(task.completion_mode);
            setDeadline(task.deadline ? task.deadline.split('T')[0] : '');
            if (task.assignments) {
                setAssignees(task.assignments.map(a => a.user?.id).filter(id => id !== undefined) as number[]);
            }
            setLoadingTask(false);
        }).catch(err => {
            console.error(err);
            alert('Failed to load task details');
            setLoadingTask(false);
        });
    }, [taskId]);

    const toggleAssignee = (id: number) => {
        if (assignees.includes(id)) {
            setAssignees(assignees.filter(a => a !== id));
        } else {
            setAssignees([...assignees, id]);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (assignees.length === 0) {
            alert('Please assign at least one user.');
            return;
        }

        setIsSubmitting(true);
        axios.put(`/api/tasks/${taskId}`, {
            title, description, priority, completion_mode: completionMode, deadline, assignees
        }).then(res => {
            window.location.href = `/tasks/${taskId}`;
        }).catch(err => {
            alert('Error updating task. Check console.');
            console.error(err.response?.data);
            setIsSubmitting(false);
        });
    };

    if (loadingTask) {
        return (
            <AppSidebarLayout>
                <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Task Details...</p>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout>
            <Head title="Edit Task" />
            
            {/* Main Wrapper with decorative glassmorphism background */}
            <div className="relative flex flex-1 flex-col min-h-screen overflow-hidden bg-slate-50 pb-12 sm:pb-8">
                
                {/* Background Glassmorphism Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[30rem] sm:w-[40rem] h-[30rem] sm:h-[40rem] bg-indigo-300/30 rounded-full blur-[80px] sm:blur-[100px] mix-blend-multiply pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] sm:w-[40rem] h-[30rem] sm:h-[40rem] bg-blue-300/30 rounded-full blur-[80px] sm:blur-[100px] mix-blend-multiply pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                    
                    {/* Header */}
                    <div className="mb-6 lg:mb-8 flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 rounded-xl shadow-sm border border-indigo-200/50">
                            <ListTodo className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Edit Task</h1>
                            <p className="text-slate-500 font-medium mt-0.5 text-xs sm:text-sm">Update task details and assignments.</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-6 lg:gap-8">
                        
                        {/* Section 1: Core Details */}
                        <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-5 sm:p-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Task Title</Label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-4 text-slate-400">
                                            <AlignLeft className="w-5 h-5" />
                                        </div>
                                        <input 
                                            required 
                                            type="text" 
                                            value={title} 
                                            onChange={e => setTitle(e.target.value)} 
                                            className="w-full pl-12 pr-4 py-3 border-white/80 bg-white/60 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 rounded-xl font-bold shadow-sm transition-all outline-none" 
                                            placeholder="E.g. Q3 Marketing Review" 
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Description</Label>
                                    <textarea 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        className="w-full p-4 border-white/80 bg-white/60 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 rounded-xl font-medium shadow-sm transition-all outline-none resize-none" 
                                        rows={4} 
                                        placeholder="Describe the objectives and requirements..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Configuration */}
                        <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-5 sm:p-8 relative overflow-hidden">
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                
                                {/* Priority (Segmented Control) */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Priority Level</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner">
                                        {[
                                            { id: 'low', label: 'Low', color: 'text-emerald-600', activeBg: 'bg-white border-white shadow-sm' },
                                            { id: 'medium', label: 'Medium', color: 'text-blue-600', activeBg: 'bg-white border-white shadow-sm' },
                                            { id: 'high', label: 'High', color: 'text-orange-600', activeBg: 'bg-white border-white shadow-sm' },
                                            { id: 'critical', label: 'Critical', color: 'text-rose-600', activeBg: 'bg-white border-white shadow-sm' }
                                        ].map((p) => (
                                            <label
                                                key={p.id}
                                                className={`
                                                    flex items-center justify-center h-10 rounded-lg text-xs font-black tracking-widest uppercase transition-all cursor-pointer select-none
                                                    ${priority === p.id ? `${p.color} ${p.activeBg}` : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/40'}
                                                `}
                                            >
                                                <input
                                                    type="radio"
                                                    name="priority"
                                                    value={p.id}
                                                    checked={priority === p.id}
                                                    onChange={(e) => setPriority(e.target.value)}
                                                    className="sr-only"
                                                />
                                                {p.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Completion Mode */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Completion Mode</Label>
                                    <div className="relative">
                                        <select 
                                            value={completionMode} 
                                            onChange={e => setCompletionMode(e.target.value)} 
                                            className="w-full pl-4 pr-10 py-3 border-white/80 bg-white/60 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 rounded-xl font-bold shadow-sm transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="all_must_complete">All assignees must complete</option>
                                            <option value="any_one_completes">Any one assignee completes</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"/></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Deadline (Optional)</Label>
                                    <div className="relative">
                                        <div className="absolute top-1/2 -translate-y-1/2 left-4 text-slate-400 pointer-events-none">
                                            <CalendarIcon className="w-4 h-4" />
                                        </div>
                                        <input 
                                            type="date" 
                                            value={deadline} 
                                            onChange={e => setDeadline(e.target.value)} 
                                            className="w-full pl-11 pr-4 py-3 border-white/80 bg-white/60 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 rounded-xl font-bold shadow-sm transition-all outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Assignees */}
                        <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-5 sm:p-8 relative overflow-hidden flex flex-col">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Assign To Team Members
                                    </Label>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                                        {assignees.length} Selected
                                    </span>
                                </div>
                                
                                {loadingUsers ? (
                                    <div className="py-8 flex justify-center items-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                        {users.filter(u => u.role !== 'superadmin').map(user => (
                                            <label 
                                                key={user.id} 
                                                className={`
                                                    relative flex items-center gap-4 p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-sm group
                                                    ${assignees.includes(user.id) 
                                                        ? 'border-indigo-400 bg-indigo-50/50 shadow-indigo-500/10' 
                                                        : 'border-white/80 bg-white/60 hover:bg-white hover:border-indigo-200'}
                                                `}
                                            >
                                                {/* Custom Checkbox */}
                                                <div className="relative flex items-center justify-center shrink-0">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={assignees.includes(user.id)} 
                                                        onChange={() => toggleAssignee(user.id)} 
                                                        className="peer sr-only" 
                                                    />
                                                    <div className="w-5 h-5 rounded-[6px] border-2 border-slate-300 bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center shadow-inner group-hover:border-indigo-400">
                                                        <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200 stroke-[3]" />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-black text-white text-sm border-2 border-white shadow-sm shrink-0">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-extrabold leading-tight transition-colors ${assignees.includes(user.id) ? 'text-indigo-900' : 'text-slate-800'}`}>
                                                            {user.name}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                                            {user.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="sticky bottom-4 sm:static z-20">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold py-4 rounded-2xl transition-all shadow-[0_8px_30px_rgba(30,41,59,0.3)] active:scale-[0.98] border border-slate-600 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</>
                                ) : (
                                    'Update Task'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppSidebarLayout>
    );
}