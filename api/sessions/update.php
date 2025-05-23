<?php
// -----------------------------------------------------------------------------
// File: /api/sessions/update.php
// API per aggiornare una sessione di studio.
// Riceve JSON: id e campi opzionali (start_time, end_time, duration_minutes, focus_score,
// discipline_score, efficiency_score, dedication_score, notes).
// -----------------------------------------------------------------------------
header('Content-Type: application/json');
require_once __DIR__ . '/../config.php';
session_start();

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Utente non autenticato']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['id'])) {
    http_response_code(422);
    echo json_encode(['error' => 'ID sessione mancante']);
    exit;
}

$sessionId = (int)$input['id'];
$fields = [];
$params = [];

// Campi modificabili
$allowed = ['start_time','end_time','duration_minutes','focus_score','discipline_score','efficiency_score','dedication_score','notes'];
foreach ($allowed as $field) {
    if (isset($input[$field])) {
        $fields[] = "`$field` = ?";
        $params[] = $input[$field];
    }
}

if (empty($fields)) {
    http_response_code(422);
    echo json_encode(['error' => 'Nessun campo da aggiornare']);
    exit;
}

$sql = 'UPDATE study_sessions SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?';
$params[] = $sessionId;
$params[] = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore aggiornamento sessione']);
}