<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'akku6293347@gmail.com')->first();
if ($user) {
    $date = now()->subDay()->toDateString();
    \App\Models\Attendance::updateOrCreate(
        ['user_id' => $user->id, 'date' => $date],
        [
            'punch_history' => [['in' => now()->subDay()->setTime(9, 0)->toIso8601String(), 'out' => null]],
            'total_logged_minutes' => 0,
            'punch_in' => now()->subDay()->setTime(9, 0),
            'is_regularized' => false
        ]
    );
    echo "Created open session for yesterday ({$date})!\n";
} else {
    echo "User not found\n";
}
