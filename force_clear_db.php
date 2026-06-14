<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=attendance_tracker;charset=utf8', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Clearing cache locks...\n";
    $pdo->exec("TRUNCATE TABLE cache_locks");
    
    echo "Clearing cache...\n";
    $pdo->exec("TRUNCATE TABLE cache");
    
    echo "Clearing jobs...\n";
    $pdo->exec("DELETE FROM jobs");
    
    echo "Done!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
