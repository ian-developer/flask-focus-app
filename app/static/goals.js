
// Fetch data from goals and send to flask

const addGoal = async (goalData) => {
        try {

        const hasEmptyFields = Object.entries(goalData).some(([key, value]) => {
            if (key === 'tasks') return false;
            return !String(value).trim();
        });
        
        if (hasEmptyFields) {
            alert('Form cannot be submitted! Please fill all fields')
            return;
        }

        const response = await fetch('/add-goal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        });

        if(!response.ok) {
            const errorData = await response.json();
            
            throw new Error(errorData.error || 'Server error');
        }

        const goal = await response.json();

        dateObj = new Date(goal.created_at);

        prettyDate = dateObj.toLocaleString('hr-HR', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

        const tbody = document.querySelector('table tbody');

        if (tbody.rows.length === 1 && tbody.rows[0].cells.length === 1) {
            tbody.innerHTML = '';
        }

        // SHOW INFORMATION IN GOAL ROW

        const tasksHtml = goal.tasks?.length 
            ? `<ul>${goal.tasks.map(task => `<li>${task}</li>`).join('')}</ul>`
            : '<small style="color: #b2bec3;">Nema zadataka</small>';
        
        const statusText = goal.is_completed ? 'Completed' : 'Pending';
        const statusClass = goal.is_completed ? 'status-done' : 'status-pending';

        const row = document.createElement('tr');
        row.classList.add('clickable-row');
        row.dataset.href = `/goals/${goal.id}`;

        row.innerHTML = `
            <td><span class="badge badge-${goal.priority}">${goal.priority}</span></td>
            <td>
                <a href="/goals/${goal.id}">
                    <strong>${goal.title}</strong><br>
                </a>
                <small style="color: #7f8c8d;">${goal.description || 'Nema opisa'}</small><br>
                <small class="date">${prettyDate}</small>
            </td>
            <td>${tasksHtml}</td>
            <td>${goal.difficulty}</td>
            <td>${Math.round(goal.progress_percentage)}%</td>
            <td><span class="${statusClass}">${statusText}</span></td>
        `;

        // adding a new row to table
        tbody.appendChild(row);

        // Reset form for next input
        document.getElementById('new_goal_form').reset();

        } catch (error) {
            alert(`Server error: ${error.message}`)
            console.error('Error', error);
        }
    };

document.getElementById('new_goal_form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target)
  const goalData = Object.fromEntries(formData.entries());

  await addGoal(goalData)
});

//-------------------Open and close form window functionalities------------------

// Dohvaćanje elemenata s ekrana
const openFormBtn = document.getElementById('open_form_btn');
const closeFormBtn = document.getElementById('close_form_btn');
const formContainer = document.getElementById('form_container');

// 1. Klikom na "+ Dodaj cilj" prikaži formu
openFormBtn.addEventListener('click', () => {
    formContainer.classList.remove('hidden');
});

// 2. Klikom na "X" ponovno sakrij formu
closeFormBtn.addEventListener('click', () => {
    formContainer.classList.add('hidden');
});

// 3. Automatski sakrij formu NAKON što je cilj uspješno spremljen
// (Ovaj dio koda stavite na sam kraj vašeg 'try' bloka unutar addGoal funkcije, odmah nakon resetiranja forme)
formContainer.classList.add('hidden');


// Globalni osluškivač klikova na tablicu (hvata i stare i nove retke)
document.querySelector('table tbody').addEventListener('click', (e) => {
    // Ako je korisnik kliknuo unutar retka koji ima klasu 'clickable-row'
    const row = e.target.closest('.clickable-row');
    
    if (row) {
        // Ako je korisnik kliknuo točno na ugrađeni <a> link, pusti preglednik da odradi svoje (npr. otvaranje u novom tabu)
        if (e.target.closest('.goal-link')) {
            return;
        }
        
        // Inače, dohvati URL iz data-href atributa i preusmjeri korisnika
        const url = row.dataset.href;
        if (url) {
            window.location.href = url;
        }
    }
});
