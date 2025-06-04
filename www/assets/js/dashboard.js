/**
 * www/assets/js/dashboard.js
 *
 * - Controllo login / redirect
 * - Recupero profilo utente
 * - Recupero statistiche
 * - Focus timer con start / stop / reset
 * - Al termine del countdown:
 *     • Mostra modal di riepilogo task pendenti
 *     • Permette di chiudere il riepilogo
 * - Il resto del codice (es. logout) rimane invariato
 */

document.addEventListener('DOMContentLoaded', () => {
  setupLogoutButton();
  loadProfile();
  loadStats();
  setupTimer();

  // ⇒ 1) Rendi cliccabile l’avatar
  const btnAvatar = document.getElementById('btn-avatar');
  if (btnAvatar) {
    btnAvatar.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }

  // ⇒ 2) Gestione chiudi riepilogo E apertura feedback
  const btnCloseSummary = document.getElementById('btn-close-summary');
  if (btnCloseSummary) {
    btnCloseSummary.addEventListener('click', () => {
      closeModal(document.getElementById('modal-summary'));
      // Apriamo subito il modal di feedback:
      openModal(document.getElementById('modal-feedback'));
    });
  }

  // ⇒ 3) Gestione invio feedback
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitFeedback();
      closeModal(document.getElementById('modal-feedback'));
    });
  }

  // ⇒ 4) Gestione “Annulla” feedback
  const btnCancelFeedback = document.getElementById('btn-cancel-feedback');
  if (btnCancelFeedback) {
    btnCancelFeedback.addEventListener('click', () => {
      closeModal(document.getElementById('modal-feedback'));
    });
  }
});

/* ==== LOGOUT, PROFILE, STATS INVARIATE ==== */

function setupLogoutButton() {
  const btnLogout = document.getElementById('logout-btn');
  if (!btnLogout) return;
  btnLogout.addEventListener('click', async () => {
    try {
      const res = await fetch('../../api/auth/logout.php', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        window.location.href = 'login.html';
      } else {
        console.error('Logout fallito');
      }
    } catch (err) {
      console.error('Errore rete logout:', err);
    }
  });
}

async function loadProfile() {
  try {
    const res = await fetch('../../api/auth/get_profile.php', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!res.ok) throw `HTTP error: ${res.status}`;
    const json = await res.json();
    if (json.status === 'success') {
      const unameSpan = document.querySelector('.user-name');
      if (unameSpan) unameSpan.textContent = json.data.username;
      const avatar = document.querySelector('.profile-img');
      if (avatar) {
        const imgPath = json.data.profile_img || '../assets/img/default-avatar.png';
        avatar.style.backgroundImage = `url('${imgPath}')`;
      }
    } else {
      console.error('Errore get_profile:', json.message);
    }
  } catch (err) {
    console.error('Errore loadProfile:', err);
  }
}

async function loadStats() {
  try {
    const res = await fetch('../../api/stats/user.php', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!res.ok) throw `HTTP error: ${res.status}`;
    const json = await res.json();
    if (json.status === 'success') {
      const { focus, discipline, efficiency, dedication } = json.data;
      document.querySelector('.stat-focus').textContent = focus.toFixed(1);
      document.querySelector('.stat-disciplina').textContent = `${discipline}%`;
      document.querySelector('.stat-efficiency').textContent = `${efficiency}`;
      document.querySelector('.stat-dedication').textContent = dedication;
    } else {
      console.error('Errore stats/user:', json.message);
    }
  } catch (err) {
    console.error('Errore loadStats:', err);
  }
}

/* ==== FOCUS TIMER INCLUSO CONTROLLO DURATA ==== */

let timerInterval = null;
let remainingSeconds = 25 * 60;
let timerRunning = false;

function setupTimer() {
  const displayEl = document.getElementById('timer-display');
  const btnStart  = document.getElementById('btn-start');
  const modalDur  = document.getElementById('modal-duration');
  const inputDur  = document.getElementById('input-duration');
  const btnSetDur = document.getElementById('btn-set-duration');
  const btnCancel = document.getElementById('btn-cancel-duration');

  if (!displayEl || !btnStart || !modalDur || !inputDur || !btnSetDur || !btnCancel) {
    console.error('Elementi timer non trovati nel DOM');
    return;
  }

  updateDisplay(displayEl);

  btnStart.addEventListener('click', () => {
    if (!timerRunning) {
      startTimer(displayEl, btnStart);
    } else {
      stopTimer();
      btnStart.textContent = 'Avvio';
      btnStart.classList.remove('btn-danger');
      btnStart.classList.add('btn-primary');
    }
  });

  displayEl.addEventListener('click', () => {
    if (!timerRunning) {
      openModal(modalDur);
    }
  });

  // ⇒ qui inseriamo il controllo di range
  btnSetDur.addEventListener('click', () => {
    const val = parseInt(inputDur.value, 10);
    if (isNaN(val)) {
      alert('Inserisci un numero valido.');
      return;
    }
    if (val < 1 || val > 120) {
      alert('La durata deve essere compresa tra 5 e 120 minuti.');
      return;
    }
    remainingSeconds = val * 60;
    updateDisplay(displayEl);
    closeModal(modalDur);
  });

  btnCancel.addEventListener('click', () => {
    closeModal(modalDur);
  });
}

function startTimer(displayEl, btnStart) {
  timerRunning = true;
  btnStart.textContent = 'Give Up';
  btnStart.classList.remove('btn-primary');
  btnStart.classList.add('btn-danger');

  timerInterval = setInterval(() => {
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      btnStart.textContent = 'Avvio';
      btnStart.classList.remove('btn-danger');
      btnStart.classList.add('btn-primary');
      remainingSeconds = 0;
      updateDisplay(displayEl);
      onTimerEnd();
    } else {
      remainingSeconds--;
      updateDisplay(displayEl);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
}

function updateDisplay(displayEl) {
  const min = Math.floor(remainingSeconds / 60);
  const sec = remainingSeconds % 60;
  displayEl.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

/* ==== CALLBACK: al termine del timer ==== */

async function onTimerEnd() {
  const pendingTasks = await fetchPendingTasks();
  populateSummaryModal(pendingTasks);
  openModal(document.getElementById('modal-summary'));
}

/* ==== API: recupera task pendenti ==== */

async function fetchPendingTasks() {
  try {
    const res = await fetch('../../api/tasks/list.php?type=task', {
      method: 'GET',
      credentials: 'include'
    });
    if (res.status === 401) {
      window.location.href = 'login.html';
      return [];
    }
    if (!res.ok) {
      console.error('HTTP error fetchPendingTasks:', res.status);
      return [];
    }
    const json = await res.json();
    if (json.success) {
      return json.tasks.filter(t => t.completed === 0);
    } else {
      console.error('Errore list task:', json.message);
      return [];
    }
  } catch (err) {
    console.error('Errore fetchPendingTasks:', err);
    return [];
  }
}

/* ==== POPOLA IL MODAL DI RIEPILOGO TASK PENDENTI ==== */

function populateSummaryModal(pendingTasks) {
  const ulTasks = document.getElementById('summary-pending-tasks');
  if (!ulTasks) return;

  ulTasks.innerHTML = '';

  if (pendingTasks.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nessun task pendente.';
    ulTasks.appendChild(li);
  } else {
    pendingTasks.forEach(t => {
      const li = document.createElement('li');
      li.textContent = `${t.title} – ${formatDate(t.due_date)}`;
      ulTasks.appendChild(li);
    });
  }
}

/* ==== SUBMIT FEEDBACK ===== */

async function submitFeedback() {
  // Raccogliamo valori dal form
  const focusVal       = parseInt(document.getElementById('feedback-focus').value, 10);
  const utilitaVal     = parseInt(document.getElementById('feedback-utilita').value, 10);
  const distrazioniTxt = document.getElementById('feedback-distrazioni').value.trim();

  // Costruiamo il JSON da inviare
  const payload = {
    focus:       focusVal,
    utilita:     utilitaVal,
    distrazioni: distrazioniTxt
    // Puoi aggiungere anche “session_id” se serve
  };

  try {
    const res = await fetch('../../api/feedback/add.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    if (!res.ok) {
      console.error('Errore HTTP submitFeedback:', res.status);
      return;
    }
    const json = await res.json();
    if (!json.success) {
      console.error('Errore API submitFeedback:', json.error || json.message);
    }
  } catch (err) {
    console.error('Errore rete submitFeedback:', err);
  }
}


/* ==== UTILITY: Apertura/Chiusura Modal ==== */

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('hidden');
  modalEl.classList.add('show');
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('show');
  modalEl.classList.add('hidden');
}

/* ==== UTILITY: formatta date ==== */

function formatDate(mysqlDate) {
  if (!mysqlDate) return '';
  const parts = mysqlDate.split('-');
  if (parts.length !== 3) return mysqlDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
