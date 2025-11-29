document.addEventListener('DOMContentLoaded', () => {
    const summaryBox = document.getElementById('form-summary');
    if (!summaryBox) return;

    const urlParams = new URLSearchParams(window.location.search);

    const requiredFields = {
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'email': 'Email',
        'phone': 'Mobile Phone',
        'org_name': 'Business Name',
        'timestamp': 'Submission Date'
    };

    let summaryHtml = '<ul>';
    let hasData = false;

    for (const [key, label] of Object.entries(requiredFields)) {
        const value = urlParams.get(key);
        if (value) {
            hasData = true;
            let displayValue = value;
            // Format the timestamp for readability
            if (key === 'timestamp') {
                try {
                    const date = new Date(value);
                    displayValue = date.toLocaleString();
                } catch (e) {
                    // Fallback to original value if date is invalid
                    displayValue = value;
                }
            }
            summaryHtml += `<li><strong>${label}:</strong> ${escapeHTML(displayValue)}</li>`;
        }
    }

    summaryHtml += '</ul>';

    if (hasData) {
        summaryBox.innerHTML = summaryHtml;
    } else {
        summaryBox.innerHTML = '<p>No submission data found.</p>';
    }
});

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}
