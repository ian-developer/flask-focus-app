document.getElementById('user_form').addEventListener('submit', async (e) => {
  e.preventDefault(); // This stops the page reload

  const inputElement = document.getElementById('user_input')
  const personName = inputElement.value;

  try {
    const response = await fetch('/add_person', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify({person: personName})
    });

    if (response.ok) {
      const result = await response.json();

      const newElement = document.createElement('p');
      newElement.textContent = result.name;

      const container = document.getElementById('display_container');
      container.appendChild(newElement);

      inputElement.value = '';
    }

    else {
      alert('Failed to save data to the database');
    }
  } catch(error) {
    console.error("Network error", error);
  }

})