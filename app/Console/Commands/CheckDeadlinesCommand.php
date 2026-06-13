<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Enums\TaskStatus;
use App\Events\TaskDeadlineApproachingEvent;
use App\Events\TaskOverdueEvent;
use App\Helpers\ActivityLogger;
use Illuminate\Console\Command;

class CheckDeadlinesCommand extends Command
{
    protected $signature = 'tasks:check-deadlines';
    protected $description = 'Check for approaching deadlines and overdue tasks';

    public function handle()
    {
        $now = now();
        $in24Hours = now()->addHours(24);

        // Approaching deadlines (between now and 24h from now)
        $approachingTasks = Task::whereBetween('deadline', [$now, $in24Hours])
            ->whereNotIn('status', [TaskStatus::Completed, TaskStatus::Cancelled])
            ->get();

        foreach ($approachingTasks as $task) {
            $assignees = $task->assignments()->pluck('user_id')->toArray();
            if (!empty($assignees)) {
                event(new TaskDeadlineApproachingEvent($task, $assignees));
            }
        }

        // Overdue tasks
        $overdueTasks = Task::where('deadline', '<', $now)
            ->whereNotIn('status', [TaskStatus::Completed, TaskStatus::Cancelled, TaskStatus::Overdue])
            ->get();

        foreach ($overdueTasks as $task) {
            $oldStatus = $task->status;
            $task->status = TaskStatus::Overdue;
            $task->save();

            ActivityLogger::log(
                $task->id,
                null,
                ActivityLogger::ACTION_STATUS_CHANGED,
                "Task marked as overdue by system",
                $oldStatus instanceof \UnitEnum ? $oldStatus->value : $oldStatus,
                TaskStatus::Overdue->value
            );

            $assignees = $task->assignments()->pluck('user_id')->toArray();
            if (!empty($assignees)) {
                event(new TaskOverdueEvent($task, $assignees));
            }
        }

        $this->info('Checked deadlines successfully.');
    }
}
