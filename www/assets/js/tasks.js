/**
 * tasks.js
 *
 * 1. Carica e conta i Task e i Test (da API)
 * 2. Popola le liste #section-tasks e #section-tests
 * 3. Gestisce toggle tra “Task” e “Test”
 * 4. Apre i modal per New Task e modifica/cancella
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1) Carico liste iniziali
  loadTaskCount();
  loadTasksList();
  loadTestCount();
  loadTestsList();

  // 2) Toggle sezioni
  const btnTasks = document.getElementById('btn-view-tasks');
  const btnTests = document.getElementById('btn-view-tests');
  const sectionTasks = document.getElementById('section-tasks');
  const sectionTests = document.getElementById('section-tests');

  if (btnTasks && btnTests && sectionTasks && sectionTests) {
    btnTasks.addEventListener('click', () => {
      sectionTasks.classList.remove('hidden');
      sectionTests.classList.add('hidden');
    });
    btnTests.addEventListener('click', () => {
      sectionTests.classList.remove('hidden');
      sectionTasks.classList.add('hidden');
    });
  }

  // 3) New Task
  const btnNewTask = document.getElementById('btn-new-task');
  const modalNewTask = document.getElementById('modal-new-task');
  const formNewTask = document.getElementById('form-new-task');
  const btnCancelTask = document.getElementById('btn-cancel-task');

  if (btnNewTask && modalNewTask && formNewTask && btnCancelTask) {
    btnNewTask.addEventListener('click', () => {
      openModal(modalNewTask);
    });

    btnCancelTask.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(modalNewTask);
    });

    formNewTask.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('task-title').value.trim();
      const date  = document.getElementById('task-date').value;
      if (!title || !date) {
        alert('Compila titolo e data.');
        return;
      }
      try {
        const response = await fetch('../../api/tasks/add.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, due_date: date, is_test: false })
        });
        if (response.status === 401) {
          window.location.href = 'login.html';
          return;
        }
        if (!response.ok) throw 'network-error';

        const json = await response.json();
        if (json.status === 'success') {
          closeModal(modalNewTask);
          loadTaskCount();
          loadTasksList();
          formNewTask.reset();
        } else {
          console.error('Errore creazione Task:', json.message);
        }
      } catch (err) {
        console.error('Errore di rete new task:', err);
      }
    });
  }

  // 4) Gestione modifica/cancella Task e Test (delegation)
  const taskListEl = document.querySelector('#section-tasks .item-list');
  const testListEl = document.querySelector('#section-tests .item-list');

  // Event delegation per Task
  if (taskListEl) {
    taskListEl.addEventListener('click', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;
      const taskId = item.dataset.id;
      openModifyTaskModal(taskId);
    });
  }

  // Event delegation per Test
  if (testListEl) {
    testListEl.addEventListener('click', (e) => {
      const item = e.target.closest('.item');
      if (!item) return;
      const testId = item.dataset.id;
      openModifyTestModal(testId);
    });
  }
});

/* ----- Funzioni di caricamento lista e contatori ----- */

async function loadTaskCount() {
  try {
    const response = await fetch('../../api/tasks/list.php?type=task', {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) throw 'network-error';
    const json = await response.json();
    if (json.status === 'success' && Array.isArray(json.tasks)) {
      document.querySelector('.count-tasks').textContent = json.tasks.length;
    }
  } catch (err) {
    console.error('Errore loadTaskCount:', err);
  }
}

async function loadTasksList() {
  try {
    const response = await fetch('../../api/tasks/list.php?type=task', {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) throw 'network-error';
    const json = await response.json();
    if (json.status === 'success') {
      populateTaskList(json.tasks);
    }
  } catch (err) {
    console.error('Errore loadTasksList:', err);
  }
}

async function loadTestCount() {
  try {
    const response = await fetch('../../api/tasks/list.php?type=test', {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) throw 'network-error';
    const json = await response.json();
    if (json.status === 'success' && Array.isArray(json.tasks)) {
      document.querySelector('.count-tests').textContent = json.tasks.length;
    }
  } catch (err) {
    console.error('Errore loadTestCount:', err);
  }
}

async function loadTestsList() {
  try {
    const response = await fetch('../../api/tasks/list.php?type=test', {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) throw 'network-error';
    const json = await response.json();
    if (json.status === 'success') {
      populateTestList(json.tasks);
    }
  } catch (err) {
    console.error('Errore loadTestsList:', err);
  }
}

/* ----- Funzioni di popolamento DOM ----- */

function populateTaskList(tasks) {
  const ul = document.querySelector('#section-tasks .item-list');
  if (!ul) return;
  ul.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.classList.add('item');
    li.dataset.id = task.id;
    li.innerHTML = `
      <span class="item-checkbox">○</span>
      <div class="item-content">
        <p class="item-title">${task.title}</p>
        <p class="item-date">Scadenza: ${task.due_date}</p>
      </div>
    `;
    ul.appendChild(li);
    const hr = document.createElement('hr');
    hr.classList.add('divider');
    ul.appendChild(hr);
  });
}

function populateTestList(tests) {
  const ul = document.querySelector('#section-tests .item-list');
  if (!ul) return;
  ul.innerHTML = '';
  tests.forEach(test => {
    const li = document.createElement('li');
    li.classList.add('item');
    li.dataset.id = test.id;
    li.innerHTML = `
      <div class="item-content">
        <p class="item-title">${test.title}</p>
        <p class="item-date">Data: ${test.due_date}</p>
        <p class="item-desc">${test.description || ''}</p>
      </div>
    `;
    ul.appendChild(li);
    const hr = document.createElement('hr');
    hr.classList.add('divider');
    ul.appendChild(hr);
  });
}

/* ----- Funzioni modali per modifica/cancella ----- */

function openModifyTaskModal(taskId) {
  // Crea popup dinamico per modificare o cancellare il task
  const modal = document.createElement('div');
  modal.classList.add('modal', 'show');
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Modifica Task</h5>
          <button class="btn-close" data-action="close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-modify-task">
            <label for="edit-title">Titolo</label>
            <input type="text" id="edit-title" value="" required>
            <label for="edit-date">Data</label>
            <input type="date" id="edit-date" required>
            <button class="btn btn-confirm" type="submit">Salva</button>
            <button class="btn btn-danger" id="btn-delete-task">Elimina</button>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Carico i dati correnti del task
  fetchTaskById(taskId).then(task => {
    modal.querySelector('#edit-title').value = task.title;
    modal.querySelector('#edit-date').value = task.due_date;
  });

  // Chiudi modal
  modal.querySelector('[data-action="close"]').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Salva modifiche
  modal.querySelector('#form-modify-task').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedTitle = modal.querySelector('#edit-title').value.trim();
    const updatedDate  = modal.querySelector('#edit-date').value;
    try {
      const response = await fetch('../../api/tasks/update.php', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, title: updatedTitle, due_date: updatedDate })
      });
      if (!response.ok) throw 'network-error';
      const json = await response.json();
      if (json.status === 'success') {
        document.body.removeChild(modal);
        loadTaskCount();
        loadTasksList();
      } else {
        console.error('Errore update Task:', json.message);
      }
    } catch (err) {
      console.error('Errore di rete update task:', err);
    }
  });

  // Elimina task
  modal.querySelector('#btn-delete-task').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Sei sicuro di voler eliminare questo task?')) return;
    try {
      const response = await fetch('../../api/tasks/delete.php', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      });
      if (!response.ok) throw 'network-error';
      const json = await response.json();
      if (json.status === 'success') {
        document.body.removeChild(modal);
        loadTaskCount();
        loadTasksList();
      } else {
        console.error('Errore delete Task:', json.message);
      }
    } catch (err) {
      console.error('Errore rete delete task:', err);
    }
  });
}

async function fetchTaskById(taskId) {
  // API che restituisce un singolo task (opzionale; se non esiste, puoi ricavarlo
  // filtrando la lista già caricata in memoria)
  try {
    const response = await fetch(`../../api/tasks/get.php?id=${taskId}`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) throw 'network-error';
    const json = await response.json();
    return json.task;
  } catch (err) {
    console.error('Errore fetchTaskById:', err);
    return { title: '', due_date: '' };
  }
}

function openModifyTestModal(testId) {
  // Simile a openModifyTaskModal, ma include anche descrizione
  const modal = document.createElement('div');
  modal.classList.add('modal', 'show');
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5>Modifica Test</h5>
          <button class="btn-close" data-action="close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="form-modify-test">
            <label for="edit-test-title">Titolo</label>
            <input type="text" id="edit-test-title" value="" required>
            <label for="edit-test-date">Data</label>
            <input type="date" id="edit-test-date" required>
            <label for="edit-test-desc">Descrizione</label>
            <textarea id="edit-test-desc" rows="3"></textarea>
            <button class="btn btn-confirm" type="submit">Salva</button>
            <button class="btn btn-danger" id="btn-delete-test">Elimina</button>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  fetchTestById(testId).then(test => {
    modal.querySelector('#edit-test-title').value = test.title;
    modal.querySelector('#edit-test-date').value = test.due_date;
    modal.querySelector('#edit-test-desc').value = test.description || '';
  });

  modal.querySelector('[data-action="close"]').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('#form-modify-test').addEventListener('submit', async (e) => {
    e.preventDefault();
    const utitle = modal.querySelector('#edit-test-title').value.trim();
    const udate  = modal.querySelector('#edit-test-date').value;
    const udesc  = modal.querySelector('#edit-test-desc').value.trim();
    try {
      const response = await fetch('../../api/tasks/update.php', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: testId, title: utitle, due_date: udate, description: udesc, is_test: true })
      });
      if (!response.ok) throw 'network-error';
      const json = await response.json();
      if (json.status === 'success') {
        document.body.removeChild(modal);
        loadTestCount();
        loadTestsList();
      } else {
        console.error('Errore update Test:', json.message);
      }
    } catch (err) {
      console.error('Errore rete update test:', err);
    }
  });

  modal.querySelector('#btn-delete-test').addEventListener('click', async (e) => {
    e.preventDefault();
    if (!confirm('Sei sicuro di voler eliminare questo test?')) return;
    try {
      const response = await fetch('../../api/tasks/delete.php', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: testId })
      });
      if (!response.ok) throw 'network-error';
      const json = await response.json();
      if (json.status === 'success') {
        document.body.removeChild(modal);
        loadTestCount();
        loadTestsList();
      } else {
        console.error('Errore delete Test:', json.message);
      }
    } catch (err) {
      console.error('Errore rete delete test:', err);
    }
  });
}

async function fetchTestById(testId) {
  try {
    const response = await fetch(`../../api/tasks/get.php?id=${testId}`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) throw 'network-error';
    const json = await response.json();
    return json.task;
  } catch (err) {
    console.error('Errore fetchTestById:', err);
    return { title: '', due_date: '', description: '' };
  }
}

/* ----- Helpers per modal ----- */

function openModal(modalEl) {
  modalEl.classList.add('show');
}

function closeModal(modalEl) {
  modalEl.classList.remove('show');
}
