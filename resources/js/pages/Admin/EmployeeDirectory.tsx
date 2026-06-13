import { AddEmployeeModal } from '@/components/add-employee-modal';
import { ViewAttendanceModal } from '@/components/view-attendance-modal';
import { ActiveEmployeesModal } from '@/components/active-employees-modal';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Bell,
    HelpCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    Users,
    CalendarDays,
    Briefcase
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    {
        title: 'Directory',
        href: '/employees',
    },
];

export default function EmployeeDirectory({
    employees,
    totalStaff,
    activeNow,
    nextEmployeeId,
    activeEmployeesList = [],
}: any) {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isActiveEmployeesOpen, setIsActiveEmployeesOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState<any>(null);

    const openAttendanceModal = (emp: any) => {
        setSelectedEmployeeForAttendance(emp);
        setIsAttendanceModalOpen(true);
    };

    const openEditModal = (emp: any) => {
        setEditingEmployee(emp);
        setIsAddModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingEmployee(null);
        setIsAddModalOpen(true);
    };

    const handleDelete = (empId: number) => {
        if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            router.delete(route('admin.employees.destroy', empId), {
                onSuccess: () => console.log('Request successful'),
                onError: (errors) => console.error('Request errors:', errors),
            });
        }
    };

    const employeeList = employees.data || employees;
    const filteredEmployees = employeeList.filter((emp: any) => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.role).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Directory" />
            
            {/* Main Wrapper with decorative glassmorphism background */}
            <div className="relative flex flex-1 flex-col p-4 sm:p-6 lg:p-8 min-h-screen overflow-hidden bg-slate-50">
                
                {/* Background Blur Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-10000 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-300/30 rounded-full blur-[100px] mix-blend-multiply animate-pulse duration-10000 delay-1000 pointer-events-none"></div>
                <div className="absolute top-[40%] left-[60%] w-[30rem] h-[30rem] bg-emerald-300/20 rounded-full blur-[80px] mix-blend-multiply pointer-events-none"></div>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col gap-6 lg:gap-8 w-full max-w-[1400px] mx-auto">
                    
                    {/* Header & Global Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="w-full md:w-auto flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Directory</h1>
                                <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Manage your team members and roles.</p>
                            </div>
                            
                            {/* Mobile utility icons (hidden on desktop) */}
                            <div className="flex md:hidden items-center gap-3">
                                <button className="p-2 bg-white/50 backdrop-blur-md rounded-full text-slate-500 hover:text-slate-800 border border-white shadow-sm">
                                    <Bell className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Search Input (Glass) */}
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search employees..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm transition-all"
                                />
                            </div>

                            {/* Desktop utility icons */}
                            <div className="hidden md:flex items-center gap-2 px-2">
                                <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/50 transition-all">
                                    <Bell className="h-5 w-5" />
                                </button>
                                <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/50 transition-all">
                                    <HelpCircle className="h-5 w-5" />
                                </button>
                            </div>

                            <button 
                                onClick={handleAddClick}
                                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white rounded-2xl px-6 py-2.5 flex items-center justify-center gap-2 font-bold shadow-lg shadow-slate-800/20 transition-all active:scale-95 border border-slate-700"
                            >
                                <Plus className="h-4 w-4" /> Add Employee
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        {/* Total Staff Card */}
                        <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative overflow-hidden flex items-center gap-5">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-200/40 rounded-full blur-2xl"></div>
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 relative z-10">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Total Staff</p>
                                <h3 className="text-3xl font-black text-slate-800 mt-1">{totalStaff}</h3>
                            </div>
                        </div>

                        {/* Active Now Card */}
                        <div 
                            onClick={() => setIsActiveEmployeesOpen(true)}
                            className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 relative overflow-hidden flex items-center gap-5 cursor-pointer group hover:-translate-y-1 transition-all"
                        >
                            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-emerald-200/40 rounded-full blur-2xl"></div>
                            <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 relative z-10">
                                <UserCheck className="h-6 w-6 text-white" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-600 transition-colors">Active Now</p>
                                <h3 className="text-3xl font-black text-slate-800 mt-1">{activeNow}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Employee Data Section */}
                    <div className="rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
                        
                        {/* Empty State */}
                        {filteredEmployees.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mb-4 shadow-sm border border-white">
                                    <Search className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">No employees found</h3>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your search criteria.</p>
                            </div>
                        )}

                        {/* Mobile View: Card Stack (Hidden on md+) */}
                        <div className="md:hidden flex flex-col p-4 gap-4">
                            {filteredEmployees.map((emp: any) => (
                                <div key={emp.id} className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                                    {/* Mobile Header: Avatar & Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden shadow-inner border-2 border-white">
                                            {emp.avatar ? (
                                                <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" />
                                            ) : (
                                                emp.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-extrabold text-slate-800">{emp.name}</h3>
                                            <p className="text-xs font-medium text-slate-500 truncate">{emp.email}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Details */}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="bg-slate-100/50 rounded-xl p-3 border border-white">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                                            <p className="text-sm font-semibold text-slate-700 capitalize flex items-center gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                                {emp.role}
                                            </p>
                                        </div>
                                        <div className="bg-slate-100/50 rounded-xl p-3 border border-white">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-sm font-bold text-emerald-700">Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="flex gap-2 mt-2 pt-4 border-t border-white/60">
                                        <button 
                                            onClick={() => openEditModal(emp)}
                                            className="flex-1 bg-white hover:bg-slate-50 text-slate-600 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-slate-200 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Pencil className="h-4 w-4" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => openAttendanceModal(emp)}
                                            className="flex-1 bg-white hover:bg-slate-50 text-indigo-600 py-2.5 rounded-xl text-sm font-bold shadow-sm border border-slate-200 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <CalendarDays className="h-4 w-4" /> History
                                        </button>
                                        <button 
                                            onClick={emp.role === 'admin' || emp.role === 'superadmin' ? undefined : () => handleDelete(emp.id)}
                                            disabled={emp.role === 'admin' || emp.role === 'superadmin'}
                                            className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${
                                                emp.role === 'admin' || emp.role === 'superadmin' 
                                                ? 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed' 
                                                : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100 shadow-sm'
                                            }`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Glass Table (Hidden on sm) */}
                        <div className="hidden md:block overflow-x-auto w-full">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-100/40 border-b border-white/60 backdrop-blur-md">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Employee</th>
                                        <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 font-black text-slate-500 text-[10px] uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/40">
                                    {filteredEmployees.map((emp: any) => (
                                        <tr key={emp.id} className="hover:bg-white/40 transition-colors duration-200 group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold overflow-hidden shadow-inner border border-white/50">
                                                        {emp.avatar ? (
                                                            <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            emp.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                                                        <p className="text-xs font-medium text-slate-500">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 capitalize bg-slate-100/50 px-3 py-1.5 rounded-lg border border-white/60">
                                                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                                    {emp.role}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-1.5 bg-emerald-50/80 border border-emerald-200 px-3 py-1.5 rounded-lg">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Active</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <button 
                                                        onClick={() => openEditModal(emp)}
                                                        className="p-2 bg-white/60 hover:bg-white text-indigo-600 rounded-lg shadow-sm border border-white/80 transition-all active:scale-95"
                                                        title="Edit Details"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => openAttendanceModal(emp)}
                                                        className="p-2 bg-white/60 hover:bg-white text-blue-600 rounded-lg shadow-sm border border-white/80 transition-all active:scale-95"
                                                        title="View Attendance"
                                                    >
                                                        <CalendarDays className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={emp.role === 'admin' || emp.role === 'superadmin' ? undefined : () => handleDelete(emp.id)}
                                                        disabled={emp.role === 'admin' || emp.role === 'superadmin'}
                                                        className={`p-2 rounded-lg shadow-sm border transition-all active:scale-95 ${
                                                            emp.role === 'admin' || emp.role === 'superadmin' 
                                                            ? 'bg-slate-100/50 text-slate-300 border-transparent cursor-not-allowed' 
                                                            : 'bg-white/60 hover:bg-red-50 text-red-500 hover:text-red-600 border-white/80 hover:border-red-200'
                                                        }`}
                                                        title={emp.role === 'admin' || emp.role === 'superadmin' ? "Cannot delete admin" : "Delete Employee"}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {employees.links && filteredEmployees.length > 0 && (
                            <div className="border-t border-white/60 bg-white/30 backdrop-blur-md px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                    Showing {employees.from || 0} to {employees.to || 0} of {employees.total || 0}
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {employees.links.map((link: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                            disabled={!link.url}
                                            className={`h-9 px-3.5 rounded-xl border text-sm font-bold transition-all active:scale-95 flex items-center justify-center ${
                                                link.active
                                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-transparent shadow-md shadow-indigo-500/20'
                                                    : 'bg-white/60 text-slate-600 border-white/80 hover:bg-white shadow-sm'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed bg-transparent border-transparent shadow-none' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                setIsOpen={setIsAddModalOpen}
                nextEmployeeId={nextEmployeeId}
                employee={editingEmployee}
                allUsers={employeeList}
            />

            <ViewAttendanceModal 
                isOpen={isAttendanceModalOpen}
                setIsOpen={setIsAttendanceModalOpen}
                employee={selectedEmployeeForAttendance}
            />

            <ActiveEmployeesModal
                isOpen={isActiveEmployeesOpen}
                setIsOpen={setIsActiveEmployeesOpen}
                employees={activeEmployeesList}
            />
        </AppLayout>
    );
}