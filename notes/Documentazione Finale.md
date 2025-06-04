
---

## 1. Panoramica delle Funzionalità Implementate

### EPIC 1 – Autenticazione e Sicurezza
- **Registrazione utente**  
  - Form in `register.html` (username, password, scuola, classe, immagine profilo).  
  - Backend in `api/auth/register.php`: validazione input, hash della password, salvataggio in MySQL.
- **Login utente**  
  - Form in `login.html` (username + password).  
  - Backend in `api/auth/login.php`: verifica credenziali, `session_start()`, memorizza `$_SESSION['user_id']`.
- **Logout**  
  - Pulsante logout in `dashboard.html`, gestito in `dashboard.js` → `api/auth/logout.php`: `session_destroy()` e redirect a `login.html`.
- **Protezione rotte**  
  - Ogni API di turno (tasks, sessions, stats, profile, settings) controlla `$_SESSION['user_id']` e restituisce `401 Unauthorized` se mancante.

---

### EPIC 2 – Gestione Task, Test e Sessioni di Studio
- **Creazione di Task e Test**  
  - Pagine:
    - `add_task.html` con form titolo, descrizione, data, checkbox “is_test”.  
    - `add_task.js`: Fetch POST → `api/tasks/add.php`.  
  - Backend `api/tasks/add.php`: salva in tabella `tasks`.  
    - Se `is_test = 1`, genera automaticamente 4 record in `study_sessions` (7, 6, 3, 1 giorno prima).
- **Visualizzazione di Task e Test**  
  - Pagine:
    - `tasks.html`: elenco di task (filtro `?type=task`), elenco di test (filtro `?type=test`), tab di toggle.  
    - `tasks.js`:  
      - `loadTaskCount()` e `loadTestCount()` per mostrare il numero nella UI.  
      - `loadTaskList()`: Fetch GET → `api/tasks/list.php?type=task`, filtra `completed = 0`, mostra `<li>` con checkbox, titolo, data, icone edit/delete.  
      - `loadTestList()`: Fetch GET → `api/tasks/list.php?type=test`, per ogni test mostra titolo, data, descrizione e sottoelenco `sessions` (4 future) con data e stato.
- **Modifica e Cancellazione**  
  - Endpoints:
    - `api/tasks/update.php` (PUT): aggiorna titolo, descrizione, data, `is_test`, `completed`.  
    - `api/tasks/delete.php` (DELETE): elimina task e relative sessioni (cascade).
    - `api/sessions/update.php` e `api/sessions/delete.php` per modificare/cancellare singole sessioni.
  - Frontend in `tasks.js`:
    - `openEditModal(item, type)`: apre modale pre‐caricando i campi, poi invia PUT a `/api/tasks/update.php` o `/api/sessions/update.php`.
    - `openDeleteModal(item, type)`: conferma e invia DELETE.
- **Toggle Completamento Task**  
  - In `loadTaskList()`, ogni `<li>` task ha `<input type="checkbox" class="task-checkbox">`.  
  - Al change del checkbox, `toggleTaskCompletion(id, checked)` invia PUT con `{ id, completed: 1/0, is_test: 0 }`.  
  - Se confermato, ricarica `loadTaskList()` per rimuovere task completato.
- **Sessioni per i Test**  
  - `list.php?type=test` restituisce array `tasks` con sotto‐array `sessions` per ogni test (id, `session_due_date`).  
  - In `loadTestList()`, per ogni test itera su `test.sessions` e aggiunge un sotto‐elenco `<ul>` con date delle sessioni.  
  - Ogni sessione ha icona edit/delete che chiama `openEditModal(session, 'session')` o `openDeleteModal(session, 'session')`.

---

### EPIC 3 – To-Do List Giornaliera
- **Pagina `daily_todo.html`**  
  - Elenco di task non completati e sessioni di studio programmate per la data odierna.
  - `daily_todo.js`:  
    - `fetch('../../api/tasks/list.php?type=task')` → filtra `due_date = oggi` e `completed = 0`.  
    - `fetch('../../api/sessions/list.php?date=oggi')` (endpoint dedicato o filter su `list.php?type=test`) → filtra `session_due_date = oggi`.  
    - Popola due sezioni separate: “Task del Giorno” e “Sessioni del Giorno”.

---

### EPIC 4 – Focus Timer e Studio Attivo
- **`dashboard.html`**  
  - Timer grande al centro (`<div id="timer-display">`) inizializzato a `25:00`.  
  - Pulsante `#btn-start` toggla “Avvio” ↔ “Give Up”.
  - Clic su display apre modal `#modal-duration`.  
- **`dashboard.js`**  
  - `setupTimer()`:  
    - `remainingSeconds = 25 * 60` di default; `updateDisplay()` aggiorna il DOM.  
    - `startTimer()`: `setInterval` riduce `remainingSeconds` ogni secondo, fino a 0; cambia testo/pulsante.  
    - `stopTimer()`: `clearInterval()`, reimposta stato button.  
    - `input-duration`: regola `remainingSeconds` se `5 ≤ val ≤ 120`, altrimenti `alert()`.  
  - **Al termine** (`onTimerEnd()`):  
    - Chiama `fetchPendingTasks()` e `fetchPendingSessions()`.  
    - `fetchPendingTasks()`: GET `list.php?type=task` → filtra `completed = 0`.  
    - `fetchPendingSessions()`: GET `list.php?type=test` → itera `test.sessions` e filtra date ≥ oggi.  
    - `populateSummaryModal(tasks, sessions)`: riempie `<ul id="summary-pending-tasks">` e `<ul id="summary-pending-sessions">`.  
    - Apre `#modal-summary`.  
    - Clic su “Chiudi” chiude `#modal-summary` e apre `#modal-feedback`.  
  - `submitFeedback()`: quando user invia feedback, POST JSON a `api/feedback/add.php`.  
- **Modal di feedback**  
  - `#modal-feedback` contiene form con:  
    - `#feedback-focus` (range 1–5),  
    - `#feedback-utilita` (select 1–5),  
    - `#feedback-distrazioni` (textarea).  
  - Submit invia `{ focus, utilita, distrazioni }` a `api/feedback/add.php`.

---

### EPIC 5 – Feedback e Valutazione Sessioni
- **Salvataggio feedback**  
  - Endpoint `api/feedback/add.php`:  
    - `session_start()`, se non loggato `401`.  
    - Legge JSON con `focus, utilita, distrazioni` (eventuale `session_id`).  
    - Inserisce in tabella `feedback` (o aggiorna `study_sessions` con punteggi).  
    - Restituisce `{ status:"success" }`.
- **Dati raccolti**  
  - `focus_score`, `discipline_score`, `efficiency_score`, `dedication_score` su `study_sessions` o tabella `feedback`.

---

### EPIC 6 – Profilo e Statistiche Utente
- **`profile.html`**  
  - Header “PROFILO” + pulsante ritorno dashboard.  
  - “Hey [username]!” + box con immagine profilo (`.profile-img-large`) e dati: nome, scuola, classe.  
  - Quattro card statistiche (focus, disciplina, efficienza, dedizione).  
- **`profile.js`**  
  - Al `DOMContentLoaded`:  
    - Fetch `api/auth/get_profile.php` → `{ username, school, class, profile_img }`, popola DOM.  
    - Fetch `api/stats/user.php` → `{ focus, discipline, efficiency, dedication }`, popola le card.  
- **`stats.html`**  
  - Grafici e tabelle avanzate (non ancora sviluppati in dettaglio, placeholder).
- **Calcolo Statistiche**  
  - `api/stats/user.php`:  
    - `focus = AVG(study_sessions.focus_score)`  
    - `discipline = (punti_ottenuti / punti_massimi) * 100`  
    - `efficiency = (media(produttività) / ore_studio) * Fattore_scalante` (placeholder 72)  
    - `dedication = (azioni_significative / soglia_settimanale) * 100` (placeholder "🟢 Attivo").  
  - Restituisce JSON `{ status:"success", data:{ focus, discipline, efficiency, dedication } }`.

---

### EPIC 7 – Impostazioni e Sicurezza
- **`settings.html`**  
  - Form “Cambia Password” con:  
    - `#current-password`, `#new-password`, `#confirm-password`, `#btn-update-password`.  
    - `#change-password-message` per feedback.  
  - Sezione “Elimina Account” con `#btn-delete-account` e `#delete-account-message`.  
- **`settings.js`**  
  - Form submit:  
    - Validazione client (campi non vuoti, lunghezza ≥ 6, conferma = nuova).  
    - Fetch POST a `api/auth/change_password.php` con `{ current_password, new_password }`.  
    - Se `success`, mostra “Password aggiornata” e reset form; altrimenti mostra errore.  
  - Bottone “Elimina Account”:  
    - `confirm()`: se confermato, fetch POST a `api/auth/delete_account.php`.  
    - Se `success`, alert “Account eliminato” e redirect `login.html`.
- **`api/auth/change_password.php`**  
  - Controlla sessione.  
  - JSON input `{ current_password, new_password }`.  
  - SELECT `password_hash` da `users` → verifica con `password_verify()`.  
  - Se ok, `UPDATE users SET password_hash = password_hash(new_password)`.  
- **`api/auth/delete_account.php`**  
  - Controlla sessione.  
  - `DELETE FROM users WHERE id = $_SESSION['user_id']` (cascade elimina task/session/local_stats).  
  - `session_destroy()`, restituisce `{ status:"success" }`.

---

## 2. Workflow Suggerito per l’Uso dell’App

1. **Avvio e Registrazione**  
   - L’utente apre l’app (`index.html`) e sceglie “Registrati”.  
   - Compila `register.html` con dati anagrafici e optional immagine profilo.  
   - Viene creato un nuovo account in `users`; dopo registrazione, redirect automatico a `login.html`.

2. **Accesso e Dashboard**  
   - In `login.html`, inserisce username + password.  
   - Al login con successo, viene reindirizzato a `dashboard.html`.  
   - In alto appare l’avatar (default o personalizzato) e pulsante logout.

3. **Impostazione Timer e Inizio Studio**  
   - Nella Dashboard vede timer impostato a 25:00 (default).  
   - Può cliccare sul timer per cambiare durata (5–120 minuti).  
   - Clic su “Avvio” fa partire il countdown; il pulsante diventa “Give Up” per fermare anticipatamente.  
   - Durante il conto alla rovescia, può monitorare altre statistiche rapide.

4. **Fine Timer → Riepilogo Task/Sessioni**  
   - Quando il timer raggiunge 00:00, compare il modal “Riepilogo Task” con la lista dei task ancora non completati (completati = 0).  
   - Dopo aver letto, clicca “Chiudi”; viene aperto immediatamente il modal “Feedback Sessione”.

5. **Feedback Post-Sessione**  
   - Nel modal feedback seleziona livello di focus (1–5), utilità (1–5), scrive eventuali distrazioni.  
   - Clic su “Invia Feedback” invia i dati a `api/feedback/add.php` e chiude il modal.  
   - Dashboard può aggiornare statistiche (opzionale).

6. **Gestione Task e Test**  
   - Naviga a `tasks.html` (tramite navbar → icona 📝).  
   - Vede la lista dei task non completati (checkbox).  
   - Vede la lista dei test (con le sessioni programmate in un sotto‐elenco).  
   - Può:
     - Marcare un task come completato (il checkbox invia update e la riga sparisce).  
     - Creare un nuovo task (`#btn-new-task` apre modal con form titolo, descrizione, data).  
     - Creare un nuovo test (`#btn-new-test` apre modal simile, `is_test=1`).  
     - All’inserimento di un test, il backend genera 4 sessioni (7, 6, 3, 1 giorno prima).  
     - Modificare/cancellare un task/test via icone ✏️ e 🗑️, che aprono un modal di editing.  
     - Modificare/cancellare singole sessioni (in `loadTestList()` sotto ogni test).

7. **Profilo e Statistiche Avanzate**  
   - Naviga a `profile.html` (navbar o clic sull’avatar).  
   - Visualizza nome utente, scuola, classe, immagine profilo.  
   - Sotto, vede le metriche:
     - **Focus**: media livelli concentrazione (su 5).  
     - **Disciplina**: % dei task completati in tempo.  
     - **Efficienza**: indice su 100 (placeholder, da integrare).  
     - **Dedizione**: badge o % attività settimanali.  
   - Statistiche calcolate da `api/stats/user.php`.

8. **Impostazioni e Sicurezza**  
   - Naviga a `settings.html`.  
   - **Cambia Password**: inserisce password attuale + nuova + conferma → `api/auth/change_password.php`.  
   - **Elimina Account**: clicca “Elimina Account”, conferma, `api/auth/delete_account.php` → account e tutti i dati vengono rimossi, sessione distrutta, redirect `login.html`.

9. **Logout e Chiusura Sessione**  
    - In qualsiasi pagina, clicca su “Logout” (navbar o header).  
    - Viene chiamato `api/auth/logout.php`, sessione terminata, redirect a `login.html`.  

---

## 3. Possibili Miglioramenti e Aggiunte Future

1. **Dashboard Avanzata**  
   - Grafico a torta o barre per mostrare l’andamento settimanale di focus/discipline.  
   - Collegamenti rapidi: “Inizia nuova sessione di studio” direttamente da dashboard.

2. **Notifiche Push o Reminder**  
   - Reminder sul telefono (via Cordova) per ricordare le sessioni di studio programmata.  
   - Notifiche locali a 7, 6, 3, 1 giorno prima del test.

3. **Upload e Ritaglio Immagine Profilo**  
   - Permettere all’utente di caricare una propria foto e ridimensionarla lato client.  

4. **Statistiche e Report Avanzati**  
   - Pagina “Stats” con grafici interattivi (Recharts o Chart.js): evoluzione focus, disciplina, sessioni completate, dedizione settimanale.  
   - Esportazione report PDF o CSV.

5. **Ricerca e Filtri Task/Test**  
   - In `tasks.html`, aggiungere barra di ricerca e dropdown per filtrare per data/intervallo.  
   - Ordinamento per priorità o tipo.

6. **Gestione Collaborativa**  
   - Condivisione di task/test con altri utenti (gruppi di studio).  
   - Chat room integrata per discutere di un test specifico.

7. **Tema e Personalizzazione UI**  
   - Alternare tra dark mode e light mode.  
   - Scegliere colori personalizzati.

8. **Ottimizzazioni Performance**  
   - Pagination per liste lunghissime di task.  
   - Caching lato client (IndexedDB) per funzionamento offline.

9. **Validazioni e Sicurezza Aggiuntive**  
   - Limiti di lunghezza/desino del titolo task e descrizione.  
   - Protezione CSRF per form e API (token).  
   - Rate‐limiting su chiamate API (throttling).

10. **Backup & Ripristino Dati**  
    - Permettere all’utente di esportare periodicamente il proprio database (JSON o SQL).  
    - Importazione dati in caso di reinstallazione o cambio dispositivo.

---

## 4. Conclusione

L’app “Doot Doot” ora offre un flusso completo per:

- **Registrazione** → **Login** → **Dashboard** → **Timer** → **Riepilogo Task/Sessioni** → **Feedback** → **Task/Test** → **To-Do Giornaliera** → **Profilo/Statistiche** → **Impostazioni** → **Logout**

Tutte le funzionalità base sono state implementate in modo sicuro e modulare, con:

- PHP + MySQL (PDO) per il backend  
- AJAX (Fetch API) lato frontend  
- Cordova-ready (architettura file pronta per packaging mobile)  

I suggerimenti elencati nella sezione “Miglioramenti” offrono spunti per funzioni aggiuntive, ottimizzazioni e arricchimenti futuri.
