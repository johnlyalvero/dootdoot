<?php
/**
 * upload_profile_image.php
 *
 * API per caricare/modificare l’immagine profilo utente.
 * - Riceve file via multipart/form-data (campo 'profile_image')
 * - Valida tipo e dimensione
 * - Sposta il file in /www/assets/img/profiles/
 * - Aggiorna la colonna `profile_img` nella tabella `users`
 * - Restituisce JSON con path relativo all’immagine
 */

// Mostriamo errori per debug (rimuovere in produzione)
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config.php';
session_start();

// 1) Verifico login
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status'=>'error','message'=>'Unauthorized']);
    exit;
}

// 2) Verifico che sia arrivato un file
if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status'=>'error','message'=>'Nessun file caricato o errore upload']);
    exit;
}

// 3) Validazione MIME e dimensione massima (es. 2MB)
$allowedTypes = ['image/jpeg','image/png','image/webp'];
$fileInfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($fileInfo, $_FILES['profile_image']['tmp_name']);
finfo_close($fileInfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['status'=>'error','message'=>'Formato immagine non supportato. Solo JPEG, PNG o WEBP.']);
    exit;
}

$maxSizeBytes = 2 * 1024 * 1024; // 2 MB
if ($_FILES['profile_image']['size'] > $maxSizeBytes) {
    http_response_code(400);
    echo json_encode(['status'=>'error','message'=>'Dimensione file superiore a 2MB.']);
    exit;
}

// 4) Costruisco nome file univoco: userID_timestamp.ext
$ext = '';
switch ($mimeType) {
    case 'image/jpeg': $ext = '.jpg'; break;
    case 'image/png':  $ext = '.png'; break;
    case 'image/webp': $ext = '.webp'; break;
}
$userId = $_SESSION['user_id'];
$timestamp = time();
$filename = "user_{$userId}_{$timestamp}{$ext}";
$destinationDir = __DIR__ . '/../../www/assets/img/profiles/';
$destinationPath = $destinationDir . $filename;

// 5) Sposto il file
if (!move_uploaded_file($_FILES['profile_image']['tmp_name'], $destinationPath)) {
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>'Errore durante il salvataggio dell’immagine']);
    exit;
}

// 6) Aggiorno DB (campo profile_img con path relativo)
$relativePath = "assets/img/profiles/{$filename}";
try {
    $stmt = $pdo->prepare("UPDATE users SET profile_img = :img WHERE id = :uid");
    $stmt->bindParam(':img', $relativePath, PDO::PARAM_STR);
    $stmt->bindParam(':uid', $userId, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode([
        'status'      => 'success',
        'profile_img' => $relativePath
    ]);
    exit;

} catch (PDOException $e) {
    // Se il DB fallisce, elimina il file salvato per coerenza
    if (file_exists($destinationPath)) {
        unlink($destinationPath);
    }
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>'Database error: ' . $e->getMessage()]);
    exit;
}
