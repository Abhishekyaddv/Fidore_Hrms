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
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Award,
    Briefcase,
    Building2,
    ChevronLeft,
    ChevronRight,
    Info,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Common departments list
const DEPARTMENTS = [
    'Engineering',
    'Design',
    'Marketing',
    'Growth',
    'Finance',
    'People Operations',
];

interface Designation {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    role?: string;
    users_count: number;
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_designations: number;
    active_departments: number;
    unassigned_employees: number;
}

interface DesignationsProps {
    designations: Designation[];
    stats: Stats;
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Designations',
        href: '/admin/designations',
    },
];

export default function Designations({
    designations,
    stats,
    filters,
}: DesignationsProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: '',
        description: '',
        role: 'employee',
    });

    // Handle search input change with Inertia routing
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('admin.designations.index'),
                { search: searchTerm },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Open Modal for Create
    const handleCreateOpen = () => {
        clearErrors();
        reset();
        setEditingDesignation(null);
        setIsOpen(true);
    };

    // Open Modal for Edit
    const handleEditOpen = (designation: Designation) => {
        clearErrors();
        setEditingDesignation(designation);
        setData({
            name: designation.display_name,
            description: designation.description || '',
            role: designation.role || 'employee',
        });
        setIsOpen(true);
    };

    // Submit Create or Edit Form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDesignation) {
            put(route('admin.designations.update', editingDesignation.id), {
                onSuccess: () => {
                    console.log('Request successful');
                    setIsOpen(false);
                    reset();
                },
                onError: (errors) => console.error('Request errors:', errors),
            });
        } else {
            post(route('admin.designations.store'), {
                onSuccess: () => {
                    console.log('Request successful');
                    setIsOpen(false);
                    reset();
                },
                onError: (errors) => console.error('Request errors:', errors),
            });
        }
    };

    // Open Delete Confirmation
    const handleDeleteOpen = (id: number) => {
        setDeletingId(id);
        setIsDeleteOpen(true);
    };

    // Confirm Delete Action
    const confirmDelete = () => {
        if (deletingId) {
            router.delete(route('admin.designations.destroy', deletingId), {
                onSuccess: () => {
                    console.log('Request successful');
                    setIsDeleteOpen(false);
                    setDeletingId(null);
                },
                onError: (errors) => console.error('Request errors:', errors),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Designation Management" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-surface-1 min-h-screen">
                
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                            Designation Management
                        </h1>
                        <p className="text-text-secondary">
                            Configure and organize job titles across all departments.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleCreateOpen}
                            className="bg-brand-600 hover:bg-brand-400 text-surface-0 cursor-pointer shadow-xs border-none"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Create New
                        </Button>
                    </div>
                </div>

                {/* Premium Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Total Designations */}
                    <div className="rounded-xl border border-border bg-surface-0 p-6 flex items-center gap-4 shadow-xs">
                        <div className="p-3 bg-info-bg rounded-lg shrink-0">
                            <Briefcase className="h-6 w-6 text-info-text" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-secondary">
                                Total Designations
                            </p>
                            <h3 className="text-2xl font-bold text-text-primary mt-1">
                                {stats.total_designations}
                            </h3>
                        </div>
                    </div>

                    {/* Card 2: Active Departments */}
                    <div className="rounded-xl border border-border bg-surface-0 p-6 flex items-center gap-4 shadow-xs">
                        <div className="p-3 bg-success-bg rounded-lg shrink-0">
                            <Building2 className="h-6 w-6 text-success-text" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-secondary">
                                Active Departments
                            </p>
                            <h3 className="text-2xl font-bold text-text-primary mt-1">
                                {stats.active_departments}
                            </h3>
                        </div>
                    </div>

                    {/* Card 3: Unassigned Employees */}
                    <div className="rounded-xl border border-border bg-surface-0 p-6 flex items-center gap-4 shadow-xs">
                        <div className="p-3 bg-warning-bg rounded-lg shrink-0">
                            <UserCheck className="h-6 w-6 text-warning-text" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-secondary">
                                Unassigned Employees
                            </p>
                            <h3 className="text-2xl font-bold text-text-primary mt-1">
                                {stats.unassigned_employees}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Table & Search Card */}
                <div className="rounded-xl border border-border bg-surface-0 overflow-hidden shadow-xs">
                    
                    {/* Toolbar */}
                    <div className="p-5 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-0">
                        <h2 className="text-lg font-bold text-text-primary">
                            Current Job Titles
                        </h2>
                        
                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search designations..."
                                className="pl-9 h-10 border-border bg-surface-2 focus-visible:ring-accent-500"
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-text-secondary uppercase bg-surface-2 border-b border-border font-semibold tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Designation Name</th>
                                    <th scope="col" className="px-6 py-4">Headcount</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {designations.length > 0 ? (
                                    designations.map((designation) => (
                                        <tr
                                            key={designation.id}
                                            className="bg-surface-0 border-b border-border hover:bg-surface-1/70 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="font-semibold text-text-primary text-[15px]">
                                                        {designation.display_name}
                                                    </span>
                                                    <span className="ml-2.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium tracking-tight bg-surface-2 text-text-secondary">
                                                        {designation.name}
                                                    </span>
                                                    {designation.description && (
                                                        <p className="text-xs text-text-muted mt-1 max-w-md line-clamp-1">
                                                            {designation.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-text-secondary text-sm">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-2 text-text-secondary">
                                                    {designation.users_count}{' '}
                                                    {designation.users_count === 1
                                                        ? 'Employee'
                                                        : 'Employees'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <button
                                                        onClick={() => handleEditOpen(designation)}
                                                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all cursor-pointer border-none"
                                                        title="Edit Designation"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOpen(designation.id)}
                                                        className="p-2 rounded-lg text-danger-text hover:bg-danger-bg transition-all cursor-pointer border-none"
                                                        title="Delete Designation"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-12 text-center text-text-secondary"
                                        >
                                            No designations found. Click &quot;Create New&quot; to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Indicator (Static placeholder matching screenshots) */}
                    <div className="px-6 py-4 bg-surface-1/50 border-t border-border flex justify-between items-center text-xs text-text-secondary">
                        <span>
                            Showing {designations.length} of{' '}
                            {stats.total_designations} designations
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-border"
                                disabled
                            >
                                <span className="sr-only">Previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-border bg-brand-600 text-surface-0 hover:bg-brand-400"
                            >
                                1
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-border"
                                disabled
                            >
                                <span className="sr-only">Next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create & Edit Modal Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[480px] p-6 gap-6 rounded-xl border border-border shadow-xl bg-surface-0">
                    <DialogHeader className="gap-1 border-b border-border pb-4">
                        <DialogTitle className="text-xl font-bold tracking-tight text-text-primary">
                            {editingDesignation
                                ? 'Edit Designation'
                                : 'Create New Designation'}
                        </DialogTitle>
                        <DialogDescription className="text-text-secondary">
                            Define the parameters for a new organizational role.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Designation Name Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="text-sm font-semibold text-text-secondary"
                            >
                                Designation Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Senior Project Manager"
                                className="h-11 border-border bg-surface-0 text-text-primary focus-visible:ring-accent-500"
                                required
                            />
                            {errors.name && (
                                <p className="text-xs font-semibold text-danger-text mt-1.5 flex items-center gap-1">
                                    <Info className="h-3 w-3 shrink-0" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Department Select Field */}
                        <div className="space-y-2">
                        {/* Access Role Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="role"
                                className="text-sm font-semibold text-text-secondary"
                            >
                                Access Role
                            </Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) => setData('role', value)}
                                required
                            >
                                <SelectTrigger
                                    id="role"
                                    className="h-11 border-border focus:ring-accent-500 text-left bg-transparent"
                                >
                                    <SelectValue placeholder="Select Access Role" />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-surface-0">
                                    <SelectItem value="employee">Standard Employee</SelectItem>
                                    <SelectItem value="hr">HR / Admin</SelectItem>
                                    <SelectItem value="superadmin">Super Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-xs font-semibold text-danger-text mt-1.5 flex items-center gap-1">
                                    <Info className="h-3 w-3 shrink-0" />
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="description"
                                className="text-sm font-semibold text-text-secondary"
                            >
                                Description
                            </Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Briefly describe the key responsibilities and expectations for this role..."
                                rows={4}
                                className="flex w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-500 text-text-primary"
                            />
                            {errors.description && (
                                <p className="text-xs font-semibold text-danger-text mt-1.5 flex items-center gap-1">
                                    <Info className="h-3 w-3 shrink-0" />
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Bottom Info Note */}
                        <div className="p-3 bg-info-bg border border-border rounded-lg flex gap-2.5">
                            <Info className="h-5 w-5 text-info-text shrink-0 mt-0.5" />
                            <p className="text-xs text-info-text leading-normal">
                                Note: This designation will be available across the selected
                                department immediately after creation.
                            </p>
                        </div>

                        {/* Actions Footer */}
                        <DialogFooter className="pt-2 border-t border-border flex flex-row justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="border-border text-text-secondary font-semibold cursor-pointer h-11 px-6 rounded-lg hover:bg-surface-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-brand-600 hover:bg-brand-400 text-surface-0 font-semibold cursor-pointer h-11 px-6 rounded-lg shadow-sm border-none"
                            >
                                {editingDesignation
                                    ? 'Save Changes'
                                    : 'Create Designation'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] p-6 gap-6 rounded-xl border border-border bg-surface-0 shadow-xl">
                    <DialogHeader className="gap-2 text-center sm:text-left">
                        <DialogTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-danger-text shrink-0" /> Confirm
                            Deletion
                        </DialogTitle>
                        <DialogDescription className="text-text-secondary leading-normal text-sm">
                            Are you sure you want to delete this designation? Any employees
                            currently assigned to this designation will be set to
                            unassigned. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-row justify-end gap-3 pt-2 border-t border-border">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="border-border text-text-secondary font-semibold cursor-pointer h-11 px-5 rounded-lg hover:bg-surface-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="bg-danger-text hover:opacity-90 text-surface-0 font-semibold cursor-pointer h-11 px-5 rounded-lg shadow-sm border-none"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
