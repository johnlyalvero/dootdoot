// add_task.js
// Script per gestire il form di creazione di un nuovo task o test e inviare i dati a add.php tramite Fetch API

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-task-form');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Blocca il comportamento di default del form

    // Preleva i valori dai campi del form
    const title       = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const dueDate     = document.getElementById('due-date').value;
    const isTest      = document.getElementById('is-test').checked;

    // Prepara il payload JSON
    const payload = { title, description, due_date: dueDate, is_test: isTest };

    try {
      // Invio della richiesta POST al backend
      const response = await fetch('../../api/tasks/add.php', {
        method: 'POST',
        credentials: 'include', // include cookie di sessione per autenticazione
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json(); // parsing della risposta JSON

      if (response.ok && data.success) {
        // Successo: avviso e redirect
        messageDiv.innerHTML = `<div class="alert alert-success">Attività creata con ID ${data.task_id}</div>`;
        setTimeout(() => {
          window.location.href = 'tasks.html';
        }, 2000);
      } else {
        // Errore restituito dall'API
        messageDiv.innerHTML = `<div class="alert alert-danger">${data.error || 'Errore nella creazione dell\'attività'}</div>`;
      }
    } catch (error) {
      // Errore di rete o imprevisto
      console.error('Fetch error:', error);
      messageDiv.innerHTML = `<div class="alert alert-danger">Errore di rete: ${error.message}</div>`;
    }
  });
});
