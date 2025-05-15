<?php
require_once '../config.php';

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Inserisci username e password']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenziali errate']);
    exit;
}

// Salva ID in sessione
$_SESSION['user_id'] = $user['id'];
echo json_encode(['success' => true]);
?>
