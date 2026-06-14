<?php
echo "Killing other PHP processes...\n";
exec("taskkill /IM php.exe /F /FI \"PID ne " . getmypid() . "\"");
sleep(2);

echo "Connecting to DB...\n";
$host = '127.0.0.1';
$db   = 'attendance_tracker';
$user = 'root';
$pass = '';

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->exec("DELETE FROM jobs");
    echo "Jobs deleted successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
