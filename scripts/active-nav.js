document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#primary-navigation a');

    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname;

        const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
        const normalizedLinkPath = linkPath.endsWith('/') ? linkPath.slice(0, -1) : linkPath;

        if ((normalizedLinkPath.endsWith('/index.html') || normalizedLinkPath === '') && (normalizedCurrentPath === '' || normalizedCurrentPath.endsWith('/wdd231'))) {
            if (link.textContent === 'Home') {
                link.classList.add('active');
            }
        } else if (normalizedCurrentPath.includes(normalizedLinkPath) && !normalizedLinkPath.endsWith('/index.html')) {
            link.classList.add('active');
        }
    });
});
