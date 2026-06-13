<?php

namespace App\Enums;

enum CompletionMode: string
{
    case AllMustComplete = 'all_must_complete';
    case AnyOneCompletes = 'any_one_completes';
}
