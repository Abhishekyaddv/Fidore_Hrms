<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
Illuminate\Support\Facades\DB::table('jobs')->truncate();
Illuminate\Support\Facades\DB::table('failed_jobs')->truncate();
echo "Jobs cleared.\n";
