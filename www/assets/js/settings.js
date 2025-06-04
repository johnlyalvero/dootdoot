/**
 * www/assets/js/settings.js
 *
 * Logica per la pagina Impostazioni:
 * 1) Cambiare password (AJAX → api/auth/change_password.php)
 * 2) Eliminare account (AJAX → api/auth/delete_account.php)
 * 3) Eventuale redirect alla dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Bottone “← Dashboard”
  const btnBack = document.getElementById('btn-back-dashboard');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }

  // Logica “Cambia Password”
  const changeForm = document.getElementById('change-password-form');
  const msgChange   = document.getElementById('change-password-message');
  if (changeForm) {
    changeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      msgChange.textContent = ''; // pulisco eventuali messaggi precedenti

      const currentPwd = document.getElementById('current-password').value.trim();
      const newPwd     = document.getElementById('new-password').value.trim();
      const confirmPwd = document.getElementById('confirm-password').value.trim();

      // 1. Validazione lato client
      if (!currentPwd || !newPwd || !confirmPwd) {
        msgChange.textContent = 'Tutti i campi sono obbligatori.';
        msgChange.classList.add('error');
        return;
      }
      if (newPwd.length < 6) {
        msgChange.textContent = 'La nuova password deve essere di almeno 6 caratteri.';
        msgChange.classList.add('error');
        return;
      }
      if (newPwd !== confirmPwd) {
        msgChange.textContent = 'La nuova password e la conferma non corrispondono.';
        msgChange.classList.add('error');
        return;
      }

      // 2. Invio AJAX al backend
      try {
        const payload = {
          current_password: currentPwd,
          new_password: newPwd
        };
        const res = await fetch('../../api/auth/change_password.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.status === 401) {
          // Sessione scaduta/not logged in
          window.location.href = 'login.html';
          return;
        }
        const json = await res.json();
        if (json.status === 'success') {
          msgChange.textContent = 'Password aggiornata con successo.';
          msgChange.classList.remove('error');
          msgChange.classList.add('success');
          // Pulisco i campi
          changeForm.reset();
        } else {
          msgChange.textContent = json.message || 'Errore nellʼaggiornamento.';
          msgChange.classList.add('error');
        }
      } catch (err) {
        msgChange.textContent = 'Errore di rete. Riprova più tardi.';
        msgChange.classList.add('error');
        console.error('submitChangePassword:', err);
      }
    });
  }

  // Logica “Elimina Account”
  const btnDelete = document.getElementById('btn-delete-account');
  const msgDelete = document.getElementById('delete-account-message');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      msgDelete.textContent = '';
      const conferma = confirm(
        'Sei sicuro? Lʼeliminazione dellʼaccount è permanente e cancellerà tutti i tuoi dati.'
      );
      if (!conferma) return;

      try {
        const res = await fetch('../../api/auth/delete_account.php', {
          method: 'POST',
          credentials: 'include'
        });
        if (res.status === 401) {
          window.location.href = 'login.html';
          return;
        }
        const json = await res.json();
        if (json.status === 'success') {
          // Dopo eliminazione, ridirigo a login (sessione distrutta dal server)
          alert('Il tuo account è stato eliminato.');
          window.location.href = 'login.html';
        } else {
          msgDelete.textContent = json.message || 'Errore durante lʼeliminazione.';
          msgDelete.classList.add('error');
        }
      } catch (err) {
        msgDelete.textContent = 'Errore di rete. Riprova più tardi.';
        msgDelete.classList.add('error');
        console.error('deleteAccount:', err);
      }
    });
  }
});
