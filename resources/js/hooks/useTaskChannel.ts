import { useEffect, useState } from 'react';

export function useTaskChannel(taskId: number | undefined) {
    const [latestEvent, setLatestEvent] = useState<any>(null);

    useEffect(() => {
        if (!taskId || !(window as any).Echo) return;

        const echo = (window as any).Echo;
        const channel = echo.private(`task.${taskId}`);

        channel.listen('.App\\Events\\TaskStatusChangedEvent', (e: any) => {
            setLatestEvent(e);
        });

        channel.listen('.App\\Events\\TaskCommentAddedEvent', (e: any) => {
            setLatestEvent(e);
        });

        channel.listen('.App\\Events\\TaskCompletedEvent', (e: any) => {
            setLatestEvent(e);
        });

        channel.listen('.App\\Events\\TaskBlockedEvent', (e: any) => {
            setLatestEvent(e);
        });

        return () => {
            channel.stopListening('.App\\Events\\TaskStatusChangedEvent');
            channel.stopListening('.App\\Events\\TaskCommentAddedEvent');
            channel.stopListening('.App\\Events\\TaskCompletedEvent');
            channel.stopListening('.App\\Events\\TaskBlockedEvent');
            echo.leave(`task.${taskId}`);
        };
    }, [taskId]);

    return { latestEvent, setLatestEvent };
}
