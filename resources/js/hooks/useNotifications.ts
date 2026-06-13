import { useEffect, useState } from 'react';
import { Notification } from '../types/task';
import axios from 'axios';

export function useNotifications(userId: number | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const [resNotes, resCount] = await Promise.all([
                axios.get('/api/notifications'),
                axios.get('/api/notifications/unread-count')
            ]);
            setNotifications(resNotes.data.data);
            setUnreadCount(resCount.data.unread_count);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    useEffect(() => {
        if (!userId) return;

        fetchNotifications();

        if ((window as any).Echo) {
            const echo = (window as any).Echo;
            echo.private(`user.${userId}`)
                .listen('.App\\Events\\TaskAssignedEvent', (e: any) => {
                    handleNewNotification(e);
                })
                .listen('.App\\Events\\TaskDeadlineApproachingEvent', (e: any) => {
                    handleNewNotification(e);
                })
                .listen('.App\\Events\\TaskOverdueEvent', (e: any) => {
                    handleNewNotification(e);
                })
                .listen('.App\\Events\\TaskCommentAddedEvent', (e: any) => {
                    handleNewNotification(e);
                });

            return () => {
                echo.leave(`user.${userId}`);
            };
        } else {
            // Polling fallback
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const handleNewNotification = (e: any) => {
        const newNotif: Notification = {
            id: crypto.randomUUID(),
            type: e.type,
            data: e,
            read_at: null,
            created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(`/api/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (e) {
            console.error('Failed to mark notification as read', e);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.patch('/api/notifications/read-all');
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (e) {
            console.error('Failed to mark all notifications as read', e);
        }
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    };
}
