# Error Knowledge Base

## ERR-0001: PowerShell Remove-Item Array Syntax Error
**Symptoms and Messages:**
```
Remove-Item : A positional parameter cannot be found that accepts argument ...
CategoryInfo          : InvalidArgument: (:) [Remove-Item], ParameterBindingException
FullyQualifiedErrorId : PositionalParameterNotFound,Microsoft.PowerShell.Commands.RemoveItemCommand
```

**Root Cause:**
Attempted to delete multiple files using bash-like syntax `rm file1 file2` in PowerShell. PowerShell's `Remove-Item` (`rm` alias) requires commas between array elements when passed positionally, or an explicit `-Path` array.

**Step-by-step solution:**
1. Separate the file paths with a comma: `Remove-Item file1.txt, file2.txt`
2. Alternatively, use an array parameter: `Remove-Item -Path "file1.txt", "file2.txt"`

**Prevention tips:**
When using `rm` or `Remove-Item` to delete multiple items in PowerShell, always remember to use a comma-separated list.

## ERR-0002: Null Custom Leaves Overriding Global Policy With Zeros
**Symptoms and Messages:**
Admin configures leave policy, but employee sees `0 / 0 Remaining` on the "My Leaves" page and cannot apply for leaves. No application error is thrown.

**Root Cause:**
The logic in `getLeaveBalances` checked `if ($user->custom_leave_year == $currentYear)` but did not check if the custom leave amounts (`custom_cl`, `custom_sl`, `custom_el`) were actually set. If they were null, it used `?? 0`, effectively giving the employee 0 leaves instead of falling back to the global policy.

**Step-by-step solution:**
1. Retrieve the global policy for the user's employment type first.
2. Update the condition to require at least one custom leave value to not be null: `if ($user->custom_leave_year == $currentYear && ($user->custom_cl !== null || $user->custom_sl !== null || $user->custom_el !== null))`
3. Inside the block, fallback to the global policy value for any missing custom leaves: `$cl_total = $user->custom_cl ?? ($policy ? $policy->cl : 0);`

**Prevention tips:**
When dealing with "override" columns in a database that default to `null`, always ensure the fallback logic evaluates properly so that `null` defaults to the standard policy rather than `0`.

## ERR-0003: ProcessTimedOutException in Queue Worker due to API Hang
**Symptoms and Messages:**
```
Symfony\Component\Process\Exception\ProcessTimedOutException
The process "C:\tools\php84\php.exe artisan queue:work --once" exceeded the timeout of 60 seconds.
```

**Root Cause:**
A job (`FetchLocationAddress`) was making an external HTTP request (`Http::get()`) to an API (`nominatim.openstreetmap.org`) without an explicit timeout. If the external server hangs or drops packets without closing the connection, the PHP process hangs indefinitely. Since `queue:listen` has a strict 60s timeout for its child worker processes, it kills the hanging worker and throws `ProcessTimedOutException`.

**Step-by-step solution:**
1. Add an explicit timeout to the external HTTP call: `Http::timeout(10)->get(...)`
2. Catch the exception and implement exponential backoff if the job fails.
3. Terminate stuck queue worker processes and clear the pending stuck jobs from the database using `php artisan queue:clear`.

**Prevention tips:**
Always add a `->timeout(seconds)` to Laravel `Http` client requests, especially when calling external APIs inside queue jobs, to prevent the queue workers from hanging indefinitely.
