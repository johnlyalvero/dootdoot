<?php
/**
 * login.php
 *
 * API per l'autenticazione utente.
 * Riceve JSON con username e password, verifica le credenziali e avvia la sessione.
 */

header('Content-Type: application/json');

// Includo la configurazione e connessione PDO
require_once __DIR__ . './../config.php';

// Avvio la sessione per gestire lo stato di login
session_start();

// Leggo il payload JSON dal client
$input = json_decode(file_get_contents('php://input'), true);

// Verifica payload
if (!$input || empty($input['username']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Username e password richiesti']);
    exit;
}

// Sanitizzo input
$username = trim($input['username']);
$password = $input['password'];

try {
    // Preparo la query per recuperare hash password
    $stmt = $pdo->prepare('SELECT id, password_hash, school, class FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    // Se utente non trovato o password non corrisponde
    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenziali non valide']);
        exit;
    }

    // Credenziali valide: setto variabili di sessione
    session_regenerate_id(true); // Previene session fixation
    $_SESSION['user_id']   = $user['id'];
    $_SESSION['username']  = $username;
    $_SESSION['school']    = $user['school'];
    $_SESSION['class']     = $user['class'];

    // Ritorno risposta di successo con dati utente
    echo json_encode([
        'success' => true,
        'user' => [
            'id'      => $user['id'],
            'username'=> $username,
            'school'  => $user['school'],
            'class'   => $user['class'],
        ]
    ]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore durante il login']);
    exit;
}
