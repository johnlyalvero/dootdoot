<?php
require_once '../auth/config.php';

header('Content-Type: application/json');

// Verifica se l'utente è autenticato
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Utente non autenticato']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC");
    $stmt->execute([$user_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("SELECT * FROM study_sessions WHERE user_id = ? ORDER BY start_time ASC");
    $stmt->execute([$user_id]);
    $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'tasks' => $tasks,
        'sessions' => $sessions
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore server']);
}
?>
