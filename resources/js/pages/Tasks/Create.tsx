import React, { useState, useEffect } from 'react';
import AppSidebarLayout from '@/Layouts/app/app-sidebar-layout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';

export default function TaskCreate() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [completionMode, setCompletionMode] = useState('all_must_complete');
    const [deadline, setDeadline] = useState('');
    const [assignees, setAssignees] = useState<number[]>([]);
    const [subtasks, setSubtasks] = useState<{user_id: number, title: string}[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        axios.get('/api/users').then(res => {
            setUsers(res.data);
            setLoadingUsers(false);
        }).catch(err => {
            console.error(err);
            setLoadingUsers(false);
        });
    }, []);

    const toggleAssignee = (id: number) => {
        if (assignees.includes(id)) {
            setAssignees(assignees.filter(a => a !== id));
            // Remove subtasks for unassigned user
            setSubtasks(subtasks.filter(s => s.user_id !== id));
        } else {
            setAssignees([...assignees, id]);
        }
    };

    const addSubtask = (userId: number, title: string) => {
        setSubtasks([...subtasks, { user_id: userId, title }]);
    };

    const removeSubtask = (userId: number, titleToRemove: string) => {
        setSubtasks(subtasks.filter(s => !(s.user_id === userId && s.title === titleToRemove)));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (assignees.length === 0) {
            alert('Please assign at least one user.');
            return;
        }

        setIsSubmitting(true);

        axios.post('/api/tasks', {
            title, description, priority, completion_mode: completionMode, deadline, assignees, subtasks
        }).then(res => {
            window.location.href = '/tasks'; // Force a full navigation to ensure list is re-fetched properly
        }).catch(err => {
            setIsSubmitting(false);
            alert('Error creating task. Check console.');
            console.error(err.response?.data);
        });
    };

    return (
        <AppSidebarLayout>
            <Head title="Create Task" />
            <div className="p-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Create New Task</h1>
                <form onSubmit={submit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" placeholder="Task title..." />
                    </div>
                    <div className="mb-5">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" rows={4} placeholder="Describe the task..."></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Completion Mode</label>
                            <select value={completionMode} onChange={e => setCompletionMode(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white">
                                <option value="all_must_complete">All Must Complete</option>
                                <option value="any_one_completes">Any One Completes</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Deadline</label>
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Assign To</label>
                        {loadingUsers ? (
                            <div className="text-sm text-slate-500">Loading users...</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto p-1">
                                {users.filter(u => u.role !== 'superadmin').map(user => (
                                    <div key={user.id} className={`p-4 rounded-xl border transition ${assignees.includes(user.id) ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={assignees.includes(user.id)} onChange={() => toggleAssignee(user.id)} className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5" />
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-semibold text-slate-800 leading-tight">{user.name}</span>
                                                    <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                                                </div>
                                            </div>
                                        </label>
                                        
                                        {assignees.includes(user.id) && (
                                            <div className="mt-4 pl-8">
                                                <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Subtasks for {user.name.split(' ')[0]}</div>
                                                {subtasks.filter(s => s.user_id === user.id).map((st, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 mb-2 bg-white p-2 rounded-lg border border-indigo-100 shadow-sm">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></div>
                                                        <span className="text-sm text-slate-700 font-medium flex-1 truncate">{st.title}</span>
                                                        <button type="button" onClick={() => removeSubtask(user.id, st.title)} className="text-slate-400 hover:text-red-500 transition px-2">
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2 mt-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Type subtask & press Enter..." 
                                                        className="text-sm p-2.5 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                if (e.currentTarget.value.trim()) {
                                                                    addSubtask(user.id, e.currentTarget.value.trim());
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        className="bg-indigo-600 text-white px-4 rounded-lg text-sm hover:bg-indigo-700 font-bold transition shadow-sm"
                                                        onClick={(e) => {
                                                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                                                            if (input.value.trim()) {
                                                                addSubtask(user.id, input.value.trim());
                                                                input.value = '';
                                                            }
                                                        }}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-[0_8px_20px_-4px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            'Create Task'
                        )}
                    </button>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
