<?php
require_once '../config.php';

// Validazione e sanitizzazione
$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';
$school = trim($_POST['school'] ?? '');
$class = trim($_POST['class'] ?? '');
$profile_img = $_FILES['profile_img'] ?? null;

if (!$username || !$password || !$school || !$class || !$profile_img) {
    http_response_code(400);
    echo json_encode(['error' => 'Compila tutti i campi']);
    exit;
}

// Check se utente esiste
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Username già in uso']);
    exit;
}

// Hash della password
$hashed = password_hash($password, PASSWORD_BCRYPT);

// Salva immagine profilo (opzionale)
$imgPath = 'uploads/default.png';  // Fallback
if ($profile_img && $profile_img['error'] === UPLOAD_ERR_OK) {
    $ext = pathinfo($profile_img['name'], PATHINFO_EXTENSION);
    $imgPath = 'uploads/' . uniqid() . '.' . $ext;
    move_uploaded_file($profile_img['tmp_name'], '../../www/assets/img/' . $imgPath);
}

// Inserisci nel DB
$stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, school, class, profile_img) 
                       VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $username,
    $username . '@doot.local', // email fittizia per ora
    $hashed,
    $school,
    $class,
    $imgPath
]);

echo json_encode(['success' => true]);
?>
