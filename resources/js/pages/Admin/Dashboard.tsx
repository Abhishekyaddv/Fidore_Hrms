import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Download, MoreVertical, Plus, Users, CalendarX, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { AddEmployeeModal } from '@/components/add-employee-modal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function AdminDashboard({
    designations,
    nextEmployeeId,
}: {
    designations: any[];
    nextEmployeeId: string;
}) {
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-surface-1 min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Good Morning, {auth.user.name}</h1>
                        <p className="text-text-secondary">Here is what's happening in Small Corp today.</p>
                    </div>
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
                    <div className="md:col-span-2 rounded-xl border border-border bg-surface-0 flex overflow-hidden shadow-xs">
                        <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                                <span className="inline-flex items-center rounded-full bg-info-bg px-2.5 py-1 text-xs font-semibold text-info-text mb-4">Live Status</span>
                                <h2 className="text-xl font-bold text-text-primary mb-1">Punch In / Out</h2>
                                <p className="text-sm text-text-secondary">Current Location: 123 Tech Avenue, Innovation City</p>
                            </div>
                            
                            <div className="mt-8 flex items-end gap-6 mb-8">
                                <div className="text-3xl font-bold text-text-primary font-mono">
                                    06:44
                                    <span className="text-sm font-normal text-text-muted ml-1">AM</span>
                                </div>
                                <div className="text-sm text-text-secondary pb-1 border-l pl-4 border-border">
                                    Monday, Oct 24, 2023
                                </div>
                            </div>

                            <Button className="w-full sm:w-auto bg-brand-600 hover:bg-brand-400 text-white h-12 text-sm font-semibold tracking-wider cursor-pointer shadow-xs">
                                <MapPin className="mr-2 h-4 w-4" /> PUNCH IN
                            </Button>
                        </div>
                        <div className="hidden md:block w-1/2 bg-surface-2 relative">
                            {/* Map placeholder */}
                            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxSDB6TTAgMzl2MWg0MHYtMXpNMCBwaDF2NDBIMHoiIGZpbGw9IiNjdXJyZW50Q29sb3IiLz4KPC9zdmc+')] mix-blend-multiply dark:mix-blend-overlay"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="bg-brand-600 p-2.5 rounded-full border-4 border-surface-0 shadow-lg animate-pulse">
                                    <MapPin className="text-white h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Stack */}
                    <div className="flex flex-col gap-6">
                        {/* Total Employees */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 flex flex-col justify-between shadow-xs">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-text-secondary">Total Employees</p>
                                    <h3 className="text-3xl font-bold text-text-primary mt-2">1,284</h3>
                                </div>
                                <div className="p-3 bg-brand-50 rounded-lg">
                                    <Users className="h-5 w-5 text-brand-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm font-medium text-success-text">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                +12 this month
                            </div>
                        </div>

                        {/* Pending Leaves */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 flex flex-col justify-between shadow-xs">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-text-secondary">Pending Leaves</p>
                                    <h3 className="text-3xl font-bold text-text-primary mt-2">24</h3>
                                </div>
                                <div className="p-3 bg-danger-bg rounded-lg">
                                    <CalendarX className="h-5 w-5 text-danger-text" />
                                </div>
                            </div>
                            <div className="mt-4 text-sm font-medium text-danger-text">
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
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="37.68" className="text-brand-600 dark:text-accent-500" strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-text-primary">85%</span>
                                <span className="text-xs font-bold text-text-muted tracking-wider">PRESENT</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-text-secondary mb-1">Present</p>
                                <p className="text-xl font-bold text-text-primary">1,092</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-text-secondary mb-1">On Leave</p>
                                <p className="text-xl font-bold text-accent-700 dark:text-accent-500">42</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-text-secondary mb-1">Late Arrivals</p>
                                <p className="text-xl font-bold text-warning-text">18</p>
                            </div>
                            <div className="bg-surface-2 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-text-secondary mb-1">Absent</p>
                                <p className="text-xl font-bold text-danger-text">132</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Leave Requests */}
                <div className="rounded-xl border border-border bg-surface-0 overflow-hidden shadow-xs">
                    <div className="p-6 flex justify-between items-center border-b border-border">
                        <h2 className="text-lg font-bold text-text-primary">Recent Leave Requests</h2>
                        <a href="#" className="text-sm font-medium text-accent-700 dark:text-accent-500 hover:underline">View All</a>
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
                                <tr className="bg-surface-0 border-b border-border hover:bg-surface-1 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 dark:text-brand-900 flex items-center justify-center font-bold text-xs">JD</div>
                                        <div>
                                            <div className="font-semibold text-text-primary">Jane Doe</div>
                                            <div className="text-xs text-text-muted">UI Designer</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">Annual Leave</td>
                                    <td className="px-6 py-4 text-text-secondary">Oct 28 - Oct 30</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">Approved</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-text-muted hover:text-text-primary transition-all cursor-pointer"><MoreVertical className="h-5 w-5 ml-auto" /></button>
                                    </td>
                                </tr>
                                <tr className="bg-surface-0 border-b border-border hover:bg-surface-1 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface-2 text-text-secondary flex items-center justify-center font-bold text-xs">JS</div>
                                        <div>
                                            <div className="font-semibold text-text-primary">John Smith</div>
                                            <div className="text-xs text-text-muted">Backend Developer</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">Sick Leave</td>
                                    <td className="px-6 py-4 text-text-secondary">Oct 24 - Oct 24</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning-text">Pending</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-text-muted hover:text-text-primary transition-all cursor-pointer"><MoreVertical className="h-5 w-5 ml-auto" /></button>
                                    </td>
                                </tr>
                                <tr className="bg-surface-0 hover:bg-surface-1 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-success-bg text-success-text flex items-center justify-center font-bold text-xs">MB</div>
                                        <div>
                                            <div className="font-semibold text-text-primary">Marcus Brown</div>
                                            <div className="text-xs text-text-muted">HR Specialist</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary">Maternity Leave</td>
                                    <td className="px-6 py-4 text-text-secondary">Nov 1 - Feb 1</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">Rejected</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-text-muted hover:text-text-primary transition-all cursor-pointer"><MoreVertical className="h-5 w-5 ml-auto" /></button>
                                    </td>
                                </tr>
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
            />
        </AppLayout>
    );
}
