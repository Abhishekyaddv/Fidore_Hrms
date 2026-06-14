<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=attendance_tracker;charset=utf8', 'root', '');
    $stmt = $pdo->query("SHOW FULL PROCESSLIST");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ($row['Time'] > 5 && $row['Id'] != $pdo->query("SELECT CONNECTION_ID()")->fetchColumn()) {
            echo "Killing connection {$row['Id']} running for {$row['Time']}s\n";
            $pdo->exec("KILL {$row['Id']}");
        }
    }
    $pdo->exec("TRUNCATE TABLE jobs");
    echo "Jobs truncated successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
