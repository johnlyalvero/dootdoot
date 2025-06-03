/**
 * dashboard.js
 *
 * 1. Controlla sessione e recupera username + profile_img (se esiste)
 * 2. Aggiorna avatar (fallback default o immagine reale) e imposta redirect su profile.html
 * 3. Recupera statistiche e le mostra
 * 4. Gestisce timer con “Avvio” → “Give Up” e blocco modifica durata
 * 5. Gestisce logout
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1) Carico profilo (username + avatar) e statistiche
  fetchProfile()
    .then(username => {
      updateUserInfo(username);
      return fetchStats();
    })
    .then(stats => {
      updateStats(stats);
    })
    .catch(err => {
      if (err === 'unauthorized') {
        window.location.href = 'login.html';
      } else {
        console.error('Errore caricamento dashboard:', err);
      }
    });

  // 2) Listener sul bottone avatar per redirect a profile.html
  const btnProfile = document.querySelector('.btn-profile');
  if (btnProfile) {
    btnProfile.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }

  // 3) Logout
  setupLogoutButton();

  // 4) Timer interazioni
  setupTimerInteractions();
});

/* ----- Sezione 1: API per profilo (username + profile_img) ----- */

// Memorizziamo il path dell’avatar (vuoto se non impostato)
window.profileImgPath = '';

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

    // Salvo in window.profileImgPath il percorso relativo restituito dal DB (es: "assets/img/profiles/user_1_1630000000.png")
    window.profileImgPath = json.data.profile_img || '';
    return json.data.username;

  } catch (err) {
    if (err === 'unauthorized') throw 'unauthorized';
    throw 'generic-error';
  }
}

function updateUserInfo(username) {
  // (a) Aggiorna lo span .user-name se esiste
  const nameSpan = document.querySelector('.user-name');
  if (nameSpan) nameSpan.textContent = username;

  // (b) Aggiorna il background-image dello span.profile-img
  const avatar = document.querySelector('.profile-img');
  if (avatar) {
    if (window.profileImgPath) {
      // Se abbiamo un percorso in DB, lo applichiamo
      avatar.style.backgroundImage = `url('../${window.profileImgPath}')`;
    }
    // Altrimenti rimane l’inline style impostato in HTML (default-avatar.png)
  }
}

/* ----- Sezione 2: API per statistiche utente ----- */

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

function updateStats(stats) {
  const statEls = document.querySelectorAll('.stat-value');
  if (statEls.length < 4) return;
  statEls[0].textContent = `${stats.focus}/5`;
  statEls[1].textContent = `${stats.discipline}%`;
  statEls[2].textContent = `${stats.efficiency}/100`;
  statEls[3].textContent = stats.dedication;
}

/* ----- Sezione 3: Logout ----- */

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
        console.error('Errore HTTP logout:', response.status);
        return;
      }
      const json = await response.json();
      if (json.success === true) {
        window.location.href = 'login.html';
      } else {
        console.error('Logout fallito:', json.message || 'Errore sconosciuto');
      }
    } catch (err) {
      console.error('Errore rete logout:', err);
    }
  });
}

/* ----- Sezione 4: Timer (Avvio/Give Up & Blocca modifica) ----- */

function setupTimerInteractions() {
  const timerDisplay      = document.getElementById('timer-display');
  const btnStart          = document.getElementById('btn-start');
  const modalDuration     = document.getElementById('modal-duration');
  const btnSetDuration    = document.getElementById('btn-set-duration');
  const btnCancelDuration = document.getElementById('btn-cancel-duration');
  const inputDuration     = document.getElementById('input-duration');

  let countdownInterval = null;
  let remainingSeconds  = 25 * 60; // default 25 minuti

  // 4.1: Clic su timer → se il timer gira, non faccio niente
  timerDisplay.addEventListener('click', () => {
    if (countdownInterval !== null) return;
    if (!modalDuration) return;
    openModal(modalDuration);
  });

  // 4.2: Imposta durata (bottone “Imposta”)
  if (btnSetDuration && inputDuration && modalDuration) {
    btnSetDuration.addEventListener('click', () => {
      let minutes = parseInt(inputDuration.value, 10);
      if (isNaN(minutes) || minutes < 1 || minutes > 120) {
        alert('Inserisci un valore tra 5 e 120 minuti.');
        return;
      }
      remainingSeconds = minutes * 60;
      updateTimerDisplay();
      closeModal(modalDuration);
    });
  }

  // 4.3: Annulla modifica durata
  if (btnCancelDuration && modalDuration) {
    btnCancelDuration.addEventListener('click', () => {
      closeModal(modalDuration);
    });
  }

  // 4.4: Gestione “Avvio” e “Give Up”
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      if (countdownInterval === null) {
        // Avvio nuovo conteggio
        btnStart.textContent = 'Give Up';
        startCountdown();
      } else {
        // Give Up: interrompo e resetto
        clearInterval(countdownInterval);
        countdownInterval = null;
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
  function openModal(modalEl)  { modalEl.classList.add('show'); }
  function closeModal(modalEl) { modalEl.classList.remove('show'); }
}
