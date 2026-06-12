import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu className="gap-1 relative">
                {items.map((item) => {
                    const isActive = item.url === page.url;
                    return (
                        <SidebarMenuItem key={item.title} className="relative rounded-full">
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active-pill"
                                    className="absolute inset-0 rounded-full bg-[#082760]"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                />
                            )}
                            <SidebarMenuButton 
                                asChild 
                                isActive={false}
                                tooltip={item.title}
                                className={`relative z-10 w-full h-10 px-4 group-data-[collapsible=icon]:px-0 flex items-center justify-start group-data-[collapsible=icon]:justify-center transition-colors duration-200 rounded-full hover:bg-transparent! ${
                                    isActive ? 'text-white' : 'text-[#0a316cf0] hover:text-[#0a316cf0]'
                                }`}
                            >
                                <Link href={item.url} prefetch className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 w-full group-data-[collapsible=icon]:w-auto outline-none">
                                    {item.icon && <item.icon className="w-5 h-5 shrink-0" />}
                                    <span className="font-medium text-[13px] group-data-[collapsible=icon]:hidden">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
