/**
 * dashboard.js
 *
 * Gestisce:
 * 1. Controllo sessione e caricamento dati utente/statistiche (da API)
 * 2. Funzionamento timer (selezione durata, conto alla rovescia, popup riepilogo/feedback)
 *    → “Avvio” → “Give Up”, e blocco modifica durata mentre il timer gira
 * 3. Logout
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1) Carico profilo e statistiche
  fetchProfile()
    .then(username => {
      updateUserName(username);
      return fetchStats();
    })
    .then(stats => {
      updateStats(stats);
    })
    .catch(err => {
      if (err === 'unauthorized') {
        window.location.href = 'login.html';
      } else {
        console.error('Errore durante il caricamento della dashboard:', err);
      }
    });

  // 2) Setup logout
  setupLogoutButton();

  // 3) Setup timer click e start/give up
  setupTimerInteractions();
});

/* ----- Sezione 1: API per profilo e statistiche ----- */

async function fetchProfile() {
  try {
    const response = await fetch('../../api/auth/get_profile.php', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 401) throw 'unauthorized';
    if (!response.ok) throw 'generic-error';

    const json = await response.json();
    if (json.status !== 'success') throw 'generic-error';

    // Memorizzo profile_img globalmente
    window.profileImgPath = json.data.profile_img || '';
    return json.data.username;

  } catch (err) {
    if (err === 'unauthorized') throw 'unauthorized';
    throw 'generic-error';
  }
}

async function fetchStats() {
  try {
    const response = await fetch('../../api/stats/user.php', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 401) throw 'unauthorized';
    if (!response.ok) throw 'generic-error';

    const json = await response.json();
    if (json.status !== 'success') throw 'generic-error';

    return {
      focus:      json.data.focus,
      discipline: json.data.discipline,
      efficiency: json.data.efficiency,
      dedication: json.data.dedication
    };
  } catch (err) {
    if (err === 'unauthorized') throw 'unauthorized';
    throw 'generic-error';
  }
}

function updateUserName(username) {
  const span = document.querySelector('.user-name');
  if (span) span.textContent = username;
  // Carichiamo immagine di profilo se disponibile
  const avatar = document.querySelector('.profile-img');
  if (avatar && window.profileImgPath) {
    avatar.style.backgroundImage = `url('../${window.profileImgPath}')`;
  }
}

function updateStats(stats) {
  const statEls = document.querySelectorAll('.stat-value');
  if (statEls.length < 4) return;
  statEls[0].textContent = `${stats.focus}/5`;
  statEls[1].textContent = `${stats.discipline}%`;
  statEls[2].textContent = `${stats.efficiency}/100`;
  statEls[3].textContent = stats.dedication;
}

/* ----- Sezione 2: Logout ----- */

function setupLogoutButton() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      const response = await fetch('../../api/auth/logout.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 401) {
        window.location.href = 'login.html';
        return;
      }
      if (!response.ok) {
        console.error('Errore HTTP durante logout:', response.status);
        return;
      }
      const json = await response.json();
      if (json.success === true) {
        window.location.href = 'login.html';
      } else {
        console.error('Logout fallito:', json.message || 'Errore sconosciuto');
      }
    } catch (err) {
      console.error('Errore di rete durante logout:', err);
    }
  });
}

/* ----- Sezione 3: Timer con “Avvio” → “Give Up” e blocco modifica ----- */

function setupTimerInteractions() {
  const timerDisplay     = document.getElementById('timer-display');
  const btnStart         = document.getElementById('btn-start');
  const modalDuration    = document.getElementById('modal-duration');
  const btnSetDuration   = document.getElementById('btn-set-duration');
  const btnCancelDuration= document.getElementById('btn-cancel-duration');
  const inputDuration    = document.getElementById('input-duration');

  let countdownInterval = null;
  let remainingSeconds  = 25 * 60; // default 25 minuti

  // 3.1: Disabilita apertura modal se timer in esecuzione
  timerDisplay.addEventListener('click', () => {
    if (countdownInterval !== null) {
      // Timer attivo: blocco modifica
      return;
    }
    if (!modalDuration) return;
    openModal(modalDuration);
  });

  // 3.2: Impostazione durata selezionata
  if (btnSetDuration && inputDuration && modalDuration) {
    btnSetDuration.addEventListener('click', () => {
      let minutes = parseInt(inputDuration.value, 10);
      if (isNaN(minutes) || minutes < 5 || minutes > 120) {
        alert('Inserisci un valore tra 5 e 120 minuti.');
        return;
      }
      remainingSeconds = minutes * 60;
      updateTimerDisplay();
      closeModal(modalDuration);
    });
  }

  // 3.3: Annulla modifica durata
  if (btnCancelDuration && modalDuration) {
    btnCancelDuration.addEventListener('click', () => {
      closeModal(modalDuration);
    });
  }

  // 3.4: Gestione “Avvio” e “Give Up”
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      if (countdownInterval === null) {
        // Avvio timer
        btnStart.textContent = 'Give Up';
        startCountdown();
      } else {
        // Give Up: fermo e resetto
        clearInterval(countdownInterval);
        countdownInterval = null;
        // Reset ai secondi selezionati (o default se input non disponibile)
        const minutes = inputDuration ? parseInt(inputDuration.value, 10) : 25;
        remainingSeconds = (isNaN(minutes) ? 25 : minutes) * 60;
        updateTimerDisplay();
        btnStart.textContent = 'Avvio';
      }
    });
  }

  function startCountdown() {
    updateTimerDisplay();
    countdownInterval = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        remainingSeconds = 0;
        updateTimerDisplay();
        btnStart.textContent = 'Avvio';
        onTimerEnd();
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    if (timerDisplay) {
      timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }

  function onTimerEnd() {
    // Mostra pop-up riepilogo
    const modalSummary = document.getElementById('modal-summary');
    if (modalSummary) {
      openModal(modalSummary);
      const btnCloseSummary = document.getElementById('btn-close-summary');
      if (btnCloseSummary) {
        btnCloseSummary.addEventListener('click', () => {
          closeModal(modalSummary);
          const modalFeedback = document.getElementById('modal-feedback');
          if (modalFeedback) openModal(modalFeedback);
        });
      }
    }
  }

  // Helper modali
  function openModal(modalEl) {
    modalEl.classList.add('show');
  }
  function closeModal(modalEl) {
    modalEl.classList.remove('show');
  }
}
