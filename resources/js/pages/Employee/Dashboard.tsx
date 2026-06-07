import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Designation {
    id: number;
    name: string;
    display_name: string;
    department: string;
}

interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
    employee_id: string | null;
    department: string | null;
    joining_date: string | null;
    employment_type: string | null;
    designation: Designation | null;
}

interface Attendance {
    id: number;
    user_id: number;
    date: string;
    punch_in: string | null;
    punch_out: string | null;
    minutes_late?: number | null;
    punch_history: { in: string; out: string | null }[] | null;
    total_logged_minutes: number;
    created_at: string;
    updated_at: string;
}

interface Holiday {
    id: number;
    name: string;
    date: string;
    description: string | null;
}

interface LeaveRequest {
    id: number;
    user_id: number;
    type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
}

interface DashboardProps {
    employee: Employee;
    todayAttendance: Attendance | null;
    monthAttendances?: Attendance[];
    holidays?: Holiday[];
    leaveRequests?: LeaveRequest[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    employee,
    todayAttendance,
    monthAttendances = [],
    holidays = [],
    leaveRequests = [],
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [preFetchedLocation, setPreFetchedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Update real-time clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            // Format time
            setCurrentTime(
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                })
            );
            // Format date
            setCurrentDate(
                now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                })
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Pre-fetch location on mount
    useEffect(() => {
        if (!todayAttendance || !todayAttendance.punch_in) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setPreFetchedLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        });
                    },
                    (error) => {
                        console.warn('Pre-fetching location failed:', error);
                    }
                );
            }
        }
    }, [todayAttendance]);

    const formatTime = (isoString: string | null) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return '';
        }
    };

    const isPunchedIn = () => {
        if (!todayAttendance) return false;
        const history = todayAttendance.punch_history || [];
        return history.length > 0 && history[history.length - 1].out === null;
    };

    const handlePunch = () => {
        if (!isPunchedIn()) {
            if (preFetchedLocation) {
                router.post(route('attendance.punch-in'), preFetchedLocation, {
                    preserveScroll: true,
                });
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        router.post(route('attendance.punch-in'), { latitude, longitude }, {
                            preserveScroll: true,
                        });
                    },
                    (error) => {
                        alert('Location access is required to punch in. Please allow location access and try again.');
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        } else {
            router.post(route('attendance.punch-out'), {}, {
                preserveScroll: true,
            });
        }
    };

    const getPunchButtonState = () => {
        if (!isPunchedIn()) {
            return {
                text: 'PUNCH IN',
                disabled: false,
                className: 'w-full sm:w-auto bg-brand-600 hover:bg-brand-400 text-surface-0 font-semibold cursor-pointer h-12 px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all border-none',
                icon: <MapPin className="h-4 w-4" />
            };
        }
        return {
            text: 'PUNCH OUT',
            disabled: false,
            className: 'w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-surface-0 font-semibold cursor-pointer h-12 px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all border-none',
            icon: <Clock className="h-4 w-4" />
        };
    };

    const buttonState = getPunchButtonState();

    // Calendar logic
    const parsedDate = new Date();
    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const renderMiniCalendarDays = () => {
        const grid = [];
        
        // Empty slots
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(<div key={`empty-${i}`} className="aspect-square bg-transparent"></div>);
        }

        const todayDateStr = new Date().toISOString().substring(0, 10);

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayDateStr;

            // Check if holiday
            const holiday = holidays.find((h) => h.date === dateStr);
            const isPublicHoliday = holiday && holiday.name !== 'Weekly Off (Sunday)';
            
            // Check if leave
            const leave = leaveRequests.find((l) => {
                const start = new Date(l.start_date);
                const end = new Date(l.end_date);
                const current = new Date(dateStr);
                return current >= start && current <= end;
            });

            // Check if attendance exists
            const attendance = monthAttendances.find((a) => {
                const attDate = typeof a.date === 'string' ? a.date.substring(0, 10) : '';
                return attDate === dateStr;
            });

            let indicatorColor = '';
            let tooltip = '';

            if (isPublicHoliday) {
                indicatorColor = 'bg-rose-500';
                tooltip = `Holiday: ${holiday.name}`;
            } else if (holiday && !isPublicHoliday) {
                indicatorColor = 'bg-gray-300';
                tooltip = `Weekly Off`;
            } else if (leave) {
                if (leave.status === 'approved') {
                    indicatorColor = 'bg-emerald-500';
                    tooltip = `Approved Leave: ${leave.type}`;
                } else if (leave.status === 'pending') {
                    indicatorColor = 'bg-amber-500';
                    tooltip = `Pending Leave: ${leave.type}`;
                } else {
                    indicatorColor = 'bg-rose-500';
                    tooltip = `Rejected Leave: ${leave.type}`;
                }
            } else if (attendance) {
                indicatorColor = 'bg-green-600';
                tooltip = `Present${attendance.minutes_late && attendance.minutes_late > 0 ? ` (${attendance.minutes_late}m late)` : ''}`;
            }

            grid.push(
                <div 
                    key={day} 
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-semibold relative hover:bg-surface-2 transition-colors cursor-pointer ${
                        isToday ? 'bg-brand-50 text-brand-800 border border-brand-400/30' : 'text-text-primary'
                    }`}
                    title={tooltip || `${monthNames[month]} ${day}, ${year}`}
                >
                    <span>{day}</span>
                    {indicatorColor && (
                        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${indicatorColor}`}></span>
                    )}
                </div>
            );
        }

        // Fill remaining slots
        const totalSlots = firstDayOfMonth + daysInMonth;
        const remainingSlots = (7 - (totalSlots % 7)) % 7;
        for (let i = 0; i < remainingSlots; i++) {
            grid.push(<div key={`empty-end-${i}`} className="aspect-square bg-transparent"></div>);
        }

        return grid;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-surface-1 min-h-screen">
                
                {/* Greeting Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                        Good Morning, {auth.user.name}
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Here is your overview for today.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Time Clock Card */}
                    <div className="md:col-span-2 rounded-xl border border-border bg-surface-0 flex flex-col sm:flex-row overflow-hidden shadow-xs">
                        <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                                <span className="inline-flex items-center rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text mb-4">
                                    <Clock className="mr-1 h-3.5 w-3.5" /> Working Hours
                                </span>
                                {todayAttendance && todayAttendance.minutes_late && todayAttendance.minutes_late > 0 ? (
                                    <div className="mb-4 p-3.5 rounded-xl bg-warning-bg text-warning-text border border-amber-500/20 text-sm flex items-center gap-3 animate-fade-in shadow-xs">
                                        <div className="p-1.5 bg-amber-500/10 rounded-md">
                                            <span className="text-base">⚠️</span>
                                        </div>
                                        <span className="font-semibold">You were {todayAttendance.minutes_late} minutes late today.</span>
                                    </div>
                                ) : null}
                                <h2 className="text-xl font-bold text-text-primary mb-1">
                                    Attendance Punch
                                </h2>
                                <p className="text-sm text-text-secondary">
                                    Log your daily work hours from your registered location.
                                </p>
                            </div>

                            <div className="mt-8 flex items-end gap-5 mb-8">
                                <div className="text-3xl font-bold text-text-primary font-mono tracking-tight">
                                    {currentTime || '00:00:00 AM'}
                                </div>
                                <div className="text-sm text-text-secondary pb-1 border-l pl-4 border-border">
                                    {currentDate || 'Loading date...'}
                                </div>
                            </div>

                            {todayAttendance && (
                                <div className="flex flex-wrap gap-4 text-xs font-semibold mb-6 text-text-secondary bg-surface-1 p-3 rounded-lg border border-border w-fit">
                                    <div>
                                        <span className="text-text-muted">TOTAL LOGGED TODAY: </span>
                                        <span className="text-brand-600 dark:text-accent-500 font-mono text-sm">
                                            {Math.floor((todayAttendance.total_logged_minutes || 0) / 60)}h {(todayAttendance.total_logged_minutes || 0) % 60}m
                                        </span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handlePunch}
                                disabled={buttonState.disabled}
                                className={buttonState.className}
                            >
                                {buttonState.icon} {buttonState.text}
                            </button>
                        </div>
                        <div className="hidden sm:block w-1/3 bg-surface-2 relative border-l border-border">
                            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxSDB6TTAgMzl2MWg0MHYtMXpNMCBwaDF2NDBIMHoiIGZpbGw9IiNjdXJyZW50Q29sb3IiLz4KPC9zdmc+')] mix-blend-multiply dark:mix-blend-overlay"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center space-y-2">
                                <div className="bg-emerald-600 p-2.5 rounded-full border-4 border-white shadow-lg inline-block animate-pulse">
                                    <MapPin className="text-white h-5 w-5" />
                                </div>
                                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                                    Inside Office GPS
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats/Profile Stack */}
                    <div className="flex flex-col gap-6">
                        {/* Designation Card */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 flex flex-col justify-between shadow-xs">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                        Designation
                                    </p>
                                    <h3 className="text-lg font-bold text-text-primary mt-2.5">
                                        {employee.designation?.display_name || 'Unassigned'}
                                    </h3>
                                </div>
                                <div className="p-3 bg-info-bg rounded-lg shrink-0">
                                    <Briefcase className="h-5 w-5 text-info-text" />
                                </div>
                            </div>
                            <div className="mt-4 text-xs font-mono font-medium text-text-muted">
                                Code: {employee.designation?.name || 'N/A'}
                            </div>
                        </div>

                        {/* Department Card */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 flex flex-col justify-between shadow-xs">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                        Department
                                    </p>
                                    <h3 className="text-lg font-bold text-text-primary mt-2.5">
                                        {employee.department || 'Unassigned'}
                                    </h3>
                                </div>
                                <div className="p-3 bg-accent-50 rounded-lg shrink-0">
                                    <Building2 className="h-5 w-5 text-accent-700" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs font-semibold text-success-text flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4" /> Active Status
                                </div>
                                <div className="text-[10px] font-bold px-2 py-1 bg-brand-50 text-brand-700 rounded-md uppercase tracking-wider border border-brand-200">
                                    {employee.employment_type || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity and Attendance Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Recent Activity */}
                    <div className="lg:col-span-2 rounded-xl border border-border bg-surface-0 p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="border-b border-border pb-4 mb-4 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-text-primary">
                                    My Recent Activity
                                </h2>
                                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                    ID: {employee.employee_id || 'N/A'}
                                </span>
                            </div>

                            <div className="text-center py-12 text-text-secondary space-y-2">
                                <Calendar className="h-10 w-10 mx-auto text-text-muted" />
                                <h4 className="font-semibold text-[15px] text-text-primary">
                                    No recent leave records or tasks found
                                </h4>
                                <p className="text-xs max-w-xs mx-auto">
                                    When you log requests, submit timesheets, or check leaves, they will appear here.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Mini Calendar */}
                    <div className="rounded-xl border border-border bg-surface-0 p-6 shadow-xs flex flex-col">
                        <div className="border-b border-border pb-4 mb-4 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-brand-600" />
                                Attendance Calendar
                            </h2>
                            <span className="text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-md">
                                {monthNames[month]} {year}
                            </span>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                <div key={idx} className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 flex-1">
                            {renderMiniCalendarDays()}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-text-secondary">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                Present
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Approved Leave
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Pending Leave
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                Public Holiday
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                Weekly Off
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
