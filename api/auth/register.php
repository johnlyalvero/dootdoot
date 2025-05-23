<?php
/**
 * register.php
 *
 * API per la registrazione di un nuovo utente.
 * Riceve dati in JSON: username, password, scuola, classe.
 * Inserisce l'utente nella tabella `users` con password hashata.
 */

header('Content-Type: application/json');

// Includo la configurazione e connessione PDO
require_once __DIR__ . './../config.php';

// Leggo il payload JSON inviato dal client
$input = json_decode(file_get_contents('php://input'), true);

// Controllo che il JSON sia valido
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON non valido']);
    exit;
}

// Definisco campi obbligatori
$required = ['username', 'password', 'school', 'class'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        http_response_code(422);
        echo json_encode(['error' => "Campo '$field' mancante"]);
        exit;
    }
}

// Sanitizzo e assegno le variabili
$username = trim($input['username']);
$password = $input['password'];
$school   = trim($input['school']);
$class    = trim($input['class']);

// Verifico che lo username non esista già
try {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Username già esistente']);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore verifica username']);
    exit;
}

// Hash della password
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// Inserisco il nuovo utente nel database
try {
    $insert = $pdo->prepare(
        'INSERT INTO users (username, password_hash, school, class) VALUES (?, ?, ?, ?)'
    );
    $insert->execute([$username, $passwordHash, $school, $class]);

    // Ritorno l'ID del nuovo utente
    echo json_encode([
        'success' => true,
        'user_id' => $pdo->lastInsertId()
    ]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Registrazione fallita']);
    exit;
}
