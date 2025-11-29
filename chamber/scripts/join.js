document.addEventListener('DOMContentLoaded', () => {
    // Timestamp for the form
    const timestampField = document.getElementById('form-timestamp');
    if (timestampField) {
        timestampField.value = new Date().toISOString();
    }

    // Form validation
    const form = document.querySelector('.join-form');
    if (form) {
        form.addEventListener('submit', e => {
            form.classList.add('was-validated');
            if (!form.checkValidity()) {
                e.preventDefault();
                // Find the first invalid field and focus it for accessibility
                const firstInvalidField = form.querySelector(':invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
            }
        });
    }

    // Phone number input validation
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('keydown', e => {
            const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'
            ];
            if (allowedKeys.includes(e.key)) {
                return;
            }

            const currentValue = e.target.value;
            const isDigit = e.key >= '0' && e.key <= '9';
            const isPlus = e.key === '+';
            const isDash = e.key === '-';
            const isSpace = e.key === ' ';

            // If the input is empty and the user types a digit, prepend '+'
            if (currentValue.length === 0 && isDigit) {
                e.target.value = '+';
                // The digit will be added by the default browser action, so we don't need to do anything else.
                return;
            }

            // Allow '+' only as the first character
            if (isPlus && currentValue.length === 0) {
                return;
            }

            // Allow digits, dashes, and spaces after the first character
            if (currentValue.length > 0 && (isDigit || isDash || isSpace)) {
                return;
            }
            
            // Prevent all other characters
            e.preventDefault();
        });
    }

    // Modal functionality
    const modalButtons = document.querySelectorAll('[data-modal-target]');
    const modals = document.querySelectorAll('.modal');
    const body = document.body;
    let lastFocusedElement;

    function openModal(modal) {
        if (modal == null) return;
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        body.style.overflow = 'hidden'; // Prevent background scrolling
        setTimeout(() => {
            modal.classList.add('is-open');
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusableElement = focusableElements[0];
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }, 10); // Delay for transition
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('is-open');
        body.style.overflow = '';
        modal.addEventListener('transitionend', () => {
            modal.hidden = true;
        }, { once: true });
        if(lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    modalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            openModal(modal);
        });
    });

    modals.forEach(modal => {
        const closeButton = modal.querySelector('.modal-close');
        if(closeButton) {
            closeButton.addEventListener('click', () => {
                closeModal(modal);
            });
        }

        // Close modal by clicking on the overlay
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });

        // Keyboard accessibility
        modal.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeModal(modal);
            }
            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    });
});
