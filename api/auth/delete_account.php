<?php
/**
 * delete_account.php
 *
 * API per eliminare lʼaccount dellʼutente loggato.
 * Rimuove la riga in `users` (e per ON DELETE CASCADE elimina tasks, sessions, ecc.)
 * Termina la sessione e restituisce JSON.
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config.php';
session_start();

// Verifico sessione
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // 1) Elimino utente (tasks, sessions, stats verranno eliminati per foreign key cascade)
    $delStmt = $pdo->prepare("DELETE FROM users WHERE id = :uid");
    $delStmt->execute([':uid' => $userId]);

    // 2) Distruggo la sessione
    session_unset();
    session_destroy();

    echo json_encode(['status' => 'success']);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
    exit;
}
