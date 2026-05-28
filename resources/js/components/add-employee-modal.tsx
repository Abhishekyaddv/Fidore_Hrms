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
} from 'lucide-react';
import React, { useEffect } from 'react';

interface Designation {
    id: number;
    name: string;
    display_name: string;
    department: string;
}

interface AddEmployeeModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    designations: Designation[];
    nextEmployeeId: string;
}

const DEPARTMENTS = [
    'Engineering',
    'Design',
    'Marketing',
    'Growth',
    'Finance',
    'People Operations',
];

export function AddEmployeeModal({
    isOpen,
    setIsOpen,
    designations,
    nextEmployeeId,
}: AddEmployeeModalProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        dob: '',
        gender: '',
        phone: '',
        employee_id: nextEmployeeId,
        designation_id: '',
        department: '',
        joining_date: new Date().toISOString().split('T')[0],
        employment_type: 'Full-time',
        email: '',
        password: '',
        role: 'employee',
    });

    // Update Employee ID when nextEmployeeId changes (on successful creations)
    useEffect(() => {
        if (isOpen) {
            setData('employee_id', nextEmployeeId);
        }
    }, [nextEmployeeId, isOpen]);

    // Reset when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.employees.store'), {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-6 gap-6 rounded-xl border border-border shadow-xl bg-surface-0">
                <DialogHeader className="gap-1 border-b border-border pb-4">
                    <DialogTitle className="text-xl font-bold tracking-tight text-text-primary">
                        Add New Employee
                    </DialogTitle>
                    <DialogDescription className="text-text-secondary">
                        Create a new corporate profile and assign system roles.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Personal Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-border pb-2">
                            <User className="h-5 w-5 text-text-muted shrink-0" />
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                                Personal Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-text-secondary">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Jonathan Doe"
                                    className="h-10 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs font-medium text-danger-text">{errors.name}</p>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-1.5">
                                <Label htmlFor="dob" className="text-xs font-semibold text-text-secondary">
                                    Date of Birth
                                </Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={data.dob}
                                    onChange={(e) => setData('dob', e.target.value)}
                                    className="h-10 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500"
                                />
                                {errors.dob && (
                                    <p className="text-xs font-medium text-danger-text">{errors.dob}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="space-y-1.5">
                                <Label htmlFor="gender" className="text-xs font-semibold text-text-secondary">
                                    Gender
                                </Label>
                                <Select
                                    value={data.gender}
                                    onValueChange={(value) => setData('gender', value)}
                                >
                                    <SelectTrigger
                                        id="gender"
                                        className="h-10 border-border focus:ring-accent-500 bg-transparent text-left text-text-primary"
                                    >
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent className="border-border bg-surface-0">
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && (
                                    <p className="text-xs font-medium text-danger-text">{errors.gender}</p>
                                )}
                            </div>

                            {/* Contact Details (Phone) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="phone" className="text-xs font-semibold text-text-secondary">
                                    Contact Details (Phone)
                                </Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="h-10 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500"
                                />
                                {errors.phone && (
                                    <p className="text-xs font-medium text-danger-text">{errors.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Professional Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-border pb-2">
                            <Briefcase className="h-5 w-5 text-text-muted shrink-0" />
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                                Professional Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Employee ID */}
                            <div className="space-y-1.5">
                                <Label htmlFor="employee_id" className="text-xs font-semibold text-text-secondary">
                                    Employee ID
                                </Label>
                                <Input
                                    id="employee_id"
                                    value={data.employee_id}
                                    readOnly
                                    className="h-10 border-border bg-surface-2 cursor-not-allowed text-text-muted font-medium"
                                    required
                                />
                                {errors.employee_id && (
                                    <p className="text-xs font-medium text-danger-text">{errors.employee_id}</p>
                                )}
                            </div>

                            {/* Designation */}
                            <div className="space-y-1.5">
                                <Label htmlFor="designation" className="text-xs font-semibold text-text-secondary">
                                    Designation
                                </Label>
                                <Select
                                    value={data.designation_id}
                                    onValueChange={(value) => setData('designation_id', value)}
                                >
                                    <SelectTrigger
                                        id="designation"
                                        className="h-10 border-border focus:ring-accent-500 bg-transparent text-left text-text-primary"
                                    >
                                        <SelectValue placeholder="Select Designation" />
                                    </SelectTrigger>
                                    <SelectContent className="border-border bg-surface-0">
                                        {designations.map((desg) => (
                                            <SelectItem key={desg.id} value={desg.id.toString()}>
                                                {desg.display_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.designation_id && (
                                    <p className="text-xs font-medium text-danger-text">{errors.designation_id}</p>
                                )}
                            </div>

                            {/* Department */}
                            <div className="space-y-1.5">
                                <Label htmlFor="department" className="text-xs font-semibold text-text-secondary">
                                    Department
                                </Label>
                                <Select
                                    value={data.department}
                                    onValueChange={(value) => setData('department', value)}
                                    required
                                >
                                    <SelectTrigger
                                        id="department"
                                        className="h-10 border-border focus:ring-accent-500 bg-transparent text-left text-text-primary"
                                    >
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent className="border-border bg-surface-0">
                                        {DEPARTMENTS.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.department && (
                                    <p className="text-xs font-medium text-danger-text">{errors.department}</p>
                                )}
                            </div>

                            {/* Date of Joining */}
                            <div className="space-y-1.5">
                                <Label htmlFor="joining_date" className="text-xs font-semibold text-text-secondary">
                                    Date of Joining
                                </Label>
                                <Input
                                    id="joining_date"
                                    type="date"
                                    value={data.joining_date}
                                    onChange={(e) => setData('joining_date', e.target.value)}
                                    className="h-10 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500"
                                    required
                                />
                                {errors.joining_date && (
                                    <p className="text-xs font-medium text-danger-text">{errors.joining_date}</p>
                                )}
                            </div>

                            {/* Employment Type */}
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs font-semibold text-text-secondary">
                                    Employment Type
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Full-time', 'Contract', 'Intern'].map((type) => (
                                        <label
                                            key={type}
                                            className={`
                                                flex items-center justify-center h-10 rounded-lg border text-xs font-semibold tracking-tight transition-all cursor-pointer select-none
                                                ${
                                                    data.employment_type === type
                                                        ? 'bg-brand-600 border-brand-600 text-surface-0'
                                                        : 'border-border bg-transparent text-text-secondary hover:bg-surface-2'
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
                                    <p className="text-xs font-medium text-danger-text">{errors.employment_type}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Account & Role Setup */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-border pb-2">
                            <KeyRound className="h-5 w-5 text-text-muted shrink-0" />
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                                Account &amp; Role Setup
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Corporate Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-text-secondary">
                                    Corporate Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="j.doe@company.com"
                                    className="h-10 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-xs font-medium text-danger-text">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold text-text-secondary">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="h-10 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500"
                                    required
                                />
                                {errors.password && (
                                    <p className="text-xs font-medium text-danger-text">{errors.password}</p>
                                )}
                            </div>

                            {/* Access Role */}
                            <div className="space-y-1.5">
                                <Label htmlFor="role" className="text-xs font-semibold text-text-secondary">
                                    Access Role
                                </Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(value) => setData('role', value)}
                                >
                                    <SelectTrigger
                                        id="role"
                                        className="h-10 border-border focus:ring-accent-500 bg-transparent text-left text-text-primary"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-border bg-surface-0">
                                        <SelectItem value="hr">HR</SelectItem>
                                        <SelectItem value="employee">Standard Employee</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && (
                                    <p className="text-xs font-medium text-danger-text">{errors.role}</p>
                                )}
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div className="p-3 bg-info-bg border border-border rounded-lg flex gap-2.5">
                            <Info className="h-5 w-5 text-info-text shrink-0 mt-0.5" />
                            <p className="text-xs text-info-text leading-normal">
                                Note: Saving this form will instantly build the new profile. The user can log in immediately.
                            </p>
                        </div>
                    </div>

                    {/* Dialog Footer Actions */}
                    <DialogFooter className="pt-4 border-t border-border flex flex-row justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="border-border text-text-secondary font-semibold cursor-pointer h-10 px-5 rounded-lg hover:bg-surface-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-brand-600 hover:bg-brand-400 text-surface-0 font-semibold cursor-pointer h-10 px-5 rounded-lg shadow-sm border-none"
                        >
                            Save Employee Profile
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
