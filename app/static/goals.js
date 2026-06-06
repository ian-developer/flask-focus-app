document.getElementById('new_goal_form').addEventListener('submit', async (e) => {
  e.preventDefault(); // This stops the page reload

  const goalData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        tasks: document.getElementById('tasks').value,
        difficulty: document.getElementById('difficulty').value,
        priority: document.getElementById('priority').value,
        progress_percentage: document.getElementById('progress_percentage').value
  };

    fetch('/add-goal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
    })
    .then(response => response.json())
    .then(goal => {
        // Pronalaženje tbody elementa u tablici
        const tbody = document.querySelector('table tbody');
        
        // Ako postoji poruka "Trenutno nema spremljenih ciljeva", obriši je
        if (tbody.rows.length === 1 && tbody.rows[0].cells.length === 1) {
            tbody.innerHTML = '';
        }

        let tasksHtml = '<small style="color: #b2bec3;">Nema zadataka</small>';
        if (goal.tasks && goal.tasks.length > 0) {
            tasksHtml = '<ul>';
            goal.tasks.forEach(task => {
                tasksHtml += `<li>${task}</li>`;
            });
            tasksHtml += '</ul>';
        }

        const statusText = goal.is_completed ? 'Rješeno' : 'U tijeku';
        const statusClass = goal.is_completed ? 'status-done' : 'status-pending';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="badge badge-${goal.priority}">${goal.priority}</span></td>
            <td>
                <strong>${goal.title}</strong><br>
                <small style="color: #7f8c8d;">${goal.description || 'Nema opisa'}</small>
            </td>
            <td>${tasksHtml}</td>
            <td>${goal.difficulty}</td>
            <td>${goal.progress_percentage}%</td>
            <td><span class="${statusClass}">${statusText}</span></td>
        `;

        // Dodavanje novog retka na kraj tablice
        tbody.appendChild(row);

        // Resetiranje forme za sljedeći unos
        document.getElementById('new_goal_form').reset();
    })
    .catch(error => console.error('Greška:', error));

});