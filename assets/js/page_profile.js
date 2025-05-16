// SikmaV2 - assets/js/page_profile.js

const PageProfile = {
    // DOM Elements
    profileForm: null,
    profilePageMessageDiv: null,
    saveProfileDataBtn: null,
    
    // Input fields for basic profile info (can be pre-filled)
    firstNameInput: null,
    lastNameInput: null,
    emailInput: null,
    nimInput: null,
    bioInput: null,
    avatarPreviewPage: null,
    avatarUploadInput: null,

    // Containers for dynamic items
    itemLists: {
        programmingSkill: null,
        framework: null,
        otherSkill: null,
        education: null,
        experience: null,
        socialLink: null,
    },
    addItemButtons: null,

    // Modal elements (shared item entry modal)
    itemEntryModal: null,
    itemEntryForm: null,
    itemModalTitle: null,
    itemNameInputModal: null, // Common name/title input in modal
    itemTypeInputModal: null, // Hidden input for item type
    itemIdInputModal: null, // Hidden input for item ID (during edit)
    modalSpecificFieldsContainer: null, // Container for type-specific fields
    itemModalMessageDiv: null,

    // State
    currentProfileData: {}, // To store loaded profile data
    isEditingItem: false, // Flag for modal edit mode
    
    // Configuration for different item types
    itemTypeConfigs: {
        programmingSkill: { 
            listElementId: 'programmingSkillsListProfile', 
            modalTitle: 'Bahasa Pemrograman', 
            icon: 'fas fa-code',
            fieldsTemplateId: 'skillFieldsTemplate', // ID of the template in index.php modal
            displayName: 'Bahasa Pemrograman'
        },
        framework: { 
            listElementId: 'frameworksListProfile', 
            modalTitle: 'Framework', 
            icon: 'fas fa-cubes',
            fieldsTemplateId: 'skillFieldsTemplate', // Reuses skill template
            displayName: 'Framework'
        },
        otherSkill: { 
            listElementId: 'otherSkillsListProfile', 
            modalTitle: 'Keahlian Lain', 
            icon: 'fas fa-tools',
            fieldsTemplateId: 'skillFieldsTemplate', // Reuses skill template
            displayName: 'Keahlian Lain'
        },
        education: { 
            listElementId: 'educationListProfile', 
            modalTitle: 'Riwayat Pendidikan', 
            icon: 'fas fa-graduation-cap',
            fieldsTemplateId: 'educationFieldsTemplate',
            displayName: 'Pendidikan'
        },
        experience: { 
            listElementId: 'experienceListProfile', 
            modalTitle: 'Pengalaman Kerja/Proyek', 
            icon: 'fas fa-briefcase',
            fieldsTemplateId: 'experienceFieldsTemplate',
            displayName: 'Pengalaman'
        },
        socialLink: {
            listElementId: 'socialLinksListProfile',
            modalTitle: 'Link Sosial Media/Portfolio',
            icon: 'fas fa-link',
            fieldsTemplateId: 'socialLinkFieldsTemplate',
            displayName: 'Link Sosial Media'
        }
        // Add more types as needed
    },

    initialize: () => {
        console.log("PageProfile: Initializing...");

        PageProfile.profileForm = UI.getElement('#fullProfileForm');
        PageProfile.profilePageMessageDiv = UI.getElement('#profilePageMessage');
        PageProfile.saveProfileDataBtn = UI.getElement('#saveProfileDataBtn');

        PageProfile.firstNameInput = UI.getElement('#profile_firstName');
        PageProfile.lastNameInput = UI.getElement('#profile_lastName');
        PageProfile.emailInput = UI.getElement('#profile_email');
        PageProfile.nimInput = UI.getElement('#profile_nim');
        PageProfile.bioInput = UI.getElement('#profile_bio');
        PageProfile.avatarPreviewPage = UI.getElement('#profile_avatarPreviewPage');
        PageProfile.avatarUploadInput = UI.getElement('#profile_avatarUpload');

        // Initialize item list containers
        for (const type in PageProfile.itemTypeConfigs) {
            const config = PageProfile.itemTypeConfigs[type];
            PageProfile.itemLists[type] = UI.getElement(`#${config.listElementId}`);
        }
        PageProfile.addItemButtons = UI.getAllElements('.add-item-btn');

        // Modal elements
        PageProfile.itemEntryModal = UI.getElement('#itemEntryModal');
        PageProfile.itemEntryForm = UI.getElement('#itemEntryForm');
        PageProfile.itemModalTitle = UI.getElement('#itemModalTitle');
        PageProfile.itemNameInputModal = UI.getElement('#itemName'); // Common name field in modal
        PageProfile.itemTypeInputModal = UI.getElement('#itemType');
        PageProfile.itemIdInputModal = UI.getElement('#itemId');
        PageProfile.modalSpecificFieldsContainer = UI.getElement('#modalSpecificFieldsContainer');
        PageProfile.itemModalMessageDiv = UI.getElement('#itemModalMessage');


        if (PageProfile.profileForm && PageProfile.saveProfileDataBtn) {
            PageProfile.profileForm.addEventListener('submit', PageProfile.handleSaveFullProfile);
        } else {
            console.error("PageProfile: Profile form or save button not found.");
            return;
        }
        
        if (PageProfile.avatarUploadInput && PageProfile.avatarPreviewPage) {
            PageProfile.avatarUploadInput.addEventListener('change', PageProfile.handleAvatarPreview);
        }

        PageProfile._initAddItemButtons();
        PageProfile._initModalFormSubmit();
        PageProfile.loadAndDisplayProfileData(); // Load existing data

        console.log("PageProfile: Initialized.");
    },

    resetPage: () => {
        console.log("PageProfile: Resetting page...");
        if (PageProfile.profileForm) UI.resetForm(PageProfile.profileForm);
        if (PageProfile.profilePageMessageDiv) UI.hideMessage(PageProfile.profilePageMessageDiv);
        if (PageProfile.avatarPreviewPage) PageProfile.avatarPreviewPage.src = 'https://placehold.co/100x100/3498db/ffffff?text=U';
        
        for (const type in PageProfile.itemLists) {
            if (PageProfile.itemLists[type]) PageProfile.itemLists[type].innerHTML = '';
        }
        PageProfile.currentProfileData = {};
    },

    loadAndDisplayProfileData: async () => {
        UI.showButtonSpinner(PageProfile.saveProfileDataBtn, 'Simpan Semua Data Profil'); // Show loading on save button
        const response = await Api.getProfileData();
        UI.hideButtonSpinner(PageProfile.saveProfileDataBtn);

        if (response.status === 'success' && response.data) {
            PageProfile.currentProfileData = response.data;
            PageProfile._populateBasicInfo(response.data);
            PageProfile._populateDynamicItems(response.data);
        } else {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Gagal memuat data profil.', 'error');
            // Populate with session data as fallback for basic info
            if (window.sikmaApp && window.sikmaApp.initialUserData) {
                 PageProfile._populateBasicInfo(window.sikmaApp.initialUserData);
            }
        }
    },

    _populateBasicInfo: (userData) => {
        if (!userData) return;
        const nameParts = (userData.nama_lengkap || '').split(' ');
        if (PageProfile.firstNameInput) PageProfile.firstNameInput.value = nameParts[0] || '';
        if (PageProfile.lastNameInput) PageProfile.lastNameInput.value = nameParts.slice(1).join(' ');
        if (PageProfile.emailInput) PageProfile.emailInput.value = userData.email || '';
        if (PageProfile.nimInput) PageProfile.nimInput.value = userData.nim || '';
        if (PageProfile.bioInput) PageProfile.bioInput.value = userData.bio || '';
        if (PageProfile.avatarPreviewPage) PageProfile.avatarPreviewPage.src = userData.avatar || 'https://placehold.co/100x100/3498db/ffffff?text=U';
    },

    _populateDynamicItems: (profileData) => {
        for (const itemType in PageProfile.itemTypeConfigs) {
            const config = PageProfile.itemTypeConfigs[itemType];
            const listElement = PageProfile.itemLists[itemType];
            const items = profileData[itemType] || profileData[config.listElementId.replace('ListProfile','')] || []; // Check various key names

            if (listElement) {
                listElement.innerHTML = ''; // Clear existing items
                if (Array.isArray(items)) {
                    items.forEach((item, index) => {
                        // Item ID could be index or a proper ID from DB
                        const itemId = item.id || `${itemType}_${index}`; 
                        PageProfile._addItemToDOM(itemType, item, itemId);
                    });
                }
            }
        }
    },
    
    handleAvatarPreview: (event) => {
        const file = event.target.files[0];
        if (file && PageProfile.avatarPreviewPage) {
            const reader = new FileReader();
            reader.onload = (e) => {
                PageProfile.avatarPreviewPage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    },

    _initAddItemButtons: () => {
        PageProfile.addItemButtons.forEach(button => {
            button.addEventListener('click', function() {
                const itemType = this.dataset.type;
                const modalTitle = this.dataset.modalTitle || `Tambah Item ${itemType}`;
                const iconClass = this.dataset.icon || 'fas fa-plus-square';
                PageProfile.openItemModal(itemType, modalTitle, iconClass);
            });
        });
    },
    
    openItemModal: (itemType, title, icon, itemDataToEdit = null, itemIdToEdit = null) => {
        PageProfile.isEditingItem = !!itemDataToEdit;
        UI.resetForm(PageProfile.itemEntryForm);
        if (PageProfile.itemModalMessageDiv) UI.hideMessage(PageProfile.itemModalMessageDiv);

        PageProfile.itemTypeInputModal.value = itemType;
        PageProfile.itemIdInputModal.value = PageProfile.isEditingItem ? itemIdToEdit : '';
        UI.setModalTitle('itemEntryModal', PageProfile.isEditingItem ? `Edit ${title}` : `Tambah ${title}`, icon);

        // Clear previous specific fields and load new ones
        PageProfile.modalSpecificFieldsContainer.innerHTML = '';
        const config = PageProfile.itemTypeConfigs[itemType];
        if (config && config.fieldsTemplateId) {
            const template = UI.getElement(`#${config.fieldsTemplateId}`);
            if (template) {
                const clone = template.cloneNode(true);
                clone.style.display = 'block'; // Make it visible
                clone.id = ''; // Remove ID from clone to avoid duplicates
                PageProfile.modalSpecificFieldsContainer.appendChild(clone);
            } else {
                console.warn(`Template with ID "${config.fieldsTemplateId}" not found for item type "${itemType}".`);
            }
        }

        // Populate form if editing
        if (PageProfile.isEditingItem && itemDataToEdit) {
            PageProfile.itemNameInputModal.value = itemDataToEdit.name || itemDataToEdit.itemName || itemDataToEdit.institution_name || itemDataToEdit.company_name || '';
            
            // Populate specific fields based on itemType
            const fields = PageProfile.itemEntryForm.elements;
            for (const key in itemDataToEdit) {
                if (fields[key] && key !== 'name' && key !== 'itemName') { // `name` is handled by itemNameInputModal
                    if (fields[key].type === 'checkbox') {
                        fields[key].checked = !!itemDataToEdit[key];
                    } else {
                        fields[key].value = itemDataToEdit[key];
                    }
                }
            }
        }
        
        UI.openModal('itemEntryModal');
    },

    _initModalFormSubmit: () => {
        if (PageProfile.itemEntryForm) {
            PageProfile.itemEntryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(PageProfile.itemEntryForm);
                const itemData = Object.fromEntries(formData.entries());
                const itemType = itemData.itemType;
                const itemId = itemData.itemId; // Will be empty if new, or contain ID if editing

                // Basic validation (can be more specific per type)
                if (!itemData.itemName && !itemData.name && !itemData.institution_name && !itemData.company_name) { // Check common name fields
                    UI.showMessage(PageProfile.itemModalMessageDiv, 'Nama/Judul/Institusi wajib diisi.', 'error');
                    return;
                }
                
                // Use the more specific name from the form fields for display
                const displayName = itemData.itemName || itemData.name || itemData.institution_name || itemData.company_name || 'Item';
                itemData.displayName = displayName; // Add a consistent display name property

                if (PageProfile.isEditingItem && itemId) {
                    PageProfile._updateItemInDOM(itemType, itemData, itemId);
                } else {
                    // Generate a temporary client-side ID for new items
                    const tempId = `${itemType}_${Date.now()}`;
                    PageProfile._addItemToDOM(itemType, itemData, tempId);
                }
                UI.closeModal('itemEntryModal');
            });
        }
    },
    
    _addItemToDOM: (itemType, itemData, tempItemId) => {
        const listElement = PageProfile.itemLists[itemType];
        const config = PageProfile.itemTypeConfigs[itemType];
        if (!listElement || !config) return;

        // Construct details string based on itemType and its specific fields
        let detailsString = "";
        if (itemType === 'programmingSkill' || itemType === 'framework' || itemType === 'otherSkill') {
            detailsString = `Level: ${itemData.itemLevel || 'N/A'}`;
            if (itemData.itemExperienceDuration) detailsString += `, Peng: ${itemData.itemExperienceDuration}`;
        } else if (itemType === 'education') {
            detailsString = `${itemData.educationDegree || ''} di ${itemData.educationFieldOfStudy || ''}`;
            if(itemData.educationStartDate || itemData.educationEndDate) {
                detailsString += ` (${itemData.educationStartDate?.replace('-', '/')} - ${itemData.educationEndDate?.replace('-', '/')} )`;
            }
        } else if (itemType === 'experience') {
            detailsString = `${itemData.experienceJobTitle || ''}`;
             if(itemData.experienceStartDate || itemData.experienceEndDate) {
                detailsString += ` (${itemData.experienceStartDate?.replace('-', '/')} - ${itemData.experienceEndDate?.replace('-', '/')} )`;
            }
        } else if (itemType === 'socialLink') {
            detailsString = `${itemData.socialPlatform || 'Link'}: ${itemData.socialUrl || ''}`;
        }


        const itemTag = UI.createItemTag(
            itemData.displayName, // Use the consistent display name
            detailsString,
            config.icon,
            tempItemId // Use tempId for new items
        );
        
        // Attach event listeners for edit/delete on the new tag
        const editBtn = itemTag.querySelector('.edit-item');
        const removeBtn = itemTag.querySelector('.remove-item');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                // Retrieve full item data (might need to store it on the element or re-construct)
                // For simplicity, we'll just pass what we have. A better way is to store full object in a data structure.
                const originalItemData = PageProfile._getItemDataFromDOM(itemTag, itemType);
                PageProfile.openItemModal(itemType, config.displayName, config.icon, originalItemData, tempItemId);
            });
        }
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                itemTag.remove(); // Remove from DOM
                // Also remove from PageProfile.currentProfileData if it's managed there
            });
        }

        listElement.appendChild(itemTag);
    },

    _updateItemInDOM: (itemType, newItemData, itemIdToUpdate) => {
        const listElement = PageProfile.itemLists[itemType];
        const config = PageProfile.itemTypeConfigs[itemType];
        if (!listElement || !config) return;

        const existingItemTag = listElement.querySelector(`.item-tag[data-item-id="${itemIdToUpdate}"]`);
        if (existingItemTag) {
            // Create a new tag with updated data and replace the old one
            const updatedItemTag = UI.createItemTag(
                newItemData.displayName,
                PageProfile._getDetailsStringForItem(itemType, newItemData), // Helper to get details
                config.icon,
                itemIdToUpdate
            );
            // Re-attach listeners
            const editBtn = updatedItemTag.querySelector('.edit-item');
            const removeBtn = updatedItemTag.querySelector('.remove-item');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                     const originalItemData = PageProfile._getItemDataFromDOM(updatedItemTag, itemType);
                    PageProfile.openItemModal(itemType, config.displayName, config.icon, originalItemData, itemIdToUpdate);
                });
            }
            if (removeBtn) {
                removeBtn.addEventListener('click', () => updatedItemTag.remove());
            }
            
            listElement.replaceChild(updatedItemTag, existingItemTag);
        }
    },
    
    _getItemDataFromDOM: (itemTagElement, itemType) => {
        // This is a simplified way to get data. For complex forms,
        // it's better to have a JS data structure holding the items.
        const data = {
            name: itemTagElement.dataset.itemName, // Common name
            // Extract other details based on itemType if they were stored in data attributes
        };
        // For a real edit, you'd fetch the full item data from your JS store or reconstruct it
        // from the details string, which is less reliable.
        // Example for skill:
        if (itemType === 'programmingSkill' || itemType === 'framework' || itemType === 'otherSkill') {
            const details = itemTagElement.dataset.itemDetails || "";
            const levelMatch = details.match(/Level: ([^,]+)/);
            const expMatch = details.match(/Peng: (.*)/);
            if (levelMatch) data.itemLevel = levelMatch[1].trim();
            if (expMatch) data.itemExperienceDuration = expMatch[1].trim();
        }
        // Add similar logic for other item types
        return data;
    },

    _getDetailsStringForItem: (itemType, itemData) => {
        // Helper to reconstruct details string for display, similar to _addItemToDOM
        let detailsString = "";
         if (itemType === 'programmingSkill' || itemType === 'framework' || itemType === 'otherSkill') {
            detailsString = `Level: ${itemData.itemLevel || 'N/A'}`;
            if (itemData.itemExperienceDuration) detailsString += `, Peng: ${itemData.itemExperienceDuration}`;
        } else if (itemType === 'education') {
            detailsString = `${itemData.educationDegree || ''} di ${itemData.educationFieldOfStudy || ''}`;
            if(itemData.educationStartDate || itemData.educationEndDate) {
                 detailsString += ` (${itemData.educationStartDate?.replace('-', '/')} - ${itemData.educationEndDate?.replace('-', '/')} )`;
            }
        } else if (itemType === 'experience') {
            detailsString = `${itemData.experienceJobTitle || ''}`;
             if(itemData.experienceStartDate || itemData.experienceEndDate) {
                detailsString += ` (${itemData.experienceStartDate?.replace('-', '/')} - ${itemData.experienceEndDate?.replace('-', '/')} )`;
            }
        } else if (itemType === 'socialLink') {
            detailsString = `${itemData.socialPlatform || 'Link'}: ${itemData.socialUrl || ''}`;
        }
        return detailsString;
    },

    handleSaveFullProfile: async (e) => {
        e.preventDefault();
        UI.showButtonSpinner(PageProfile.saveProfileDataBtn, 'Menyimpan...');

        const profilePayload = {
            firstName: PageProfile.firstNameInput.value,
            lastName: PageProfile.lastNameInput.value,
            bio: PageProfile.bioInput.value,
            // Avatar: if changed, PageProfile.avatarUploadInput.files[0] will have it
        };
        
        if (PageProfile.avatarUploadInput.files && PageProfile.avatarUploadInput.files[0]) {
            profilePayload.avatar = PageProfile.avatarUploadInput.files[0];
        }

        // Collect dynamic items
        for (const itemType in PageProfile.itemTypeConfigs) {
            const listElement = PageProfile.itemLists[itemType];
            const items = [];
            if (listElement) {
                listElement.querySelectorAll('.item-tag').forEach(tag => {
                    // This needs to be more robust to collect all data associated with the tag.
                    // For now, just collecting names as an example.
                    // In a real scenario, each tag would store its full data object or an ID to retrieve it.
                    const itemData = {
                        name: tag.dataset.itemName, // or .querySelector('.item-name').textContent
                        // ... extract other relevant data from the tag or a JS store ...
                        // This part is crucial and needs to be designed based on how data is stored/retrieved for edit.
                        // For items added via modal, the full `itemData` object should be stored with the tag or in a JS array.
                    };
                    // Reconstruct details from the tag for submission if not storing full objects client-side
                    const details = tag.querySelector('.item-details')?.textContent || '';
                    if (details) {
                        if (itemType === 'programmingSkill' || itemType === 'framework' || itemType === 'otherSkill') {
                            const levelMatch = details.match(/Level: ([^,]+)/);
                            const expMatch = details.match(/Peng: (.*)\)/); // Adjusted regex
                            if (levelMatch) itemData.itemLevel = levelMatch[1].trim();
                            if (expMatch) itemData.itemExperienceDuration = expMatch[1].trim();
                        }
                        // Add similar reconstruction for other item types
                    }
                    items.push(itemData);
                });
            }
            // Backend expects JSON string for these array fields
            profilePayload[itemType] = JSON.stringify(items); 
        }
        
        const response = await Api.saveFullProfileData(profilePayload);
        UI.hideButtonSpinner(PageProfile.saveProfileDataBtn);

        if (response.status === 'success') {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Data profil berhasil disimpan!', 'success');
            if (response.user_data && response.user_data.is_profile_complete) {
                window.sikmaApp.initialUserData.is_profile_complete = true;
                window.sikmaApp.needsProfileCompletion = false;
                AuthFlow.checkInitialProfileCompletion(); // This will now remove restrictions
                // Optionally, navigate away from profile page if it was forced
                // AppCore.navigateToPage('page-home', UI.getElement('a[data-page="page-home"]'), 'Dashboard');
            }
             // Update shared UI elements if name/avatar changed
            if (window.sikmaApp && window.sikmaApp.initialUserData) {
                // If backend returns updated user object, use it. Otherwise, construct from form.
                const updatedUserForUI = response.user || { // Assuming backend might return full user on profile save
                    ...window.sikmaApp.initialUserData,
                    nama_lengkap: `${profilePayload.firstName} ${profilePayload.lastName}`.trim(),
                    bio: profilePayload.bio,
                    avatar: PageProfile.avatarPreviewPage.src // Use preview src as it reflects new upload
                };
                UI.updateSharedUserUI(updatedUserForUI);
                // Also update settings page if it's loaded/cached
                if (typeof PageSettings !== 'undefined' && PageSettings.isInitialized) {
                    PageSettings.populateSettingsForm(updatedUserForUI);
                }
            }


        } else {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Gagal menyimpan data profil.', 'error');
        }
    }
};