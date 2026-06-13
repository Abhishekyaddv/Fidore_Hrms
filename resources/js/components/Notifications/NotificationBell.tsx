import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, Check, Circle } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function NotificationBell({ userId }: { userId: number }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notif: any) => {
        markAsRead(notif.id);
        setIsOpen(false);
        if (notif.data?.action_url) {
            router.visit(notif.data.action_url);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                                <Bell className="w-8 h-8 text-slate-200 mb-2" />
                                <p>You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((notif) => (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!notif.read_at ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notif.read_at ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                                                {notif.data?.message || 'New notification'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(notif.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notif.read_at && (
                                            <Circle className="w-2 h-2 fill-indigo-600 text-indigo-600 mt-1.5 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
