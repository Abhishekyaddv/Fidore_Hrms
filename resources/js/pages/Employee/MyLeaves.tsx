import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Clock, Palmtree, Pill, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function MyLeaves({ balances, upcomingHolidays, holidays, leaveRequests, leaveHistory = [], attendances = [], currentMonth }: any) {
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [deniedModal, setDeniedModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

    // Form
    const { data, setData, post, processing, reset, errors } = useForm({
        type: '',
        start_date: '',
        end_date: '',
        reason: '',
        document: null as File | null,
    });

    const submitLeave = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.type && data.type !== 'LWP' && data.start_date && data.end_date) {
            const start = new Date(data.start_date);
            const end = new Date(data.end_date);
            if (end >= start) {
                const requestedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
                const balance = balances[data.type];
                if (balance) {
                    const available = balance.available;
                    if (requestedDays > available) {
                        const message = `You requested ${requestedDays} days, but only have ${available} ${data.type} leaves remaining.`;
                        try {
                            setDeniedModal({ isOpen: true, message });
                        } catch (e) {
                            // Fallback window alert
                            window.alert(`Leave Request Denied: ${message}`);
                        }
                        return;
                    }
                }
            }
        }

        post(route('my-leaves.store'), {
            onSuccess: () => {
                reset();
                setIsApplyModalOpen(false);
            },
        });
    };

    const deleteLeave = (id: number) => {
        if (confirm('Are you sure you want to delete this leave request?')) {
            router.delete(route('my-leaves.destroy', id));
        }
    };

    // Calendar Logic from currentMonth parameter
    const parsedDate = currentMonth ? new Date(currentMonth + '-02') : new Date();
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => {
        const targetDate = new Date(year, month - 1, 2);
        const targetMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        router.visit(route('my-leaves.index', { month: targetMonthStr }), {
            preserveState: true,
            only: ['holidays', 'leaveRequests', 'attendances', 'currentMonth'],
        });
    };

    const nextMonth = () => {
        const targetDate = new Date(year, month + 1, 2);
        const targetMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        router.visit(route('my-leaves.index', { month: targetMonthStr }), {
            preserveState: true,
            only: ['holidays', 'leaveRequests', 'attendances', 'currentMonth'],
        });
    };

    const goToToday = () => {
        const targetDate = new Date();
        const targetMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        router.visit(route('my-leaves.index', { month: targetMonthStr }), {
            preserveState: true,
            only: ['holidays', 'leaveRequests', 'attendances', 'currentMonth'],
        });
    };

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '';
        try {
            const date = new Date(timeStr);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch (e) {
            return '';
        }
    };

    const renderCalendarDays = () => {
        const grid = [];
        // Empty slots
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50/50"></div>);
        }

        const today = new Date();
        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Check if holiday
            const holiday = holidays.find((h: any) => h.date === dateStr);
            
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const isSunday = new Date(year, month, day).getDay() === 0;
            const isPublicHoliday = holiday && holiday.name !== 'Weekly Off (Sunday)';
            
            // Check if leave
            const leave = leaveRequests.find((l: any) => {
                const start = new Date(l.start_date);
                const end = new Date(l.end_date);
                const current = new Date(dateStr);
                return current >= start && current <= end;
            });

            // Check if attendance exists
            const attendance = (attendances || []).find((a: any) => {
                const attDate = typeof a.date === 'string' ? a.date.substring(0, 10) : '';
                return attDate === dateStr;
            });

            let boxClasses = "h-24 border p-2 flex flex-col gap-1 transition-colors ";
            let textClasses = "font-semibold ";

            if (isToday) {
                boxClasses += "border-blue-300 bg-blue-50/60 hover:bg-blue-50";
                textClasses += "text-lg text-blue-600";
            } else if (isSunday) {
                boxClasses += "border-gray-100 bg-gray-50/50 hover:bg-gray-50";
                textClasses += "text-sm text-gray-400";
            } else {
                boxClasses += "border-gray-100 bg-white hover:bg-gray-50";
                textClasses += "text-sm text-gray-700";
            }

            grid.push(
                <div key={day} className={boxClasses}>
                    <span className={textClasses}>{day}</span>
                    <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
                        {isPublicHoliday && (
                            <div className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded truncate" title={holiday.name}>
                                🎉 {holiday.name}
                            </div>
                        )}
                        {isSunday && !isPublicHoliday && (
                            <div className="text-[10px] font-medium text-gray-400/80 px-1 py-0.5 text-center bg-transparent rounded truncate" title="Weekly Off">
                                Holiday
                            </div>
                        )}
                        {leave && (
                            <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate ${
                                leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                                leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                            }`} title={leave.reason}>
                                {leave.type} - {leave.status}
                            </div>
                        )}
                        {attendance && (
                            <div className="text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] px-1.5 py-0.5 rounded flex flex-col gap-0.5 border border-[#C8E6C9]" title={`Punched In: ${formatTime(attendance.punch_in)}${attendance.punch_out ? `, Punched Out: ${formatTime(attendance.punch_out)}` : ''}`}>
                                <div className="flex items-center gap-0.5 truncate">
                                    <Clock className="h-2.5 w-2.5 shrink-0" />
                                    <span>In: {formatTime(attendance.punch_in)}{attendance.minutes_late > 0 ? ` (${attendance.minutes_late}m late)` : ''}</span>
                                </div>
                                {attendance.punch_out && (
                                    <div className="flex items-center gap-0.5 border-t border-[#C8E6C9]/40 pt-0.5 truncate">
                                        <Clock className="h-2.5 w-2.5 shrink-0" />
                                        <span>Out: {formatTime(attendance.punch_out)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Fill remaining slots to complete grid
        const totalSlots = firstDayOfMonth + daysInMonth;
        const remainingSlots = (7 - (totalSlots % 7)) % 7;
        for (let i = 0; i < remainingSlots; i++) {
            grid.push(<div key={`empty-end-${i}`} className="h-24 border border-gray-100 bg-gray-50/50"></div>);
        }

        return grid;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'My Leaves', href: '/my-leaves' }]}>
            <Head title="My Leaves" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-[#F9FAFB] min-h-screen">
                
                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#051C3F]">My Leaves</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your leaves and view upcoming holidays.</p>
                    </div>
                    
                    <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-600 hover:bg-brand-500 text-white font-semibold">
                                + Apply Leave
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Apply for Leave</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submitLeave} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Leave Type</Label>
                                    <Select value={data.type} onValueChange={(val) => setData('type', val)} required>
                                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CL">Casual Leave (CL)</SelectItem>
                                            <SelectItem value="SL">Sick Leave (SL)</SelectItem>
                                            <SelectItem value="EL">Earned Leave (EL)</SelectItem>
                                            <SelectItem value="LWP">Leave Without Pay (LWP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required />
                                        {errors.start_date && <p className="text-xs text-red-500">{errors.start_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} required />
                                        {errors.end_date && <p className="text-xs text-red-500">{errors.end_date}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <Input value={data.reason} onChange={e => setData('reason', e.target.value)} placeholder="Reason for leave" required />
                                    {errors.reason && <p className="text-xs text-red-500">{errors.reason}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Supporting Document (Optional)</Label>
                                    <Input type="file" onChange={e => setData('document', e.target.files ? e.target.files[0] : null)} accept=".pdf,.jpg,.jpeg,.png" />
                                    <p className="text-xs text-gray-500">Max 5MB. Allowed formats: PDF, JPG, PNG.</p>
                                    {errors.document && <p className="text-xs text-red-500">{errors.document}</p>}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full bg-brand-600">Submit Request</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Balances */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Casual Leaves</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-[#051C3F]">{balances.CL.available}</span>
                                <span className="text-sm font-medium text-gray-400">/ {balances.CL.total} Remaining</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <Pill className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Sick Leaves</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-[#051C3F]">{balances.SL.available}</span>
                                <span className="text-sm font-medium text-gray-400">/ {balances.SL.total} Remaining</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Palmtree className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Earned Leaves</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-[#051C3F]">{balances.EL.available}</span>
                                <span className="text-sm font-medium text-gray-400">/ {balances.EL.total} Remaining</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Leave w/o Pay</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-2xl font-black text-[#051C3F]">{balances.LWP?.used || 0}</span>
                                <span className="text-sm font-medium text-gray-400">Days Taken</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[#051C3F] flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-brand-600" />
                                {monthNames[month]} {year}
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={prevMonth}>Prev</Button>
                                <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
                                <Button variant="outline" size="sm" onClick={nextMonth}>Next</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="bg-gray-50 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                            {renderCalendarDays().map(day => day)}
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 mt-6 text-xs font-semibold text-gray-600">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Public Holiday</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Pending Leave</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> Approved Leave</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#2E7D32]"></div> Present (Attendance Log)</div>
                        </div>
                    </div>

                    {/* Upcoming Holidays */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <Palmtree className="h-5 w-5 text-brand-600" />
                            <h2 className="text-lg font-bold text-[#051C3F]">Upcoming Holidays</h2>
                        </div>
                        <div className="space-y-4 flex-1">
                            {upcomingHolidays.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No upcoming holidays scheduled.</p>
                            ) : upcomingHolidays.map((holiday: any) => {
                                const dateObj = new Date(holiday.date);
                                return (
                                    <div key={holiday.id} className="relative pl-4 border-l-2 border-brand-500 pb-4 last:pb-0">
                                        <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-4 ring-white"></div>
                                        <p className="text-sm font-bold text-brand-600">
                                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="font-bold text-gray-900 mt-0.5">{holiday.name}</p>
                                        {holiday.description && <p className="text-xs text-gray-500 mt-1">{holiday.description}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* My Leave History */}
                <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-[#051C3F]">My Leave History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Leave Type</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {leaveHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">No leave requests found.</td>
                                    </tr>
                                ) : leaveHistory.map((req: any) => {
                                    const start = new Date(req.start_date);
                                    const end = new Date(req.end_date);
                                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
                                    
                                    return (
                                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-[#051C3F]">{req.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="font-bold text-[#051C3F] text-sm">{days} {days === 1 ? 'Day' : 'Days'}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} 
                                                    {days > 1 && ` - ${end.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs text-gray-600">
                                                <p className="truncate" title={req.reason}>{req.reason}</p>
                                                {req.document_path && (
                                                    <a href={`/storage/${req.document_path}`} target="_blank" className="text-xs font-bold text-[#4CB5F9] hover:underline mt-1 inline-block">
                                                        View Document
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {req.status === 'pending' && (
                                                    <button onClick={() => deleteLeave(req.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Request">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Denied Notification Modal */}
            <Dialog open={deniedModal.isOpen} onOpenChange={(isOpen) => setDeniedModal(prev => ({ ...prev, isOpen }))}>
                <DialogContent className="sm:max-w-md bg-surface-0 border-border p-6 shadow-xl rounded-xl">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-danger-bg flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-danger-text" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-text-primary tracking-tight">Leave Request Denied</h3>
                            <p className="text-sm font-medium text-text-secondary">
                                {deniedModal.message}
                            </p>
                        </div>
                        <Button 
                            className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 font-medium"
                            onClick={() => setDeniedModal({ isOpen: false, message: '' })}
                        >
                            Got it, I'll adjust the dates
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
