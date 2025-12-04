import attractions from '../data/attractions.mjs';

// Visitor tracking with localStorage
function displayVisitorMessage() {
    const visitorBanner = document.getElementById('visitor-message');
    const visitorText = document.getElementById('visitor-text');

    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();

    let message = '';

    if (!lastVisit) {
        message = 'Welcome! Let us know if you have any questions.';
    } else {
        const timeDiff = now - parseInt(lastVisit);
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff < 1) {
            message = 'Back so soon! Awesome!';
        } else if (daysDiff === 1) {
            message = 'You last visited 1 day ago.';
        } else {
            message = `You last visited ${daysDiff} days ago.`;
        }
    }

    visitorText.textContent = message;
    visitorBanner.style.display = 'block';

    // Store current visit
    localStorage.setItem('lastVisit', now.toString());
}

// Close banner
document.getElementById('close-visitor-message')?.addEventListener('click', () => {
    document.getElementById('visitor-message').style.display = 'none';
});

// Create attraction cards
function displayAttractions() {
    const grid = document.getElementById('attractions-grid');
    const skeleton = document.getElementById('attractions-skeleton');
    if (skeleton) skeleton.remove();

    attractions.forEach((attraction, index) => {
        const card = document.createElement('article');
        card.className = 'attraction-card';
        card.style.gridArea = `card${index + 1}`;

        card.innerHTML = `
            <figure class="attraction-figure">
                <img src="${attraction.image}" 
                     alt="${attraction.name}" 
                     width="300" 
                     height="200" 
                     loading="lazy"
                     decoding="async">
            </figure>
            <div class="attraction-body">
                <h2>${attraction.name}</h2>
                <address>${attraction.address}</address>
                <p>${attraction.description}</p>
                <button class="btn btn-learn-more">Learn More</button>
            </div>
        `;

        grid.appendChild(card);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    displayVisitorMessage();
    displayAttractions();
});
