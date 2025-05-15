<?php
// Configurazione del database XAMPP

$host = 'localhost';
$dbname = 'dootdoot';
$user = 'root';
$pass = '';  // Cambia se hai impostato una password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connessione fallita: " . $e->getMessage());
}

session_start();
?>