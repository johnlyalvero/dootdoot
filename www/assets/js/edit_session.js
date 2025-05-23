// edit_session.js
// Gestisce Submit del form per aggiornare una sessione via PUT

document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('save-session-btn');
  async function updateSession(payload) {
    const res = await fetch('../../api/sessions/update.php', {
      method: 'PUT', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
    });
    return res.json();
  }

  saveBtn.addEventListener('click', async () => {
    const payload = {
      id: document.getElementById('edit-session-id').value,
      start_time: document.getElementById('edit-start-time').value.replace('T', ' '),
      end_time: document.getElementById('edit-end-time').value.replace('T', ' '),
      notes: document.getElementById('edit-notes').value
    };
    const data = await updateSession(payload);
    if (data.success) location.reload();
    else alert(data.error);
  });
});