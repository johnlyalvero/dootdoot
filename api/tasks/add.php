<?php
/**
 * add.php
 *
 * API per la creazione di un task o test.
 * Riceve JSON con:
 *   - title        (string, obbligatorio)
 *   - due_date     (string YYYY-MM-DD, obbligatorio)
 *   - description  (string, opzionale)
 *   - is_test      (int 0/1, obbligatorio)
 *
 * Se is_test = 1, genera automaticamente 4 study_sessions per il test.
 * Restituisce JSON { success: true, task_id: <id> } altrimenti { success: false, error: "msg" }.
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

// Includiamo la connessione PDO da config.php
require_once __DIR__ . '/../config.php';
session_start();

// 1. Verifica sessione utente
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Utente non autenticato']);
    exit;
}

// 2. Leggi e decodifica il JSON in ingresso
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['title']) || empty($input['due_date']) || !isset($input['is_test'])) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Parametri mancanti: title, due_date, is_test']);
    exit;
}

// 3. Sanitizzazione e validazione di base
$userId      = $_SESSION['user_id'];
$title       = trim($input['title']);
$description = isset($input['description']) ? trim($input['description']) : null;
$dueDate     = $input['due_date'];
$isTest      = intval($input['is_test']);

// Validiamo il formato di due_date (esempio semplice YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dueDate)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Formato data non valido (YYYY-MM-DD)']);
    exit;
}

try {
    // 4. Inserimento nella tabella tasks
    $stmt = $pdo->prepare(
        'INSERT INTO tasks (user_id, title, description, due_date, is_test, completed) VALUES (?, ?, ?, ?, ?, 0)'
    );
    $stmt->execute([$userId, $title, $description, $dueDate, $isTest]);
    $taskId = $pdo->lastInsertId();

    // 5. Se è un test, generazione automatica delle 4 study_sessions
    if ($isTest) {
        $intervals = [7, 6, 3, 1]; 
        $insertSession = $pdo->prepare(
            'INSERT INTO study_sessions (user_id, task_id, start_time) VALUES (?, ?, ?)'
        );
        foreach ($intervals as $daysBefore) {
            // Calcola la data e ora di inizio: midnight specifico giorno
            $sessionTimestamp = strtotime("$dueDate - $daysBefore days");
            $sessionDateTime = date('Y-m-d 09:00:00', $sessionTimestamp); 
            // (Usiamo le 09:00:00 come orario fisso di inizio, modificabile in futuro)
            $insertSession->execute([$userId, $taskId, $sessionDateTime]);
        }
    }

    echo json_encode(['success' => true, 'task_id' => $taskId]);
    exit;
} catch (PDOException $e) {
    // Log dell’errore per debug, senza esporre dettagli all’utente
    error_log('add.php PDOException: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Errore creazione task/test']);
    exit;
}
