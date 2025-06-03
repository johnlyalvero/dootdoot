/**
 * profile.js
 *
 * 1. Verifica sessione → se non autenticato, redirect a login.html
 * 2. Carica dati anagrafici da api/auth/get_profile.php
 * 3. Carica statistiche da api/stats/user.php
 * 4. Popola immagine, nome, scuola, classe, e le 4 card
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
      profileImg: json.data.profile_img
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

  // Imposta immagine profilo
  const imgEl = document.querySelector('.profile-img-large');
  if (imgEl && user.profileImg) {
    imgEl.style.backgroundImage = `url('${user.profileImg}')`;
  }

  // Dati scuola e classe
  const infoValues = document.querySelectorAll('.info-value');
  // Si assume che l'ordine nel markup sia Nome, Scuola, Classe
  if (infoValues.length >= 3) {
    infoValues[0].textContent = user.username;
    infoValues[1].textContent = user.school;
    infoValues[2].textContent = user.class;
  }
}

function populateStats(stats) {
  const statEls = document.querySelectorAll('.stat-value');
  if (statEls.length < 4) return;
  statEls[0].textContent = `${stats.focus}/5`;       // Focus
  statEls[1].textContent = `${stats.discipline}%`;  // Disciplina
  statEls[2].textContent = `${stats.efficiency}/100`;// Efficienza
  statEls[3].textContent = stats.dedication;        // Dedizione
}
