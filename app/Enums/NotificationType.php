<?php

namespace App\Enums;

enum NotificationType: string
{
    case TaskAssigned = 'TaskAssigned';
    case TaskCompleted = 'TaskCompleted';
    case TaskBlocked = 'TaskBlocked';
    case TaskCommentAdded = 'TaskCommentAdded';
    case TaskMention = 'TaskMention';
    case TaskDeadlineApproaching = 'TaskDeadlineApproaching';
    case TaskOverdue = 'TaskOverdue';
    case TaskReassigned = 'TaskReassigned';
    case TaskDeadlineExtended = 'TaskDeadlineExtended';
    case TaskStatusChanged = 'TaskStatusChanged';
}
