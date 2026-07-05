// html gumb za dodavanje novog zadatka za implementirati uview_goal.js

        /*<div style="margin-top: 8px; display: flex; gap: 4px;">
            <input type="text" class="quick-task-input" placeholder="Novi zadatak..." style="flex: 1; padding: 2px 4px; font-size: 0.85rem;">
            <button type="button" class="quick-task-add-btn" data-goal-id="${goalId}" style="padding: 2px 6px; font-size: 0.85rem;">+</button>
        </div>*/


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

// Funkcija za kreiranje HTML-a liste zadataka s checkboxovima i gumbima za brisanje
const createTasksHtml = (goalId, tasks = []) => {
    if (!tasks.length) {
        return '<small style="color: #b2bec3;">Nema zadataka</small>';
    }

    return `
        <ul class="task-list" data-goal-id="${goalId}" style="list-style: none; padding: 0; margin: 0;">
            ${tasks.map(task => `
                <li style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0px;">

                        <span style="${task.is_completed ? 'text-decoration: line-through; color: #7f8c8d;' : ''}">
                            ${task.text}
                        </span>
                    </label>

                </li>
            `).join('')}
        </ul>
    `;
};

// Glavna funkcija za dodavanje cilja
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
            <td>
                <h2>${goal.title}</h2>
                <p style="color: #7f8c8d;">${goal.description || 'Nema opisa'}</p>
                <small class="date">${prettyDate}</small>
            </td>
            <td class="tasks-cell">${createTasksHtml(goal.id, goal.tasks)}</td>
            <td>${goal.difficulty}</td>
            <td class="progress-cell">${Math.round(goal.progress_percentage)}%</td>
            <td class="status-cell"><span class="${statusClass}">${statusText}</span></td>
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

openFormBtn.addEventListener('click', () => formContainer.classList.remove('hidden'));
closeFormBtn.addEventListener('click', () => formContainer.classList.add('hidden'));


//------------------- Delegacija klikova unutar Tablice ------------------
document.querySelector('table tbody').addEventListener('click', async (e) => {
    const target = e.target;
    const row = target.closest('.clickable-row');
    if (!row) return;

    /*
    // 1. Ako je kliknut checkbox za TOGGLE zadatka
    if (target.classList.contains('task-toggle')) {
        e.stopPropagation(); // Sprječava otvaranje linka kartice cilja
        const taskId = target.dataset.taskId;
        const isCompleted = target.checked;

        try {
            const response = await fetch(`/api/tasks/${taskId}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_completed: isCompleted })
            });
            const data = await response.json();
            
            // Vizualno prekriži tekst
            const textSpan = target.nextElementSibling;
            if (textSpan) {
                textSpan.classList.toggle('completed-task', isCompleted);
            }
            // Ažuriraj postotak i status u tablici za taj redak
            row.querySelector('.progress-cell').textContent = `${Math.round(data.progress_percentage)}%`;
            
            const statusCell = row.querySelector('.status-cell span');
            statusCell.className = data.progress_percentage === 100 ? 'status-done' : 'status-pending';
            statusCell.textContent = data.progress_percentage === 100 ? 'Completed' : 'Pending';
        } catch (err) {
            console.error(err);
        }
        return;
    }*/

    // 2. Ako je kliknut gumb za BRISANJE zadatka
    if (target.classList.contains('delete-task-btn')) {
        e.stopPropagation();
        const taskId = target.dataset.taskId;
        
        if (!confirm('Želite li obrisati ovaj zadatak?')) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            const data = await response.json();
            
            // Osvježi samo ćeliju sa zadacima i postotak napretka
            const tasksCell = row.querySelector('.tasks-cell');
            // Napomena: Za ovo rješenje, pretpostavlja se da delete ruta vraća ažuriranu listu 'tasks' ili radite refetch cijelog cilja.
            // Ako backend vraća samo progress, jednostavno uklonite <li> element iz DOM-a:
            target.closest('li').remove();
            
            row.querySelector('.progress-cell').textContent = `${Math.round(data.progress_percentage)}%`;
        } catch (err) {
            console.error(err);
        }
        return;
    }

    // 3. Ako je kliknut gumb za BRZO DODAVANJE zadatka (+)
    if (target.classList.contains('quick-task-add-btn')) {
        e.stopPropagation();
        const goalId = target.dataset.goalId;
        const input = target.previousElementSibling;
        const taskText = input.value.trim();

        if (!taskText) return;

        try {
            const response = await fetch(`/api/goals/${goalId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: taskText })
            });
            const data = await response.json(); // Backend vraća novi progress_percentage i cijeli novi task objekt
            
            // Najčišći pristup: Ponovno iscrtaj cijelu ćeliju s novim podacima (morali bismo povući cijeli novi niz zadataka)
            // Alternativno: Osvježite cijelu stranicu s window.location.reload() radi jednostavnosti, ili dodajte novi li ručno.
            window.location.reload(); 
        } catch (err) {
            console.error(err);
        }
        return;
    }

    // 4. Standardni klik na redak za preusmjeravanje (ako nije kliknut link unutar retka)
    if (!target.closest('.goal-link') && !target.closest('a')) {
        const url = row.dataset.href;
        if (url) window.location.href = url;
    }
});
