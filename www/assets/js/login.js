// login.js
// Script per gestire il form di login e inviare i dati a login.php tramite Fetch API

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevengo il comportamento di default del form

    // Prelevo i valori dai campi del form
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Costruisco il payload JSON
    const payload = { username, password };

    try {
      // Invio della richiesta POST in formato JSON includendo i cookie di sessione
      const response = await fetch('./../../api/auth/login.php', {
        method: 'POST',
        credentials: 'include', // Include cookie di sessione
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Parsing della risposta JSON
      const data = await response.json();

      // Gestione della risposta
      if (response.ok && data.success) {
        // Successo: redirect alla dashboard (index.html)
          window.location.href = 'dashboard.html';
      } else {
        // Errore restituito dall'API
        messageDiv.innerHTML =
          `<div class="alert alert-danger">${data.error || 'Credenziali non valide'}</div>`;
      }
    } catch (error) {
      // Errore di rete o inaspettato
      console.error('Fetch error:', error);
      messageDiv.innerHTML =
        `<div class="alert alert-danger">Errore di rete: ${error.message}</div>`;
    }
  });
});
