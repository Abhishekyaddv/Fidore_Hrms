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
import { Calendar, LayoutGrid, Settings, Users, Briefcase, User } from 'lucide-react';
import AppLogoIcon from './app-logo-icon';

const adminNavItems: NavItem[] = [
    { title: 'Dashboard',          url: '/admin/dashboard',    icon: LayoutGrid },
    { title: 'Designations',       url: '/admin/designations', icon: Briefcase  },
    { title: 'My Leave',           url: '#',                   icon: Calendar   },
    { title: 'Employee Directory', url: '/admin/employees',    icon: Users      },
    { title: 'My Profile',         url: '/profile',            icon: User       },
    { title: 'Settings',           url: '#',                   icon: Settings   },
];

const employeeNavItems: NavItem[] = [
    { title: 'Dashboard',  url: '/dashboard', icon: LayoutGrid },
    { title: 'My Leave',   url: '#',          icon: Calendar   },
    { title: 'My Profile', url: '/profile',   icon: User       },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'superadmin' || auth.user.role === 'hr';
    const navItems = isAdmin ? adminNavItems : employeeNavItems;

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className={isAdmin ? 'admin-sidebar dark' : ''}
        >
            <SidebarHeader className="border-b border-black/[0.05] px-5 py-5">
                <Link
                    href={isAdmin ? '/admin/dashboard' : '/dashboard'}
                    className="flex items-center px-1"
                    prefetch
                >
                    <span className="text-lg font-bold tracking-tight text-white dark:text-white">
                        HRMS Portal
                    </span>
                </Link>
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