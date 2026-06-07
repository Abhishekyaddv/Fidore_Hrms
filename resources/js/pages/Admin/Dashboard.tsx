import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { Download, MoreVertical, Plus, Users, CalendarX, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { AddEmployeeModal } from '@/components/add-employee-modal';

interface Designation {
    id: number;
    name: string;
    display_name: string;
    department: string;
}

interface Attendance {
    id: number;
    user_id: number;
    date: string;
    punch_in: string | null;
    punch_out: string | null;
    punch_history: { in: string; out: string | null }[] | null;
    total_logged_minutes: number;
    created_at: string;
    updated_at: string;
}

interface LeaveRequest {
    id: number;
    user_id: number;
    type: string;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
    created_at: string;
    user?: {
        name: string;
        designation?: Designation | null;
    };
}

interface Stats {
    totalEmployees: number;
    newEmployeesThisMonth: number;
    pendingLeaves: number;
    presentCount: number;
    leaveCount: number;
    lateCount: number;
    absentCount: number;
    presentPercentage: number;
}

interface AdminDashboardProps {
    designations: Designation[];
    nextEmployeeId: string;
    todayAttendance: Attendance | null;
    stats: Stats;
    recentLeaveRequests: LeaveRequest[];
    employees?: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function AdminDashboard({
    designations,
    nextEmployeeId,
    todayAttendance,
    stats,
    recentLeaveRequests = [],
    employees = [],
}: AdminDashboardProps) {
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-surface-1 min-h-screen">
                {/* Header Action Section */}
                <div className="flex justify-end gap-4">
                    <div className="flex items-center gap-3">
                        <Button onClick={() => setIsAddEmployeeOpen(true)} className="bg-brand-600 hover:bg-brand-400 text-white cursor-pointer shadow-xs font-semibold">
                            <Plus className="mr-2 h-4 w-4" /> New Hire
                        </Button>
                        <Button variant="outline" className="border-border text-text-secondary hover:text-text-primary font-semibold">
                            <Download className="mr-2 h-4 w-4" /> Export Reports
                        </Button>
                    </div>
                </div>

                {/* Top Grid - Punch In & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Punch In Card */}
                    <div className="md:col-span-2 rounded-xl border border-border bg-surface-0 flex flex-col sm:flex-row overflow-hidden shadow-xs">
                        <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                                <span className="inline-flex items-center rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text mb-4">
                                    <Clock className="mr-1 h-3.5 w-3.5" /> Working Hours
                                </span>
                                <h2 className="text-xl font-bold text-text-primary mb-1">Attendance Punch</h2>
                                <p className="text-sm text-text-secondary">Log your daily work hours from your registered location.</p>
                            </div>
                            
                            <div className="mt-8 flex items-end gap-6 mb-8">
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

                    {/* Stats Stack */}
                    <div className="flex flex-col gap-6">
                        {/* Total Employees */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 flex flex-col justify-between shadow-xs">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Total Employees</p>
                                    <h3 className="text-3xl font-bold text-text-primary mt-2">{stats.totalEmployees.toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-brand-50 rounded-lg">
                                    <Users className="h-5 w-5 text-brand-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm font-semibold text-success-text">
                                <svg className="w-4 h-4 mr-1 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                +{stats.newEmployeesThisMonth} this month
                            </div>
                        </div>

                        {/* Pending Leaves */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 flex flex-col justify-between shadow-xs">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Pending Leaves</p>
                                    <h3 className="text-3xl font-bold text-text-primary mt-2">{stats.pendingLeaves}</h3>
                                </div>
                                <div className="p-3 bg-danger-bg rounded-lg">
                                    <CalendarX className="h-5 w-5 text-danger-text" />
                                </div>
                            </div>
                            <div className="mt-4 text-xs font-semibold text-danger-text">
                                Requires immediate action
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Attendance - Full Width Row */}
                <div className="rounded-xl border border-border bg-surface-0 p-6 shadow-xs">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-text-primary">Today's Attendance</h2>
                        <select className="text-sm border border-border bg-surface-2 rounded-md text-text-secondary focus:outline-hidden p-1.5 font-semibold">
                            <option>All Departments</option>
                            <option>Engineering</option>
                            <option>Design</option>
                        </select>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                        {/* Circle Chart */}
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-2" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 * (1 - stats.presentPercentage / 100)}
                                    className="text-brand-600 dark:text-accent-500"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-text-primary">{stats.presentPercentage}%</span>
                                <span className="text-xs font-bold text-text-muted tracking-wider">PRESENT</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-text-secondary mb-1">Present</p>
                                <p className="text-xl font-bold text-text-primary">{stats.presentCount}</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-text-secondary mb-1">On Leave</p>
                                <p className="text-xl font-bold text-accent-700 dark:text-accent-500">{stats.leaveCount}</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-text-secondary mb-1">Late Arrivals</p>
                                <p className="text-xl font-bold text-warning-text">{stats.lateCount}</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-text-secondary mb-1">Absent</p>
                                <p className="text-xl font-bold text-danger-text">{stats.absentCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Leave Requests */}
                <div className="rounded-xl border border-border bg-surface-0 overflow-hidden shadow-xs">
                    <div className="p-6 flex justify-between items-center border-b border-border">
                        <h2 className="text-lg font-bold text-text-primary">Recent Leave Requests</h2>
                        <Link href={route('admin.leaves.index')} className="text-sm font-medium text-accent-700 dark:text-accent-500 hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-text-secondary uppercase bg-surface-2 border-b border-border font-semibold tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Employee</th>
                                    <th scope="col" className="px-6 py-4">Type</th>
                                    <th scope="col" className="px-6 py-4">Dates</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeaveRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-text-secondary font-medium">
                                            No recent leave requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    recentLeaveRequests.map((req) => {
                                        const initials = req.user?.name
                                            ? req.user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                                            : '??';

                                        const formatLeaveDate = (dateStr: string) => {
                                            try {
                                                const d = new Date(dateStr);
                                                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            } catch (e) {
                                                return dateStr;
                                            }
                                        };

                                        const startFormatted = formatLeaveDate(req.start_date);
                                        const endFormatted = formatLeaveDate(req.end_date);
                                        const dateRange = startFormatted === endFormatted ? startFormatted : `${startFormatted} - ${endFormatted}`;

                                        const getStatusBadge = (status: string) => {
                                            switch (status.toLowerCase()) {
                                                case 'approved':
                                                    return (
                                                        <span className="inline-flex items-center rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">
                                                            Approved
                                                        </span>
                                                    );
                                                case 'rejected':
                                                    return (
                                                        <span className="inline-flex items-center rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">
                                                            Rejected
                                                        </span>
                                                    );
                                                default:
                                                    return (
                                                        <span className="inline-flex items-center rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning-text">
                                                            Pending
                                                        </span>
                                                    );
                                            }
                                        };

                                        return (
                                            <tr key={req.id} className="bg-surface-0 border-b border-border hover:bg-surface-1 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:text-brand-900 flex items-center justify-center font-bold text-xs">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-text-primary">{req.user?.name || 'Unknown User'}</div>
                                                        <div className="text-xs text-text-muted">{req.user?.designation?.display_name || 'Employee'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary">{req.type}</td>
                                                <td className="px-6 py-4 text-text-secondary">{dateRange}</td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(req.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-text-muted hover:text-text-primary transition-all cursor-pointer">
                                                        <MoreVertical className="h-5 w-5 ml-auto" />
                                                    </button>
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
            
            <AddEmployeeModal
                isOpen={isAddEmployeeOpen}
                setIsOpen={setIsAddEmployeeOpen}
                designations={designations}
                nextEmployeeId={nextEmployeeId}
                allUsers={employees}
            />
        </AppLayout>
    );
}
