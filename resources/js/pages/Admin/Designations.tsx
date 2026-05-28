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
    department: string;
    description: string | null;
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
        href: '/admin/dashboard',
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
        department: '',
        description: '',
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
            department: designation.department,
            description: designation.description || '',
        });
        setIsOpen(true);
    };

    // Submit Create or Edit Form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDesignation) {
            put(route('admin.designations.update', editingDesignation.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.designations.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
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
                    setIsDeleteOpen(false);
                    setDeletingId(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Designation Management" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
                
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Designation Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Configure and organize job titles across all departments.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleCreateOpen}
                            className="bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer shadow-xs"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Create New
                        </Button>
                    </div>
                </div>

                {/* Premium Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Total Designations */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex items-center gap-4 shadow-xs">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                            <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Total Designations
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {stats.total_designations}
                            </h3>
                        </div>
                    </div>

                    {/* Card 2: Active Departments */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex items-center gap-4 shadow-xs">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg shrink-0">
                            <Building2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Active Departments
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {stats.active_departments}
                            </h3>
                        </div>
                    </div>

                    {/* Card 3: Unassigned Employees */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex items-center gap-4 shadow-xs">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg shrink-0">
                            <UserCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Unassigned Employees
                            </p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                {stats.unassigned_employees}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Table & Search Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xs">
                    
                    {/* Toolbar */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Current Job Titles
                        </h2>
                        
                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search designations..."
                                className="pl-9 h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300"
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-semibold tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Designation Name</th>
                                    <th scope="col" className="px-6 py-4">Department</th>
                                    <th scope="col" className="px-6 py-4">Headcount</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {designations.length > 0 ? (
                                    designations.map((designation) => (
                                        <tr
                                            key={designation.id}
                                            className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="font-semibold text-slate-900 dark:text-white text-[15px]">
                                                        {designation.display_name}
                                                    </span>
                                                    <span className="ml-2.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium tracking-tight bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                        {designation.name}
                                                    </span>
                                                    {designation.description && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md line-clamp-1">
                                                            {designation.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                {designation.department}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
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
                                                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
                                                        title="Edit Designation"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOpen(designation.id)}
                                                        className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all cursor-pointer"
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
                                            className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                                        >
                                            No designations found. Click &quot;Create New&quot; to add one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Indicator (Static placeholder matching screenshots) */}
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                        <span>
                            Showing {designations.length} of{' '}
                            {stats.total_designations} designations
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800"
                                disabled
                            >
                                <span className="sr-only">Previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800 bg-slate-900 text-white dark:bg-blue-600 dark:border-blue-600 hover:text-white hover:bg-slate-800"
                            >
                                1
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-slate-200 dark:border-slate-800"
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
                <DialogContent className="sm:max-w-[480px] p-6 gap-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
                    <DialogHeader className="gap-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {editingDesignation
                                ? 'Edit Designation'
                                : 'Create New Designation'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                            Define the parameters for a new organizational role.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Designation Name Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                Designation Name
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Senior Project Manager"
                                className="h-11 border-slate-200 dark:border-slate-800 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300"
                                required
                            />
                            {errors.name && (
                                <p className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
                                    <Info className="h-3 w-3 shrink-0" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Department Select Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="department"
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                Department
                            </Label>
                            <Select
                                value={data.department}
                                onValueChange={(value) => setData('department', value)}
                                required
                            >
                                <SelectTrigger
                                    id="department"
                                    className="h-11 border-slate-200 dark:border-slate-800 focus:ring-slate-950 dark:focus:ring-slate-300 text-left bg-transparent"
                                >
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent className="border-slate-200 dark:border-slate-800">
                                    {DEPARTMENTS.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.department && (
                                <p className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
                                    <Info className="h-3 w-3 shrink-0" />
                                    {errors.department}
                                </p>
                            )}
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="description"
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                Description
                            </Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Briefly describe the key responsibilities and expectations for this role..."
                                rows={4}
                                className="flex w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.description && (
                                <p className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
                                    <Info className="h-3 w-3 shrink-0" />
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Bottom Info Note */}
                        <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-950 rounded-lg flex gap-2.5">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-normal">
                                Note: This designation will be available across the selected
                                department immediately after creation.
                            </p>
                        </div>

                        {/* Actions Footer */}
                        <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-row justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="border-slate-200 dark:border-slate-800 font-semibold cursor-pointer h-11 px-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-[#0f172a] hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 font-semibold cursor-pointer h-11 px-6 rounded-lg shadow-sm"
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
                <DialogContent className="sm:max-w-[400px] p-6 gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl">
                    <DialogHeader className="gap-2 text-center sm:text-left">
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-rose-500 shrink-0" /> Confirm
                            Deletion
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 leading-normal text-sm">
                            Are you sure you want to delete this designation? Any employees
                            currently assigned to this designation will be set to
                            unassigned. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-row justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                            className="border-slate-200 dark:border-slate-800 font-semibold cursor-pointer h-11 px-5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer h-11 px-5 rounded-lg shadow-sm"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
