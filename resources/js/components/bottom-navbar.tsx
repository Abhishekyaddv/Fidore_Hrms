import { Link, usePage } from '@inertiajs/react';
import { Home, Users, Settings, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { SharedData } from '@/types';
import { useState, useEffect } from 'react';

export function BottomNavbar() {
    const { auth, url } = usePage<SharedData>().props as any;
    
    // Inertia usePage().url gives the path without the domain, e.g. /dashboard
    const currentPath = usePage().url;
    
    const isAdmin = auth.user.role === 'superadmin' || auth.user.role === 'hr';

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show if scrolling up, hide if scrolling down
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-[200%]'}`}>
            <div className="bg-[#1a1f2e] rounded-full px-4 py-2 sm:px-6 sm:py-3 flex items-center gap-4 sm:gap-8 shadow-2xl shadow-black/50 border border-white/10">
                {/* Home */}
                <Link 
                    href="/dashboard"
                    className={`p-3 rounded-full transition-all duration-300 ${currentPath.startsWith('/dashboard') ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    prefetch
                >
                    <Home className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={currentPath.startsWith('/dashboard') ? 2.5 : 2} />
                </Link>

                {/* Employees (Admin Only) */}
                {isAdmin && (
                    <Link 
                        href="/admin/employees"
                        className={`p-3 rounded-full transition-all duration-300 ${currentPath.startsWith('/admin/employees') ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                        prefetch
                    >
                        <Users className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={currentPath.startsWith('/admin/employees') ? 2.5 : 2} />
                    </Link>
                )}

                {/* Profile */}
                <Link 
                    href="/profile"
                    className={`p-3 rounded-full transition-all duration-300 ${currentPath.startsWith('/profile') ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                    prefetch
                >
                    <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={currentPath.startsWith('/profile') ? 2.5 : 2} />
                </Link>

                {/* Settings / Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger className={`p-3 rounded-full transition-all duration-300 text-gray-400 hover:text-white focus:outline-none data-[state=open]:bg-white data-[state=open]:text-black`}>
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 rounded-xl mb-4 border-slate-200 shadow-xl"
                        align="end"
                        side="top"
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
