// Pomoćna funkcija za formatiranje datuma (čisti kod od ponavljanja)
const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleString('hr-HR', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Funkcija za kreiranje HTML-a liste zadataka
const createTasksHtml = (goalId, tasks = []) => {
    if (!tasks.length) {
        return '<small style="color: #b2bec3;">Nema zadataka</small>';
    }

    return `
        <ul class="task-list" data-goal-id="${goalId}" style="list-style: none; padding: 0; margin: 0;">
            ${tasks.map(task => `
                <li class="task-cell" style="display: flex; align-items: left; justify-content: space-between; margin-bottom: 0px;">
                        <span style="${task.is_completed ? 'text-decoration: line-through; color: #7f8c8d;' : ''}">
                            ${task.text}
                        </span>
                </li>
            `).join('')}
        </ul>
    `;
};

// ADD NEW GOAL
const addGoal = async (goalData) => {
    try {
        // Validacija praznih polja (izuzimajući tasks)
        const hasEmptyFields = Object.entries(goalData).some(([key, value]) => {
            if (key === 'tasks') return false;
            return !String(value).trim();
        });
        
        if (hasEmptyFields) {
            alert('Form cannot be submitted! Please fill all fields');
            return;
        }

        const response = await fetch('/add-goal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error');
        }

        const goal = await response.json();
        const prettyDate = formatDate(goal.created_at);
        const tbody = document.querySelector('table tbody');

        // Ako imamo "Empty state" poruku u tablici, očisti je
        if (tbody.rows.length === 1 && tbody.rows[0].cells.length === 1) {
            tbody.innerHTML = '';
        }

        const statusText = goal.is_completed ? 'Completed' : 'Pending';
        const statusClass = goal.is_completed ? 'status-done' : 'status-pending';

        const row = document.createElement('tr');
        row.classList.add('clickable-row');
        row.dataset.href = `/goals/${goal.id}`;
        row.id = `goal-row-${goal.id}`; // Dodan ID za lakše dinamičko osvježavanje retka

        row.innerHTML = `
            <td style="text-align: center;"><span class="badge badge-${goal.priority}">${goal.priority}</span></td>
            <td style="text-align: left; max-width: 200px;">
                <h2 style="white-space: wrap; overflow: wrap;">${goal.title}</h2>
                <p style="color: #7f8c8d; max-width: 250px; font-size: 0.8rem; margin: 5px 0px;">${goal.description || 'No description'}</p>
                <small class="date">${prettyDate}</small>
            </td>
            <td>${createTasksHtml(goal.id, goal.tasks)}</td>
            <td>${goal.difficulty}</td>
            <td class="progress-cell">${Math.round(goal.progress_percentage)}%</td>
            <td class="status-cell" style="overflow: hidden; white-space: nowrap; padding: 3px;"><span class="${statusClass}">${statusText}</span></td>
        `;

        tbody.appendChild(row);

        // Resetiranje i zatvaranje forme NAKON uspjeha
        document.getElementById('new_goal_form').reset();
        //document.getElementById('form_container').classList.add('hidden');

    } catch (error) {
        alert(`Server error: ${error.message}`);
        console.error('Error', error);
    }
};

// Event Listener za formu
document.getElementById('new_goal_form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const goalData = Object.fromEntries(formData.entries());
    await addGoal(goalData);
});

//------------------- Upravljanje prozorom forme ------------------
const openFormBtn = document.getElementById('open_form_btn');
const closeFormBtn = document.getElementById('close_form_btn');
const formContainer = document.getElementById('form_container');

openFormBtn?.addEventListener('click', () => formContainer.classList.remove('hidden'));
closeFormBtn?.addEventListener('click', () => formContainer.classList.add('hidden'));


//------------------- Delegacija klikova unutar Tablice ------------------
document.querySelector('table tbody')?.addEventListener('click', async (e) => {
    const target = e.target;
    const row = target.closest('.clickable-row');
    if (!row) return;


    // 4. Standardni klik na redak za preusmjeravanje (ako nije kliknut link unutar retka)
    if (!target.closest('.goal-link') && !target.closest('a')) {

        const url = row.dataset.href;
        if (url) window.location.href = url;
    }
});
