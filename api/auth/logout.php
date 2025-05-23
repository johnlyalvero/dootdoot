<?php
/**
 * logout.php
 *
 * API per il logout dell'utente.
 * Termina la sessione corrente e restituisce conferma in JSON.
 */

header('Content-Type: application/json');

// Avvio sessione per accedere alle variabili di sessione
session_start();

// Verifico se esiste una sessione attiva
if (session_status() === PHP_SESSION_ACTIVE) {
    // Rimuovo tutte le variabili di sessione
    $_SESSION = [];

    // Distruggo i cookie della sessione se impostati
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly']
        );
    }

    // Distruggo la sessione lato server
    session_destroy();

    // Ritorno risposta di successo
    echo json_encode(['success' => true, 'message' => 'Logout eseguito con successo']);
    exit;
} else {
    // Nessuna sessione attiva
    http_response_code(400);
    echo json_encode(['error' => 'Nessuna sessione attiva']);
    exit;
}
