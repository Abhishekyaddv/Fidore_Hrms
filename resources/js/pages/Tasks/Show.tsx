import React, { useEffect, useState } from 'react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Head, usePage, Link } from '@inertiajs/react';
import axios from 'axios';
import { Task } from '@/types/task';
import { PageProps } from '@/types';
import { useTaskChannel } from '@/hooks/useTaskChannel';
import { 
    Pencil, 
    Trash2, 
    Calendar, 
    Flag, 
    User, 
    AlertCircle, 
    CheckSquare, 
    Check, 
    Loader2,
    ListTodo
} from 'lucide-react';

export default function TaskShow({ taskId }: { taskId: string }) {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const { auth } = usePage<PageProps>().props;
    const currentUser = auth.user;
    const canEditDelete = currentUser.role === 'superadmin' || currentUser.role === 'hr';
    
    const { latestEvent } = useTaskChannel(parseInt(taskId));

    const fetchTask = () => {
        axios.get(`/api/tasks/${taskId}`).then((res) => {
            setTask(res.data.data);
            setLoading(false);
        });
    };

    const toggleSubtask = (subtaskId: number) => {
        // optimistic update
        const updatedSubtasks = task?.subtasks?.map(st => 
            st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
        );
        if (task) setTask({ ...task, subtasks: updatedSubtasks });

        axios.patch(`/api/tasks/${taskId}/subtasks/${subtaskId}/toggle`).catch(err => {
            fetchTask();
            if (err.response?.status === 403) {
                alert('You are not authorized to update this subtask.');
            } else {
                alert('Failed to update subtask');
            }
        });
    };

    const updateAssignmentStatus = (assignmentId: number, status: string) => {
        const updatedAssignments = task?.assignments?.map(a => 
            a.id === assignmentId ? { ...a, status: status as any } : a
        );
        if (task) setTask({ ...task, assignments: updatedAssignments });

        axios.patch(`/api/tasks/${taskId}/assignments/${assignmentId}/status`, { status }).catch(() => {
            fetchTask();
            alert('Failed to update assignment status');
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            axios.delete(`/api/tasks/${taskId}`).then(() => {
                window.location.href = '/tasks';
            }).catch(() => {
                alert('Failed to delete task.');
            });
        }
    };

    let completionPercentage = 0;
    if (task) {
        if (task.subtasks && task.subtasks.length > 0) {
            const completed = task.subtasks.filter(st => st.is_completed).length;
            completionPercentage = Math.round((completed / task.subtasks.length) * 100);
        } else if (task.assignments && task.assignments.length > 0) {
            const completed = task.assignments.filter(a => a.status === 'completed').length;
            completionPercentage = Math.round((completed / task.assignments.length) * 100);
        }
    }

    useEffect(() => {
        fetchTask();
    }, [taskId]);

    useEffect(() => {
        if (latestEvent) {
            fetchTask();
        }
    }, [latestEvent]);

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return 'text-rose-600 bg-rose-100/80 border-rose-200';
            case 'high': return 'text-orange-600 bg-orange-100/80 border-orange-200';
            case 'medium': return 'text-blue-600 bg-blue-100/80 border-blue-200';
            case 'low': return 'text-emerald-600 bg-emerald-100/80 border-emerald-200';
            default: return 'text-slate-600 bg-slate-100/80 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'text-emerald-600';
            case 'in_progress': return 'text-blue-600';
            default: return 'text-slate-500';
        }
    };

    return (
        <AppSidebarLayout>
            <Head title={task ? task.title : 'Loading Task...'} />
            
            <div className="relative flex flex-1 flex-col min-h-screen overflow-hidden bg-slate-50 pb-12 sm:pb-8">
                
                {/* Background Glassmorphism Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[30rem] sm:w-[40rem] h-[30rem] sm:h-[40rem] bg-indigo-300/30 rounded-full blur-[80px] sm:blur-[100px] mix-blend-multiply pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] sm:w-[40rem] h-[30rem] sm:h-[40rem] bg-blue-300/30 rounded-full blur-[80px] sm:blur-[100px] mix-blend-multiply pointer-events-none"></div>

                <div className="relative z-10 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Details...</p>
                        </div>
                    ) : task ? (
                        <div className="flex flex-col gap-4 sm:gap-6">
                            
                            {/* Main Header Card */}
                            <div className="bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-5 sm:p-8 relative overflow-hidden">
                                {/* Inner Highlight */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-12">
                                    
                                    {/* Task Info */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-xl border border-white shadow-sm w-fit">
                                                <ListTodo className="w-4 h-4 text-indigo-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Task Overview</span>
                                            </div>
                                            
                                            {/* Action Buttons (Mobile: Wrap right, Desktop: Top right) */}
                                            {canEditDelete && (
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/tasks/${taskId}/edit`} className="p-2 bg-white/60 hover:bg-white text-indigo-600 rounded-xl shadow-sm border border-white transition-all active:scale-95" title="Edit Task">
                                                        <Pencil className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={handleDelete} className="p-2 bg-white/60 hover:bg-red-50 text-red-500 rounded-xl shadow-sm border border-white hover:border-red-100 transition-all active:scale-95" title="Delete Task">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight mb-3">
                                            {task.title}
                                        </h1>
                                        <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-3xl">
                                            {task.description}
                                        </p>
                                    </div>

                                    {/* Progress Widget */}
                                    <div className="w-full lg:w-64 bg-white/60 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/80 shadow-sm shrink-0 flex flex-col items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 relative z-10">Overall Progress</span>
                                        <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tighter mb-4 relative z-10 drop-shadow-sm">
                                            {completionPercentage}%
                                        </div>
                                        
                                        <div className="w-full bg-slate-200/50 rounded-full h-3 sm:h-4 border border-white shadow-inner overflow-hidden relative z-10">
                                            <div 
                                                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out relative" 
                                                style={{ width: `${completionPercentage}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {/* Status */}
                                <div className="bg-white/40 backdrop-blur-md p-4 sm:p-5 rounded-[1.5rem] border border-white/60 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <AlertCircle className="w-3.5 h-3.5" /> Status
                                    </div>
                                    <div className={`text-sm sm:text-base font-extrabold capitalize ${getStatusColor(task.status)}`}>
                                        {task.status.replace('_', ' ')}
                                    </div>
                                </div>
                                
                                {/* Priority */}
                                <div className="bg-white/40 backdrop-blur-md p-4 sm:p-5 rounded-[1.5rem] border border-white/60 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Flag className="w-3.5 h-3.5" /> Priority
                                    </div>
                                    <div className="mt-0.5">
                                        <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-black uppercase tracking-widest rounded-lg border ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div className="bg-white/40 backdrop-blur-md p-4 sm:p-5 rounded-[1.5rem] border border-white/60 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Calendar className="w-3.5 h-3.5" /> Deadline
                                    </div>
                                    <div className="text-sm sm:text-base font-extrabold text-slate-700">
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                                    </div>
                                </div>

                                {/* Created By */}
                                <div className="bg-white/40 backdrop-blur-md p-4 sm:p-5 rounded-[1.5rem] border border-white/60 shadow-sm flex flex-col justify-center">
                                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <User className="w-3.5 h-3.5" /> Created By
                                    </div>
                                    <div className="text-sm sm:text-base font-extrabold text-slate-700 truncate">
                                        {task.created_by?.name || 'Unknown'}
                                    </div>
                                </div>
                            </div>

                            {/* Assignments Section */}
                            <div className="mt-4">
                                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-4 px-2 flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                                    Assignments & Subtasks
                                </h2>
                                
                                <div className="space-y-4">
                                    {task.assignments?.length === 0 ? (
                                        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 p-8 text-center shadow-sm">
                                            <p className="text-slate-500 font-bold">No members assigned to this task yet.</p>
                                        </div>
                                    ) : (
                                        task.assignments?.map(assignment => {
                                            const userSubtasks = task.subtasks?.filter(st => st.user_id === assignment.user?.id) || [];
                                            const isAuthorized = currentUser.id === assignment.user?.id || currentUser.role === 'superadmin' || currentUser.role === 'hr';
                                            
                                            return (
                                                <div key={assignment.id} className="bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-sm border border-white/80 p-4 sm:p-6 transition-all duration-300">
                                                    
                                                    {/* Assignment Header (Mobile: Stacked, Desktop: Row) */}
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/50">
                                                        <div className="flex items-center gap-3 sm:gap-4">
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-sm sm:text-lg border-2 border-white shadow-sm shrink-0">
                                                                {assignment.user?.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <span className="font-extrabold text-slate-800 text-base sm:text-lg block line-clamp-1">{assignment.user?.name}</span>
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignee</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {isAuthorized ? (
                                                            <div className="relative w-full sm:w-auto">
                                                                <select 
                                                                    value={assignment.status} 
                                                                    onChange={(e) => updateAssignmentStatus(assignment.id, e.target.value)}
                                                                    className="w-full sm:w-auto text-[11px] font-black tracking-widest uppercase pl-4 pr-8 py-2.5 sm:py-2 bg-white/80 border border-white text-indigo-700 rounded-xl focus:ring-2 focus:ring-indigo-500/30 cursor-pointer outline-none shadow-sm appearance-none"
                                                                >
                                                                    <option value="pending">Pending</option>
                                                                    <option value="in_progress">In Progress</option>
                                                                    <option value="completed">Completed</option>
                                                                </select>
                                                                {/* Custom arrow for select */}
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                                                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"/></svg>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className={`w-full sm:w-auto text-center text-[10px] font-black uppercase tracking-widest px-4 py-2 sm:py-1.5 rounded-xl border shadow-sm ${
                                                                assignment.status === 'completed' ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200' : 
                                                                assignment.status === 'in_progress' ? 'bg-blue-100/80 text-blue-700 border-blue-200' : 
                                                                'bg-slate-100/80 text-slate-600 border-slate-200'
                                                            }`}>
                                                                {assignment.status.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Subtasks List */}
                                                    {userSubtasks.length > 0 ? (
                                                        <div className="space-y-2 mt-2">
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Subtasks</div>
                                                            <div className="flex flex-col gap-2.5">
                                                                {userSubtasks.map(st => (
                                                                    <label key={st.id} className="relative flex items-start sm:items-center gap-3.5 cursor-pointer group p-3 sm:p-2 bg-white/40 sm:bg-transparent hover:bg-white/60 rounded-xl transition-all border border-white/40 sm:border-transparent hover:border-white shadow-sm sm:shadow-none">
                                                                        <div className="relative flex items-center justify-center mt-0.5 sm:mt-0 shrink-0">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={st.is_completed} 
                                                                                onChange={() => toggleSubtask(st.id)}
                                                                                className="peer sr-only"
                                                                            />
                                                                            <div className="w-5 h-5 rounded-[6px] border-2 border-slate-300 bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center shadow-inner group-hover:border-indigo-400">
                                                                                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200 stroke-[3]" />
                                                                            </div>
                                                                        </div>
                                                                        <span className={`text-sm font-bold transition-all flex-1 leading-snug ${st.is_completed ? 'line-through text-slate-400' : 'text-slate-700 group-hover:text-indigo-700'}`}>
                                                                            {st.title}
                                                                        </span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            
                                                            {/* Subtask Progress Summary */}
                                                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/50 ml-1">
                                                                <div className="flex-1 h-1.5 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                                                                    <div 
                                                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                                                        style={{ width: `${(userSubtasks.filter(st => st.is_completed).length / userSubtasks.length) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                                                                    {userSubtasks.filter(st => st.is_completed).length} / {userSubtasks.length} Done
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs font-bold text-slate-400 italic py-2">
                                                            No specific subtasks assigned.
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-4 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-sm">
                            <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
                            <h3 className="text-xl font-extrabold text-slate-800">Task Not Found</h3>
                            <p className="text-slate-500 mt-1">The task you are looking for does not exist or has been removed.</p>
                            <Link href="/tasks" className="mt-6 px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold shadow-md hover:bg-slate-700 transition-colors">
                                Return to Tasks
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}