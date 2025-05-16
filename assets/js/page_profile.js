// SikmaV2 - assets/js/page_profile.js

const PageProfile = {
    // DOM Elements
    profileForm: null,
    profilePageMessageDiv: null,
    saveProfileDataBtn: null,
    
    firstNameInput: null,
    lastNameInput: null,
    emailInput: null,
    nimInput: null,
    bioInput: null,
    avatarPreviewPage: null,
    avatarUploadInput: null,

    itemLists: {
        programmingSkill: null,
        framework: null,
        otherSkill: null,
        education: null,
        experience: null,
        socialLink: null,
    },
    addItemButtons: null,

    itemEntryModal: null,
    itemEntryForm: null,
    itemModalTitle: null,
    itemNameInputModal: null,
    itemTypeInputModal: null,
    itemIdInputModal: null,
    modalSpecificFieldsContainer: null,
    itemModalMessageDiv: null,

    // State
    currentProfileData: { // Initialize with empty arrays for dynamic items
        programmingSkill: [],
        framework: [],
        otherSkill: [],
        education: [],
        experience: [],
        socialLink: [],
        // Basic info will be populated directly
    }, 
    isEditingItem: false,
    editingItemId: null, // To store ID of item being edited
    
    itemTypeConfigs: {
        programmingSkill: { 
            listElementId: 'programmingSkillsListProfile', 
            modalTitle: 'Bahasa Pemrograman', 
            icon: 'fas fa-code',
            fieldsTemplateId: 'skillFieldsTemplate',
            displayName: 'Bahasa Pemrograman',
            nameField: 'skill_name', // DB field for the main name
            fields: ['skill_name', 'skill_level', 'experience_duration']
        },
        framework: { 
            listElementId: 'frameworksListProfile', 
            modalTitle: 'Framework', 
            icon: 'fas fa-cubes',
            fieldsTemplateId: 'skillFieldsTemplate',
            displayName: 'Framework',
            nameField: 'framework_name',
            fields: ['framework_name', 'skill_level', 'experience_duration']
        },
        otherSkill: { 
            listElementId: 'otherSkillsListProfile', 
            modalTitle: 'Keahlian Lain', 
            icon: 'fas fa-tools',
            fieldsTemplateId: 'skillFieldsTemplate',
            displayName: 'Keahlian Lain',
            nameField: 'skill_name',
            fields: ['skill_name', 'skill_level', 'experience_duration']
        },
        education: { 
            listElementId: 'educationListProfile', 
            modalTitle: 'Riwayat Pendidikan', 
            icon: 'fas fa-graduation-cap',
            fieldsTemplateId: 'educationFieldsTemplate',
            displayName: 'Pendidikan',
            nameField: 'institution_name',
            fields: ['institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'description']
        },
        experience: { 
            listElementId: 'experienceListProfile', 
            modalTitle: 'Pengalaman Kerja/Proyek', 
            icon: 'fas fa-briefcase',
            fieldsTemplateId: 'experienceFieldsTemplate',
            displayName: 'Pengalaman',
            nameField: 'company_name',
            fields: ['company_name', 'job_title', 'start_date', 'end_date', 'description']
        },
        socialLink: {
            listElementId: 'socialLinksListProfile',
            modalTitle: 'Link Sosial Media/Portfolio',
            icon: 'fas fa-link',
            fieldsTemplateId: 'socialLinkFieldsTemplate',
            displayName: 'Link Sosial Media',
            nameField: 'platform_name', // Or treat 'url' as primary identifier if platform isn't unique
            fields: ['platform_name', 'url']
        }
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

        for (const type in PageProfile.itemTypeConfigs) {
            const config = PageProfile.itemTypeConfigs[type];
            PageProfile.itemLists[type] = UI.getElement(`#${config.listElementId}`);
        }
        PageProfile.addItemButtons = UI.getAllElements('.add-item-btn');

        PageProfile.itemEntryModal = UI.getElement('#itemEntryModal');
        PageProfile.itemEntryForm = UI.getElement('#itemEntryForm');
        PageProfile.itemModalTitle = UI.getElement('#itemModalTitle');
        PageProfile.itemNameInputModal = UI.getElement('#itemName');
        PageProfile.itemTypeInputModal = UI.getElement('#itemType');
        PageProfile.itemIdInputModal = UI.getElement('#itemId'); // This is the client-side temp ID or DB ID
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
        PageProfile.loadAndDisplayProfileData();

        console.log("PageProfile: Initialized.");
    },

    resetPage: () => {
        console.log("PageProfile: Resetting page...");
        if (PageProfile.profileForm) UI.resetForm(PageProfile.profileForm);
        if (PageProfile.profilePageMessageDiv) UI.hideMessage(PageProfile.profilePageMessageDiv);
        if (PageProfile.avatarPreviewPage) PageProfile.avatarPreviewPage.src = 'https://placehold.co/100x100/3498db/ffffff?text=U';
        
        for (const type in PageProfile.itemLists) {
            if (PageProfile.itemLists[type]) PageProfile.itemLists[type].innerHTML = '';
            PageProfile.currentProfileData[type] = []; // Reset data arrays
        }
    },

    loadAndDisplayProfileData: async () => {
        if (PageProfile.saveProfileDataBtn) UI.showButtonSpinner(PageProfile.saveProfileDataBtn, 'Simpan Semua Data Profil');
        const response = await Api.getProfileData();
        if (PageProfile.saveProfileDataBtn) UI.hideButtonSpinner(PageProfile.saveProfileDataBtn);

        if (response.status === 'success' && response.data) {
            // Store basic info directly
            PageProfile.currentProfileData.firstName = response.data.firstName;
            PageProfile.currentProfileData.lastName = response.data.lastName;
            PageProfile.currentProfileData.bio = response.data.bio;
            // Avatar, email, nim are part of initialUserData and handled by _populateBasicInfo

            PageProfile._populateBasicInfo(response.data); // Populates form from fetched OR session data

            // Populate dynamic items and store them in currentProfileData arrays
            for (const itemType in PageProfile.itemTypeConfigs) {
                const items = response.data[itemType] || [];
                PageProfile.currentProfileData[itemType] = [...items]; // Store a copy
                PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
            }
        } else {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Gagal memuat data profil.', 'error');
            if (window.sikmaApp && window.sikmaApp.initialUserData) {
                 PageProfile._populateBasicInfo(window.sikmaApp.initialUserData);
            }
        }
    },

    _populateBasicInfo: (userData) => {
        if (!userData) return;
        const nameParts = (userData.nama_lengkap || '').split(' ');
        const firstName = userData.firstName || nameParts[0] || '';
        const lastName = userData.lastName || nameParts.slice(1).join(' ') || '';

        if (PageProfile.firstNameInput) PageProfile.firstNameInput.value = firstName;
        if (PageProfile.lastNameInput) PageProfile.lastNameInput.value = lastName;
        if (PageProfile.emailInput) PageProfile.emailInput.value = userData.email || '';
        if (PageProfile.nimInput) PageProfile.nimInput.value = userData.nim || '';
        if (PageProfile.bioInput) PageProfile.bioInput.value = userData.bio || '';
        if (PageProfile.avatarPreviewPage) PageProfile.avatarPreviewPage.src = userData.avatar || 'https://placehold.co/100x100/3498db/ffffff?text=U';
    },

    _populateDynamicList: (itemType, itemsArray) => {
        const listElement = PageProfile.itemLists[itemType];
        if (listElement) {
            listElement.innerHTML = ''; // Clear existing items
            itemsArray.forEach(item => {
                // item.id from DB is crucial here for edit/delete to work with backend
                PageProfile._addItemToDOM(itemType, item, item.id || `${itemType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);
            });
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
                const config = PageProfile.itemTypeConfigs[itemType];
                PageProfile.openItemModal(itemType, config.displayName, config.icon);
            });
        });
    },
    
    openItemModal: (itemType, title, icon, itemDataToEdit = null, itemId = null) => {
        PageProfile.isEditingItem = !!itemDataToEdit;
        PageProfile.editingItemId = PageProfile.isEditingItem ? itemId : null;

        UI.resetForm(PageProfile.itemEntryForm);
        if (PageProfile.itemModalMessageDiv) UI.hideMessage(PageProfile.itemModalMessageDiv);

        PageProfile.itemTypeInputModal.value = itemType;
        PageProfile.itemIdInputModal.value = PageProfile.editingItemId || ''; // Store client/DB ID
        UI.setModalTitle('itemEntryModal', PageProfile.isEditingItem ? `Edit ${title}` : `Tambah ${title}`, icon);

        PageProfile.modalSpecificFieldsContainer.innerHTML = '';
        const config = PageProfile.itemTypeConfigs[itemType];
        if (config && config.fieldsTemplateId) {
            const template = UI.getElement(`#${config.fieldsTemplateId}`);
            if (template) {
                const clone = template.cloneNode(true);
                clone.style.display = 'block';
                clone.id = '';
                PageProfile.modalSpecificFieldsContainer.appendChild(clone);

                // Set common name/title input based on config.nameField
                // The #itemName input in the modal is the generic one.
                // We map the specific field from template (e.g. skill_name) to this generic one for UI.
                if (PageProfile.isEditingItem && itemDataToEdit) {
                    PageProfile.itemNameInputModal.value = itemDataToEdit[config.nameField] || itemDataToEdit.itemName || '';
                    
                    // Populate specific fields from itemDataToEdit
                    const formElements = PageProfile.itemEntryForm.elements;
                    config.fields.forEach(fieldKey => {
                        if (formElements[fieldKey] && itemDataToEdit[fieldKey] !== undefined) {
                           if (formElements[fieldKey].type === 'checkbox') {
                                formElements[fieldKey].checked = !!itemDataToEdit[fieldKey];
                            } else {
                                formElements[fieldKey].value = itemDataToEdit[fieldKey];
                            }
                        }
                    });
                } else {
                     PageProfile.itemNameInputModal.value = ''; // Clear for new item
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
                const rawItemData = Object.fromEntries(formData.entries());
                const itemType = rawItemData.itemType;
                const clientOrDbId = rawItemData.itemId; // This is PageProfile.editingItemId or empty
                const config = PageProfile.itemTypeConfigs[itemType];

                // Map generic itemName from modal back to specific field name
                const specificItemData = {};
                specificItemData[config.nameField] = rawItemData.itemName; // Use #itemName for the main name
                
                config.fields.forEach(fieldKey => {
                    if (fieldKey !== config.nameField && rawItemData[fieldKey] !== undefined) {
                        specificItemData[fieldKey] = rawItemData[fieldKey];
                    }
                });
                 if (PageProfile.isEditingItem && clientOrDbId) {
                    specificItemData.id = clientOrDbId; // Ensure ID is part of the object for update
                }


                if (!specificItemData[config.nameField]) {
                    UI.showMessage(PageProfile.itemModalMessageDiv, 'Nama/Judul/Institusi utama wajib diisi.', 'error');
                    return;
                }
                
                if (PageProfile.isEditingItem && clientOrDbId) {
                    PageProfile._updateItemInDataStore(itemType, specificItemData, clientOrDbId);
                } else {
                    // Add new item to data store with a temporary client ID until saved to DB
                    const tempClientId = `${itemType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                    specificItemData.client_id = tempClientId; // Use this for DOM mapping before DB ID is available
                    PageProfile._addItemToDataStore(itemType, specificItemData);
                }
                // Re-render the list for this item type from the data store
                PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
                UI.closeModal('itemEntryModal');
            });
        }
    },

    _addItemToDataStore: (itemType, itemData) => {
        PageProfile.currentProfileData[itemType].push(itemData);
    },

    _updateItemInDataStore: (itemType, newItemData, itemIdToUpdate) => {
        const itemIndex = PageProfile.currentProfileData[itemType].findIndex(item => (item.id === itemIdToUpdate || item.client_id === itemIdToUpdate));
        if (itemIndex > -1) {
            // Preserve original ID if it exists (from DB), or client_id if it was a new item not yet saved
            const originalId = PageProfile.currentProfileData[itemType][itemIndex].id;
            const originalClientId = PageProfile.currentProfileData[itemType][itemIndex].client_id;

            PageProfile.currentProfileData[itemType][itemIndex] = {...newItemData};
            
            if(originalId) PageProfile.currentProfileData[itemType][itemIndex].id = originalId;
            if(originalClientId && !originalId) PageProfile.currentProfileData[itemType][itemIndex].client_id = originalClientId;

        } else {
            console.warn("Item not found in data store for update:", itemIdToUpdate);
        }
    },
    
    _removeItemFromDataStoreAndDOM: (itemType, itemIdToRemove) => {
        const listElement = PageProfile.itemLists[itemType];
        const itemIndex = PageProfile.currentProfileData[itemType].findIndex(item => (item.id === itemIdToRemove || item.client_id === itemIdToRemove));
        
        if (itemIndex > -1) {
            PageProfile.currentProfileData[itemType].splice(itemIndex, 1);
            // Re-render the list for this item type
            PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
        } else {
             // Fallback: try to remove from DOM directly if not in data store (should not happen ideally)
            const itemTag = listElement ? listElement.querySelector(`.item-tag[data-item-id="${itemIdToRemove}"]`) : null;
            if (itemTag) itemTag.remove();
        }
    },
    
    _addItemToDOM: (itemType, itemData, displayId) => { // displayId is item.id or item.client_id
        const listElement = PageProfile.itemLists[itemType];
        const config = PageProfile.itemTypeConfigs[itemType];
        if (!listElement || !config) return;

        let detailsString = PageProfile._getDetailsStringForItem(itemType, itemData);
        const mainName = itemData[config.nameField] || itemData.itemName || 'N/A';

        const itemTag = UI.createItemTag(mainName, detailsString, config.icon, displayId);
        
        const editBtn = itemTag.querySelector('.edit-item');
        const removeBtn = itemTag.querySelector('.remove-item');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                // Find the full item object from our data store
                const fullItemData = PageProfile.currentProfileData[itemType].find(item => (item.id === displayId || item.client_id === displayId));
                if (fullItemData) {
                    PageProfile.openItemModal(itemType, config.displayName, config.icon, fullItemData, displayId);
                } else {
                    console.error("Could not find item data for edit:", displayId);
                }
            });
        }
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                // Confirm before removing
                if (confirm(`Apakah Anda yakin ingin menghapus item "${mainName}"?`)) {
                    PageProfile._removeItemFromDataStoreAndDOM(itemType, displayId);
                }
            });
        }
        listElement.appendChild(itemTag);
    },
    
    _getDetailsStringForItem: (itemType, itemData) => {
        let detailsString = "";
        switch (itemType) {
            case 'programmingSkill':
            case 'framework':
            case 'otherSkill':
                detailsString = `Level: ${itemData.skill_level || 'N/A'}`;
                if (itemData.experience_duration) detailsString += `, Peng: ${itemData.experience_duration}`;
                break;
            case 'education':
                detailsString = `${itemData.degree || ''}${itemData.field_of_study ? ' di ' + itemData.field_of_study : ''}`;
                if (itemData.start_date || itemData.end_date) {
                    const start = itemData.start_date ? itemData.start_date.replace('-', '/') : '';
                    const end = itemData.end_date ? itemData.end_date.replace('-', '/') : 'Sekarang';
                    detailsString += ` (${start} - ${end})`;
                }
                break;
            case 'experience':
                detailsString = `${itemData.job_title || ''}`;
                if (itemData.start_date || itemData.end_date) {
                     const start = itemData.start_date ? itemData.start_date.replace('-', '/') : '';
                    const end = itemData.end_date ? itemData.end_date.replace('-', '/') : 'Sekarang';
                    detailsString += ` (${start} - ${end})`;
                }
                break;
            case 'socialLink':
                detailsString = `${itemData.platform_name || 'Link'}: ${itemData.url || ''}`;
                break;
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
        };
        
        if (PageProfile.avatarUploadInput.files && PageProfile.avatarUploadInput.files[0]) {
            profilePayload.avatar = PageProfile.avatarUploadInput.files[0];
        }

        // Collect dynamic items from the data store
        for (const itemType in PageProfile.itemTypeConfigs) {
            // Send array of objects. Backend will handle JSON encoding if it receives objects directly,
            // or frontend can stringify. For FormData, stringifying is safer.
            profilePayload[itemType] = JSON.stringify(PageProfile.currentProfileData[itemType] || []);
        }
        
        const response = await Api.saveFullProfileData(profilePayload); // Api.js uses FormData
        UI.hideButtonSpinner(PageProfile.saveProfileDataBtn);

        if (response.status === 'success') {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Data profil berhasil disimpan!', 'success');
            
            // Update local data store with IDs from backend if they were returned
            if (response.saved_item_ids) {
                for (const itemType in response.saved_item_ids) {
                    const idMap = response.saved_item_ids[itemType]; // { client_id_1: db_id_1, ... }
                    PageProfile.currentProfileData[itemType].forEach(item => {
                        if (item.client_id && idMap[item.client_id]) {
                            item.id = idMap[item.client_id]; // Assign DB ID
                            delete item.client_id; // Remove temporary client_id
                        }
                    });
                    // Re-render list to update data-item-id attributes in DOM
                    PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
                }
            }

            if (response.user_data && response.user_data.is_profile_complete !== undefined) {
                window.sikmaApp.initialUserData.is_profile_complete = response.user_data.is_profile_complete;
                window.sikmaApp.needsProfileCompletion = !response.user_data.is_profile_complete;
                AuthFlow.checkInitialProfileCompletion(); 
            }
            
            if (window.sikmaApp && window.sikmaApp.initialUserData) {
                const updatedUserForUI = response.user_data || { 
                    ...window.sikmaApp.initialUserData,
                    nama_lengkap: `${profilePayload.firstName} ${profilePayload.lastName}`.trim(),
                    bio: profilePayload.bio,
                    avatar: PageProfile.avatarPreviewPage.src 
                };
                window.sikmaApp.initialUserData = {...window.sikmaApp.initialUserData, ...updatedUserForUI}; // Merge updates
                UI.updateSharedUserUI(window.sikmaApp.initialUserData);
                if (typeof PageSettings !== 'undefined' && PageSettings.isInitialized) {
                    PageSettings.populateSettingsForm(window.sikmaApp.initialUserData);
                }
            }
        } else {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Gagal menyimpan data profil.', 'error');
        }
    }
};