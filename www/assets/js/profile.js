/**
 * profile.js
 *
 * 1. Verifica sessione → se non autenticato, redirect a login.html
 * 2. Carica dati anagrafici da api/auth/get_profile.php (compreso profile_img)
 * 3. Popola immagine (o default), nome, scuola, classe, e le 4 card statistiche
 * 4. Gestisce upload immagine via api/auth/upload_profile_image.php
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1) Controllo sessione e recupero profilo
  fetchProfileData()
    .then(user => {
      populateProfileInfo(user);
      return fetchStatsData();
    })
    .then(stats => {
      populateStats(stats);
    })
    .catch(err => {
      if (err === 'unauthorized') {
        window.location.href = 'login.html';
      } else {
        console.error('Errore caricamento profilo:', err);
      }
    });

  // 4) Setup upload immagine
  setupImageUpload();
});

async function fetchProfileData() {
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

    return {
      username:   json.data.username,
      school:     json.data.school,
      class:      json.data.class,
      profileImg: json.data.profile_img // potrebbe essere "" se non impostata
    };
  } catch (err) {
    if (err === 'unauthorized') throw 'unauthorized';
    throw 'generic-error';
  }
}

async function fetchStatsData() {
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

function populateProfileInfo(user) {
  // Saluto: Hey [nomeUtente]!
  const nameSpan = document.querySelector('.user-name');
  if (nameSpan) nameSpan.textContent = user.username;

  // Imposta immagine profilo (o default)
  const imgEl = document.getElementById('profile-img-large');
  if (imgEl) {
    if (user.profileImg) {
      imgEl.style.backgroundImage = `url('../${user.profileImg}')`;
    } else {
      imgEl.style.backgroundImage = `url('../assets/img/default-avatar.png')`;
    }
  }

  // Dati scuola e classe
  const infoValues = document.querySelectorAll('.info-value');
  if (infoValues.length >= 3) {
    infoValues[0].textContent = user.username;
    infoValues[1].textContent = user.school;
    infoValues[2].textContent = user.class;
  }
}

function populateStats(stats) {
  const statEls = document.querySelectorAll('.stat-value');
  if (statEls.length < 4) return;
  statEls[0].textContent = `${stats.focus}/5`;
  statEls[1].textContent = `${stats.discipline}%`;
  statEls[2].textContent = `${stats.efficiency}/100`;
  statEls[3].textContent = stats.dedication;
}

/* ----- Sezione Upload Immagine ----- */

function setupImageUpload() {
  const fileInput = document.getElementById('input-profile-image');
  if (!fileInput) return;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // Controllo client‐side MIME e dimensione (ulteriore validazione)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato non supportato: usa JPG, PNG o WEBP.');
      fileInput.value = '';
      return;
    }
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert('Immagine troppo grande: massimo 2MB.');
      fileInput.value = '';
      return;
    }

    // Creo FormData e invio a backend
    const formData = new FormData();
    formData.append('profile_image', file);

    try {
      const response = await fetch('../../api/auth/upload_profile_image.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (response.status === 401) {
        window.location.href = 'login.html';
        return;
      }
      if (!response.ok) throw 'network-error';

      const json = await response.json();
      if (json.status === 'success') {
        // Aggiorno l’avatar in pagina
        const imgEl = document.getElementById('profile-img-large');
        if (imgEl) {
          imgEl.style.backgroundImage = `url('../${json.profile_img}')`;
        }
        alert('Immagine di profilo aggiornata con successo.');
        fileInput.value = '';
      } else {
        alert('Errore upload: ' + json.message);
      }
    } catch (err) {
      console.error('Errore di rete durante upload immagine:', err);
      alert('Errore di rete durante upload immagine.');
    }
  });
}
