// SikmaV2 - assets/js/ui.js

const UI = {
    // DOM Element Selectors (cache common elements if needed, or select dynamically)
    getElement: (selector) => document.querySelector(selector),
    getAllElements: (selector) => document.querySelectorAll(selector),

    // Message Display
    /**
     * Shows a message in a specified div.
     * @param {string|HTMLElement} targetDivOrSelector - The div element or its selector.
     * @param {string} message - The message to display.
     * @param {'success'|'error'|'info'} type - The type of message.
     * @param {number} autoHideDelay - Delay in ms to auto-hide. 0 for no auto-hide.
     */
    showMessage: (targetDivOrSelector, message, type = 'info', autoHideDelay = 5000) => {
        const div = typeof targetDivOrSelector === 'string' ? UI.getElement(targetDivOrSelector) : targetDivOrSelector;
        if (!div) {
            console.warn('UI.showMessage: Target div not found:', targetDivOrSelector);
            // Fallback to alert if target div not found for critical messages
            if (type === 'error' || type === 'success') alert(`${type.toUpperCase()}: ${message}`);
            return;
        }

        div.textContent = message;
        div.className = 'auth-message'; // Reset classes
        div.classList.add(type); // Add success, error, or info class
        
        // Add icon based on type
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        else if (type === 'error') iconClass = 'fas fa-exclamation-triangle';
        
        div.innerHTML = `<i class="${iconClass}"></i> ${message}`; // Prepend icon

        div.style.display = 'block';
        div.style.opacity = 1; // Ensure visible if previously faded out

        if (autoHideDelay > 0) {
            if (div.hideTimeout) clearTimeout(div.hideTimeout); // Clear existing timeout
            div.hideTimeout = setTimeout(() => {
                UI.hideMessage(div);
            }, autoHideDelay);
        }
    },

    hideMessage: (targetDivOrSelector) => {
        const div = typeof targetDivOrSelector === 'string' ? UI.getElement(targetDivOrSelector) : targetDivOrSelector;
        if (div) {
            // Optional: Add a fade-out animation
            div.style.opacity = 0;
            setTimeout(() => {
                div.style.display = 'none';
                div.textContent = ''; // Clear content after hiding
                if (div.hideTimeout) clearTimeout(div.hideTimeout);
            }, 300); // Match animation duration
        }
    },

    // Modal Management
    /**
     * Opens a modal.
     * @param {string} modalId - The ID of the modal element.
     */
    openModal: (modalId) => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            modal.classList.add('show');
            document.body.classList.add('modal-open'); // Optional: for body scroll lock
            // Focus on the first focusable element in the modal
            const firstFocusable = modal.querySelector('input, select, button, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        } else {
            console.warn(`Modal with ID "${modalId}" not found.`);
        }
    },

    /**
     * Closes a modal.
     * @param {string} modalId - The ID of the modal element.
     */
    closeModal: (modalId) => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    },

    /**
     * Sets the title of a modal.
     * @param {string} modalId - The ID of the modal.
     * @param {string} title - The new title text.
     * @param {string} [iconClass] - Optional FontAwesome icon class for the title.
     */
    setModalTitle: (modalId, title, iconClass = 'fas fa-info-circle') => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            const titleElement = modal.querySelector('.modal-header h3'); // Assuming h3 is used for title
            if (titleElement) {
                titleElement.innerHTML = `<i class="${iconClass}"></i> ${title}`;
            }
        }
    },
    
    // Form Handling
    /**
     * Resets a form.
     * @param {string|HTMLFormElement} formOrSelector - The form element or its selector.
     */
    resetForm: (formOrSelector) => {
        const form = typeof formOrSelector === 'string' ? UI.getElement(formOrSelector) : formOrSelector;
        if (form && typeof form.reset === 'function') {
            form.reset();
        }
    },

    /**
     * Disables or enables all submittable elements in a form.
     * @param {string|HTMLFormElement} formOrSelector - The form element or its selector.
     * @param {boolean} disabled - True to disable, false to enable.
     */
    setFormDisabled: (formOrSelector, disabled) => {
        const form = typeof formOrSelector === 'string' ? UI.getElement(formOrSelector) : formOrSelector;
        if (form) {
            const elements = form.elements;
            for (let i = 0; i < elements.length; i++) {
                if (['submit', 'button'].includes(elements[i].type) || elements[i].tagName === 'BUTTON') {
                    elements[i].disabled = disabled;
                }
            }
        }
    },

    // Element Visibility & Class Toggling
    showElement: (elementOrSelector) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.style.display = ''; // Use '' to revert to stylesheet's default (block, flex, etc.)
    },

    hideElement: (elementOrSelector) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.style.display = 'none';
    },

    toggleClass: (elementOrSelector, className, force) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.classList.toggle(className, force);
    },

    addClass: (elementOrSelector, className) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.classList.add(className);
    },

    removeClass: (elementOrSelector, className) => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.classList.remove(className);
    },

    // Update User Interface (Shared elements like header)
    updateSharedUserUI: (userData) => {
        const sharedUserName = UI.getElement('#sharedUserName');
        const sharedAvatarPreview = UI.getElement('#sharedAvatarPreview');
        
        const displayName = userData?.nama_lengkap || 'Pengguna';
        const displayAvatar = userData?.avatar || 'https://placehold.co/45x45/3498db/ffffff?text=U';

        if (sharedUserName) sharedUserName.textContent = displayName;
        if (sharedAvatarPreview) {
            sharedAvatarPreview.src = displayAvatar;
            sharedAvatarPreview.alt = `Avatar ${displayName}`;
        }
    },

    // Reset UI (e.g., on logout)
    resetSharedUserUI: () => {
        const sharedUserName = UI.getElement('#sharedUserName');
        const sharedAvatarPreview = UI.getElement('#sharedAvatarPreview');
        if (sharedUserName) sharedUserName.textContent = 'Nama Mahasiswa';
        if (sharedAvatarPreview) {
            sharedAvatarPreview.src = 'https://placehold.co/45x45/3498db/ffffff?text=U';
            sharedAvatarPreview.alt = 'Avatar Pengguna';
        }
    },

    // Spinner/Loading indication
    /**
     * Shows a loading spinner on a button.
     * @param {HTMLButtonElement} buttonElement
     * @param {string} [originalText] - Optional: text to restore after loading.
     */
    showButtonSpinner: (buttonElement, originalText = null) => {
        if (!buttonElement) return;
        if (originalText) {
            buttonElement.dataset.originalText = originalText;
        } else if (!buttonElement.dataset.originalText) {
            buttonElement.dataset.originalText = buttonElement.innerHTML; // Store current HTML
        }
        buttonElement.disabled = true;
        buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;
    },

    /**
     * Hides the loading spinner on a button and restores its original text/HTML.
     * @param {HTMLButtonElement} buttonElement
     */
    hideButtonSpinner: (buttonElement) => {
        if (!buttonElement) return;
        buttonElement.disabled = false;
        if (buttonElement.dataset.originalText) {
            buttonElement.innerHTML = buttonElement.dataset.originalText;
        }
        // Consider removing dataset.originalText if not needed anymore
    },

    /**
     * Creates and returns a generic item tag element.
     * @param {string} name - The main text of the tag.
     * @param {string} [details] - Optional details text.
     * @param {string} [iconClass] - Optional FontAwesome icon class for the tag.
     * @param {string} [itemId] - Optional ID for the item, stored in dataset.
     * @param {boolean} [canEdit=true] - Whether to show an edit button.
     * @param {boolean} [canDelete=true] - Whether to show a delete button.
     * @returns {HTMLElement} The created item tag element.
     */
    createItemTag: (name, details = '', iconClass = '', itemId = '', canEdit = true, canDelete = true) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-tag';
        if (itemId) itemDiv.dataset.itemId = itemId;
        itemDiv.dataset.itemName = name; // Store name for easier access
        if (details) itemDiv.dataset.itemDetails = details;


        let html = '';
        if (iconClass) {
            html += `<i class="${iconClass} item-icon"></i> `;
        }
        html += `<span class="item-name">${UI.escapeHTML(name)}</span>`;
        if (details) {
            html += ` <span class="item-details">(${UI.escapeHTML(details)})</span>`;
        }
        
        html += '<div class="item-actions">';
        if (canEdit) {
            html += `<button type="button" class="item-action-btn edit-item" aria-label="Edit item ${UI.escapeHTML(name)}"><i class="fas fa-pencil-alt"></i></button>`;
        }
        if (canDelete) {
            html += `<button type="button" class="item-action-btn remove-item" aria-label="Remove item ${UI.escapeHTML(name)}"><i class="fas fa-times"></i></button>`;
        }
        html += '</div>';

        itemDiv.innerHTML = html;
        return itemDiv;
    },

    escapeHTML: (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }
};

// Global event listener for closing modals with escape key or close button
document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const openModal = UI.getElement('.modal.show');
            if (openModal) {
                UI.closeModal(openModal.id);
            }
        }
    });

    document.body.addEventListener('click', (event) => {
        // Close modal if backdrop is clicked
        if (event.target.classList.contains('modal') && event.target.classList.contains('show')) {
            UI.closeModal(event.target.id);
        }
        // Close modal if a close button inside a modal is clicked
        if (event.target.classList.contains('close-btn') || event.target.closest('.close-btn')) {
            const modalToClose = event.target.closest('.modal');
            if (modalToClose && modalToClose.classList.contains('show')) {
                UI.closeModal(modalToClose.id);
            }
        }
    });
});