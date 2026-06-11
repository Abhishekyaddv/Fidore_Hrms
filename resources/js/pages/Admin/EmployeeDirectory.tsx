import { AddEmployeeModal } from '@/components/add-employee-modal';
import { ViewAttendanceModal } from '@/components/view-attendance-modal';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    Filter,
    HelpCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    Users,
    CalendarDays,
} from 'lucide-react';
import { useState } from 'react';

export default function EmployeeDirectory({
    employees,
    totalStaff,
    activeNow,
    designations,
    nextEmployeeId,
}: any) {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
        (emp.designation?.display_name || emp.role).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex w-full flex-col bg-[#F9FAFB] min-h-screen">
                <Head title="Employee Directory" />
                
                {/* Top Navbar */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
                    <div className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
                        <Search className="h-4 w-4 text-gray-400 shrink-0" />
                        <Input 
                            type="text" 
                            placeholder="Search employees or roles..." 
                            className="h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0 shadow-none w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-6 ml-auto">
                        <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            <HelpCircle className="h-5 w-5" />
                        </button>
                        <Button 
                            className="bg-[#0D4E78] hover:bg-[#0A3D5E] text-white rounded-md px-4 py-2 flex items-center gap-2 font-medium"
                            onClick={handleAddClick}
                        >
                            <Plus className="h-4 w-4" /> Add Employee
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    <div className="mx-auto max-w-7xl">
                        
                        {/* Page Stats */}
                        <div className="flex justify-end gap-6 mb-8">
                            <div className="flex gap-4">
                                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[200px] shadow-sm">
                                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                        <Users className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Staff</p>
                                        <h3 className="text-2xl font-bold text-[#051C3F]">{totalStaff}</h3>
                                    </div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 min-w-[200px] shadow-sm">
                                    <div className="bg-green-50 p-3 rounded-lg text-green-600">
                                        <UserCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Now</p>
                                        <h3 className="text-2xl font-bold text-[#051C3F]">{activeNow}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>



                        {/* Data Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-700 font-semibold text-xs tracking-wider uppercase">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-[#051C3F]">Employee</th>
                                            <th className="px-6 py-4 font-semibold text-[#051C3F]">Role</th>
                                            <th className="px-6 py-4 font-semibold text-[#051C3F]">Status</th>
                                            <th className="px-6 py-4 font-semibold text-[#051C3F] text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredEmployees.map((emp: any) => (
                                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden">
                                                            {emp.avatar ? (
                                                                <img src={emp.avatar} alt={emp.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                emp.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#051C3F]">{emp.name}</p>
                                                            <p className="text-xs text-gray-500">{emp.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {emp.designation?.display_name || emp.role}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {/* We can fake status for now or use actual */}
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 uppercase">
                                                        ACTIVE
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            onClick={() => openEditModal(emp)}
                                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => openAttendanceModal(emp)}
                                                            className="text-emerald-500 hover:text-emerald-700 transition-colors"
                                                            title="View Attendance"
                                                        >
                                                            <CalendarDays className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={emp.role === 'admin' || emp.role === 'superadmin' ? undefined : () => handleDelete(emp.id)}
                                                            className={`transition-colors ${emp.role === 'admin' || emp.role === 'superadmin' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}`}
                                                            title={emp.role === 'admin' || emp.role === 'superadmin' ? "Cannot delete admin" : "Delete"}
                                                            disabled={emp.role === 'admin' || emp.role === 'superadmin'}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredEmployees.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    No employees found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {employees.links && (
                                <div className="border-t border-gray-100 bg-white px-6 py-4 flex items-center justify-between">
                                    <p className="text-xs text-gray-500 font-medium">
                                        Showing {employees.from || 0} to {employees.to || 0} of {employees.total || 0} employees
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {employees.links.map((link: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                disabled={!link.url}
                                                className={`h-8 px-3 rounded-md border text-sm font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-[#4CB5F9] text-white border-[#4CB5F9]'
                                                        : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </main>
            </div>

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                setIsOpen={setIsAddModalOpen}
                designations={designations}
                nextEmployeeId={nextEmployeeId}
                employee={editingEmployee}
                allUsers={employeeList}
            />

            <ViewAttendanceModal 
                isOpen={isAttendanceModalOpen}
                setIsOpen={setIsAttendanceModalOpen}
                employee={selectedEmployeeForAttendance}
            />
        </SidebarProvider>
    );
}
