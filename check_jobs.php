<?php
$host = '127.0.0.1';
$db   = 'attendance_tracker';
$user = 'root';
$pass = '';
$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_TIMEOUT => 2]);
    $stmt = $pdo->query("SELECT count(*) FROM jobs");
    echo "Jobs count: " . $stmt->fetchColumn() . "\n";
} catch (Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}
