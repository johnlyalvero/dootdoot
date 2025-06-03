<?php
/**
 * list.php
 *
 * API per ottenere la lista di Task o Test per l’utente loggato.
 * Accetta query string:
 *   - type=task → restituisce solo is_test = 0
 *   - type=test → restituisce solo is_test = 1
 *
 * Per i Test include anche le study_sessions sotto ogni test.
 *
 * Risposta JSON:
 *   { "success": true, "tasks": [ {id, title, description, due_date, is_test, completed, [sessions]}, … ] }
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
session_start();

// 1) Verifico login
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
$userId = $_SESSION['user_id'];

// 2) Leggo il parametro type (task o test)
$type = isset($_GET['type']) ? strtolower($_GET['type']) : '';
if ($type === 'task') {
    $isTest = 0;
} elseif ($type === 'test') {
    $isTest = 1;
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parametro type non valido. Usa "task" o "test".']);
    exit;
}

try {
    // 3) Seleziono i task/tests di quell’utente
    $stmt = $pdo->prepare("
        SELECT id, title, description, due_date, is_test, completed
        FROM tasks
        WHERE user_id = :uid AND is_test = :ist
        ORDER BY due_date ASC
    ");
    $stmt->bindParam(':uid', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':ist', $isTest, PDO::PARAM_INT);
    $stmt->execute();
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4) Se siamo in 'test', recupero anche le sessioni per ciascun test
    if ($isTest === 1 && !empty($tasks)) {
        $stmt2 = $pdo->prepare("
            SELECT id, task_id, DATE_FORMAT(start_time, '%Y-%m-%d') AS session_due_date
            FROM study_sessions
            WHERE task_id = :task_id
            ORDER BY start_time ASC
        ");
        foreach ($tasks as &$test) {
            $stmt2->bindParam(':task_id', $test['id'], PDO::PARAM_INT);
            $stmt2->execute();
            $sessions = $stmt2->fetchAll(PDO::FETCH_ASSOC);
            $test['sessions'] = $sessions;
        }
        unset($test);
    }

    // 5) Restituisco il JSON
    echo json_encode(['success' => true, 'tasks' => $tasks]);
    exit;

} catch (PDOException $e) {
    error_log('list.php PDOException: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}
