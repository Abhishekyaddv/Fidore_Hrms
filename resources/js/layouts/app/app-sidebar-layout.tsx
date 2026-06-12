import { AppShell } from '@/components/app-shell';
import { BottomNavbar } from '@/components/bottom-navbar';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell>
            {/* The main content area with padding at the bottom to avoid overlapping the bottom navbar */}
            <main className="flex-1 pb-24 sm:pb-28 w-full max-w-full overflow-x-hidden">
                {children}
            </main>
            
            {/* The new floating bottom navbar */}
            <BottomNavbar />
        </AppShell>
    );
}
