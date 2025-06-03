/**
 * settings.js
 *
 * Gestisce:
 * 1. Verifica sessione utente (eventuale redirect)
 * 2. Change Password via API
 */

document.addEventListener('DOMContentLoaded', () => {
  // Verifica se utente loggato
  fetchProfileStatus()
    .catch(err => {
      if (err === 'unauthorized') {
        window.location.href = 'login.html';
      }
    });

  // Gestione form Change Password
  const form = document.getElementById('form-change-password');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const oldPw = document.getElementById('old-password').value;
      const newPw = document.getElementById('new-password').value;
      const confirmPw = document.getElementById('confirm-password').value;
      if (newPw !== confirmPw) {
        alert('Le password non coincidono.');
        return;
      }

      try {
        const response = await fetch('../../api/auth/change_password.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ old_password: oldPw, new_password: newPw })
        });
        if (response.status === 401) {
          window.location.href = 'login.html';
          return;
        }
        if (!response.ok) throw 'network-error';

        const json = await response.json();
        if (json.status === 'success') {
          alert('Password modificata con successo.');
          form.reset();
        } else {
          alert('Errore: ' + json.message);
        }
      } catch (err) {
        console.error('Errore di rete change password:', err);
      }
    });
  }
});

async function fetchProfileStatus() {
  try {
    const response = await fetch('../../api/auth/get_profile.php', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.status === 401) throw 'unauthorized';
  } catch (err) {
    if (err === 'unauthorized') throw 'unauthorized';
    console.error('Errore fetchProfileStatus:', err);
  }
}
