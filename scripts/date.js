const yearEl = document.getElementById('currentyear');
const lastModEl = document.getElementById('lastModified');

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

if (lastModEl) {
    lastModEl.textContent = document.lastModified || new Date().toLocaleString();
}
