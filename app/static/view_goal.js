const tasksContainer = document.querySelector('.tasks-container');
const progressPercentage = document.querySelector('.progress-percentage');
const statusCell = document.querySelector('.goal-status span');
const progressBar = document.querySelector('.progress-bar');
const progressBarFill = document.querySelector('.progress-bar-fill');
const finishGoalBtn = document.querySelector('.finish-goal-btn');
const cardActions = document.querySelector('.card-actions');

function changeProgress(percentage){
    progressPercentage.innerText = percentage + '%';
    progressBarFill.style.setProperty('--progress', percentage + '%');

    if(percentage >= 100){
                    finishGoalBtn.style.backgroundColor = "var(--primary)";
                    statusCell.style.color = "var(--primary)";
                    statusCell.innerText = "Completed";
                }
                else{
                    finishGoalBtn.style.backgroundColor = "gray";
                    statusCell.style.color = "#b364de";
                    statusCell.innerText = "In Progress";
                }
}

if(tasksContainer){
    tasksContainer.addEventListener('click', async (e) => {
        const target = e.target;
        // CHECKBOX TASK

        if (target.classList.contains('task-toggle') || target.type === 'checkbox'){

            const taskItem = target.closest('.task-item'); // cijeli <li> task redak (checkbox, tekst i x)
            const taskCheckbox = target.closest('.task-toggle');
            const isCompleted = taskCheckbox.checked;
            const taskId = taskCheckbox.dataset.taskId;
            const taskText = taskItem.querySelector('label span');


            try {
            const response = await fetch(`/api/tasks/${taskId}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_completed: isCompleted })
            });
            const data = await response.json();
            
            if (taskText) {
                taskText.classList.toggle('completed-task', isCompleted);

                changeProgress(data.progress_percentage);

            }
            
            } catch (err) {
                console.error(err);
            }

        }
        // DELETE TASK

        if (target.classList.contains('delete-task-btn')) {
            e.stopPropagation();
            const taskId = target.dataset.taskId;
            const taskItem = target.closest('.task-item');

            if (target.disabled) return;
            
            if (!confirm('Do you want to delete this task?')) return;

            try {
                const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
                const data = await response.json();

                taskItem.remove();

                changeProgress(data.progress_percentage);
                
                const remainingTasks = tasksContainer.querySelectorAll('.task-item');
        
                if (remainingTasks.length === 0) {
                    tasksContainer.innerHTML = '';
                    const noTasksMsg = document.createElement('p');
                    noTasksMsg.className = 'no-tasks-msg';
                    noTasksMsg.textContent = 'There is no tasks';
                    noTasksMsg.innerHTML = 'There are no tasks here.';
                    
                    // Dodajemo poruku u kontejner gdje su bili zadaci
                    tasksContainer.appendChild(noTasksMsg);
                }
                
            } catch (err) {
                console.error(err);
            }
            return;
        }
    });
}

// CONFIRM FINISH BUTTON EVENT LISTENER

cardActions.addEventListener('click', async(e) => {
    e.preventDefault();
    const target = e.target;

    if(target.classList.contains('finish-goal-btn')){

        const goalId = target.dataset.id;

        if (!goalId) {
            console.error("Greška: Element nema 'data-id' atribut!");
            return; 
        }

        const isConfirmed = confirm('Do you really want to finish this goal?');

        if (!isConfirmed) {
            return;
        }

        // SENT DATA TO BACKEND WITH FETCH
        fetch(`/goals/${goalId}/finish/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                goal_id: goalId,
                goal_confirmed_finished: true
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    if (data.tasks_incomplete) {
                        alert(`Unable to finish goal due to unchecked tasks.`);
                    }
                    console.error('Server error:', data.message);
                }
            })
            .catch(error => console.error('Fetch error:', error));
        }
    
    // 1. CLICKED THE THREE DOTS BUTTON
    if (e.target.matches('.three-dots-btn')) {
        e.stopPropagation();
        
        const currentDropdown = e.target.nextElementSibling;

        // Toggle the current dropdown
        currentDropdown.classList.toggle('hidden');
        return;
    }
    // 3. CLICKED ANYWHERE ELSE ON THE PAGE
    // Automatically hide all open dropdown menus
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.add('hidden');
    });
});

// TASK ACTIONS

const taskManagementBox = document.querySelector('.task-management-box');

taskManagementBox.addEventListener('click', async(e) =>{
    e.preventDefault();
    const target = e.target;

    // SHOW NEW TASK CONTAINER

    if(target.classList.contains('new-task-btn')){
        e.stopPropagation();

        const newTaskBtn = target;
        const addTaskContainer = target.nextElementSibling;

        if (addTaskContainer) {
            newTaskBtn.classList.add('hidden');          // Sakrij gumb
            addTaskContainer.classList.remove('hidden'); // Prikaži input i gumb za spremanje
            
            // Bonus: Automatski stavi fokus (kurzor) u input polje
            const inputField = addTaskContainer.querySelector('input');
            if (inputField) inputField.focus();
        }

    }

    // CLOSE NEW TASK CONTAINER

    if(target.classList.contains('quit-task-btn')){
        e.stopPropagation();

        const addTaskContainer = target.closest('.add-task-container');
        const taskManageBox = target.closest('.task-management-box');

        if (taskManageBox && addTaskContainer) {
            const newTaskBtn = taskManageBox.querySelector('.new-task-btn');
            const inputField = addTaskContainer.querySelector('input');

            // Ponovno prikaži početni gumb, sakrij formu
            if (newTaskBtn) newTaskBtn.classList.remove('hidden');
            addTaskContainer.classList.add('hidden');

            // Čisti tekst koji je korisnik upisao da ne ostane za idući put
            if (inputField) inputField.value = '';
        }
    }

    // ADD NEW TASK

    if(target.classList.contains('add-task-btn')){
        e.stopPropagation();
        const addTaskContainer = target.closest('.add-task-container');
        const taskManageBox = target.closest('.task-management-box'); 

        if (taskManageBox && addTaskContainer) {  
            const inputField = addTaskContainer.querySelector('.new-task-input');
            const taskText = inputField.value.trim();

            const goalId = taskManageBox.dataset.id;

            if (taskText === '') {
                alert('Molimo upišite tekst zadatka!');
                return;
            }

            // 2. SLANJE PODATAKA NA BACKEND (U BAZU) PREKO FETCH API-JA
            fetch(`/api/tasks/${goalId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    goal_id: goalId,   // Vaš dohvaćeni ID
                    task_text: taskText // Tekst zadatka
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    const taskBox = document.createElement('ul');
                    const noTaskMsg = tasksContainer.querySelector('p');
                    if (noTaskMsg) {
                        noTaskMsg.remove();
                    }

                    taskBox.classList.add('task-list-box');
                    tasksContainer.appendChild(taskBox);

                    const newTask = document.createElement('li');
                    newTask.className = "task-item task-box";
                    newTask.style.cssText = "display: flex; align-items: center; justify-content: space-between;";

                    newTask.innerHTML = `<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                        <input
                                            style="margin-right: 10px;"
                                            type="checkbox" 
                                            class="task-toggle"
                                            data-task-id="${ data.new_task_id}">                      
                                        <span>
                                            ${ data.task_text }
                                        </span>
                                    </label>
                                    
                                    <button type="button" 
                                            class="delete-task-btn" 
                                            data-task-id="${data.new_task_id}">
                                        &times;
                                    </button>`;

                    taskBox.append(newTask);

                    changeProgress(data.progress_percentage);
                    
                    // Sakrijte formu i očistite input nakon uspješnog spremanja
                    const newTaskBtn = taskManageBox.querySelector('.new-task-btn');
                    if (newTaskBtn) newTaskBtn.classList.remove('hidden');
                    addTaskContainer.classList.add('hidden');
                    inputField.value = '';
                } else {
                    //alert('Greška pri spremanju zadatka u bazu.');
                    alert('Greška sa servera: ' + (data.message || 'Nepoznata greška'));
                    console.error('Detalji greške s Flask-a:', data);
                }
            })
            .catch(error => {
                console.error('Greška u komunikaciji s poslužiteljem:', error);
            });
        }
    }

//end of event listener
})