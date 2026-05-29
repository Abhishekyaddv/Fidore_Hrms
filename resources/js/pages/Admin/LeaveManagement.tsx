import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, Clock, XCircle, Trash2, Shield, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LeaveManagement({ holidays, policies, leaveRequests }: any) {
    const [activeTab, setActiveTab] = useState<'requests' | 'policies' | 'holidays'>('requests');

    // Holiday Form
    const { data: holidayData, setData: setHolidayData, post: postHoliday, reset: resetHoliday, processing: holidayProcessing } = useForm({
        name: '',
        date: '',
        description: '',
    });

    const submitHoliday = (e: React.FormEvent) => {
        e.preventDefault();
        postHoliday(route('admin.leaves.holidays.store'), {
            onSuccess: () => resetHoliday(),
        });
    };

    const deleteHoliday = (id: number) => {
        if (confirm('Delete this holiday?')) {
            router.delete(route('admin.leaves.holidays.destroy', id));
        }
    };

    // Policy Form
    const { data: policyData, setData: setPolicyData, post: postPolicy, processing: policyProcessing } = useForm({
        employment_type: 'Full-time',
        cl: 0,
        sl: 0,
        el: 0,
    });

    // Populate policy form when employment type changes
    const handlePolicyTypeChange = (val: string) => {
        setPolicyData('employment_type', val);
        const existing = policies.find((p: any) => p.employment_type === val);
        if (existing) {
            setPolicyData('cl', existing.cl);
            setPolicyData('sl', existing.sl);
            setPolicyData('el', existing.el);
        } else {
            setPolicyData('cl', 0);
            setPolicyData('sl', 0);
            setPolicyData('el', 0);
        }
    };

    const submitPolicy = (e: React.FormEvent) => {
        e.preventDefault();
        postPolicy(route('admin.leaves.policies.store'));
    };

    // Leave Request Action
    const updateRequestStatus = (id: number, status: string) => {
        router.patch(route('admin.leaves.requests.update', id), { status });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Leave Management', href: '/admin/leaves' }]}>
            <Head title="Leave Management" />
            <div className="flex flex-1 flex-col gap-6 p-6 bg-[#F9FAFB] min-h-screen">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#051C3F]">Leave Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage policies, public holidays, and employee leave requests.</p>
                    </div>
                </div>

                {/* Custom Tabs */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'requests' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('policies')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'policies' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Leave Policies
                    </button>
                    <button
                        onClick={() => setActiveTab('holidays')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'holidays' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Public Holidays
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="mt-4">
                    
                    {/* REQUESTS TAB */}
                    {activeTab === 'requests' && (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                <h2 className="text-lg font-bold text-[#051C3F]">Leave Requests</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-[#F8FAFC] border-b border-gray-200 text-xs uppercase tracking-wider font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4">Leave Type</th>
                                            <th className="px-6 py-4">Duration</th>
                                            <th className="px-6 py-4">Reason</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {leaveRequests.length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No leave requests found.</td></tr>
                                        ) : leaveRequests.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{req.user?.name}</td>
                                                <td className="px-6 py-4 font-bold text-brand-600">{req.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {req.start_date} to {req.end_date}
                                                </td>
                                                <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {req.status === 'pending' && (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => updateRequestStatus(req.id, 'approved')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve">
                                                                <CheckCircle2 className="h-5 w-5" />
                                                            </button>
                                                            <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject">
                                                                <XCircle className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* POLICIES TAB */}
                    {activeTab === 'policies' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Settings className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-lg font-bold text-[#051C3F]">Configure Policy Allowances</h2>
                                </div>
                                <form onSubmit={submitPolicy} className="space-y-5">
                                    <div className="space-y-2">
                                        <Label>Employment Type Target</Label>
                                        <Select value={policyData.employment_type} onValueChange={handlePolicyTypeChange}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Probation">Probation</SelectItem>
                                                <SelectItem value="Full-time">Full-time / Confirmed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Casual (CL)</Label>
                                            <Input type="number" min="0" value={policyData.cl} onChange={e => setPolicyData('cl', Number(e.target.value))} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sick (SL)</Label>
                                            <Input type="number" min="0" value={policyData.sl} onChange={e => setPolicyData('sl', Number(e.target.value))} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Earned (EL)</Label>
                                            <Input type="number" min="0" value={policyData.el} onChange={e => setPolicyData('el', Number(e.target.value))} required />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={policyProcessing} className="w-full bg-brand-600 hover:bg-brand-500">Save Policy Config</Button>
                                </form>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-lg font-bold text-[#051C3F]">Current Policies</h2>
                                </div>
                                <div className="space-y-4 flex-1">
                                    {policies.length === 0 ? <p className="text-gray-500 text-sm">No policies defined.</p> : policies.map((p: any) => (
                                        <div key={p.id} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                                            <h3 className="font-bold text-gray-900 mb-2">{p.employment_type}</h3>
                                            <div className="flex gap-4 text-sm font-medium text-gray-600">
                                                <span>CL: {p.cl}</span>
                                                <span>SL: {p.sl}</span>
                                                <span>EL: {p.el}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HOLIDAYS TAB */}
                    {activeTab === 'holidays' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-[#051C3F] mb-6">Add Public Holiday</h2>
                                <form onSubmit={submitHoliday} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Holiday Name</Label>
                                        <Input value={holidayData.name} onChange={e => setHolidayData('name', e.target.value)} placeholder="e.g. Christmas Day" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                        <Input type="date" value={holidayData.date} onChange={e => setHolidayData('date', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description (Optional)</Label>
                                        <Input value={holidayData.description} onChange={e => setHolidayData('description', e.target.value)} />
                                    </div>
                                    <Button type="submit" disabled={holidayProcessing} className="w-full bg-brand-600 hover:bg-brand-500">Add Holiday</Button>
                                </form>
                            </div>

                            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <h2 className="text-lg font-bold text-[#051C3F]">Holiday Calendar</h2>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-[500px] overflow-auto">
                                    {holidays.length === 0 ? (
                                        <p className="p-6 text-gray-500 text-center">No holidays created yet.</p>
                                    ) : holidays.map((h: any) => (
                                        <div key={h.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                            <div>
                                                <p className="font-bold text-gray-900">{h.name}</p>
                                                <p className="text-sm text-gray-500">{h.date} {h.description && `- ${h.description}`}</p>
                                            </div>
                                            <button onClick={() => deleteHoliday(h.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
