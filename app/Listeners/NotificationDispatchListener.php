<?php

namespace App\Listeners;

use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Support\Str;

class NotificationDispatchListener
{
    public function handle($event): void
    {
        $type = null;
        $usersToNotify = collect();
        $data = [];
        
        if (method_exists($event, 'broadcastWith')) {
            $data = $event->broadcastWith();
            $type = $data['type'] ?? null;
        }

        if (!$type) return;

        if (isset($event->assigneeIds)) {
            $usersToNotify = User::whereIn('id', $event->assigneeIds)->get();
        } elseif (isset($event->mentionUserIds)) {
            $usersToNotify = User::whereIn('id', $event->mentionUserIds)->get();
        } elseif (isset($event->completedBy) && property_exists($event, 'task')) {
            $usersToNotify = User::where('id', $event->task->created_by)->get();
        } elseif (property_exists($event, 'task')) {
            $usersToNotify = $event->task->assignees;
        }

        if ($usersToNotify->isEmpty()) return;

        $now = now();
        $notificationsToInsert = [];

        foreach ($usersToNotify as $user) {
            $pref = NotificationPreference::where('user_id', $user->id)
                ->where('notification_type', $type)
                ->first();
                
            if (!$pref || $pref->in_app) {
                $notificationsToInsert[] = [
                    'id' => Str::uuid()->toString(),
                    'user_id' => $user->id,
                    'type' => get_class($event),
                    'notifiable_type' => User::class,
                    'notifiable_id' => $user->id,
                    'data' => json_encode($data),
                    'read_at' => null,
                    'created_at' => $now,
                ];
            }
        }

        if (!empty($notificationsToInsert)) {
            Notification::insert($notificationsToInsert);
        }
    }
}
