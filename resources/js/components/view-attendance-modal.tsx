import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, CalendarDays, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AttendanceRecord {
    date: string;
    total_logged_minutes: number;
    punch_history: { in: string; out: string | null }[] | null;
    is_regularized: boolean;
}

export function ViewAttendanceModal({
    isOpen,
    setIsOpen,
    employee,
}: {
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
    employee: any;
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Regularization Modal State
    const [isRegularizeOpen, setIsRegularizeOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [inTime, setInTime] = useState('09:00');
    const [outTime, setOutTime] = useState('18:00');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const fetchAttendance = async () => {
        if (!employee) return;
        setLoading(true);
        try {
            const response = await fetch(`/admin/employees/${employee.id}/attendance?month=${month + 1}&year=${year}`, {
                headers: {
                    'Accept': 'application/json',
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAttendances(data);
            }
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && employee) {
            fetchAttendance();
        }
    }, [isOpen, employee, month, year]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const grid = [];
        const todayStr = new Date().toISOString().substring(0, 10);

        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const record = attendances.find(a => a.date.substring(0, 10) === dateStr);
            
            let borderClass = 'border-transparent text-slate-600';
            let hoursLogged = 0;
            let needsRegularization = false;

            const dateObj = new Date(year, month, day);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));

            if (record) {
                hoursLogged = record.total_logged_minutes / 60;
                if (record.punch_history && record.punch_history.length > 0) {
                    const lastSession = record.punch_history[record.punch_history.length - 1];
                    if (lastSession.out === null && !isToday) {
                        needsRegularization = true;
                    }
                }

                if (hoursLogged >= 8) {
                    borderClass = 'border-emerald-500 text-emerald-700';
                } else if (hoursLogged > 0) {
                    borderClass = 'border-amber-500 text-amber-700';
                } else if (isPast && !isWeekend) {
                    borderClass = 'border-red-500 text-red-700';
                }
            } else if (isPast && !isWeekend) {
                borderClass = 'border-red-500 text-red-700';
            }

            grid.push(
                <div 
                    key={dateStr} 
                    className={`group relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 shadow-sm transition-all duration-200 cursor-pointer bg-white/40 hover:bg-white/60 ${borderClass} ${isToday ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-transparent' : ''}`}
                    onClick={() => {
                        setSelectedDate(dateStr);
                        if (record && record.punch_history && record.punch_history.length > 0) {
                            const lastSession = record.punch_history[record.punch_history.length - 1];
                            if (lastSession.out === null) {
                                const dateObj = new Date(lastSession.in);
                                setInTime(dateObj.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
                            }
                        } else {
                            setInTime('09:00');
                        }
                        setOutTime('18:00');
                        setIsRegularizeOpen(true);
                    }}
                >
                    <span className={`text-sm font-bold`}>{day}</span>
                    
                    {needsRegularization && (
                        <div className="absolute bottom-1.5 right-1.5">
                            <span className="block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        </div>
                    )}

                    {record?.is_regularized && (
                        <div className="absolute top-1 right-1 text-indigo-500" title="Regularized by HR">
                            <CheckCircle className="h-2.5 w-2.5" />
                        </div>
                    )}
                    
                    {/* Hover indicator */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 pointer-events-none">
                        <Clock className="h-4 w-4 text-indigo-600 drop-shadow-md scale-75 group-hover:scale-100 transition-transform" />
                    </div>
                </div>
            );
        }

        return grid;
    };

    const handleRegularize = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.employees.regularize', employee.id), {
            date: selectedDate,
            in_time: inTime,
            out_time: outTime,
        }, {
            onSuccess: () => {
                setIsRegularizeOpen(false);
                fetchAttendance();
            },
            onError: (err) => {
                if (err.regularize) {
                    alert(err.regularize);
                } else if (err.out_time) {
                    alert(err.out_time);
                }
            }
        });
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-2xl bg-slate-50/90 backdrop-blur-3xl border-white/80 p-0 overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
                    
                    {/* Decorative Background Blob */}
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-300/40 rounded-full blur-[60px] pointer-events-none mix-blend-multiply"></div>

                    <div className="relative z-10">
                        {/* Header */}
                        <DialogHeader className="p-5 pb-3 border-b border-white/50 bg-white/40">
                            <DialogTitle className="text-lg font-extrabold text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 bg-indigo-100/80 rounded-lg backdrop-blur-sm border border-indigo-200/50">
                                        <CalendarDays className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <span className="truncate max-w-[200px] sm:max-w-xs">{employee?.name}</span>
                                </div>

                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-xl p-1 border border-white shadow-sm w-fit">
                                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg">
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold text-xs text-slate-800 min-w-[100px] text-center uppercase tracking-widest">
                                        {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        {/* Calendar Body */}
                        <div className="p-5">
                            {loading ? (
                                <div className="h-56 flex items-center justify-center">
                                    <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-7 gap-1.5 mb-2">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="grid grid-cols-7 gap-1.5">
                                        {renderCalendar()}
                                    </div>
                                    
                                    {/* Legend */}
                                    <div className="mt-5 flex flex-wrap items-center justify-between sm:justify-start gap-x-4 gap-y-2 pt-4 border-t border-white/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-white/40"></div>
                                            <span>Present</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-full border-2 border-amber-500 bg-white/40"></div>
                                            <span>Late / Partial</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-white/40"></div>
                                            <span>Absent</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:ml-auto">
                                            <CheckCircle className="h-3.5 w-3.5 text-indigo-500" />
                                            <span>Regularized</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Regularization Modal */}
            <Dialog open={isRegularizeOpen} onOpenChange={setIsRegularizeOpen}>
                <DialogContent className="sm:max-w-sm bg-slate-50/95 backdrop-blur-2xl border-white/80 p-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden">
                    <DialogHeader className="p-5 pb-3 border-b border-white/50 bg-white/40">
                        <DialogTitle className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-indigo-600" /> Regularize Attendance
                        </DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleRegularize} className="flex flex-col">
                        <div className="p-5 space-y-4">
                            {/* Date Display */}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</Label>
                                <div className="text-sm font-bold text-slate-700 bg-white/60 p-2.5 rounded-xl border border-white/80 shadow-sm flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                    {selectedDate}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="in_time" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punch In Time</Label>
                                    <Input
                                        id="in_time"
                                        type="time"
                                        value={inTime}
                                        onChange={(e) => setInTime(e.target.value)}
                                        className="h-10 border-white/80 bg-white/60 text-slate-800 focus:border-indigo-400 focus:ring-indigo-500/20 rounded-xl font-medium shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="out_time" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punch Out Time</Label>
                                    <Input
                                        id="out_time"
                                        type="time"
                                        value={outTime}
                                        onChange={(e) => setOutTime(e.target.value)}
                                        className="h-10 border-white/80 bg-white/60 text-slate-800 focus:border-indigo-400 focus:ring-indigo-500/20 rounded-xl font-medium shadow-sm"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mt-1">
                                Max 2 regularizations/month
                            </p>
                        </div>
                        
                        <div className="flex justify-end gap-2 p-4 border-t border-white/50 bg-white/40">
                            <Button type="button" variant="outline" onClick={() => setIsRegularizeOpen(false)} className="text-slate-600 bg-white/60 border-white/80 hover:bg-white h-9 rounded-xl text-xs font-bold transition-all shadow-sm">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white h-9 rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-800/20">
                                Confirm
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}