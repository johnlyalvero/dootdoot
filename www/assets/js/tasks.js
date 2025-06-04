/**
 * www/assets/js/tasks.js
 *
 * 1. Toggle tra le sezioni “Task” e “Test”
 * 2. Conteggi iniziale
 * 3. Popolamento dinamico delle liste (Task / Test)
 * 4. Apertura e gestione dei modali: New Task, New Test, Edit/Delete
 * 5. Interazione con le API: add.php, update.php, delete.php
 */

document.addEventListener('DOMContentLoaded', () => {
  // Selettori principali
  const btnTasks     = document.getElementById('btn-view-tasks');
  const btnTests     = document.getElementById('btn-view-tests');
  const sectionTasks = document.getElementById('section-tasks');
  const sectionTests = document.getElementById('section-tests');

  // Modali e form per New Task/Test e Edit/Delete
  const modalNewTask     = document.getElementById('modal-new-task');
  const formNewTask      = document.getElementById('form-new-task');
  const btnCancelNewTask = document.getElementById('btn-cancel-new-task');

  const modalNewTest     = document.getElementById('modal-new-test');
  const formNewTest      = document.getElementById('form-new-test');
  const btnCancelNewTest = document.getElementById('btn-cancel-new-test');

  const btnCancelEditItem = document.getElementById('btn-cancel-edit-item');
  const formEditItem      = document.getElementById('form-edit-item');
  const btnDeleteItem     = document.getElementById('btn-delete-item');

  // 1) Toggle Task / Test
  if (sectionTasks && sectionTests) {
    // All’avvio: mostra Task, nascondi Test
    sectionTasks.classList.remove('hidden');
    sectionTests.classList.add('hidden');
  }
  if (btnTasks && btnTests && sectionTasks && sectionTests) {
    btnTasks.addEventListener('click', () => {
      sectionTasks.classList.remove('hidden');
      sectionTests.classList.add('hidden');
      btnTasks.classList.add('active');
      btnTests.classList.remove('active');
      loadTaskList();
    });
    btnTests.addEventListener('click', () => {
      sectionTests.classList.remove('hidden');
      sectionTasks.classList.add('hidden');
      btnTests.classList.add('active');
      btnTasks.classList.remove('active');
      loadTestList();
    });
  }

  // 2) Caricamento iniziale conteggi + lista Task
  loadTaskCount().then(() => {
    loadTaskList();
  });
  loadTestCount();

  // 3) Gestione MODALE NEW TASK
  document.getElementById('btn-new-task').addEventListener('click', () => {
    openModal(modalNewTask);
  });
  btnCancelNewTask.addEventListener('click', () => {
    closeModal(modalNewTask);
    formNewTask.reset();
  });
  formNewTask.addEventListener('submit', async e => {
    e.preventDefault();
    await submitNewTask();
    closeModal(modalNewTask);
    formNewTask.reset();
    await refreshAll();
  });

  // 4) Gestione MODALE NEW TEST
  document.getElementById('btn-new-test').addEventListener('click', () => {
    openModal(modalNewTest);
  });
  btnCancelNewTest.addEventListener('click', () => {
    closeModal(modalNewTest);
    formNewTest.reset();
  });
  formNewTest.addEventListener('submit', async e => {
    e.preventDefault();
    await submitNewTest();
    closeModal(modalNewTest);
    formNewTest.reset();
    await refreshAll();
  });

  // 5) Gestione MODALE EDIT / DELETE
  btnCancelEditItem.addEventListener('click', () => {
    closeModal(document.getElementById('modal-edit-item'));
    formEditItem.reset();
  });
  formEditItem.addEventListener('submit', async e => {
    e.preventDefault();
    await submitEditItem();
    closeModal(document.getElementById('modal-edit-item'));
    formEditItem.reset();
    await refreshAll();
  });
  btnDeleteItem.addEventListener('click', async () => {
    if (confirm('Sei sicuro di voler cancellare questo elemento?')) {
      await deleteItem();
      closeModal(document.getElementById('modal-edit-item'));
      await refreshAll();
    }
  });
});

/* ===== FUNZIONE: conteggi ===== */

async function loadTaskCount() {
  try {
    const url = '../../api/tasks/list.php?type=task';
    const response = await fetch(url, { method: 'GET', credentials: 'include' });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) throw `http-error:${response.status}`;
    const json = await response.json();
    if (json.success === true && Array.isArray(json.tasks)) {
      const countEl = document.querySelector('.count-tasks');
      if (countEl) countEl.textContent = json.tasks.length;
    } else {
      console.error('Errore conteggio task:', json.message || '');
    }
  } catch (err) {
    console.error('Errore loadTaskCount:', err);
  }
}

async function loadTestCount() {
  try {
    const url = '../../api/tasks/list.php?type=test';
    const response = await fetch(url, { method: 'GET', credentials: 'include' });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) throw `http-error:${response.status}`;
    const json = await response.json();
    if (json.success === true && Array.isArray(json.tasks)) {
      const countEl = document.querySelector('.count-tests');
      if (countEl) countEl.textContent = json.tasks.length;
    } else {
      console.error('Errore conteggio test:', json.message || '');
    }
  } catch (err) {
    console.error('Errore loadTestCount:', err);
  }
}

/* ===== FUNZIONE: Lista Task ===== */

async function loadTaskList() {
  try {
    const url = '../../api/tasks/list.php?type=task';
    const response = await fetch(url, { method: 'GET', credentials: 'include' });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) throw `http-error:${response.status}`;

    const json = await response.json();
    if (json.success === true && Array.isArray(json.tasks)) {
      const listContainer = document.querySelector('#section-tasks .item-list');
      listContainer.innerHTML = ''; // pulisco la lista

      if (json.tasks.length === 0) {
        const li = document.createElement('li');
        li.classList.add('no-items');
        li.textContent = 'Nessun task trovato.';
        listContainer.appendChild(li);
        return;
      }

      json.tasks.forEach(task => {
        // Creo il <li> per questo task
        const li = document.createElement('li');
        li.classList.add('item');
        li.setAttribute('data-id', task.id);

        // 1) Checkbox per completamento
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('task-checkbox');
        checkbox.setAttribute('data-id', task.id);
        if (task.completed === 1) {
          checkbox.checked = true;
          li.classList.add('completed'); // opzione per styling barrato
        }
        // Listener per toggle completamento
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id, checkbox.checked));

        li.appendChild(checkbox);

        // 2) Titolo del task
        const titleEl = document.createElement('div');
        titleEl.classList.add('item-title');
        titleEl.textContent = task.title;
        li.appendChild(titleEl);

        // 3) Data di scadenza
        const dateEl = document.createElement('div');
        dateEl.classList.add('item-date');
        dateEl.textContent = formatDate(task.due_date);
        li.appendChild(dateEl);

        // 4) Icone modifica / elimina
        const iconsContainer = document.createElement('div');
        iconsContainer.classList.add('icons-container');

        const editIcon = document.createElement('span');
        editIcon.classList.add('icon-edit');
        editIcon.textContent = '✏️';
        editIcon.addEventListener('click', () => openEditModal(task, 'task'));
        iconsContainer.appendChild(editIcon);

        const deleteIcon = document.createElement('span');
        deleteIcon.classList.add('icon-delete');
        deleteIcon.textContent = '🗑️';
        deleteIcon.addEventListener('click', () => openEditModal(task, 'task'));
        iconsContainer.appendChild(deleteIcon);

        li.appendChild(iconsContainer);

        listContainer.appendChild(li);
      });
    } else {
      console.error('Errore caricamento task list:', json.message || '');
    }
  } catch (err) {
    console.error('Errore loadTaskList:', err);
  }
}

/* ===== FUNZIONE: Toggle completamento Task ===== */

async function toggleTaskCompletion(taskId, isChecked) {
  try {
    // Costruisco il payload per update.php
    const payload = {
      id:        taskId,
      completed: isChecked ? 1 : 0,
      is_test:   0
    };
    const response = await fetch('../../api/tasks/update.php', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) {
      console.error('HTTP error toggleCompletion:', response.status);
      return;
    }
    const json = await response.json();
    if (!json.success) {
      console.error('Errore API toggleCompletion:', json.error || json.message);
      return;
    }
    // Se l’update ha avuto successo, aggiorno lo stile del <li>
    const li = document.querySelector(`.item[data-id="${taskId}"]`);
    if (li) {
      if (isChecked) {
        li.classList.add('completed');
      } else {
        li.classList.remove('completed');
      }
    }
  } catch (err) {
    console.error('Errore rete toggleCompletion:', err);
  }
}


/* ===== FUNZIONE: Lista Test (con sessions) ===== */

async function loadTestList() {
  try {
    const url = '../../api/tasks/list.php?type=test';
    const response = await fetch(url, { method: 'GET', credentials: 'include' });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) throw `http-error:${response.status}`;
    const json = await response.json();
    if (json.success === true && Array.isArray(json.tasks)) {
      const listContainer = document.querySelector('#section-tests .item-list');
      listContainer.innerHTML = '';
      if (json.tasks.length === 0) {
        const li = document.createElement('li');
        li.classList.add('no-items');
        li.textContent = 'Nessun test trovato.';
        listContainer.appendChild(li);
        return;
      }
      json.tasks.forEach(test => {
        const li = document.createElement('li');
        li.classList.add('item');
        li.setAttribute('data-id', test.id);

        const titleEl = document.createElement('div');
        titleEl.classList.add('item-title');
        titleEl.textContent = test.title;
        li.appendChild(titleEl);

        const dateEl = document.createElement('div');
        dateEl.classList.add('item-date');
        dateEl.textContent = formatDate(test.due_date);
        li.appendChild(dateEl);

        const descEl = document.createElement('div');
        descEl.classList.add('item-desc');
        descEl.textContent = test.description || '';
        li.appendChild(descEl);

        // Visualizza le sessioni (array test.sessions)
        if (Array.isArray(test.sessions) && test.sessions.length > 0) {
          const ulSessions = document.createElement('ul');
          ulSessions.classList.add('session-list');
          test.sessions.forEach(sess => {
            const sesLi = document.createElement('li');
            sesLi.classList.add('session-item');
            sesLi.textContent = `Sessione: ${formatDate(sess.session_due_date)}`;
            ulSessions.appendChild(sesLi);
          });
          li.appendChild(ulSessions);
        }

        // Icone modifica / elimina
        const iconsContainer = document.createElement('div');
        iconsContainer.classList.add('icons-container');

        const editIcon = document.createElement('span');
        editIcon.classList.add('icon-edit');
        editIcon.textContent = '✏️';
        editIcon.addEventListener('click', () => openEditModal(test, 'test'));
        iconsContainer.appendChild(editIcon);

        const deleteIcon = document.createElement('span');
        deleteIcon.classList.add('icon-delete');
        deleteIcon.textContent = '🗑️';
        deleteIcon.addEventListener('click', () => openEditModal(test, 'test'));
        iconsContainer.appendChild(deleteIcon);

        li.appendChild(iconsContainer);
        listContainer.appendChild(li);
      });
    } else {
      console.error('Errore caricamento test list:', json.message || '');
    }
  } catch (err) {
    console.error('Errore loadTestList:', err);
  }
}

/* ===== UTILITY: Apertura/Chiusura Modal ===== */

function openModal(modalEl) {
  modalEl.classList.remove('hidden');
  modalEl.classList.add('show');
}
function closeModal(modalEl) {
  modalEl.classList.remove('show');
  modalEl.classList.add('hidden');
}

/* ===== FUNCTION: Nuovo Task ===== */

async function submitNewTask() {
  const title   = document.getElementById('new-task-title').value.trim();
  const dueDate = document.getElementById('new-task-date').value;
  if (!title || !dueDate) {
    alert('Compila titolo e data.');
    return;
  }
  try {
    const payload = { title, due_date: dueDate, is_test: 0 };
    const response = await fetch('../../api/tasks/add.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) {
      console.error('HTTP error new task:', response.status);
      return;
    }
    const json = await response.json();
    if (!json.success) {
      console.error('Errore API new task:', json.error || json.message);
    }
  } catch (err) {
    console.error('Errore rete new task:', err);
  }
}

/* ===== FUNCTION: Nuovo Test ===== */

async function submitNewTest() {
  const title       = document.getElementById('new-test-title').value.trim();
  const description = document.getElementById('new-test-desc').value.trim();
  const dueDate     = document.getElementById('new-test-date').value;
  if (!title || !dueDate) {
    alert('Compila titolo e data.');
    return;
  }
  try {
    const payload = { title, description, due_date: dueDate, is_test: 1 };
    const response = await fetch('../../api/tasks/add.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) {
      console.error('HTTP error new test:', response.status);
      return;
    }
    const json = await response.json();
    if (!json.success) {
      console.error('Errore API new test:', json.error || json.message);
    }
  } catch (err) {
    console.error('Errore rete new test:', err);
  }
}

/* ===== FUNCTION: Apri MODAL di Edit/Delete ===== */

let currentEditId   = null;
let currentEditType = null; // 'task' oppure 'test'

function openEditModal(item, type) {

  console.log('openEditModal viene chiamato con:', item, type);

  const editModalTitle = document.getElementById('edit-modal-title');
  const editDescGroup  = document.getElementById('edit-item-desc-group');
  const modalEditItem  = document.getElementById('modal-edit-item');

  currentEditId   = item.id;
  currentEditType = type;

  editModalTitle.textContent = (type === 'task') ? 'Modifica Task' : 'Modifica Test';

  if (type === 'test') {
    editDescGroup.classList.remove('hidden');
    document.getElementById('edit-item-desc').value = item.description || '';
  } else {
    editDescGroup.classList.add('hidden');
  }

  document.getElementById('edit-item-title').value = item.title;
  document.getElementById('edit-item-date').value = item.due_date;

  openModal(modalEditItem);
}

/* ===== FUNCTION: Edit / Update ===== */

async function submitEditItem() {
  const title   = document.getElementById('edit-item-title').value.trim();
  const dueDate = document.getElementById('edit-item-date').value;
  let description = '';
  if (currentEditType === 'test') {
    description = document.getElementById('edit-item-desc').value.trim();
  }
  if (!title || !dueDate) {
    alert('Compila titolo e data.');
    return;
  }
  try {
    const payload = {
      id:       currentEditId,
      title,
      due_date: dueDate,
      is_test:  (currentEditType === 'test') ? 1 : 0,
      description
    };
    const response = await fetch('../../api/tasks/update.php', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) {
      console.error('HTTP error update:', response.status);
      return;
    }
    const json = await response.json();
    if (!json.success) {
      console.error('Errore API update:', json.error || json.message);
    }
  } catch (err) {
    console.error('Errore rete update:', err);
  }
}

/* ===== FUNCTION: Delete ===== */

async function deleteItem() {
  try {
    const url = `../../api/tasks/delete.php?id=${encodeURIComponent(currentEditId)}`;
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!response.ok) {
      console.error('HTTP error delete:', response.status);
      return;
    }
    const json = await response.json();
    if (!json.success) {
      console.error('Errore API delete:', json.error || json.message);
    }
  } catch (err) {
    console.error('Errore rete delete:', err);
  }
}

/* ===== UTILITY: Formatta date da YYYY-MM-DD a DD/MM/YYYY ===== */

function formatDate(mysqlDate) {
  if (!mysqlDate) return '';
  const parts = mysqlDate.split('-');
  if (parts.length !== 3) return mysqlDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* ===== UTILITY: Ricarico conteggi e liste ===== */

async function refreshAll() {
  await loadTaskCount();
  await loadTestCount();
  const isTaskVisible = !document.getElementById('section-tasks').classList.contains('hidden');
  if (isTaskVisible) {
    await loadTaskList();
  } else {
    await loadTestList();
  }
}
