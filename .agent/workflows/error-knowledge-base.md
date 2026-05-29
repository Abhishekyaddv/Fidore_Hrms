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
