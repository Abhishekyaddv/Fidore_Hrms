<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $fillable = [
        'name',
        'date',
        'description',
    ];

    public static function getHolidaysInRange($startDate, $endDate)
    {
        $dbHolidays = self::whereBetween('date', [$startDate, $endDate])->get();
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);

        for ($date = $start; $date->lte($end); $date->addDay()) {
            if ($date->isSunday() && !$dbHolidays->contains('date', $date->toDateString())) {
                $dbHolidays->push(new self([
                    'id' => crc32('sunday' . $date->toDateString()),
                    'name' => 'Weekly Off (Sunday)',
                    'date' => $date->toDateString(),
                    'description' => 'Default weekly holiday'
                ]));
            }
        }

        return $dbHolidays->sortBy('date')->values();
    }
}
