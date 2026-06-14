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
    Loader2,
    Navigation,
    AlertTriangle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
    employee_id: string | null;
    department: string | null;
    joining_date: string | null;
    employment_type: string | null;
    reportingManager?: {
        id: number;
        name: string;
        email: string;
    } | null;
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

interface DashboardProps {
    employee: Employee;
    todayAttendance: Attendance | null;
    monthAttendances?: Attendance[];
    latestLocation?: {
        id: number;
        latitude: number;
        longitude: number;
        type: string;
    } | null;
    officeLocation?: {
        latitude: number;
        longitude: number;
        radius_meters: number;
        address: string | null;
    } | null;
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
    latestLocation = null,
    officeLocation = null,
}: DashboardProps) {
    const { auth, errors } = usePage<any>().props;
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [preFetchedLocation, setPreFetchedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [isPunching, setIsPunching] = useState(false);
    const [liveTotalMinutes, setLiveTotalMinutes] = useState(todayAttendance?.total_logged_minutes || 0);

    // Live total minutes calculation
    useEffect(() => {
        const calculateLiveMinutes = () => {
            let baseMinutes = todayAttendance?.total_logged_minutes || 0;
            const history = todayAttendance?.punch_history || [];
            
            if (history.length > 0) {
                const lastSession = history[history.length - 1];
                if (lastSession.out === null) {
                    // Currently punched in
                    const inTime = new Date(lastSession.in).getTime();
                    const now = new Date().getTime();
                    const diffMinutes = Math.floor((now - inTime) / 60000);
                    baseMinutes += diffMinutes;
                }
            }
            setLiveTotalMinutes(baseMinutes);
        };

        calculateLiveMinutes();
        // Update every 60 seconds
        const interval = setInterval(calculateLiveMinutes, 60000);
        return () => clearInterval(interval);
    }, [todayAttendance]);

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
        if (!officeLocation) {
             return {
                text: 'ATTENDANCE DISABLED',
                disabled: true,
                className: 'w-full sm:w-fit bg-slate-800/40 backdrop-blur-md text-white font-bold cursor-not-allowed h-14 px-8 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all border border-white/20',
                icon: <MapPin className="h-5 w-5 opacity-50" />,
                tooltip: 'Admin needs to configure the office location first'
             };
        }

        if (!isPunchedIn()) {
            return {
                text: isPunching ? 'PUNCHING IN...' : 'PUNCH IN',
                disabled: isPunching,
                className: 'w-full sm:w-fit bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold cursor-pointer h-14 px-8 rounded-2xl shadow-[0_8px_20px_-4px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-blue-400/30 group relative',
                icon: isPunching ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />,
                tooltip: 'Ready to punch in'
            };
        }
        return {
            text: isPunching ? 'PUNCHING OUT...' : 'PUNCH OUT',
            disabled: isPunching,
            className: 'w-full sm:w-fit bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold cursor-pointer h-14 px-8 rounded-2xl shadow-[0_8px_20px_-4px_rgba(249,115,22,0.5)] flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed border border-orange-400/30 group relative',
            icon: isPunching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />,
            tooltip: 'Punched in'
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

            // Check if weekly off (Sunday)
            const dateObj = new Date(year, month, day);
            const isWeeklyOff = dateObj.getDay() === 0;

            // Check if attendance exists
            const attendance = monthAttendances.find((a) => {
                const attDate = typeof a.date === 'string' ? a.date.substring(0, 10) : '';
                return attDate === dateStr;
            });

            let indicatorColor = '';
            let tooltip = '';

            if (attendance) {
                indicatorColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
                tooltip = `Present${attendance.minutes_late && attendance.minutes_late > 0 ? ` (${attendance.minutes_late}m late)` : ''}`;
            } else if (isWeeklyOff) {
                indicatorColor = 'bg-slate-300';
                tooltip = `Weekly Off`;
            }

            grid.push(
                <div 
                    key={day} 
                    className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold relative transition-all duration-200 cursor-pointer ${
                        isToday 
                        ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30 border border-white/20' 
                        : 'text-slate-600 hover:bg-white/50 hover:shadow-sm border border-transparent'
                    }`}
                    title={tooltip || `${monthNames[month]} ${day}, ${year}`}
                >
                    <span>{day}</span>
                    {indicatorColor && (
                        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${indicatorColor}`}></span>
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
            
            {/* Main Wrapper with decorative glassmorphism background */}
            <div className="relative flex flex-1 flex-col p-4 sm:p-6 lg:p-8 min-h-screen overflow-hidden bg-slate-50">
                
                {/* Background Blur Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-10000 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-10000 delay-1000 pointer-events-none"></div>
                <div className="absolute top-[40%] left-[60%] w-[30rem] h-[30rem] bg-purple-300/20 rounded-full blur-[80px] mix-blend-multiply pointer-events-none"></div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col gap-6 lg:gap-8 w-full max-w-[1400px] mx-auto">
                    
                    {/* Greeting Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                                Good Morning, {auth.user.name} 👋
                            </h1>
                            <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">
                                Here is your overview for today.
                            </p>
                        </div>
                    </div>

                    {/* Top Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        
                        {/* Time Clock Card (Glass) */}
                        <div className="lg:col-span-2 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col md:flex-row relative">
                            {/* Inner Glass Highlights */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                            
                            <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 relative z-10">
                                <div>
                                    
                                    
                                    {todayAttendance && todayAttendance.minutes_late && todayAttendance.minutes_late > 0 ? (
                                        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-amber-700 text-sm flex items-start sm:items-center gap-3 shadow-sm">
                                            <div className="p-2 bg-amber-500/20 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <span className="font-bold leading-relaxed">
                                                You were marked <span className="text-amber-800">{todayAttendance.minutes_late} minutes late</span> today.
                                            </span>
                                        </div>
                                    ) : null}

                                    <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
                                        Attendance Terminal
                                    </h2>
                                    <p className="text-slate-500 font-medium">
                                        Log your daily work hours from your registered location.
                                    </p>
                                    
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
                                    <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 tracking-tighter drop-shadow-sm font-sans">
                                        {currentTime || '00:00:00 AM'}
                                    </div>
                                    <div className="text-sm sm:text-base font-bold text-slate-500 mt-3 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {currentDate || 'Loading date...'}
                                    </div>
                                </div>

                                {todayAttendance && (
                                    <div className="flex flex-wrap gap-4 text-xs font-bold mb-8 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-sm w-fit relative overflow-hidden group">
                                        {isPunchedIn() && (
                                            <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl transition-colors ${isPunchedIn() ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
                                                <Clock className={`w-5 h-5 ${isPunchedIn() ? 'text-emerald-600' : 'text-indigo-600'}`} />
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block text-[10px] uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                                                    Total Logged Today
                                                    {isPunchedIn() && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            LIVE
                                                        </span>
                                                    )}
                                                </span>
                                                <span className={`text-xl transition-colors ${isPunchedIn() ? 'text-emerald-600 font-extrabold' : 'text-indigo-600'}`}>
                                                    {Math.floor(liveTotalMinutes / 60)}h {liveTotalMinutes % 60}m
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="relative group/tooltip inline-block w-full sm:w-auto">
                                    <button
                                        onClick={handlePunch}
                                        disabled={buttonState.disabled}
                                        className={buttonState.className}
                                    >
                                        {buttonState.icon} {buttonState.text}
                                    </button>
                                    
                                    {/* Tooltip */}
                                    <div className="absolute z-10 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition duration-300 bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 text-[11px] font-bold text-white uppercase tracking-wider bg-slate-800 rounded-xl shadow-xl whitespace-nowrap pointer-events-none">
                                        {buttonState.tooltip}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
                                    </div>
                                </div>
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

                        {/* Stats/Profile Stack */}
                        <div className="flex flex-col gap-6 lg:gap-8">

                            {/* Department Card */}
                            <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Department
                                        </p>
                                        <h3 className="text-xl font-extrabold text-slate-800 mt-2">
                                            {employee.department || 'Unassigned'}
                                        </h3>
                                    </div>
                                    <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-sm backdrop-blur-sm">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 relative z-10">
                                    <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100/50 backdrop-blur-sm">
                                        <CheckCircle className="h-4 w-4" /> Active Status
                                    </div>
                                    <div className="text-[10px] font-black px-3 py-1.5 bg-white/60 text-slate-600 rounded-xl uppercase tracking-widest border border-white shadow-sm">
                                        {employee.employment_type || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Reporting Manager Card */}
                            <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-purple-100/50 rounded-full blur-2xl"></div>
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Reporting Manager
                                        </p>
                                        <h3 className="text-xl font-extrabold text-slate-800 mt-2">
                                            {employee.reportingManager ? employee.reportingManager.name : 'Not Assigned'}
                                        </h3>
                                    </div>
                                    <div className="p-3.5 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-sm backdrop-blur-sm">
                                        <Briefcase className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="mt-6 text-xs font-bold text-slate-500 bg-white/50 backdrop-blur-md px-4 py-3 rounded-xl border border-white/60 shadow-sm relative z-10 break-all">
                                    {employee.reportingManager ? employee.reportingManager.email : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Activity and Calendar Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        
                        {/* Left: Recent Activity */}
                        <div className="lg:col-span-2 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="border-b border-white/50 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <h2 className="text-xl font-extrabold text-slate-800">
                                        My Recent Activity
                                    </h2>
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                                        ID: {employee.employee_id || 'N/A'}
                                    </span>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
                                    <div className="w-20 h-20 bg-slate-100/80 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white">
                                        <Calendar className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h4 className="font-extrabold text-lg text-slate-800 mb-2">
                                        No recent tasks or requests
                                    </h4>
                                    <p className="text-sm text-slate-500 max-w-sm font-medium">
                                        When you log requests, submit timesheets, or check leaves, they will elegantly appear right here.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Mini Calendar */}
                        <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col relative overflow-hidden">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="border-b border-white/50 pb-5 mb-6 flex justify-between items-center">
                                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-indigo-600" />
                                        Schedule
                                    </h2>
                                    <span className="text-[10px] font-black text-slate-600 bg-white/60 border border-white shadow-sm px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                        {monthNames[month]} {year}
                                    </span>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-3">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                        <div key={idx} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 flex-1">
                                    {renderMiniCalendarDays()}
                                </div>

                                {/* Legend */}
                                <div className="mt-6 pt-5 border-t border-white/50 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-bold text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                        Present
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                                        Weekly Off
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}