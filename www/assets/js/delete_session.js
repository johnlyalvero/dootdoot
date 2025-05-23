// delete_session.js
// Gestisce la cancellazione di una sessione via DELETE

document.addEventListener('click', async (event) => {
  if (!event.target.matches('.btn-delete-session')) return;
  const id = event.target.dataset.id;
  if (!confirm('Confermi cancellazione sessione?')) return;

  const res = await fetch('../../api/sessions/delete.php', {
    method: 'DELETE', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id })
  });
  const data = await res.json();
  if (data.success) location.reload();
  else alert(data.error);
});