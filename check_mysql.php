<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=attendance_tracker;charset=utf8mb4', 'root', '', [
        PDO::ATTR_TIMEOUT => 2,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "OK\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
