<x-mail::message>
# Leave Request {{ ucfirst($leaveRequest->status) }}

Hello **{{ $leaveRequest->user->name }}**,

Your leave request has been **{{ $leaveRequest->status }}** by HR.

**Details:**
- **Leave Type:** {{ $leaveRequest->type }}
- **Start Date:** {{ \Carbon\Carbon::parse($leaveRequest->start_date)->format('M d, Y') }}
- **End Date:** {{ \Carbon\Carbon::parse($leaveRequest->end_date)->format('M d, Y') }}

<x-mail::button :url="$url">
View My Leaves
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
