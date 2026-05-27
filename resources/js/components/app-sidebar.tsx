import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, LayoutGrid, Settings, Users } from 'lucide-react';
import AppLogo from './app-logo';

const adminNavItems: NavItem[] = [
    { title: 'Dashboard',          url: '/admin/dashboard', icon: LayoutGrid },
    { title: 'My Leave',           url: '#',                icon: Calendar   },
    { title: 'Employee Directory', url: '#',                icon: Users      },
    { title: 'Settings',           url: '#',                icon: Settings   },
];

const employeeNavItems: NavItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
    { title: 'My Leave',  url: '#',          icon: Calendar   },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'superadmin' || auth.user.role === 'admin';
    const navItems = isAdmin ? adminNavItems : employeeNavItems;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className={isAdmin ? 'admin-sidebar dark' : ''}
        >
            {/* ── Header ── */}
            <SidebarHeader className="border-b border-black/[0.05] px-4 py-5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="
                                rounded-[10px] gap-2.5
                                hover:bg-black/[0.04] active:bg-black/[0.07]
                                transition-colors duration-150
                            "
                        >
                            <Link href="/dashboard" prefetch>
                                <div className="
                                    flex h-[30px] w-[30px] shrink-0 items-center justify-center
                                    rounded-[8px] bg-[#1c1c1e]
                                    shadow-[0_1px_3px_rgba(0,0,0,0.22)]
                                ">
                                    <AppLogo className="h-4 w-4 text-white" />
                                </div>
                                <span className="
                                    text-[15px] font-semibold tracking-[-0.3px] text-[#1c1c1e]
                                ">
                                    LeaveOS
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ── Nav ── */}
            <SidebarContent className="px-2.5 py-2">
                {isAdmin && (
                    <p className="
                        px-2 pb-1 pt-2
                        text-[11px] font-semibold uppercase tracking-[0.6px]
                        text-[rgba(60,60,67,0.45)]
                    ">
                        Admin
                    </p>
                )}
                <NavMain items={navItems} />
            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter className="border-t border-black/[0.05] p-2.5">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}