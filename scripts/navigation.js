const menuButton = document.getElementById('menu');
const navList = document.getElementById('primary-navigation');

if (menuButton && navList) {
    menuButton.setAttribute('aria-expanded', 'false');

    menuButton.addEventListener('click', () => {
        const isOpen = navList.classList.toggle('open');
        menuButton.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
    });
}
