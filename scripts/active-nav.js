document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#primary-navigation a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        let normalizedLinkPath = linkHref.startsWith('/') ? linkHref : '/' + linkHref;
        let normalizedCurrentPath = currentPath.startsWith('/') ? currentPath : '/' + currentPath;

        if (normalizedCurrentPath === '/' && normalizedLinkPath === '/index.html') {
            link.classList.add('active');
        } else if (normalizedCurrentPath.includes(normalizedLinkPath) && normalizedLinkPath !== '/') {
            link.classList.add('active');
        }
    });
});
