<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('tasks:check-deadlines')->hourly();
Schedule::command('attendance:auto-punch-out')->everyFiveMinutes();
Schedule::command('attendance:punch-in-reminder')->dailyAt('10:00')->timezone('Asia/Kolkata');
Schedule::command('attendance:punch-in-reminder')->dailyAt('10:15')->timezone('Asia/Kolkata');
