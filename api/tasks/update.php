<?php
/**
 * update.php
 *
 * API per aggiornare un task o test esistente.
 * Riceve JSON contenente:
 *   - id (int, obbligatorio)
 *   - title (string, opzionale)
 *   - description (string, opzionale)
 *   - due_date (string YYYY-MM-DD, opzionale)
 *   - is_test (int 0/1, opzionale)
 *   - completed (int 0/1, opzionale)
 *
 * Effettua UPDATE su quei campi presenti nell’input. 
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
session_start();

// 1. Verifico autenticazione
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Utente non autenticato']);
    exit;
}

// 2. Leggo il JSON dal body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['id'])) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'ID mancante']);
    exit;
}

$taskId = intval($input['id']);
$userId = $_SESSION['user_id'];
$fields = [];
$params = [];

// 3. Campi modificabili (se presenti nell’input)
foreach (['title','description','due_date','is_test','completed'] as $field) {
    if (isset($input[$field])) {
        // Se is_test/completed, castiamo a int
        if (in_array($field, ['is_test','completed'])) {
            $fields[] = "`$field` = ?";
            $params[] = intval($input[$field]);
        } else {
            $fields[] = "`$field` = ?";
            $params[] = trim($input[$field]);
        }
    }
}

if (empty($fields)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Nessun campo da aggiornare']);
    exit;
}

// 4. Verifico che il record appartenga all’utente
try {
    $check = $pdo->prepare("SELECT id, due_date, is_test FROM tasks WHERE id = ? AND user_id = ?");
    $check->execute([$taskId, $userId]);
    $row = $check->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Non autorizzato']);
        exit;
    }
} catch (PDOException $e) {
    error_log('update.php SELECT PDOException: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Errore interno']);
    exit;
}

// 5. Costruisco query dinamica
$sql = 'UPDATE tasks SET ' . implode(', ', $fields) . ' WHERE id = ? AND user_id = ?';
$params[] = $taskId;
$params[] = $userId;

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true]);
    exit;
} catch (PDOException $e) {
    error_log('update.php UPDATE PDOException: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Errore aggiornamento task']);
    exit;
}
