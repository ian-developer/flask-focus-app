
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
        const tbody = document.querySelector('table tbody');

        if (tbody.rows.length === 1 && tbody.rows[0].cells.length === 1) {
            tbody.innerHTML = '';
        }

        const tasksHtml = goal.tasks?.length 
            ? `<ul>${goal.tasks.map(task => `<li>${task}</li>`).join('')}</ul>`
            : '<small style="color: #b2bec3;">Nema zadataka</small>';
        
        const statusText = goal.is_completed ? 'Completed' : 'Not Completed';
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
