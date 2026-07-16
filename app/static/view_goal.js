const tasksContainer = document.querySelector('.tasks-container');
const progressPercentage = document.querySelector('.progress-percentage');
const statusCell = document.querySelector('.goal-status span');

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

            console.log(taskId);
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
            const taskManageBox = target.closest('.task-management-box')

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


    });
}

/*
// Provjera postoji li kontejner na trenutnoj stranici (siguran kod)
if (tasksContainer) {
    tasksContainer.addEventListener('change', function(e) {
        // 2. Provjera je li kliknuto baš na kvačicu (checkbox)
        if (e.target.classList.contains('task-toggle') || e.target.type === 'checkbox') {
            const checkbox = e.target;
            
            // 3. Pronalaženje roditeljskog elementa tog zadatka
            const taskItem = checkbox.closest('.task-item');
            
            if (taskItem) {
                // 4. Vizualno označavanje (completed)
                if (checkbox.checked) {
                    taskItem.classList.add('completed');
                } else {
                    taskItem.classList.remove('completed');
                }
            }
            
            // 5. Pokretanje funkcije za računanje novog postotka
            azurirajPostotak();
        }
    });
}

// Funkcija koja broji zadatke i računa postotak
function azurirajPostotak() {
    // Pronađi sve kvačice unutar kontejnera
    const sveKvacice = tasksContainer.querySelectorAll('.task-toggle, input[type="checkbox"]');
    const ukupnoZadataka = sveKvacice.length;
    
    // Ako nema zadataka, postotak je 0% i prekidamo funkciju
    if (ukupnoZadataka === 0) {
        if (progressText) progressText.innerText = '0%';
        return;
    }
    
    // Izbroji koliko ih je označeno
    let oznacenoZadataka = 0;
    sveKvacice.forEach(kvacica => {
        if (kvacica.checked) {
            oznacenoZadataka++;
        }
    });
    
    // Izračunaj postotak (zaokruženo na cijeli broj)
    const postotak = Math.round((oznacenoZadataka / ukupnoZadataka) * 100);
    
    // Prikži postotak na ekranu (ako element postoji)
    if (progressText) {
        progressText.innerText = `${postotak}%`;
    }
}*/