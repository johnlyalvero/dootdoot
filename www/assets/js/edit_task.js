// edit_task.js
// Gestisce Submit del form per aggiornare un task via PUT

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edit-task-form') || document.getElementById('edit-task-page-form');
  const saveBtn = document.getElementById('save-task-btn');

  // Funzione comune per inviare update
  async function updateTask(payload) {
    const res = await fetch('../../api/tasks/update.php', {
      method: 'PUT',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  // Se è modal: prepopolo form quando aperto
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const payload = {
        id: document.getElementById('edit-task-id').value,
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-description').value,
        due_date: document.getElementById('edit-due-date').value,
        is_test: document.getElementById('edit-is-test').checked,
        completed: document.getElementById('edit-completed').checked
      };
      const data = await updateTask(payload);
      if (data.success) location.reload();
      else alert(data.error);
    });
  }

  // Se è pagina standalone: carico dati e gestisco submit
  if (form && form.id === 'edit-task-page-form') {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    // Prepopolazione ... puoi riutilizzare fetch('/api/tasks/list.php') per trovare il task

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = { id,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        due_date: document.getElementById('due-date').value,
        is_test: document.getElementById('is-test').checked,
        completed: document.getElementById('completed').checked
      };
      const data = await updateTask(payload);
      if (data.success) window.location.href = 'tasks.html';
      else alert(data.error);
    });
  }
});