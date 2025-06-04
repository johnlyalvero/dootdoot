<?php
/**
 * change_password.php
 *
 * API per cambiare la password dellʼutente loggato.
 * Riceve JSON: { current_password, new_password }
 * Controlla sessione, verifica password corrente, aggiorna hash nel DB.
 * Restituisce JSON { status:"success" } o { status:"error", message:"…" }
 */

// Debug – mostra errori (da rimuovere in produzione)
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config.php';
session_start();

// 1) Verifica sessione
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

// 2) Prendo e decodifico input JSON
$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true);

if (!isset($input['current_password'], $input['new_password'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Dati mancanti']);
    exit;
}

$currentPwd = trim($input['current_password']);
$newPwd     = trim($input['new_password']);

// 3) Recupero hash esistente dal DB
try {
    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = :uid");
    $stmt->execute([':uid' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Utente non trovato']);
        exit;
    }

    // 4) Verifica password corrente
    if (!password_verify($currentPwd, $user['password_hash'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Password attuale errata']);
        exit;
    }

    // 5) Hash nuova password e aggiorno DB
    $newHash = password_hash($newPwd, PASSWORD_DEFAULT);
    $updStmt = $pdo->prepare("
        UPDATE users
        SET password_hash = :newhash
        WHERE id = :uid
    ");
    $updStmt->execute([
        ':newhash' => $newHash,
        ':uid'     => $_SESSION['user_id']
    ]);

    echo json_encode(['status' => 'success']);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
    exit;
}
