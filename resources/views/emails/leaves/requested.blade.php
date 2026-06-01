<x-mail::message>
# New Leave Request

**{{ $leaveRequest->user->name }}** has submitted a new leave request.

**Details:**
- **Leave Type:** {{ $leaveRequest->type }}
- **Start Date:** {{ \Carbon\Carbon::parse($leaveRequest->start_date)->format('M d, Y') }}
- **End Date:** {{ \Carbon\Carbon::parse($leaveRequest->end_date)->format('M d, Y') }}
- **Reason:** {{ $leaveRequest->reason }}

<x-mail::button :url="$url">
Review Request
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
