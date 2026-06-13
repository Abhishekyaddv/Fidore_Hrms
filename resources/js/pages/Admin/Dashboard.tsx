import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { Download, MoreVertical, Plus, Users, CalendarX, MapPin, CheckCircle2, Clock, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { AddEmployeeModal } from '@/components/add-employee-modal';
import { ActiveEmployeesModal } from '@/components/active-employees-modal';

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

interface Stats {
    totalEmployees: number;
    newEmployeesThisMonth: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    presentPercentage: number;
}

interface AdminDashboardProps {
    nextEmployeeId: string;
    todayAttendance: Attendance | null;
    stats: Stats;
    employees?: any[];
    latestLocation?: {
        id: number;
        latitude: number;
        longitude: number;
        address: string | null;
        type: string;
    } | null;
    officeLocation?: {
        latitude: number;
        longitude: number;
        radius_meters: number;
        address: string | null;
    } | null;
    activeEmployees?: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function AdminDashboard({
    nextEmployeeId,
    todayAttendance,
    stats,
    employees = [],
    latestLocation = null,
    officeLocation = null,
    activeEmployees = [],
}: AdminDashboardProps) {
    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
    const [isActiveEmployeesOpen, setIsActiveEmployeesOpen] = useState(false);
    const { auth, errors } = usePage<any>().props;
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [preFetchedLocation, setPreFetchedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isPunching, setIsPunching] = useState(false);
    const [isSettingLocation, setIsSettingLocation] = useState(false);

    const handleSetOfficeLocation = () => {
        setIsSettingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    router.post(route('admin.office-location.store'), { latitude, longitude, radius_meters: 50 }, {
                        preserveScroll: true,
                        onFinish: () => setIsSettingLocation(false)
                    });
                },
                (error) => {
                    setIsSettingLocation(false);
                    alert('Location access is required to set the office location.');
                }
            );
        } else {
            setIsSettingLocation(false);
            alert('Geolocation is not supported by your browser.');
        }
    };

    // Update real-time clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                })
            );
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

    const isPunchedIn = () => {
        if (!todayAttendance) return false;
        const history = todayAttendance.punch_history || [];
        return history.length > 0 && history[history.length - 1].out === null;
    };

    const handlePunch = () => {
        setIsPunching(true);
        if (!isPunchedIn()) {
            if (preFetchedLocation) {
                router.post(route('attendance.punch-in'), preFetchedLocation, {
                    preserveScroll: true,
                    onFinish: () => setIsPunching(false)
                });
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        router.post(route('attendance.punch-in'), { latitude, longitude }, {
                            preserveScroll: true,
                            onFinish: () => setIsPunching(false)
                        });
                    },
                    (error) => {
                        setIsPunching(false);
                        alert('Location access is required to punch in. Please allow location access and try again.');
                    }
                );
            } else {
                setIsPunching(false);
                alert('Geolocation is not supported by your browser.');
            }
        } else {
            if (preFetchedLocation) {
                router.post(route('attendance.punch-out'), preFetchedLocation, {
                    preserveScroll: true,
                    onFinish: () => setIsPunching(false)
                });
            } else if (navigator.geolocation) {
                 navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        router.post(route('attendance.punch-out'), { latitude, longitude }, {
                            preserveScroll: true,
                            onFinish: () => setIsPunching(false)
                        });
                    },
                    (error) => {
                        router.post(route('attendance.punch-out'), {}, {
                            preserveScroll: true,
                            onFinish: () => setIsPunching(false)
                        });
                    }
                );
            } else {
                router.post(route('attendance.punch-out'), {}, {
                    preserveScroll: true,
                    onFinish: () => setIsPunching(false)
                });
            }
        }
    };

    const getPunchButtonState = () => {
        if (!isPunchedIn()) {
            return {
                text: isPunching ? 'PUNCHING IN...' : 'PUNCH IN',
                disabled: isPunching,
                className: 'w-full sm:w-fit bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold cursor-pointer h-14 px-8 rounded-2xl shadow-[0_8px_20px_-4px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-blue-400/30',
                icon: isPunching ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />,
            };
        }
        return {
            text: isPunching ? 'PUNCHING OUT...' : 'PUNCH OUT',
            disabled: isPunching,
            className: 'w-full sm:w-fit bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold cursor-pointer h-14 px-8 rounded-2xl shadow-[0_8px_20px_-4px_rgba(249,115,22,0.5)] flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-orange-400/30',
            icon: isPunching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />,
        };
    };

    const buttonState = getPunchButtonState();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            
            {/* Main Wrapper with decorative glassmorphism background */}
            <div className="relative flex flex-1 flex-col p-4 sm:p-6 lg:p-8 min-h-screen overflow-hidden bg-slate-50">
                
                {/* Background Blur Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-10000 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-10000 delay-1000 pointer-events-none"></div>
                <div className="absolute top-[40%] left-[60%] w-[30rem] h-[30rem] bg-purple-300/20 rounded-full blur-[80px] mix-blend-multiply pointer-events-none"></div>

                {/* Content Container (Z-index above blobs) */}
                <div className="relative z-10 flex flex-col gap-6 lg:gap-8 w-full max-w-[1400px] mx-auto">
                    
                    {/* Header Action Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Overview</h1>
                            <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Monitor your team's attendance and metrics.</p>
                        </div>
                        <Button 
                            onClick={() => setIsAddEmployeeOpen(true)} 
                            className="w-full sm:w-auto bg-white/60 backdrop-blur-md hover:bg-white text-indigo-600 border border-indigo-100 cursor-pointer shadow-lg shadow-indigo-100/50 font-bold rounded-2xl px-6 py-6 transition-all duration-300 active:scale-95"
                        >
                            <Plus className="mr-2 h-5 w-5" /> New Hire
                        </Button>
                    </div>

                    {/* Top Grid - Punch In & Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        
                        {/* Punch In Card (Glass) */}
                        <div className="lg:col-span-2 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row relative">
                            {/* Inner Glass Highlights */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                            
                            <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 relative z-10">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Attendance Terminal</h2>
                                    <p className="text-slate-500 font-medium">Log your daily work hours from your registered location.</p>
                                    
                                    {errors?.punch_in && (
                                        <div className="mt-4 p-4 bg-red-50/80 backdrop-blur-md text-red-600 text-sm rounded-2xl border border-red-200 font-semibold shadow-sm">
                                            {errors.punch_in}
                                        </div>
                                    )}
                                    {errors?.punch_out && (
                                        <div className="mt-4 p-4 bg-red-50/80 backdrop-blur-md text-red-600 text-sm rounded-2xl border border-red-200 font-semibold shadow-sm">
                                            {errors.punch_out}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-10 mb-8">
                                    <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tighter drop-shadow-sm">
                                        {currentTime || '00:00:00 AM'}
                                    </div>
                                    <div className="text-sm sm:text-base font-bold text-slate-500 mt-2 flex items-center gap-2">
                                        <CalendarX className="w-4 h-4" />
                                        {currentDate || 'Loading date...'}
                                    </div>
                                </div>

                                {todayAttendance && (
                                    <div className="flex flex-wrap gap-4 text-xs font-bold mb-8 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm w-fit">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-100 rounded-lg">
                                                <Clock className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block text-[10px] uppercase tracking-widest">Total Logged Today</span>
                                                <span className="text-indigo-600 text-base">
                                                    {Math.floor((todayAttendance.total_logged_minutes || 0) / 60)}h {(todayAttendance.total_logged_minutes || 0) % 60}m
                                                </span>
                                            </div>
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
                            
                            {/* Decorative Map Graphic Right Side */}
                            <div className="hidden md:flex w-2/5 relative bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-l border-white/40 items-center justify-center p-8">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
                                <div className="relative flex flex-col items-center justify-center space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                                        <div className="bg-gradient-to-b from-blue-500 to-indigo-600 p-4 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.3)] border-4 border-white relative z-10">
                                            <Navigation className="text-white h-8 w-8 fill-white/20" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                            GPS Active
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Stack (Glass) */}
                        <div className="flex flex-col gap-6 lg:gap-8">
                            
                            {/* Total Employees */}
                            <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Workforce</p>
                                        <h3 className="text-4xl font-black text-slate-800 mt-2 drop-shadow-sm">{stats.totalEmployees.toLocaleString()}</h3>
                                    </div>
                                    <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-sm backdrop-blur-sm">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center text-sm font-bold text-emerald-600 bg-emerald-50/50 w-fit px-3 py-1.5 rounded-xl border border-emerald-100/50 backdrop-blur-sm relative z-10">
                                    <svg className="w-4 h-4 mr-1.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    +{stats.newEmployeesThisMonth} this month
                                </div>
                            </div>

                            {/* Office Location */}
                            <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-amber-100/50 rounded-full blur-2xl"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Geofencing</p>
                                        <h3 className="text-xl font-extrabold text-slate-800 mt-2">
                                            {officeLocation ? 'Active & Set' : 'Not Configured'}
                                        </h3>
                                    </div>
                                    <div className={`p-3.5 rounded-2xl border shadow-sm backdrop-blur-sm ${officeLocation ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                        <MapPin className={`h-6 w-6 ${officeLocation ? 'text-emerald-600' : 'text-amber-600'}`} />
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-col gap-4 relative z-10">
                                    {officeLocation?.address && (
                                        <div className="text-[13px] bg-white/50 backdrop-blur-md p-3 rounded-2xl text-slate-600 border border-white/60 shadow-sm leading-relaxed">
                                            <span className="font-bold text-slate-800">HQ:</span> {officeLocation.address}
                                        </div>
                                    )}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <span className="text-[13px] font-bold text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-xl border border-slate-200/50 w-fit">
                                            {officeLocation ? `Radius: ${officeLocation.radius_meters}m` : 'Action Required'}
                                        </span>
                                        <Button 
                                            size="sm" 
                                            onClick={handleSetOfficeLocation}
                                            disabled={isSettingLocation}
                                            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white cursor-pointer shadow-lg shadow-slate-800/20 rounded-xl font-bold transition-all active:scale-95"
                                        >
                                            {isSettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : (officeLocation ? 'Update Pin' : 'Set Location')}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Today's Attendance - Full Width Row */}
                    <div className="w-full lg:w-2/3 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 relative overflow-hidden">
                        {/* Decorative background flare */}
                        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10 gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">Today's Attendance</h2>
                                <p className="text-sm font-medium text-slate-500 mt-1">Daily overview of staff presence</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12 relative z-10">
                            {/* Premium Circle Chart */}
                            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center shrink-0">
                                {/* Subtle inner drop shadow ring */}
                                <div className="absolute inset-0 rounded-full shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] border border-white/50"></div>
                                
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/60" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 * (1 - stats.presentPercentage / 100)}
                                        className="transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo-600 */}
                                            <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">{stats.presentPercentage}%</span>
                                    <span className="text-[10px] sm:text-xs font-black text-indigo-500 uppercase tracking-widest mt-1">Present</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-3/4">
                                {/* Present / Active */}
                                <div 
                                    onClick={() => setIsActiveEmployeesOpen(true)}
                                    className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-500 group-hover:text-emerald-600 transition-colors">Active Now</p>
                                    </div>
                                    <p className="text-3xl font-black text-slate-800">{activeEmployees.length}</p>
                                </div>
                                
                                {/* Late */}
                                <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Late Arrivals</p>
                                    </div>
                                    <p className="text-3xl font-black text-amber-600">{stats.lateCount}</p>
                                </div>
                                
                                {/* Absent */}
                                <div className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Absent</p>
                                    </div>
                                    <p className="text-3xl font-black text-red-500">{stats.absentCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <AddEmployeeModal
                isOpen={isAddEmployeeOpen}
                setIsOpen={setIsAddEmployeeOpen}
                nextEmployeeId={nextEmployeeId}
                allUsers={employees}
            />

            <ActiveEmployeesModal
                isOpen={isActiveEmployeesOpen}
                setIsOpen={setIsActiveEmployeesOpen}
                employees={activeEmployees}
            />
        </AppLayout>
    );
}