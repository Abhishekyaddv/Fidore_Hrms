import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import {
    Briefcase,
    Info,
    KeyRound,
    User,
    Loader2,
} from 'lucide-react';
import React, { useEffect } from 'react';

interface AddEmployeeModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    nextEmployeeId?: string;
    employee?: any;
    allUsers?: any[];
}

export function AddEmployeeModal({
    isOpen,
    setIsOpen,
    nextEmployeeId,
    employee,
    allUsers,
}: AddEmployeeModalProps) {
    const isEditMode = !!employee;

    const { data, setData, post, put, processing, errors, reset, clearErrors, setError } = useForm({
        name: employee?.name || '',
        dob: employee?.dob || '',
        gender: employee?.gender || '',
        phone: employee?.phone || '',
        employee_id: employee?.employee_id || nextEmployeeId || '',
        role: employee?.role || 'employee',
        joining_date: employee?.joining_date || new Date().toISOString().split('T')[0],
        employment_type: employee?.employment_type || 'Full-time',
        email: employee?.email || '',
        password: '',
        reporting_manager_id: employee?.reporting_manager_id?.toString() || '',
    });

    // Update Employee ID when nextEmployeeId changes (on successful creations)
    useEffect(() => {
        if (isOpen && !isEditMode && nextEmployeeId) {
            setData('employee_id', nextEmployeeId);
        } else if (isOpen && isEditMode && employee) {
            setData({
                name: employee.name || '',
                dob: employee.dob || '',
                gender: employee.gender || '',
                phone: employee.phone || '',
                employee_id: employee.employee_id || '',
                role: employee.role || 'employee',
                joining_date: employee.joining_date || '',
                employment_type: employee.employment_type || 'Full-time',
                email: employee.email || '',
                password: '',
                reporting_manager_id: employee.reporting_manager_id?.toString() || '',
            });
        }
    }, [nextEmployeeId, isOpen, isEditMode, employee]);

    const availableManagers = (allUsers || []).filter(u => u.id !== employee?.id);

    // Reset when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        clearErrors();
        let hasErrors = false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            setError('email', 'Please enter a valid email address.');
            hasErrors = true;
        }

        if (data.phone) {
            const phoneRegex = /^(?:\+91[\-\s]?)?0?(91)?[6-9]\d{9}$/;
            if (!phoneRegex.test(data.phone)) {
                setError('phone', 'Please enter a valid Indian mobile number.');
                hasErrors = true;
            }
        }

        // Validate password if provided in edit mode
        if (data.password && isEditMode) {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
            if (!passwordRegex.test(data.password)) {
                setError('password', 'Password must be at least 8 characters long, contain an uppercase letter, a number, and a special character.');
                hasErrors = true;
            }
        }

        if (hasErrors) return;

        const handleSuccess = () => {
            console.log('Request successful');
            setIsOpen(false);
            reset();
        };

        if (isEditMode) {
            put(route('admin.employees.update', employee.id), {
                onSuccess: handleSuccess,
                onError: (errors) => console.error('Request errors:', errors),
            });
        } else {
            post(route('admin.employees.store'), {
                onSuccess: handleSuccess,
                onError: (errors) => console.error('Request errors:', errors),
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-[2rem] border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-slate-50/80 backdrop-blur-3xl overflow-x-hidden">
                
                {/* Decorative Background Blobs for Glassmorphism */}
                <div className="absolute -top-32 -right-32 w-72 h-72 bg-indigo-300/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>
                <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-300/40 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header */}
                    <DialogHeader className="p-6 sm:p-8 pb-4 border-b border-white/50 bg-white/40 backdrop-blur-md">
                        <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800">
                            {isEditMode ? 'Edit Employee Profile' : 'Add New Employee'}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
                            {isEditMode 
                                ? 'Update the corporate profile and roles of this employee.' 
                                : 'Create a new corporate profile and assign system roles.'}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                        <div className="p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto">
                            
                            {/* Section 1: Personal Information */}
                            <div className="space-y-5 bg-white/40 p-5 sm:p-6 rounded-2xl border border-white/60 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-indigo-100/80 rounded-lg backdrop-blur-sm border border-indigo-200/50">
                                        <User className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Personal Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                    {/* Full Name */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Jonathan Doe"
                                            className="h-11 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dob" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Date of Birth
                                        </Label>
                                        <Input
                                            id="dob"
                                            type="date"
                                            value={data.dob}
                                            onChange={(e) => setData('dob', e.target.value)}
                                            className="h-11 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                            required
                                        />
                                        {errors.dob && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.dob}</p>
                                        )}
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="gender" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Gender
                                        </Label>
                                        <Select
                                            value={data.gender}
                                            onValueChange={(value) => setData('gender', value)}
                                        >
                                            <SelectTrigger
                                                id="gender"
                                                className="h-11 border-white/80 bg-white/60 text-slate-800 focus:ring-indigo-500/30 focus:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                            >
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="border-white/80 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg">
                                                <SelectItem value="Male" className="rounded-lg hover:bg-slate-100">Male</SelectItem>
                                                <SelectItem value="Female" className="rounded-lg hover:bg-slate-100">Female</SelectItem>
                                                <SelectItem value="Other" className="rounded-lg hover:bg-slate-100">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.gender}</p>
                                        )}
                                    </div>

                                    {/* Contact Details (Phone) */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label htmlFor="phone" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Contact Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+91 00000 00000"
                                            className="h-11 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                        />
                                        {errors.phone && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Professional Details */}
                            <div className="space-y-5 bg-white/40 p-5 sm:p-6 rounded-2xl border border-white/60 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-blue-100/80 rounded-lg backdrop-blur-sm border border-blue-200/50">
                                        <Briefcase className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Professional Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                    {/* Employee ID */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="employee_id" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Employee ID
                                        </Label>
                                        <Input
                                            id="employee_id"
                                            value={data.employee_id}
                                            readOnly
                                            className="h-11 border-white/80 bg-slate-100/50 text-slate-500 cursor-not-allowed rounded-xl font-bold shadow-sm"
                                            required
                                        />
                                        {errors.employee_id && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.employee_id}</p>
                                        )}
                                    </div>

                                    {/* Date of Joining */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="joining_date" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Date of Joining
                                        </Label>
                                        <Input
                                            id="joining_date"
                                            type="date"
                                            value={data.joining_date}
                                            onChange={(e) => setData('joining_date', e.target.value)}
                                            className="h-11 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                            required
                                        />
                                        {errors.joining_date && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.joining_date}</p>
                                        )}
                                    </div>

                                    {/* Employment Type (Segmented Control) */}
                                    <div className="space-y-1.5 md:col-span-2 mt-1">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Employment Type
                                        </Label>
                                        <div className="grid grid-cols-3 gap-2 bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-inner">
                                            {['Full-time', 'Probation', 'Intern'].map((type) => (
                                                <label
                                                    key={type}
                                                    className={`
                                                        flex items-center justify-center h-9 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all cursor-pointer select-none
                                                        ${
                                                            data.employment_type === type
                                                                ? 'bg-white text-indigo-600 shadow-sm border border-white'
                                                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/40'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="employment_type"
                                                        value={type}
                                                        checked={data.employment_type === type}
                                                        onChange={(e) =>
                                                            setData('employment_type', e.target.value)
                                                        }
                                                        className="sr-only"
                                                    />
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.employment_type && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.employment_type}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Account & Role Setup */}
                            <div className="space-y-5 bg-white/40 p-5 sm:p-6 rounded-2xl border border-white/60 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-emerald-100/80 rounded-lg backdrop-blur-sm border border-emerald-200/50">
                                        <KeyRound className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                        Account &amp; Security
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                    {/* Corporate Email */}
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Corporate Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="j.doe@company.com"
                                            className="h-11 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    {isEditMode && (
                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label htmlFor="password" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                                Update Password
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Leave blank to keep current password"
                                                className="h-11 border-white/80 bg-white/60 text-slate-800 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                            />
                                            {errors.password && (
                                                <p className="text-[11px] font-bold text-red-500 ml-1">{errors.password}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Role */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="role" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            System Role
                                        </Label>
                                        <Select
                                            value={data.role}
                                            onValueChange={(value) => setData('role', value)}
                                        >
                                            <SelectTrigger
                                                id="role"
                                                className="h-11 border-white/80 bg-white/60 text-slate-800 focus:ring-indigo-500/30 focus:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                            >
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent className="border-white/80 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg">
                                                <SelectItem value="employee" className="rounded-lg hover:bg-slate-100">Employee</SelectItem>
                                                <SelectItem value="hr" className="rounded-lg hover:bg-slate-100">HR Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.role && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.role}</p>
                                        )}
                                    </div>

                                    {/* Reporting Manager */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="reporting_manager" className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                                            Reporting Manager
                                        </Label>
                                        <Select
                                            value={data.reporting_manager_id}
                                            onValueChange={(value) => setData('reporting_manager_id', value)}
                                        >
                                            <SelectTrigger
                                                id="reporting_manager"
                                                className="h-11 border-white/80 bg-white/60 text-slate-800 focus:ring-indigo-500/30 focus:border-indigo-400 rounded-xl font-medium shadow-sm transition-all"
                                            >
                                                <SelectValue placeholder="Select Manager" />
                                            </SelectTrigger>
                                            <SelectContent className="border-white/80 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg max-h-60">
                                                {availableManagers.length > 0 ? availableManagers.map((mgr) => (
                                                    <SelectItem key={mgr.id} value={mgr.id.toString()} className="rounded-lg hover:bg-slate-100">
                                                        {mgr.name}
                                                    </SelectItem>
                                                )) : (
                                                    <div className="p-3 text-xs font-bold text-slate-400 text-center">No managers found.</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.reporting_manager_id && (
                                            <p className="text-[11px] font-bold text-red-500 ml-1">{errors.reporting_manager_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info Banner */}
                            <div className="p-4 bg-indigo-50/80 backdrop-blur-md border border-indigo-100/50 rounded-2xl flex items-start gap-3 shadow-sm">
                                <div className="p-1 bg-indigo-100 rounded-md shrink-0">
                                    <Info className="h-4 w-4 text-indigo-500" />
                                </div>
                                <p className="text-xs font-semibold text-indigo-800 leading-relaxed mt-0.5">
                                    {isEditMode 
                                        ? "Note: Updating this profile will instantly apply the changes across the workspace."
                                        : "Note: Saving this form will build the new profile. The user can log in immediately with an auto-generated password sent to their email."}
                                </p>
                            </div>
                        </div>

                        {/* Dialog Footer Actions */}
                        <DialogFooter className="p-6 border-t border-white/50 bg-white/40 backdrop-blur-md flex flex-col-reverse sm:flex-row justify-end gap-3 mt-auto relative z-10">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="w-full sm:w-auto bg-white/60 border-white/80 text-slate-600 font-bold hover:bg-white hover:text-slate-800 h-11 px-6 rounded-xl transition-all shadow-sm active:scale-95"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-slate-800/20 border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isEditMode ? 'Update Profile' : 'Save Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}