import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Mail, Pencil, Plus, Settings2, Trash2, X, Eye, Paperclip } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LeaveManagement({ holidays, policies, leaveRequests, officeTiming }: any) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterType, setFilterType] = useState('All');
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
    const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<any>(null);
    const [editStatus, setEditStatus] = useState('');

    // Office Timing Form
    const {
        data: timingData,
        setData: setTimingData,
        post: postTiming,
        processing: timingProcessing,
    } = useForm({
        start_time: officeTiming ? officeTiming.start_time.substring(0, 5) : '09:00',
        end_time: officeTiming ? officeTiming.end_time.substring(0, 5) : '18:00',
    });

    useEffect(() => {
        if (officeTiming) {
            setTimingData({
                start_time: officeTiming.start_time.substring(0, 5),
                end_time: officeTiming.end_time.substring(0, 5),
            });
        }
    }, [officeTiming]);

    const submitTiming = (e: React.FormEvent) => {
        e.preventDefault();
        postTiming(route('admin.leaves.office-timing.store'), {
            onSuccess: () => setIsTimingModalOpen(false),
        });
    };

    // Holiday Form
    const {
        data: holidayData,
        setData: setHolidayData,
        post: postHoliday,
        reset: resetHoliday,
        processing: holidayProcessing,
    } = useForm({
        name: '',
        date: '',
        description: '',
    });

    const submitHoliday = (e: React.FormEvent) => {
        e.preventDefault();
        postHoliday(route('admin.leaves.holidays.store'), {
            onSuccess: () => {
                resetHoliday();
                setIsHolidayModalOpen(false);
            },
        });
    };

    // Policy Form
    const {
        data: policyData,
        setData: setPolicyData,
        post: postPolicy,
        processing: policyProcessing,
    } = useForm({
        employment_type: 'Full-time',
        cl: 0,
        sl: 0,
        el: 0,
    });

    const handlePolicyTypeChange = (val: string) => {
        setPolicyData('employment_type', val);
        const existing = policies.find((p: any) => p.employment_type === val);
        if (existing) {
            setPolicyData('cl', existing.cl);
            setPolicyData('sl', existing.sl);
            setPolicyData('el', existing.el);
        } else {
            setPolicyData('cl', 0);
            setPolicyData('sl', 0);
            setPolicyData('el', 0);
        }
    };

    const submitPolicy = (e: React.FormEvent) => {
        e.preventDefault();
        postPolicy(route('admin.leaves.policies.store'), {
            onSuccess: () => setIsPolicyModalOpen(false),
        });
    };

    const handleUpdateStatus = (id: number, status: string) => {
        if (confirm(`Are you sure you want to mark this request as ${status}?`)) {
            router.patch(route('admin.leaves.requests.update', id), { status });
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteRequest = (id: number) => {
        if (confirm('Are you sure you want to delete this leave request? This action cannot be undone.')) {
            router.delete(route('admin.leaves.requests.destroy', id));
        }
    };

    const openEditModal = (req: any) => {
        setEditingRequest(req);
        setEditStatus(req.status);
        setIsEditModalOpen(true);
    };

    // Calendar Logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    // Adjust so week starts on Monday
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Stats
    const today = new Date();
    const pendingCount = leaveRequests.filter((r: any) => r.status === 'pending').length;
    const activeLeaves = leaveRequests.filter((r: any) => {
        if (r.status !== 'approved') return false;
        const start = new Date(r.start_date);
        const end = new Date(r.end_date);
        return today >= start && today <= end;
    }).length;

    const futureHolidays = holidays
        .filter((h: any) => new Date(h.date) >= today)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const nextHoliday = futureHolidays[0];
    const daysToNextHoliday = nextHoliday ? Math.ceil((new Date(nextHoliday.date).getTime() - today.getTime()) / (1000 * 3600 * 24)) : '-';

    const getLeaveBadge = (type: string) => {
        if (type === 'EL')
            return (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                    Earned Leave (EL)
                </span>
            );
        if (type === 'CL')
            return (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-green-700 uppercase">
                    Casual Leave (CL)
                </span>
            );
        if (type === 'SL')
            return (
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-rose-700 uppercase">
                    Sick Leave (SL)
                </span>
            );
        return (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-700 uppercase">
                {type}
            </span>
        );
    };

    const getCalendarBadge = (type: string, name: string) => {
        const shortName = name ? name.split(' ')[0][0] + '. ' + name.split(' ').slice(-1)[0].substring(0, 3) : '';
        if (type === 'EL')
            return (
                <span className="mt-1 inline-block w-full truncate rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                    {type} - {shortName}
                </span>
            );
        if (type === 'CL')
            return (
                <span className="mt-1 inline-block w-full truncate rounded bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                    {type} - {shortName}
                </span>
            );
        if (type === 'SL')
            return (
                <span className="mt-1 inline-block w-full truncate rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                    {type} - {shortName}
                </span>
            );
        return null;
    };

    const filteredRequests = leaveRequests.filter((r: any) => {
        if (filterType === 'All') return true;
        return r.type === filterType;
    });

    const renderCalendar = () => {
        const grid = [];
        for (let i = 0; i < startOffset; i++) {
            grid.push(<div key={`empty-${i}`} className="h-24 rounded-xl"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const holiday = holidays.find((h: any) => h.date === dateStr);
            const leaves = leaveRequests.filter((l: any) => {
                if (l.status !== 'approved') return false;
                const start = new Date(l.start_date);
                const end = new Date(l.end_date);
                const current = new Date(dateStr);
                return current >= start && current <= end;
            });

            grid.push(
                <div
                    key={day}
                    className="group relative flex h-24 flex-col rounded-xl border border-gray-100 bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors hover:border-[#4CB5F9]"
                >
                    <span className="text-sm font-semibold text-gray-500">{day}</span>
                    <div className="no-scrollbar flex-1 overflow-y-auto">
                        {holiday && (
                            <span
                                className="mt-1 inline-block w-full truncate rounded-full bg-rose-100 px-1.5 py-0.5 text-center text-[9px] font-bold text-rose-600"
                                title={holiday.name}
                            >
                                Public Holiday
                            </span>
                        )}
                        {leaves.map((l: any, i: number) => (
                            <div key={i}>{getCalendarBadge(l.type, l.user?.name)}</div>
                        ))}
                    </div>
                </div>,
            );
        }
        return grid;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Leave Management', href: '/admin/leaves' }]}>
            <Head title="Leave Management" />

            <div className="flex min-h-screen flex-col gap-6 bg-slate-50 p-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 border-b border-dashed border-gray-200/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-[22px] font-bold tracking-tight text-[#051C3F]">Leave Management & Holidays</h1>
                        <p className="mt-0.5 text-sm text-gray-500">Review pending requests and track company-wide holidays.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog open={isTimingModalOpen} onOpenChange={setIsTimingModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 border-gray-200 px-4 font-semibold text-[#051C3F] shadow-sm hover:bg-gray-50"
                                >
                                    <Settings2 className="mr-2 h-4 w-4 text-gray-500" /> Configure Shift
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle>Configure Office Shift Timings</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitTiming} className="mt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_time">Shift Starts (Punch-in)</Label>
                                            <Input
                                                id="start_time"
                                                type="time"
                                                value={timingData.start_time}
                                                onChange={(e) => setTimingData('start_time', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_time">Shift Ends (Punch-out)</Label>
                                            <Input
                                                id="end_time"
                                                type="time"
                                                value={timingData.end_time}
                                                onChange={(e) => setTimingData('end_time', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={timingProcessing} className="w-full bg-[#4CB5F9] hover:bg-[#3AA5E9]">
                                        Save Shift Timings
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isPolicyModalOpen} onOpenChange={setIsPolicyModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 border-gray-200 px-4 font-semibold text-[#051C3F] shadow-sm hover:bg-gray-50"
                                >
                                    <Settings2 className="mr-2 h-4 w-4 text-gray-500" /> Configure Policy
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Configure Policy Allowances</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitPolicy} className="mt-4 space-y-5">
                                    <div className="space-y-2">
                                        <Label>Employment Type Target</Label>
                                        <Select value={policyData.employment_type} onValueChange={handlePolicyTypeChange}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Probation">Probation</SelectItem>
                                                <SelectItem value="Full-time">Full-time / Confirmed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Casual (CL)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={policyData.cl}
                                                onChange={(e) => setPolicyData('cl', Number(e.target.value))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sick (SL)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={policyData.sl}
                                                onChange={(e) => setPolicyData('sl', Number(e.target.value))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Earned (EL)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={policyData.el}
                                                onChange={(e) => setPolicyData('el', Number(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={policyProcessing} className="w-full bg-[#4CB5F9] hover:bg-[#3AA5E9]">
                                        Save Policy Config
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isHolidayModalOpen} onOpenChange={setIsHolidayModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-10 bg-[#4CB5F9] px-4 font-semibold text-white shadow-sm hover:bg-[#3AA5E9]">
                                    <Plus className="mr-2 h-4 w-4" /> Add Public Holiday
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add Public Holiday</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={submitHoliday} className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>Holiday Name</Label>
                                        <Input
                                            value={holidayData.name}
                                            onChange={(e) => setHolidayData('name', e.target.value)}
                                            placeholder="e.g. Christmas Day"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input
                                            type="date"
                                            value={holidayData.date}
                                            onChange={(e) => setHolidayData('date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description (Optional)</Label>
                                        <Input value={holidayData.description} onChange={(e) => setHolidayData('description', e.target.value)} />
                                    </div>
                                    <Button type="submit" disabled={holidayProcessing} className="w-full bg-[#4CB5F9] hover:bg-[#3AA5E9]">
                                        Save Holiday
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Leave Request</DialogTitle>
                                </DialogHeader>
                                {editingRequest && (
                                    <div className="mt-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Employee</Label>
                                            <p className="text-sm font-medium text-[#051C3F]">{editingRequest.user?.name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Leave Type</Label>
                                            <p className="text-sm text-gray-600">{editingRequest.type}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Reason</Label>
                                            <p className="text-sm text-gray-600">{editingRequest.reason}</p>
                                        </div>
                                        {editingRequest.document_path && (
                                            <div className="space-y-2">
                                                <Label>Supporting Document</Label>
                                                <div>
                                                    <a href={`/storage/${editingRequest.document_path}`} target="_blank" className="text-sm font-bold text-[#4CB5F9] hover:underline">
                                                        View Document
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={editStatus} onValueChange={setEditStatus}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {/* <SelectItem value="pending">Pending</SelectItem> */}
                                                    <SelectItem value="approved">Approved</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={() => handleUpdateStatus(editingRequest.id, editStatus)}
                                            className="w-full bg-[#4CB5F9] hover:bg-[#3AA5E9]"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Top Layout Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Calendar Section */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] lg:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-[#051C3F]" />
                                <h2 className="text-lg font-bold text-[#051C3F]">
                                    {monthNames[month]} {year}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={prevMonth} className="rounded-lg p-1.5 transition-colors hover:bg-gray-100">
                                    <ChevronLeft className="h-5 w-5 text-gray-500" />
                                </button>
                                <button onClick={nextMonth} className="rounded-lg p-1.5 transition-colors hover:bg-gray-100">
                                    <ChevronRight className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-3">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                                <div
                                    key={day}
                                    className={`mb-2 text-center text-xs font-bold tracking-wider ${i >= 5 ? 'text-[#4CB5F9]' : 'text-gray-400'}`}
                                >
                                    {day}
                                </div>
                            ))}
                            {renderCalendar()}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="space-y-6">
                        {/* Upcoming Holidays */}
                        <div className="relative overflow-hidden rounded-2xl bg-[#1C2C4F] p-6 text-white shadow-[0_4px_14px_rgba(28,44,79,0.15)]">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/5 blur-2xl"></div>
                            <h3 className="mb-5 text-[11px] font-bold tracking-[0.2em] text-blue-200/70 uppercase">Upcoming Holidays</h3>
                            <div className="relative z-10 space-y-3">
                                {futureHolidays.slice(0, 3).map((h: any) => {
                                    const d = new Date(h.date);
                                    return (
                                        <div
                                            key={h.id}
                                            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.06] p-3 transition-colors hover:bg-white/10"
                                        >
                                            <div className="min-w-[3.5rem] rounded-lg bg-white/10 p-2 text-center">
                                                <span className="block text-xl leading-none font-black">{d.getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold tracking-tight">{h.name}</p>
                                                <p className="mt-0.5 text-[11px] text-blue-200">
                                                    {d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {futureHolidays.length === 0 && <p className="py-4 text-center text-sm text-blue-200">No upcoming holidays.</p>}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                            <h3 className="mb-5 text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Active Leaves</p>
                                    <p className="text-2xl font-black text-[#051C3F]">{activeLeaves}</p>
                                </div>
                                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Pending</p>
                                    <p className="text-2xl font-black text-[#4CB5F9]">
                                        {pendingCount < 10 && pendingCount > 0 ? `0${pendingCount}` : pendingCount}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Next Holiday</p>
                                    <p className="text-2xl font-black text-green-500">
                                        {daysToNextHoliday}
                                        {daysToNextHoliday !== '-' ? 'd' : ''}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                                    <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Avg Ratio</p>
                                    <p className="text-2xl font-black text-[#051C3F]">4%</p>
                                </div>
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="relative flex min-h-[120px] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F3166] to-[#1C468A] p-6 text-center text-white shadow-lg shadow-blue-900/10">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <p className="relative z-10 text-sm leading-relaxed font-medium text-blue-50 italic">
                                "Balance is not something you find, it's something you create."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pending Leave Approvals Table */}
                <div className="mt-4">
                    <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h2 className="text-[17px] font-bold text-[#051C3F]">Pending Leave Approvals</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                                <button
                                    onClick={() => setFilterType('All')}
                                    className={`rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all ${filterType === 'All' ? 'bg-gray-100 text-[#051C3F]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterType('CL')}
                                    className={`rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all ${filterType === 'CL' ? 'bg-gray-100 text-[#051C3F]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    CL
                                </button>
                                <button
                                    onClick={() => setFilterType('EL')}
                                    className={`rounded-md px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all ${filterType === 'EL' ? 'bg-gray-100 text-[#051C3F]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    EL
                                </button>
                            </div>
                            <a href="#" className="text-sm font-bold text-[#4CB5F9] hover:underline">
                                View All Requests
                            </a>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-100 font-bold text-[#051C3F]">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Employee Name</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Leave Type</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Duration</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center font-medium text-gray-500">
                                            No pending requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req: any) => {
                                        const start = new Date(req.start_date);
                                        const end = new Date(req.end_date);
                                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

                                        return (
                                            <tr key={req.id} className="group transition-colors hover:bg-gray-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-600">
                                                            {req.user?.avatar ? (
                                                                <img
                                                                    src={req.user.avatar}
                                                                    alt={req.user.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                req.user?.name?.charAt(0) || 'E'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#051C3F]">{req.user?.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {req.user?.designation?.display_name || req.user?.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getLeaveBadge(req.type)}
                                                    {req.document_path && (
                                                        <a href={`/storage/${req.document_path}`} target="_blank" className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#4CB5F9] hover:underline" title="View Attachment">
                                                            <Paperclip className="h-3 w-3" />
                                                            Attachment
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <p className="text-sm font-bold text-[#051C3F]">
                                                        {days} {days === 1 ? 'Day' : 'Days'}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        {start.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                                                        {days > 1 && ` - ${end.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                                            req.status === 'approved'
                                                                ? 'bg-green-50 text-green-700'
                                                                : req.status === 'rejected'
                                                                  ? 'bg-red-50 text-red-700'
                                                                  : 'bg-blue-50 text-[#051C3F]'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                req.status === 'approved'
                                                                    ? 'bg-green-500'
                                                                    : req.status === 'rejected'
                                                                      ? 'bg-red-500'
                                                                      : 'bg-[#4CB5F9]'
                                                            }`}
                                                        ></div>
                                                        <span className="capitalize">{req.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                        {req.status === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(req.id, 'approved')}
                                                                    className="rounded-lg bg-[#A3E635] p-1.5 text-white shadow-sm transition-colors hover:bg-[#8CD31A]"
                                                                    title="Approve"
                                                                >
                                                                    <Check className="h-4 w-4 stroke-[3]" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                                                    className="rounded-lg bg-red-400 p-1.5 text-white shadow-sm transition-colors hover:bg-red-500"
                                                                    title="Reject"
                                                                >
                                                                    <X className="h-4 w-4 stroke-[3]" />
                                                                </button>
                                                                <button
                                                                    onClick={() => openEditModal(req)}
                                                                    className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-50"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => openEditModal(req)}
                                                                className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-50"
                                                                title="Edit Status"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteRequest(req.id)}
                                                            className="rounded-lg border border-gray-200 bg-white p-1.5 text-red-500 shadow-sm transition-colors hover:bg-red-50"
                                                            title="Delete Request"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
