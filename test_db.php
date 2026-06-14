<?php
$mysqli = mysqli_init();
$mysqli->options(MYSQLI_OPT_CONNECT_TIMEOUT, 2);
if (!$mysqli->real_connect('127.0.0.1', 'root', '', 'attendance_tracker')) {
    die('Connect Error (' . mysqli_connect_errno() . ') ' . mysqli_connect_error());
}
echo 'Success... ' . $mysqli->host_info . "\n";
$mysqli->close();
