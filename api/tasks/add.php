<?php
/**
 * add.php
 *
 * API per la creazione di un task o test.
 * Riceve JSON con user_id, title, description (opzionale), due_date, is_test (boolean).
 * Se is_test = true, genera automaticamente 4 study_sessions correlate.
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
session_start();

// Verifica sessione utente
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Utente non autenticato']);
    exit;
}

// Leggi payload
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['title']) || empty($input['due_date'])) {
    http_response_code(422);
    echo json_encode(['error' => 'Parametri mancanti: title, due_date']);
    exit;
}

// Sanitizzazione campi
$userId      = $_SESSION['user_id'];
$title       = trim($input['title']);
$description = !empty($input['description']) ? trim($input['description']) : null;
$dueDate     = $input['due_date'];
$isTest       = !empty($input['is_test']) ? 1 : 0;

try {
    // Inserimento task/test
    $stmt = $pdo->prepare(
        'INSERT INTO tasks (user_id, title, description, due_date, is_test) VALUES (?, ?, ?, ?, ?)' 
    );
    $stmt->execute([$userId, $title, $description, $dueDate, $isTest]);
    $taskId = $pdo->lastInsertId();

    // Se è un test, generazione automatica delle 4 study_sessions
    if ($isTest) {
        $intervals = [7, 6, 3, 1];
        $insertSession = $pdo->prepare(
            'INSERT INTO study_sessions (user_id, task_id, start_time) VALUES (?, ?, ?)' 
        );
        foreach ($intervals as $daysBefore) {
            $sessionDate = date('Y-m-d H:i:s', strtotime("$dueDate - $daysBefore days"));
            $insertSession->execute([$userId, $taskId, $sessionDate]);
        }
    }

    echo json_encode(['success' => true, 'task_id' => $taskId]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore creazione task/test']);
    exit;
}