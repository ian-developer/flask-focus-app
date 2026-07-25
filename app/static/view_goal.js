const tasksContainer = document.querySelector('.tasks-container');
const progressPercentage = document.querySelector('.progress-percentage');
const statusCell = document.querySelector('.goal-status span');
const taskBox = document.querySelector('.task-list-box');

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
            const progressBar = document.querySelector('.progress-bar');

            try {
            const response = await fetch(`/api/tasks/${taskId}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_completed: isCompleted })
            });
            const data = await response.json();

            progressPercentage.innerText = data.progress_percentage + '%';
            
            if (taskText) {
                taskText.classList.toggle('completed-task', isCompleted);
                progressBar.innerHTML = `
                    <div class="progress-bar" style="width: 100%; background: #e2e8f0; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="--progress: ${Math.round(data.progress_percentage)}%; width: var(--progress); background: lightgreen; height: 100%; transition: width 0.3s ease;"></div>
                    </div>`
                if(data.progress_percentage == 100){
                    statusCell.style.color = "#38a169";
                    statusCell.innerText = "Completed";
                }
                else{
                    statusCell.style.color = "#dd6b20";
                    statusCell.innerText = "In Progress";
                }
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
            
            if (!confirm('Do you want to delete this task?')) return;

            console.log(target.dataset.taskId);

            try {
                const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
                const data = await response.json();

                taskItem.remove();

                const remainingTasks = tasksContainer.querySelectorAll('.task-item');
        
                if (remainingTasks.length === 0) {
                    tasksContainer.innerHTML = '';
                    // Kreiramo novi element za poruku
                    const noTasksMessage = document.createElement('p');
                    noTasksMessage.className = 'no-tasks-msg';
                    noTasksMessage.textContent = 'There is no tasks';
                    noTasksMessage.innerHTML = '<p style="margin: 0; color: #a0aec0; font-style: italic; padding-bottom: 15px;">There are no tasks here.</p>';
                    
                    // Dodajemo poruku u kontejner gdje su bili zadaci
                    tasksContainer.appendChild(noTasksMessage);
                }
                
            } catch (err) {
                console.error(err);
            }
            return;
        }

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
                        const newTask = document.createElement('li');
                        newTask.className = "task-item task-box";
                        newTask.style.cssText = "display: flex; align-items: center; justify-content: space-between;";

                        newTask.innerHTML = `<label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                                            <input
                                                style="margin-right: 10px;"
                                                type="checkbox" 
                                                class="task-toggle">                                            
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


    });
}