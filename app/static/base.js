const navPage = document.getElementById('goals');



navPage.addEventListener('click', () => {
    navPage.classList.add('active')
    console.log('clicked goals!')
});