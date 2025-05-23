// tasks.js
// Recupera e visualizza tasks+sessions, aggiunge pulsanti Edit/Delete e popola i modali

document.addEventListener('DOMContentLoaded', async () => {
  const tasksList = document.getElementById('tasks-list');
  const noTasksMessage = document.getElementById('no-tasks-message');

  try {
    const response = await fetch('../../api/tasks/list.php', { method: 'GET', credentials: 'include' });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Errore recupero attività');
    const tasks = data.tasks;
    if (tasks.length === 0) {
      noTasksMessage.classList.remove('d-none');
      return;
    }

    tasks.forEach(task => {
      const item = document.createElement('div');
      item.className = 'list-group-item mb-3';

      // Titolo e data
      const title = document.createElement('h5');
      title.textContent = `${task.title} (${new Date(task.due_date).toLocaleDateString()})`;
      item.appendChild(title);

      // Pulsanti Modifica/Elimina Task
      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn btn-sm btn-primary me-2 btn-edit-task';
      btnEdit.textContent = 'Modifica';
      btnEdit.dataset.id = task.id;
      item.appendChild(btnEdit);

      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn btn-sm btn-danger btn-delete-task';
      btnDelete.textContent = 'Elimina';
      btnDelete.dataset.id = task.id;
      item.appendChild(btnDelete);

      // Descrizione
      if (task.description) {
        const desc = document.createElement('p');
        desc.textContent = task.description;
        item.appendChild(desc);
      }

      // Sessioni per test
      if (task.is_test && task.sessions?.length) {
        const sessionsHeader = document.createElement('h6');
        sessionsHeader.textContent = 'Sessioni di studio:';
        item.appendChild(sessionsHeader);

        task.sessions.forEach(session => {
          const sessionItem = document.createElement('div');
          sessionItem.className = 'd-flex align-items-center mb-1';

          // Label sessione
          const lbl = document.createElement('span');
          lbl.className = 'me-auto';
          lbl.textContent = new Date(session.start_time).toLocaleString();
          sessionItem.appendChild(lbl);

          // Pulsanti Session
          const editS = document.createElement('button');
          editS.className = 'btn btn-sm btn-secondary me-2 btn-edit-session';
          editS.textContent = 'Modifica';
          editS.dataset.id = session.id;
          sessionItem.appendChild(editS);

          const delS = document.createElement('button');
          delS.className = 'btn btn-sm btn-danger btn-delete-session';
          delS.textContent = 'Elimina';
          delS.dataset.id = session.id;
          sessionItem.appendChild(delS);

          item.appendChild(sessionItem);
        });
      }

      tasksList.appendChild(item);
    });

  } catch (error) {
    console.error(error);
    tasksList.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
});

// Listener globali per aprire modali e popolare campi

document.addEventListener('click', event => {
  // Modifica Task
  if (event.target.matches('.btn-edit-task')) {
    const id = event.target.dataset.id;
    // Recupero il task dai dati già caricati in pagina (opzionale: fetch singolo)
    fetch('../../api/tasks/list.php', {credentials:'include'})
      .then(r => r.json())
      .then(data => {
        const task = data.tasks.find(t => t.id == id);
        document.getElementById('edit-task-id').value = task.id;
        document.getElementById('edit-title').value = task.title;
        document.getElementById('edit-description').value = task.description || '';
        document.getElementById('edit-due-date').value = task.due_date;
        document.getElementById('edit-is-test').checked = task.is_test;
        document.getElementById('edit-completed').checked = task.completed;
        new bootstrap.Modal(document.getElementById('editTaskModal')).show();
      });
  }

  // Modifica Sessione
  if (event.target.matches('.btn-edit-session')) {
    const id = event.target.dataset.id;
    fetch('../../api/tasks/list.php', {credentials:'include'})
      .then(r => r.json())
      .then(data => {
        const session = data.tasks
          .flatMap(t => t.sessions || [])
          .find(s => s.id == id);
        document.getElementById('edit-session-id').value = session.id;
        document.getElementById('edit-start-time').value = session.start_time.replace(' ', 'T');
        document.getElementById('edit-end-time').value = session.end_time ? session.end_time.replace(' ', 'T') : '';
        document.getElementById('edit-notes').value = session.notes || '';
        new bootstrap.Modal(document.getElementById('editSessionModal')).show();
      });
  }
});