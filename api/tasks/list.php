<?php
/**
 * list.php
 *
 * API per recuperare tutti i task e i test di un utente,
 * ordinati per data di scadenza. Per ogni test, includo
 * le study sessions associate ordinate per start_time.
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

$userId = $_SESSION['user_id'];

try {
    // Recupero tutti i task/test per l'utente
    $stmt = $pdo->prepare(
        'SELECT id, title, description, due_date, is_test, completed, created_at
         FROM tasks
         WHERE user_id = ?
         ORDER BY due_date ASC'
    );
    $stmt->execute([$userId]);
    $tasksRaw = $stmt->fetchAll();

    // Recupero tutte le study sessions per i task di tipo test
    $stmt2 = $pdo->prepare(
        'SELECT id, task_id, start_time, end_time, duration_minutes, focus_score, discipline_score,
                efficiency_score, dedication_score, notes
         FROM study_sessions
         WHERE user_id = ?
         ORDER BY start_time ASC'
    );
    $stmt2->execute([$userId]);
    $sessionsRaw = $stmt2->fetchAll();

    // Organizzo le sessions per task_id
    $sessionsByTask = [];
    foreach ($sessionsRaw as $session) {
        $sessionsByTask[$session['task_id']][] = [
            'id' => (int)$session['id'],
            'start_time' => $session['start_time'],
            'end_time' => $session['end_time'],
            'duration_minutes' => $session['duration_minutes'],
            'focus_score' => $session['focus_score'],
            'discipline_score' => $session['discipline_score'],
            'efficiency_score' => $session['efficiency_score'],
            'dedication_score' => $session['dedication_score'],
            'notes' => $session['notes'],
        ];
    }

    // Costruisco l'array finale
    $tasks = [];
    foreach ($tasksRaw as $task) {
        $t = [
            'id' => (int)$task['id'],
            'title' => $task['title'],
            'description' => $task['description'],
            'due_date' => $task['due_date'],
            'is_test' => (bool)$task['is_test'],
            'completed' => (bool)$task['completed'],
            'created_at' => $task['created_at'],
        ];
        // Aggiungo le sessions se è un test
        if ($t['is_test']) {
            $t['sessions'] = $sessionsByTask[$t['id']] ?? [];
        }
        $tasks[] = $t;
    }

    echo json_encode(['success' => true, 'tasks' => $tasks]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore recupero task']);
    exit;
}
