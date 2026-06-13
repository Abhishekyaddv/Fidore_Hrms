

import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import NotificationBell from './Notifications/NotificationBell';

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const { auth } = usePage<SharedData>().props as any;
    
    return (
        <div className="flex min-h-screen w-full flex-col relative">
            <div className="absolute top-4 right-4 z-50">
                <NotificationBell userId={auth.user.id} />
            </div>
            {children}
        </div>
    );
}
