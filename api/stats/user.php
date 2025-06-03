<?php
/**
 * user.php
 *
 * API per calcolare e restituire le statistiche personali dell’utente loggato:
 * - focus: media dei valori focus_score da study_sessions
 * - disciplina: percentuale di task completati
 * - efficiency: valore placeholder
 * - dedication: valore placeholder
 */

header('Content-Type: application/json; charset=utf-8');

// Includo la configurazione e connessione PDO
require_once __DIR__ . '/../config.php';

// Avvio o riprendo la sessione per verificare l’utente loggato
session_start();

// Controllo che l’utente sia autenticato
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Unauthorized'
    ]);
    exit;
}

try {
    $userId = $_SESSION['user_id'];

    //
    // 1) Calcolo della statistica "focus":
    //    media dei valori focus_score dalla tabella study_sessions
    //
    $stmtFocus = $pdo->prepare("
        SELECT AVG(focus_score) AS avg_focus
        FROM study_sessions
        WHERE user_id = :uid
    ");
    $stmtFocus->bindParam(':uid', $userId, PDO::PARAM_INT);
    $stmtFocus->execute();
    $rowFocus = $stmtFocus->fetch();
    // Se non ci sono sessioni, assegno 0.00
    $focus = ($rowFocus['avg_focus'] !== null)
        ? round((float)$rowFocus['avg_focus'], 2)
        : 0.00;

    //
    // 2) Calcolo della statistica "disciplina":
    //    conta i task totali e quelli completati nella tabella tasks
    //
    $stmtDisc = $pdo->prepare("
        SELECT
            COUNT(*) AS total_tasks,
            SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed_tasks
        FROM tasks
        WHERE user_id = :uid
    ");
    $stmtDisc->bindParam(':uid', $userId, PDO::PARAM_INT);
    $stmtDisc->execute();
    $rowDisc = $stmtDisc->fetch();

    $totalTasks     = (int)$rowDisc['total_tasks'];
    $completedTasks = (int)$rowDisc['completed_tasks'];

    if ($totalTasks > 0) {
        // Calcolo percentuale arrotondata a 2 decimali
        $discipline = round(($completedTasks / $totalTasks) * 100, 2);
    } else {
        // Se non ci sono task, disciplina = 0
        $discipline = 0;
    }

    //
    // 3) Statistica "efficiency" e "dedication":
    //    per ora valori statici placeholder
    //
    $efficiency = 72;          // placeholder: indice su 100
    $dedication = "🟢 Attivo"; // placeholder: badge a forma di stringa

    // Restituisco tutte le statistiche in formato JSON
    echo json_encode([
        'status' => 'success',
        'data'   => [
            'focus'      => $focus,        // media focus su 5
            'discipline' => $discipline,   // percentuale completamento
            'efficiency' => $efficiency,   // placeholder
            'dedication' => $dedication    // placeholder
        ]
    ]);
    exit;

} catch (PDOException $e) {
    // In caso di errore PDO restituisco 500 Internal Server Error
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Database error'
    ]);
    exit;
}
