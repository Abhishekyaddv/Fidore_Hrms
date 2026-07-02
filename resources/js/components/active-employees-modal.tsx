import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { UserCheck, Clock } from 'lucide-react';
import React from 'react';

interface ActiveEmployee {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    punch_in: string | null;
}

interface ActiveEmployeesModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    employees: ActiveEmployee[];
    title?: string;
}

export function ActiveEmployeesModal({
    isOpen,
    setIsOpen,
    employees = [],
    title = 'Active Employees',
}: ActiveEmployeesModalProps) {
    
    const formatTime = (timeString: string | null) => {
        if (!timeString) return 'N/A';
        return new Date(timeString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden p-0 gap-0 rounded-[2rem] border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-slate-50/80 backdrop-blur-3xl flex flex-col">
                
                {/* Decorative Background Blobs for Glassmorphism */}
                <div className="absolute -top-32 -right-32 w-72 h-72 bg-emerald-300/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>
                <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-300/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>

                <div className="relative z-10 flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <DialogHeader className="p-6 sm:p-8 pb-4 border-b border-white/50 bg-white/40 backdrop-blur-md shrink-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-sm text-white">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800">
                                {title}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            {title === 'Active Employees' ? 'Currently working team members who have punched in today.' : 
                             title === 'Late Arrivals' ? 'Team members who punched in after 10:20 AM today.' : 
                             'Team members who have not punched in today.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Content */}
                    <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                        {employees.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white">
                                    <UserCheck className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No {title.toLowerCase()}</h3>
                                <p className="text-slate-500 text-sm mt-1">There is no one in this list.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {employees.map((emp) => (
                                    <div key={emp.id} className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:bg-white/80 transition-colors">
                                        <div className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden shadow-inner border-2 border-white">
                                            {emp.avatar ? (
                                                <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" />
                                            ) : (
                                                emp.name.charAt(0)
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-extrabold text-slate-800 truncate">{emp.name}</h4>
                                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mt-0.5 capitalize">{emp.role}</p>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                title === 'Active Employees' ? 'bg-emerald-50/80 text-emerald-600 border border-emerald-100' :
                                                title === 'Late Arrivals' ? 'bg-amber-50/80 text-amber-600 border border-amber-100' :
                                                'bg-red-50/80 text-red-600 border border-red-100'
                                            } shadow-sm`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    title === 'Active Employees' ? 'bg-emerald-500 animate-pulse' :
                                                    title === 'Late Arrivals' ? 'bg-amber-500' :
                                                    'bg-red-500'
                                                }`}></span>
                                                {title === 'Active Employees' ? 'Active' : title === 'Late Arrivals' ? 'Late' : 'Absent'}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                In: {formatTime(emp.punch_in)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
