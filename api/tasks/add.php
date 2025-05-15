<?php
require_once '../config.php';  // contiene $pdo e session_start()

// Verifica se l'utente è autenticato
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Utente non autenticato']);
    exit;
}

$title = trim($_POST['title'] ?? '');
$desc = trim($_POST['description'] ?? '');
$due_date = $_POST['due_date'] ?? '';
$is_test = isset($_POST['is_test']) ? 1 : 0;

if (!$title || !$due_date) {
    http_response_code(400);
    echo json_encode(['error' => 'Compila tutti i campi obbligatori']);
    exit;
}

// Controlla se la data è valida
$stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, description, due_date, is_test) 
                       VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$user_id, $title, $desc, $due_date, $is_test]);

$task_id = $pdo->lastInsertId();

// Se è un test, crea 4 sessioni automatiche
if ($is_test) {
    $giorni = [7, 6, 3, 1];
    foreach ($giorni as $g) {
        $data = date('Y-m-d', strtotime("$due_date -$g days"));
        $start = "$data 16:00:00";
        $end = "$data 17:00:00";
        $stmt = $pdo->prepare("INSERT INTO study_sessions (user_id, start_time, end_time, duration_minutes, notes) 
                               VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $start, $end, 60, "Studio per il test: $title"]);
    }
}

echo json_encode(['success' => true]);
?>
