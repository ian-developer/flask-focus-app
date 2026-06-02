document.getElementById('user_form').addEventListener('submit', async (e) => {
  e.preventDefault(); // This stops the page reload

  const userInput = document.getElementById('user_input')
  const personName = userInput.value;

  const newElement = document.createElement('p');
  newElement.textContent = personName;
  newElement.className = 'user-entry'; // Optional: for CSS styling

  const container = document.getElementById('display_container');
  container.appendChild(newElement);
  inputElement.value = '';
})