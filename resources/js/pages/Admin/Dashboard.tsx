import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, MoreVertical, Plus, Users, CalendarX, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-slate-50 dark:bg-slate-900">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Good Morning, Admin</h1>
                        <p className="text-slate-500 dark:text-slate-400">Here is what's happening in Small Corp today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button className="bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> New Hire
                        </Button>
                        <Button variant="outline" className="border-slate-300 dark:border-slate-700">
                            <Download className="mr-2 h-4 w-4" /> Export Reports
                        </Button>
                    </div>
                </div>

                {/* Top Grid - Punch In & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Punch In Card */}
                    <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex overflow-hidden">
                        <div className="p-6 flex flex-col justify-between flex-1">
                            <div>
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-4 dark:bg-blue-900/30 dark:text-blue-400">Live Status</span>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Punch In / Out</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Current Location: 123 Tech Avenue, Innovation City</p>
                            </div>
                            
                            <div className="mt-8 flex items-end gap-6 mb-8">
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                    06:44
                                    <span className="text-sm font-normal text-slate-500 ml-1">AM</span>
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 pb-1 border-l pl-4 border-slate-200 dark:border-slate-800">
                                    Monday, Oct 24, 2023
                                </div>
                            </div>

                            <Button className="w-full sm:w-auto bg-[#0f172a] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-12 text-sm font-semibold tracking-wider">
                                <MapPin className="mr-2 h-4 w-4" /> PUNCH IN
                            </Button>
                        </div>
                        <div className="hidden md:block w-1/2 bg-slate-100 dark:bg-slate-900 relative">
                            {/* Map placeholder */}
                            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxSDB6TTAgMzl2MWg0MHYtMXpNMCBwaDF2NDBIMHoiIGZpbGw9IiNjdXJyZW50Q29sb3IiLz4KPC9zdmc+')] mix-blend-multiply dark:mix-blend-overlay"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="bg-blue-600 p-2 rounded-full border-4 border-white shadow-lg animate-pulse">
                                    <MapPin className="text-white h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Stack */}
                    <div className="flex flex-col gap-6">
                        {/* Total Employees */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Employees</p>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">1,284</h3>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                +12 this month
                            </div>
                        </div>

                        {/* Pending Leaves */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Leaves</p>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">24</h3>
                                </div>
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <CalendarX className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <div className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
                                Requires immediate action
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Attendance - Full Width Row */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Attendance</h2>
                        <select className="text-sm border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-md text-slate-600 dark:text-slate-300">
                            <option>All Departments</option>
                            <option>Engineering</option>
                            <option>Design</option>
                        </select>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                        {/* Circle Chart */}
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="37.68" className="text-[#0f172a] dark:text-blue-500" strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center text-center">
                                <span className="text-3xl font-bold text-slate-900 dark:text-white">85%</span>
                                <span className="text-xs font-semibold text-slate-500 tracking-wider">PRESENT</span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 flex-1 w-full">
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Present</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">1,092</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 mb-1">On Leave</p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">42</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Late Arrivals</p>
                                <p className="text-xl font-bold text-amber-500 dark:text-amber-400">18</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-slate-500 mb-1">Absent</p>
                                <p className="text-xl font-bold text-red-500 dark:text-red-400">132</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Leave Requests */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
                    <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Leave Requests</h2>
                        <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 font-semibold tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Employee</th>
                                    <th scope="col" className="px-6 py-4">Type</th>
                                    <th scope="col" className="px-6 py-4">Dates</th>
                                    <th scope="col" className="px-6 py-4">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">JD</div>
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white">Jane Doe</div>
                                            <div className="text-xs text-slate-500">UI Designer</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Annual Leave</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Oct 28 - Oct 30</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">Approved</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><MoreVertical className="h-5 w-5 ml-auto" /></button>
                                    </td>
                                </tr>
                                <tr className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs">JS</div>
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white">John Smith</div>
                                            <div className="text-xs text-slate-500">Backend Developer</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Sick Leave</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Oct 24 - Oct 24</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">Pending</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><MoreVertical className="h-5 w-5 ml-auto" /></button>
                                    </td>
                                </tr>
                                <tr className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center font-bold text-xs">MB</div>
                                        <div>
                                            <div className="font-semibold text-slate-900 dark:text-white">Marcus Brown</div>
                                            <div className="text-xs text-slate-500">HR Specialist</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Maternity Leave</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Nov 1 - Feb 1</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400">Rejected</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><MoreVertical className="h-5 w-5 ml-auto" /></button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
