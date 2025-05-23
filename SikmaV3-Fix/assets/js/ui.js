// SikmaV3 - assets/js/ui.js (Diperbarui)

const UI = {
    // DOM Element Selectors
    getElement: (selector) => document.querySelector(selector),
    getAllElements: (selector) => document.querySelectorAll(selector),

    // Message Display
    /**
     * Shows a message in a specified div.
     * @param {string|HTMLElement} targetDivOrSelector - The div element or its selector.
     * @param {string|object} messageOrErrors - The message string or an error object {field: [messages]}.
     * @param {'success'|'error'|'info'|'warning'} type - The type of message.
     * @param {number} autoHideDelay - Delay in ms to auto-hide. 0 for no auto-hide.
     */
    showMessage: (targetDivOrSelector, messageOrErrors, type = 'info', autoHideDelay = 5000) => {
        const div = typeof targetDivOrSelector === 'string' ? UI.getElement(targetDivOrSelector) : targetDivOrSelector;
        if (!div) {
            console.warn('UI.showMessage: Target div not found:', targetDivOrSelector);
            if (type === 'error' || type === 'success') {
                const alertMessage = typeof messageOrErrors === 'string' ? messageOrErrors : Object.values(messageOrErrors).flat().join('\n');
                alert(`${type.toUpperCase()}: ${alertMessage}`);
            }
            return;
        }

        div.className = 'auth-message'; // Reset classes
        div.classList.add(type);
        
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        else if (type === 'error') iconClass = 'fas fa-exclamation-triangle';
        else if (type === 'warning') iconClass = 'fas fa-exclamation-circle';
        
        let messageHTML = `<i class="${iconClass}"></i> `;
        if (typeof messageOrErrors === 'string') {
            messageHTML += UI.escapeHTML(messageOrErrors);
        } else if (typeof messageOrErrors === 'object' && messageOrErrors !== null) {
            if (messageOrErrors.message && Object.keys(messageOrErrors).length === 1) {
                 messageHTML += UI.escapeHTML(messageOrErrors.message);
            } else {
                messageHTML += "Harap perbaiki kesalahan berikut:<ul>";
                for (const field in messageOrErrors) {
                    if (Array.isArray(messageOrErrors[field])) {
                        messageOrErrors[field].forEach(msg => {
                            messageHTML += `<li>${UI.escapeHTML(msg)}</li>`;
                        });
                    } else {
                         messageHTML += `<li>${UI.escapeHTML(messageOrErrors[field])}</li>`;
                    }
                }
                messageHTML += "</ul>";
            }
        }

        div.innerHTML = messageHTML;
        div.style.display = 'flex';
        div.style.opacity = 1;

        if (div.hideTimeout) clearTimeout(div.hideTimeout);
        if (autoHideDelay > 0) {
            div.hideTimeout = setTimeout(() => {
                UI.hideMessage(div);
            }, autoHideDelay);
        }
    },

    hideMessage: (targetDivOrSelector) => {
        const div = typeof targetDivOrSelector === 'string' ? UI.getElement(targetDivOrSelector) : targetDivOrSelector;
        if (div && div.style.display !== 'none') {
            div.style.opacity = 0;
            setTimeout(() => {
                div.style.display = 'none';
                div.innerHTML = '';
                if (div.hideTimeout) clearTimeout(div.hideTimeout);
            }, 300);
        }
    },

    // Modal Management
    openModal: (modalId) => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            const firstFocusable = modal.querySelector('input:not([type="hidden"]), select, button, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 50);
            }
        } else {
            console.warn(`Modal with ID "${modalId}" not found.`);
        }
    },

    closeModal: (modalId) => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    setModalTitle: (modalId, title, iconClass = 'fas fa-info-circle') => {
        const modal = UI.getElement(`#${modalId}`);
        if (modal) {
            const titleElement = modal.querySelector('.modal-header h3');
            if (titleElement) {
                titleElement.innerHTML = `<i class="${iconClass}"></i> ${UI.escapeHTML(title)}`;
            }
        }
    },
    
    // Form Handling
    resetForm: (formOrSelector) => {
        const form = typeof formOrSelector === 'string' ? UI.getElement(formOrSelector) : formOrSelector;
        if (form && typeof form.reset === 'function') {
            form.reset();
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            form.querySelectorAll('.form-error-text').forEach(el => el.remove());
        }
    },

    setFormDisabled: (formOrSelector, disabled) => {
        const form = typeof formOrSelector === 'string' ? UI.getElement(formOrSelector) : formOrSelector;
        if (form) {
            const elements = form.elements;
            for (let i = 0; i < elements.length; i++) {
                if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(elements[i].tagName)) {
                    elements[i].disabled = disabled;
                }
            }
        }
    },

    /**
     * Handles avatar preview functionality for a file input.
     * @param {Event} event - The file input change event.
     * @param {HTMLImageElement} previewElement - The <img> element for preview.
     * @param {HTMLElement} messageElement - The element to display error/info messages.
     * @param {number} [maxFileSizeMB=5] - Maximum file size in MB.
     * @param {string[]} [allowedTypes=['image/jpeg', 'image/png', 'image/gif']] - Array of allowed MIME types.
     */
    handleAvatarPreview: (event, previewElement, messageElement, maxFileSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
        if (!event || !event.target || !event.target.files || !previewElement || !messageElement) {
            console.error("UI.handleAvatarPreview: Missing required arguments (event, previewElement, or messageElement).");
            return;
        }
        const fileInput = event.target;
        const file = fileInput.files[0];

        if (file) {
            if (file.size > maxFileSizeMB * 1024 * 1024) {
                UI.showMessage(messageElement, `Ukuran file terlalu besar (Maks ${maxFileSizeMB}MB).`, 'error');
                fileInput.value = ""; // Reset file input
                return;
            }
            if (!allowedTypes.includes(file.type)) {
                UI.showMessage(messageElement, `Format file tidak valid (hanya ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}).`, 'error');
                fileInput.value = ""; // Reset file input
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.src = e.target.result;
            };
            reader.readAsDataURL(file);
            UI.hideMessage(messageElement); // Clear previous messages if valid
        }
    },

    // Element Visibility & Class Toggling
    showElement: (elementOrSelector, displayType = 'block') => {
        const el = typeof elementOrSelector === 'string' ? UI.getElement(elementOrSelector) : elementOrSelector;
        if (el) el.style.display = displayType;
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
        const defaultAvatar = (window.sikmaApp?.baseUrl || '') + '/assets/images/default_avatar.png';
        const displayAvatar = userData?.avatar || defaultAvatar;

        if (sharedUserName) sharedUserName.textContent = UI.escapeHTML(displayName);
        if (sharedAvatarPreview) {
            sharedAvatarPreview.src = displayAvatar;
            sharedAvatarPreview.alt = `Avatar ${UI.escapeHTML(displayName)}`;
            sharedAvatarPreview.onerror = () => { sharedAvatarPreview.src = defaultAvatar; };
        }
    },

    resetSharedUserUI: () => {
        const sharedUserName = UI.getElement('#sharedUserName');
        const sharedAvatarPreview = UI.getElement('#sharedAvatarPreview');
        const defaultAvatar = (window.sikmaApp?.baseUrl || '') + '/assets/images/default_avatar.png';
        if (sharedUserName) sharedUserName.textContent = 'Nama Mahasiswa';
        if (sharedAvatarPreview) {
            sharedAvatarPreview.src = defaultAvatar;
            sharedAvatarPreview.alt = 'Avatar Pengguna';
        }
    },

    // Spinner/Loading indication
    showButtonSpinner: (buttonElement, originalText = null, loadingText = 'Memuat...') => {
        if (!buttonElement) return;
        if (originalText !== null) {
            buttonElement.dataset.originalText = originalText;
        } else if (!buttonElement.dataset.originalText) {
            buttonElement.dataset.originalText = buttonElement.innerHTML;
        }
        buttonElement.disabled = true;
        buttonElement.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${UI.escapeHTML(loadingText)}`;
    },

    hideButtonSpinner: (buttonElement) => {
        if (!buttonElement) return;
        buttonElement.disabled = false;
        if (buttonElement.dataset.originalText) {
            buttonElement.innerHTML = buttonElement.dataset.originalText;
        }
    },

    createItemTag: (name, details = '', iconClass = '', itemId = '', canEdit = true, canDelete = true) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-tag';
        if (itemId) itemDiv.dataset.itemId = itemId;
        itemDiv.dataset.itemName = name; 
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
            html += `<button type="button" class="item-action-btn remove-item" aria-label="Hapus item ${UI.escapeHTML(name)}"><i class="fas fa-times"></i></button>`;
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
    },

    formatErrors: (errors) => { // Helper to format error object from API into string
        if (typeof errors === 'string') return errors;
        if (typeof errors === 'object' && errors !== null) {
            let messages = [];
            for (const key in errors) {
                if (Array.isArray(errors[key])) {
                    messages = messages.concat(errors[key]);
                } else {
                    messages.push(errors[key]);
                }
            }
            return messages.join('<br>');
        }
        return 'Terjadi kesalahan yang tidak diketahui.';
    },

    populateSelectWithOptions: (selectOrSelector, optionsArray, selectedValue = null, placeholderText = "Pilih...") => {
        const selectElement = typeof selectOrSelector === 'string' ? UI.getElement(selectOrSelector) : selectOrSelector;
        if (!selectElement || selectElement.tagName !== 'SELECT') {
            console.warn("UI.populateSelectWithOptions: Invalid select element provided.");
            return;
        }

        selectElement.innerHTML = '';

        if (placeholderText) {
            const placeholderOption = document.createElement('option');
            placeholderOption.value = "";
            placeholderOption.textContent = placeholderText;
            // placeholderOption.disabled = true; // Not strictly necessary to disable if value is ""
            placeholderOption.selected = !selectedValue;
            selectElement.appendChild(placeholderOption);
        }

        optionsArray.forEach(opt => {
            const option = document.createElement('option');
            if (typeof opt === 'object' && opt !== null && opt.hasOwnProperty('value') && opt.hasOwnProperty('text')) {
                option.value = opt.value;
                option.textContent = opt.text;
            } else {
                option.value = opt;
                option.textContent = opt;
            }
            if (selectedValue !== null && String(option.value) === String(selectedValue)) {
                option.selected = true;
                if(placeholderText && selectElement.options[0].value === "") selectElement.options[0].selected = false;
            }
            selectElement.appendChild(option);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.key === 'Esc') {
            const openModal = UI.getElement('.modal.show');
            if (openModal) {
                UI.closeModal(openModal.id);
            }
        }
    });

    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal') && event.target.classList.contains('show')) {
            UI.closeModal(event.target.id);
        }
        const closeButton = event.target.closest('.close-btn, .close-btn-footer');
        if (closeButton) {
            const modalId = closeButton.dataset.modalId;
            if (modalId) {
                 const modalToClose = UI.getElement(`#${modalId}`);
                 if (modalToClose && modalToClose.classList.contains('show')) {
                    UI.closeModal(modalId);
                }
            } else {
                const modalToClose = event.target.closest('.modal');
                if (modalToClose && modalToClose.classList.contains('show')) {
                    UI.closeModal(modalToClose.id);
                }
            }
        }
    });
});
