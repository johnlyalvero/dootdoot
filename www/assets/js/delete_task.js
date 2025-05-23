// delete_task.js
// Gestisce la cancellazione di un task via DELETE

document.addEventListener('click', async (e) => {
  if (!e.target.matches('.btn-delete-task')) return;
  const id = e.target.dataset.id;
  if (!confirm('Confermi cancellazione task?')) return;

  const res = await fetch('../../api/tasks/delete.php', {
    method: 'DELETE',
    credentials: 'include',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ id })
  });
  const data = await res.json();
  if (data.success) location.reload();
  else alert(data.error);
});