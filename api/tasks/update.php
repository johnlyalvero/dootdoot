<?php
// -----------------------------------------------------------------------------
// File: /api/tasks/update.php
// API per aggiornare un task o test esistente.
// Riceve JSON: id, title, description, due_date, is_test, completed.
// -----------------------------------------------------------------------------
header('Content-Type: application/json');
require_once __DIR__ . './../config.php';
session_start();

// Controllo autenticazione
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Utente non autenticato']);
    exit;
}

// Leggo JSON
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['id'])) {
    http_response_code(422);
    echo json_encode(['error' => 'ID task mancante']);
    exit;
}

$taskId = (int)$input['id'];
$fields = [];
$params = [];

// Campi modificabili
foreach (['title','description','due_date','is_test','completed'] as $field) {
    if (isset($input[$field])) {
        $fields[] = "`$field` = ?";
        // cast boolean per is_test/completed
        $params[] = in_array($field, ['is_test','completed']) ? (int)$input[$field] : $input[$field];
    }
}

if (empty($fields)) {
    http_response_code(422);
    echo json_encode(['error' => 'Nessun campo da aggiornare']);
    exit;
}

// Costruisco query dinamica
$sql = 'UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?';
$params[] = $taskId;
$params[] = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore aggiornamento task']);
}