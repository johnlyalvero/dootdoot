<?php
/**
 * delete.php
 *
 * API per cancellare un task o test.
 * Richiama metodo DELETE con query string ?id=<task_id>.
 * Restituisce { success: true } oppure { success: false, error: "…" }.
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
session_start();

// 1. Verifica sessione
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Utente non autenticato']);
    exit;
}

// 2. Recupero id da query string
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'ID mancante o non valido']);
    exit;
}
$taskId = intval($_GET['id']);
$userId = $_SESSION['user_id'];

try {
    // 3. Controllo che l’item appartenga all’utente
    $stmt0 = $pdo->prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?');
    $stmt0->execute([$taskId, $userId]);
    if ($stmt0->rowCount() === 0) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Non autorizzato']);
        exit;
    }

    // 4. Esecuzione DELETE
    $stmt = $pdo->prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    $stmt->execute([$taskId, $userId]);
    echo json_encode(['success' => true]);
    exit;
} catch (PDOException $e) {
    error_log('delete.php PDOException: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Errore cancellazione task']);
    exit;
}
