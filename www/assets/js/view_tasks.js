document.addEventListener("DOMContentLoaded", async () => {
    try {
      const res = await fetch("/api/tasks/list.php");
      if (!res.ok) throw new Error("Errore nella richiesta");
      const data = await res.json();
  
      const taskBox = document.getElementById("tasks-container");
      const sessBox = document.getElementById("sessions-container");
  
      data.tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <strong>${task.title}</strong><br>
          Tipo: ${task.is_test === "1" ? "🧪 Test" : "📌 Task"}<br>
          Scadenza: ${task.due_date}<br>
          <small>${task.description}</small><br>
          <a href="/api/tasks/update.php?id=${task.id}">✏️ Modifica</a>
        `;
        taskBox.appendChild(div);
      });
  
      data.sessions.forEach(session => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          ${session.start_time} (${session.duration_minutes} min)<br>
          <em>${session.notes}</em>
        `;
        sessBox.appendChild(div);
      });
  
    } catch (err) {
      alert("Errore: " + err.message);
    }
  });
  