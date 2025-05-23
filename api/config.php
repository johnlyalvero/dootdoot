<?php
/**
 * config.php
 *
 * File di configurazione per la connessione al database MySQL tramite PDO.
 */

// Parametri di connessione
$host   = 'localhost';       // Host del database (XAMPP default)
$db     = 'dootdoot_db';     // Nome del database
$user   = 'root';            // Utente del database (XAMPP default)
$pass   = '';                // Password (XAMPP default vuota)
$charset= 'utf8mb4';          // Charset per supporto Unicode completo

// Data Source Name
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

// Opzioni PDO per migliorare la sicurezza e la gestione degli errori
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,        // Eccezioni su errori SQL
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,              // Fetch come array associativo
    PDO::ATTR_EMULATE_PREPARES   => false,                          // Utilizza prepared statements nativi
];

try {
    // Creo l'oggetto PDO per la connessione
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // Se la connessione fallisce, invio un errore 500 e un messaggio JSON
    http_response_code(500);
    echo json_encode(['error' => 'Connessione al database fallita']);
    exit;
}
