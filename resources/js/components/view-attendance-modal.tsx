import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
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
            
            let bgColor = 'bg-surface-1';
            let textColor = 'text-text-primary';
            let hoursLogged = 0;
            let needsRegularization = false;

            if (record) {
                hoursLogged = record.total_logged_minutes / 60;
                if (record.punch_history && record.punch_history.length > 0) {
                    const lastSession = record.punch_history[record.punch_history.length - 1];
                    if (lastSession.out === null && !isToday) {
                        needsRegularization = true;
                    }
                }

                if (hoursLogged >= 8) {
                    bgColor = 'bg-success-bg';
                    textColor = 'text-success-text';
                } else if (hoursLogged > 0) {
                    bgColor = 'bg-warning-bg';
                    textColor = 'text-warning-text';
                }
            }

            grid.push(
                <div 
                    key={dateStr} 
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border border-border shadow-xs transition-all ${bgColor} ${isToday ? 'ring-2 ring-brand-500' : ''}`}
                >
                    <span className={`text-sm font-bold ${textColor}`}>{day}</span>
                    {record && !needsRegularization && (
                        <div className={`text-[10px] font-semibold mt-1 ${textColor}`}>
                            {Math.floor(hoursLogged)}h {record.total_logged_minutes % 60}m
                        </div>
                    )}
                    {needsRegularization && (
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="mt-1 h-6 text-[10px] px-2 py-0 bg-danger-text hover:bg-danger-600 w-full"
                            onClick={() => {
                                setSelectedDate(dateStr);
                                setIsRegularizeOpen(true);
                            }}
                        >
                            Regularize
                        </Button>
                    )}
                    {record?.is_regularized && (
                        <div className="absolute top-1 right-1 text-brand-600 dark:text-accent-500" title="Regularized by HR">
                            <CheckCircle className="h-3 w-3" />
                        </div>
                    )}
                </div>
            );
        }

        return grid;
    };

    const handleRegularize = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.employees.regularize', employee.id), {
            date: selectedDate,
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
                <DialogContent className="max-w-3xl bg-surface-0 border-border p-0 overflow-hidden rounded-xl">
                    <DialogHeader className="p-6 pb-4 border-b border-border bg-surface-1">
                        <DialogTitle className="text-xl font-bold text-text-primary flex items-center justify-between">
                            <span>Attendance: {employee?.name}</span>
                            <div className="flex items-center gap-4 bg-surface-0 rounded-lg p-1 border border-border shadow-xs">
                                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-surface-2">
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <span className="font-semibold text-sm text-text-primary min-w-[120px] text-center">
                                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-surface-2">
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                            </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-xs font-bold text-text-muted uppercase tracking-wider py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {renderCalendar()}
                                </div>
                                
                                <div className="mt-6 flex items-center gap-6 pt-4 border-t border-border text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-success-bg border border-success-text/20"></div>
                                        <span className="text-text-secondary">Full Day (8h+)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-warning-bg border border-warning-text/20"></div>
                                        <span className="text-text-secondary">Partial Day</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-surface-1 border border-border"></div>
                                        <span className="text-text-secondary">No Data / Absent</span>
                                    </div>
                                    <div className="flex items-center gap-1 ml-auto text-text-muted">
                                        <CheckCircle className="h-3 w-3 text-brand-600 dark:text-accent-500" />
                                        <span>Regularized</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isRegularizeOpen} onOpenChange={setIsRegularizeOpen}>
                <DialogContent className="sm:max-w-sm bg-surface-0 border-border p-6 shadow-xl rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <Clock className="h-5 w-5 text-brand-600 dark:text-accent-500" /> Regularize Attendance
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRegularize} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label className="text-text-secondary text-xs uppercase font-bold tracking-wider">Date</Label>
                            <div className="text-sm font-semibold text-text-primary bg-surface-1 p-2 rounded border border-border">
                                {selectedDate}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="out_time" className="text-text-secondary text-xs uppercase font-bold tracking-wider">Set Punch Out Time</Label>
                            <Input
                                id="out_time"
                                type="time"
                                value={outTime}
                                onChange={(e) => setOutTime(e.target.value)}
                                className="bg-surface-0 border-border text-text-primary focus:border-brand-500"
                                required
                            />
                            <p className="text-xs text-text-muted">Maximum 2 regularizations allowed per month.</p>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="ghost" onClick={() => setIsRegularizeOpen(false)} className="text-text-secondary hover:text-text-primary hover:bg-surface-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-brand-600 hover:bg-brand-400 text-white shadow-xs font-semibold">
                                Confirm Regularization
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
