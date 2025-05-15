<?php
require_once '../config.php';

// Verifica se l'utente è autenticato
session_start();
$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    http_response_code(401);
    exit("Utente non autenticato");
}

$id = $_GET['id'] ?? null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $desc = $_POST['description'] ?? '';
    $date = $_POST['due_date'] ?? '';
    $is_test = isset($_POST['is_test']) ? 1 : 0;

    $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ?, due_date = ?, is_test = ? 
                           WHERE id = ? AND user_id = ?");
    $stmt->execute([$title, $desc, $date, $is_test, $id, $user_id]);

    echo "Aggiornamento completato.";
    exit;
}

// Form di modifica (visualizzazione)
$stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $user_id]);
$task = $stmt->fetch();

if (!$task) {
    exit("Elemento non trovato.");
}

?>

<form method="POST">
    <input type="text" name="title" value="<?= htmlspecialchars($task['title']) ?>" required />
    <textarea name="description"><?= htmlspecialchars($task['description']) ?></textarea>
    <input type="date" name="due_date" value="<?= $task['due_date'] ?>" required />
    <label>
        <input type="checkbox" name="is_test" value="1" <?= $task['is_test'] ? 'checked' : '' ?> />
        È un test
    </label>
    <button type="submit">Salva</button>
</form>
