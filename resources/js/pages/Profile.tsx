import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Award,
    Building2,
    Camera,
    CheckCircle2,
    Lock,
    Mail,
    Phone,
    User,
    Shield,
    FileText,
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
            title: 'Dashboard',
            href: '/dashboard',
        },
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

    // Avatar upload
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('avatar', file);
            router.post(route('profile.update_avatar'), formData, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Request successful');
                    setAvatarFile(null);
                },
                onError: (errors) => console.error('Request errors:', errors),
            });
        }
    };

    // Fallback values matchingJulian spec
    const userDesignation = user.designation?.display_name || 'Unassigned Role';
    const userDept = user.department || 'People Operations';
    const userLocation = 'HQ - New York'; // Branded location

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-surface-1 min-h-screen">
                
                {/* Profile Grid Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Left & Middle Column (Profile Header & Forms) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Premium Profile Header Card */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-xs">
                            {/* Round Avatar with upload hover trigger */}
                            <div className="relative shrink-0 group cursor-pointer" onClick={handleAvatarClick}>
                                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-brand-600 bg-surface-2 flex items-center justify-center relative">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-10 w-10 text-text-muted" />
                                    )}
                                    {/* Camera Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                {/* Small round floating camera icon */}
                                <div className="absolute bottom-0 right-0 p-1.5 bg-brand-600 rounded-full border border-surface-0 shadow-sm text-surface-0">
                                    <Camera className="h-3 w-3" />
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
                            <div className="flex-1 text-center sm:text-left space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                                    {user.name}
                                </h2>
                                <p className="text-sm font-medium text-text-secondary">
                                    {userDesignation}
                                </p>
                                
                                {/* Badges */}
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-success-bg text-success-text border border-success-text/10">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Employee
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-info-bg text-info-text border border-info-text/10">
                                        <Building2 className="h-3.5 w-3.5 animate-pulse" /> {userLocation}
                                    </span>
                                </div>
                            </div>

                            {/* Direct Photo Update Trigger CTA */}
                            <Button
                                onClick={handleAvatarClick}
                                className="bg-brand-600 hover:bg-brand-400 text-surface-0 cursor-pointer shadow-xs border-none font-semibold"
                            >
                                Update Photo
                            </Button>
                        </div>

                        {/* Personal Information Form Card */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 shadow-xs">
                            <form onSubmit={handleInfoSubmit} className="space-y-6">
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-text-muted" />
                                        <h3 className="text-lg font-bold text-text-primary">
                                            Personal Information
                                        </h3>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-accent-500 hover:bg-accent-700 text-white cursor-pointer shadow-sm border-none font-semibold px-5"
                                    >
                                        Save Changes
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Read-Only: Full Name */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                                            Full Name <Lock className="h-3 w-3 text-text-muted inline" />
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={user.name}
                                                readOnly
                                                className="h-10 border-border bg-surface-2 text-text-muted cursor-not-allowed pr-9"
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                                        </div>
                                    </div>

                                    {/* Read-Only: Corporate Email */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                                            Corporate Email <Lock className="h-3 w-3 text-text-muted inline" />
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={user.email}
                                                readOnly
                                                className="h-10 border-border bg-surface-2 text-text-muted cursor-not-allowed pr-9"
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                                        </div>
                                    </div>

                                    {/* Read-Only: Designation */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                                            Designation <Lock className="h-3 w-3 text-text-muted inline" />
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={userDesignation}
                                                readOnly
                                                className="h-10 border-border bg-surface-2 text-text-muted cursor-not-allowed pr-9"
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                                        </div>
                                    </div>

                                    {/* Read-Only: Department */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                                            Department <Lock className="h-3 w-3 text-text-muted inline" />
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                value={userDept}
                                                readOnly
                                                className="h-10 border-border bg-surface-2 text-text-muted cursor-not-allowed pr-9"
                                            />
                                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
                                        </div>
                                    </div>

                                    {/* Editable: Phone Number */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone" className="text-xs font-semibold text-text-secondary">
                                            Phone Number
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="+1 (555) 0123-4567"
                                                className="h-10 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500 pl-9"
                                            />
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-xs font-medium text-danger-text">{errors.phone}</p>
                                        )}
                                    </div>

                                    {/* Editable: Emergency Contact */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="emergency_contact" className="text-xs font-semibold text-text-secondary">
                                            Emergency Contact
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="emergency_contact"
                                                value={data.emergency_contact}
                                                onChange={(e) => setData('emergency_contact', e.target.value)}
                                                placeholder="Name (Relationship)"
                                                className="h-10 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500 pl-9"
                                            />
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                        </div>
                                        {errors.emergency_contact && (
                                            <p className="text-xs font-medium text-danger-text">{errors.emergency_contact}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Editable: Bio */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="bio" className="text-xs font-semibold text-text-secondary">
                                        Bio
                                    </Label>
                                    <div className="relative">
                                        <textarea
                                            id="bio"
                                            value={data.bio}
                                            onChange={(e) => setData('bio', e.target.value)}
                                            placeholder="Write a brief introduction about yourself, your skills, or achievements..."
                                            rows={5}
                                            className="flex w-full rounded-md border border-border bg-surface-0 px-3 py-2 pl-9 text-sm placeholder:text-text-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-500 text-text-primary"
                                        />
                                        <FileText className="absolute left-3 top-3.5 h-4 w-4 text-text-muted" />
                                    </div>
                                    {errors.bio && (
                                        <p className="text-xs font-medium text-danger-text">{errors.bio}</p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column (Sidebar Panels) */}
                    <div className="space-y-6">
                        
                        {/* Branded Performance Level Card */}
                        <div className="rounded-xl border border-brand-800 bg-brand-900 text-white dark:bg-brand-50 p-6 space-y-5 shadow-sm">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">
                                    Performance Level
                                </p>
                                <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
                                    Top Tier Professional
                                </h3>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-semibold">
                                    <span className="text-brand-200">Profile Completion</span>
                                    <span className="text-white">85%</span>
                                </div>
                                <div className="h-2 w-full bg-brand-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-500 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Expertise Card */}
                        <div className="rounded-xl border border-border bg-surface-0 p-6 space-y-4 shadow-xs">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <Award className="h-5 w-5 text-text-muted" />
                                <h3 className="text-base font-bold text-text-primary">
                                    Expertise
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['UI/UX Design', 'Design Systems', 'Strategic Planning', 'React', 'Human Factors'].map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-md text-xs font-medium bg-surface-2 text-text-secondary border border-border"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Reporting Manager Card */}
                        {manager && (
                            <div className="rounded-xl border border-border bg-surface-0 p-6 space-y-4 shadow-xs">
                                <div className="border-b border-border pb-3">
                                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Reporting Manager
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full overflow-hidden bg-surface-2 border border-border flex items-center justify-center shrink-0">
                                        {manager.avatar ? (
                                            <img src={manager.avatar} alt={manager.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-text-muted" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-text-primary">
                                            {manager.name}
                                        </h4>
                                        <p className="text-xs text-text-secondary mt-0.5">
                                            {manager.designation}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={`mailto:${manager.email}`}
                                    className="flex w-full items-center justify-center gap-2 h-10 border border-accent-200 text-accent-700 hover:bg-accent-50 rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                                >
                                    <Mail className="h-4 w-4" /> Contact Manager
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
