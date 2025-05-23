// register.js
// Script per gestire il form di registrazione e inviare i dati a register.php tramite Fetch API

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevengo il comportamento di default del form

    // Prelevo i valori dai campi del form
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const school   = document.getElementById('school').value.trim();
    const userClass= document.getElementById('class').value.trim();

    // Costruisco il payload JSON
    const payload = { username, password, school, class: userClass };

    try {
      // Invio della richiesta POST in formato JSON
      const response = await fetch('./../../api/auth/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Parsing della risposta JSON
      const data = await response.json();

      // Gestione della risposta
      if (response.ok && data.success) {
        // Successo: messaggio e redirect al login
        messageDiv.innerHTML =
          `<div class=\"alert alert-success\">Registrazione avvenuta con successo! ID utente: ${data.user_id}</div>`;
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        // Errore restituito dall'API
        messageDiv.innerHTML =
          `<div class=\"alert alert-danger\">${data.error || 'Errore durante la registrazione'}</div>`;
      }
    } catch (error) {
      // Errore di rete o inaspettato
      console.error('Fetch error:', error);
      messageDiv.innerHTML =
        `<div class=\"alert alert-danger\">Errore di rete: ${error.message}</div>`;
    }
  });
});
