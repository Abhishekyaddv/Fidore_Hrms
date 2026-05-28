import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
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

interface DashboardProps {
    employee: Employee;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ employee }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');

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

                            <button className="w-full sm:w-auto bg-brand-600 hover:bg-brand-400 text-surface-0 font-semibold cursor-pointer h-12 px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all border-none">
                                <MapPin className="h-4 w-4" /> PUNCH IN
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
                            <div className="mt-4 text-xs font-semibold text-success-text flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4" /> Active Status
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee Specific Section (e.g. Leave Balance or Overview) */}
                <div className="rounded-xl border border-border bg-surface-0 p-6 shadow-xs">
                    <div className="border-b border-border pb-4 mb-4 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-text-primary">
                            My Recent Activity
                        </h2>
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            ID: {employee.employee_id || 'N/A'}
                        </span>
                    </div>

                    <div className="text-center py-10 text-text-secondary space-y-2">
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
        </AppLayout>
    );
}
