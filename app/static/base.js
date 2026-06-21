// This file doesn't do anything yet, it should add style on links clicked in navigation


const navPage = document.getElementById('goals');



navPage.addEventListener('click', () => {
    navPage.classList.add('active')
    console.log('clicked goals!')
});