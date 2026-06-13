export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type AssignmentStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'removed';
export type CompletionMode = 'all_must_complete' | 'any_one_completes';
export type NotificationType = 'TaskAssigned' | 'TaskCompleted' | 'TaskBlocked' | 'TaskCommentAdded' | 'TaskMention' | 'TaskDeadlineApproaching' | 'TaskOverdue' | 'TaskReassigned' | 'TaskDeadlineExtended' | 'TaskStatusChanged';

export interface UserMinimal {
    id: number;
    name: string;
    avatar?: string;
}

export interface TaskAssignment {
    id: number;
    task_id: number;
    user?: UserMinimal;
    status: AssignmentStatus;
    assigned_by: number;
    assigned_at: string;
    started_at: string | null;
    completed_at: string | null;
}

export interface Subtask {
    id: number;
    task_id: number;
    user_id: number;
    user?: UserMinimal;
    title: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface TaskComment {
    id: number;
    task_id: number;
    body: string;
    parent_comment_id: number | null;
    user?: UserMinimal;
    replies?: TaskComment[];
    created_at: string;
}

export interface TaskActivityLog {
    id: number;
    task_id: number;
    user?: UserMinimal;
    action: string;
    old_value: string | null;
    new_value: string | null;
    description: string;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    completion_mode: CompletionMode;
    deadline: string | null;
    is_recurring: boolean;
    recurrence_rule: string | null;
    created_by?: UserMinimal;
    assignments?: TaskAssignment[];
    subtasks?: Subtask[];
    comments?: TaskComment[];
    activity_logs?: TaskActivityLog[];
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: string;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
}
