import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Head, usePage } from '@inertiajs/react';
import { 
    CalendarDays, 
    FileText, 
    Gavel, 
    Plus, 
    Search, 
    Timer, 
    Bell, 
    Settings, 
    ExternalLink,
    Clock,
    Users,
    BarChart3,
    MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import { AddPolicyModal } from '@/components/add-policy-modal';

export default function CompanyPolicies({ policies = [] }: any) {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const isAdmin = user.role === 'hr' || user.role === 'superadmin';

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPolicies = policies.filter((p: any) => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Distribution stats
    const complianceCount = policies.filter((p: any) => p.category === 'Compliance').length;
    const benefitsCount = policies.filter((p: any) => p.category === 'Benefits').length;
    const draftsCount = policies.filter((p: any) => p.status === 'Draft').length;

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'calendar-days': return <CalendarDays className="h-6 w-6 text-[#0D4E78]" />;
            case 'timer': return <Timer className="h-6 w-6 text-[#0D4E78]" />;
            case 'gavel': return <Gavel className="h-6 w-6 text-[#0D4E78]" />;
            default: return <FileText className="h-6 w-6 text-[#0D4E78]" />;
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex w-full flex-col bg-[#F9FAFB] min-h-screen">
                <Head title="Company Policies" />
                
                {/* Top Navbar */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-[#051C3F] hidden md:block">HRMS Portal</span>
                        <div className="flex ml-4 w-full max-w-sm items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
                            <Search className="h-4 w-4 text-gray-400 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Search policies..." 
                                className="h-auto border-0 bg-transparent p-0 text-sm focus-visible:ring-0 shadow-none w-full outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-auto">
                        <button className="text-[#0D4E78] hover:bg-blue-50 p-2 rounded-full transition-colors">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="text-[#0D4E78] hover:bg-blue-50 p-2 rounded-full transition-colors">
                            <Settings className="h-5 w-5" />
                        </button>
                        <div className="h-8 w-8 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden border border-gray-200">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    <div className="mx-auto max-w-6xl">
                        
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-[#051C3F] tracking-tight">Company Policies</h1>
                                <p className="text-gray-500 text-sm mt-1">Manage, update, and publish official company guidelines.</p>
                            </div>
                            {isAdmin && (
                                <Button 
                                    className="bg-[#0D4E78] hover:bg-[#0A3D5E] text-white rounded-md px-4 py-2 flex items-center gap-2 font-medium"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    <Plus className="h-4 w-4" /> Add New Policy
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            
                            {/* Left Sidebar */}
                            <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                                
                                {/* Policy Distribution */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                    <div className="flex items-center gap-2 text-[#051C3F] font-bold mb-4">
                                        <BarChart3 className="h-5 w-5 text-[#4CB5F9]" />
                                        Policy Distribution
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <span className="text-sm font-medium text-gray-700">Compliance</span>
                                            <span className="bg-[#4CB5F9] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{complianceCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <span className="text-sm font-medium text-gray-700">Benefits</span>
                                            <span className="bg-[#4CB5F9] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{benefitsCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <span className="text-sm font-medium text-gray-700">Drafts</span>
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{draftsCount}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* System Health */}
                                <div className="bg-[#051C3F] rounded-xl p-6 shadow-sm text-white">
                                    <h3 className="text-xs font-bold tracking-widest text-blue-200/80 uppercase mb-4">System Health</h3>
                                    <div className="text-4xl font-bold mb-2">98.5%</div>
                                    <p className="text-sm text-blue-100/80 leading-relaxed mb-6">
                                        Employee acknowledgment rate is up 4% from last month.
                                    </p>
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full border-2 border-[#051C3F] bg-gray-300"></div>
                                        <div className="w-8 h-8 rounded-full border-2 border-[#051C3F] bg-gray-400"></div>
                                        <div className="w-8 h-8 rounded-full border-2 border-[#051C3F] bg-[#0D4E78] flex items-center justify-center text-[10px] font-bold">
                                            +12
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Right Content - Policy Cards */}
                            <div className="flex-1 flex flex-col gap-4">
                                {filteredPolicies.map((policy: any) => (
                                    <div key={policy.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4 hover:border-blue-200 transition-colors">
                                        
                                        <div className="flex gap-4">
                                            <div className="bg-[#E6F4FE] p-4 rounded-xl shrink-0 self-start">
                                                {renderIcon(policy.icon)}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-[#051C3F]">{policy.title}</h3>
                                                        <p className="text-sm text-gray-500 mt-1 pr-4">{policy.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {policy.status === 'Active' ? (
                                                            <span className="bg-[#CCF034] text-[#051C3F] text-xs font-bold px-3 py-1 rounded-full">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                                                                {policy.status}
                                                            </span>
                                                        )}
                                                        {isAdmin && (
                                                            <button className="text-gray-400 hover:text-gray-600">
                                                                <MoreVertical className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 mt-2 pt-4 flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                    <Clock className="h-4 w-4" />
                                                    Updated: {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(policy.updated_at))}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                    <Users className="h-4 w-4" />
                                                    {policy.audience}
                                                </div>
                                            </div>
                                            
                                            <a 
                                                href={policy.document_path ? `/storage/${policy.document_path}` : '#'} 
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-sm font-semibold text-[#0D4E78] hover:text-[#4CB5F9] transition-colors"
                                            >
                                                View Document <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}

                                {filteredPolicies.length === 0 && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
                                        No policies found matching your criteria.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {isAdmin && (
                <AddPolicyModal 
                    isOpen={isAddModalOpen} 
                    setIsOpen={setIsAddModalOpen} 
                />
            )}
        </SidebarProvider>
    );
}
