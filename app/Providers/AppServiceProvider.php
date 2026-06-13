<?php

namespace App\Providers;

use App\Models\Task;
use App\Models\TaskAssignment;
use App\Observers\TaskAssignmentObserver;
use App\Observers\TaskObserver;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Task::observe(TaskObserver::class);
        TaskAssignment::observe(TaskAssignmentObserver::class);

        Event::listen(
            [
                \App\Events\TaskAssignedEvent::class,
                \App\Events\TaskStatusChangedEvent::class,
                \App\Events\TaskCompletedEvent::class,
                \App\Events\TaskBlockedEvent::class,
                \App\Events\TaskCommentAddedEvent::class,
                \App\Events\TaskDeadlineApproachingEvent::class,
                \App\Events\TaskOverdueEvent::class,
            ],
            \App\Listeners\NotificationDispatchListener::class
        );
    }
}
