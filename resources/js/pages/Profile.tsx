import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Camera,
    Lock,
    Mail,
    Phone,
    User,
    Shield,
    FileText,
    Briefcase
} from 'lucide-react';
import React, { useRef } from 'react';

interface Designation {
    id: number;
    name: string;
    display_name: string;
    department: string;
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    employee_id: string | null;
    department: string | null;
    joining_date: string | null;
    employment_type: string | null;
    phone: string | null;
    emergency_contact: string | null;
    bio: string | null;
    designation: Designation | null;
}

interface ManagerProfile {
    name: string;
    email: string;
    designation: string;
    avatar: string | null;
}

interface ProfileProps {
    user: UserProfile;
    manager: ManagerProfile | null;
}

export default function Profile({ user, manager }: ProfileProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'superadmin' || auth.user.role === 'hr';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'My Profile',
            href: '/profile',
        },
    ];

    // Info update form
    const { data, setData, post, processing, errors } = useForm({
        phone: user.phone || '',
        emergency_contact: user.emergency_contact || '',
        bio: user.bio || '',
    });

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update_info'), {
            onSuccess: () => console.log('Request successful'),
            onError: (errors) => console.error('Request errors:', errors),
        });
    };

    // Password update form
    const { 
        data: passwordData, 
        setData: setPasswordData, 
        post: postPassword, 
        processing: passwordProcessing, 
        errors: passwordErrors,
        reset: resetPassword
    } = useForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postPassword(route('profile.update_password'), {
            onSuccess: () => {
                resetPassword();
                console.log('Password updated successfully');
            },
            onError: (errors) => console.error('Password update errors:', errors),
        });
    };

    // Avatar upload
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            router.post(route('profile.update_avatar'), {
                avatar: file
            }, {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    console.log('Request successful');
                },
                onError: (errors) => console.error('Request errors:', errors),
            });
        }
    };

    const userDesignation = user.designation?.display_name || 'Unassigned Role';
    const userDept = user.department || 'People Operations';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />
            
            {/* Main Wrapper with decorative glassmorphism background */}
            <div className="relative flex flex-1 flex-col p-4 sm:p-6 lg:p-8 min-h-screen overflow-hidden bg-slate-50">
                
                {/* Background Blur Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-10000 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-10000 delay-1000 pointer-events-none"></div>

                {/* Content Container */}
                <div className="relative z-10 w-full max-w-6xl mx-auto">
                    
                    <div className="mb-6 lg:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Profile Settings</h1>
                        <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Manage your account information and security.</p>
                    </div>

                    {/* Profile Grid Container */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                        
                        {/* Left & Middle Column (Profile Header & Forms) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                            
                            {/* Premium Profile Header Card (Glass) */}
                            <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden text-center sm:text-left">
                                {/* Inner Glass Highlights */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 pointer-events-none"></div>
                                
                                {/* Round Avatar with upload hover trigger */}
                                <div className="relative shrink-0 group cursor-pointer z-10" onClick={handleAvatarClick}>
                                    <div className="h-28 w-28 rounded-full overflow-hidden border-[3px] border-white shadow-xl bg-slate-100 flex items-center justify-center relative">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-slate-400">{user.name.charAt(0)}</span>
                                        )}
                                        {/* Camera Hover Overlay */}
                                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <Camera className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                    {/* Small round floating camera icon */}
                                    <div className="absolute bottom-1 right-1 p-2 bg-indigo-600 rounded-full border-2 border-white shadow-md text-white hover:bg-indigo-700 transition-colors">
                                        <Camera className="h-3.5 w-3.5" />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </div>

                                {/* User Bio Details */}
                                <div className="flex-1 space-y-2 z-10 mt-2 sm:mt-0">
                                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                                        {user.name}
                                    </h2>
                                    <p className="text-sm font-bold text-indigo-600">
                                        {userDesignation}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100/80 text-slate-500 border border-white shadow-sm">
                                            ID: {user.employee_id || 'N/A'}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50/80 text-emerald-600 border border-emerald-100 shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information Form Card (Glass) */}
                            <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 relative">
                                <form onSubmit={handleInfoSubmit} className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/50 pb-5 gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                <User className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <h3 className="text-lg font-extrabold text-slate-800">
                                                Personal Information
                                            </h3>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-800/20 font-bold rounded-xl px-6 transition-all active:scale-95"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                        {/* Read-Only: Full Name */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ml-1">
                                                Full Name <Lock className="h-3 w-3 text-slate-300 inline" />
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    value={user.name}
                                                    readOnly
                                                    className="h-12 border-white/80 bg-slate-100/50 text-slate-500 cursor-not-allowed pr-10 rounded-xl font-medium shadow-sm"
                                                />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>

                                        {/* Read-Only: Corporate Email */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ml-1">
                                                Corporate Email <Lock className="h-3 w-3 text-slate-300 inline" />
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    value={user.email}
                                                    readOnly
                                                    className="h-12 border-white/80 bg-slate-100/50 text-slate-500 cursor-not-allowed pr-10 rounded-xl font-medium shadow-sm"
                                                />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>

                                        {/* Read-Only: Designation */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ml-1">
                                                Designation <Lock className="h-3 w-3 text-slate-300 inline" />
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    value={userDesignation}
                                                    readOnly
                                                    className="h-12 border-white/80 bg-slate-100/50 text-slate-500 cursor-not-allowed pr-10 rounded-xl font-medium shadow-sm"
                                                />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>

                                        {/* Read-Only: Department */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ml-1">
                                                Department <Lock className="h-3 w-3 text-slate-300 inline" />
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    value={userDept}
                                                    readOnly
                                                    className="h-12 border-white/80 bg-slate-100/50 text-slate-500 cursor-not-allowed pr-10 rounded-xl font-medium shadow-sm"
                                                />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            </div>
                                        </div>

                                        {/* Editable: Phone Number */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                                Phone Number
                                            </Label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="+1 (555) 0123-4567"
                                                    className="h-12 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 pl-11 rounded-xl font-medium shadow-sm"
                                                />
                                            </div>
                                            {errors.phone && (
                                                <p className="text-[11px] font-bold text-red-500 ml-1">{errors.phone}</p>
                                            )}
                                        </div>

                                        {/* Editable: Emergency Contact */}
                                        <div className="space-y-2">
                                            <Label htmlFor="emergency_contact" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                                Emergency Contact
                                            </Label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                                    <Shield className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    id="emergency_contact"
                                                    value={data.emergency_contact}
                                                    onChange={(e) => setData('emergency_contact', e.target.value)}
                                                    placeholder="Name (Relationship)"
                                                    className="h-12 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 pl-11 rounded-xl font-medium shadow-sm"
                                                />
                                            </div>
                                            {errors.emergency_contact && (
                                                <p className="text-[11px] font-bold text-red-500 ml-1">{errors.emergency_contact}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Editable: Bio */}
                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Bio
                                        </Label>
                                        <div className="relative group">
                                            <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <textarea
                                                id="bio"
                                                value={data.bio}
                                                onChange={(e) => setData('bio', e.target.value)}
                                                placeholder="Write a brief introduction about yourself..."
                                                rows={4}
                                                className="flex w-full rounded-xl border border-white/80 bg-white/60 px-4 py-3 pl-11 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 text-slate-800 shadow-sm resize-none transition-all"
                                            />
                                        </div>
                                        {errors.bio && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.bio}</p>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Change Password Form Card (Glass) */}
                            <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 relative">
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/50 pb-5 gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-rose-100 rounded-lg">
                                                <Lock className="h-4 w-4 text-rose-600" />
                                            </div>
                                            <h3 className="text-lg font-extrabold text-slate-800">
                                                Security Settings
                                            </h3>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={passwordProcessing}
                                            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-800/20 font-bold rounded-xl px-6 transition-all active:scale-95"
                                        >
                                            Update Password
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                        {/* Current Password */}
                                        <div className="space-y-2 md:col-span-2 md:w-1/2 md:pr-3">
                                            <Label htmlFor="current_password" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                                Current Password
                                            </Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                className="h-12 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl shadow-sm font-medium"
                                                required
                                            />
                                            {passwordErrors.current_password && (
                                                <p className="text-[11px] font-bold text-red-500 ml-1">{passwordErrors.current_password}</p>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                                New Password
                                            </Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData('new_password', e.target.value)}
                                                className="h-12 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl shadow-sm font-medium"
                                                required
                                            />
                                            {passwordErrors.new_password && (
                                                <p className="text-[11px] font-bold text-red-500 ml-1">{passwordErrors.new_password}</p>
                                            )}
                                        </div>

                                        {/* Confirm New Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password_confirmation" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                                Confirm New Password
                                            </Label>
                                            <Input
                                                id="new_password_confirmation"
                                                type="password"
                                                value={passwordData.new_password_confirmation}
                                                onChange={(e) => setPasswordData('new_password_confirmation', e.target.value)}
                                                className="h-12 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl shadow-sm font-medium"
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right Column (Sidebar Panels) */}
                        <div className="space-y-6 lg:space-y-8">
                        
                            {/* Reporting Manager Card (Glass) */}
                            {manager && (
                                <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 relative overflow-hidden">
                                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-200/40 rounded-full blur-2xl"></div>
                                    <div className="border-b border-white/50 pb-4 mb-5 relative z-10 flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-100 rounded-lg">
                                            <Briefcase className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                            Reporting Manager
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10 mb-6">
                                        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center shrink-0">
                                            {manager.avatar ? (
                                                <img src={manager.avatar} alt={manager.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-black text-slate-400">{manager.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-extrabold text-slate-800">
                                                {manager.name}
                                            </h4>
                                            <p className="text-xs font-bold text-slate-500 mt-0.5">
                                                {manager.designation}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={`mailto:${manager.email}`}
                                        className="relative z-10 flex w-full items-center justify-center gap-2 h-12 bg-white/60 hover:bg-white border border-white/80 text-slate-700 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
                                    >
                                        <Mail className="h-4 w-4 text-indigo-500" /> Message Manager
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}