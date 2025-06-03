<?php
/**
 * get_profile.php
 *
 * API per recuperare i dati anagrafici dell’utente loggato.
 * Restituisce username, scuola, classe e percorso immagine profilo in formato JSON.
 */

// Sblocchiamo il display degli errori per debugging (rimuovere in produzione)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// Includo la configurazione e connessione PDO
require_once __DIR__ . '/../config.php';

// Avvio o riprendo la sessione per verificare l’utente loggato
session_start();

// Verifico che ci sia un utente loggato (sessione valida)
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Unauthorized'
    ]);
    exit;
}

try {
    // Preparo la query per estrarre i dati dell’utente
    $stmt = $pdo->prepare("
        SELECT username, school, class , profile_image
        FROM users
        WHERE id = :uid
    ");
    $stmt->bindParam(':uid', $_SESSION['user_id'], PDO::PARAM_INT);
    $stmt->execute();

    $user = $stmt->fetch();

    // Se non trovo l’utente, rispondo con errore 404
    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'status'  => 'error',
            'message' => 'User not found'
        ]);
        exit;
    }

    // Restituisco i dati in formato JSON
    echo json_encode([
        'status' => 'success',
        'data'   => [
            'username'    => $user['username'],
            'school'      => $user['school'],
            'class'       => $user['class'],
            'profile_image' => $user['profile_image']
        ]
    ]);
    exit;

} catch (PDOException $e) {
    // In caso di errore PDO restituisco 500 Internal Server Error
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database error' . $e->getMessage()
    ]);
    exit;
}
