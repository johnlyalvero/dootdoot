// -----------------------------------------------------------------------------
// File: /api/sessions/delete.php
// API per cancellare una sessione di studio.
// Riceve JSON: id.
// -----------------------------------------------------------------------------
header('Content-Type: application/json');
require_once __DIR__ . '/../auth/config.php';
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

try {
    $stmt = $pdo->prepare('DELETE FROM study_sessions WHERE id = ? AND user_id = ?');
    $stmt->execute([$sessionId, $_SESSION['user_id']]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Errore cancellazione sessione']);
}