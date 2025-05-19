// SikmaV3 - assets/js/page_profile.js (Diperbarui)

const PageProfile = {
    // DOM Elements
    profileForm: null,
    profilePageMessageDiv: null,
    saveProfileDataBtn: null,
    
    // Basic Info Elements
    firstNameInput: null,
    lastNameInput: null,
    emailInput: null,
    nimInput: null,
    semesterSelect: null, // Baru
    ipkInput: null,       // Baru
    bioInput: null,
    avatarPreviewPage: null,
    avatarUploadInput: null,
    kotaAsalInput: null,    // Baru
    kecamatanInput: null,   // Baru
    kelurahanInput: null,   // Baru

    // Item List Containers
    itemLists: {
        programmingSkill: null,
        framework: null,
        tool: null,            // Baru
        otherSkill: null,
        education: null,
        experience: null,
        socialLink: null,
        industryPreference: null // Baru
    },
    addItemButtons: null,

    // Modal Elements
    itemEntryModal: null,
    itemEntryForm: null,
    itemModalTitle: null,
    // itemNameInputModal: null, // Tidak lagi generik, akan diambil dari template
    itemTypeInputModal: null, // Hidden input untuk tipe item
    itemIdInputModal: null,   // Hidden input untuk ID item (client atau DB)
    modalSpecificFieldsContainer: null,
    itemModalMessageDiv: null,

    // State
    currentProfileData: { // Initialize with empty arrays for dynamic items
        programmingSkill: [],
        framework: [],
        tool: [],
        otherSkill: [],
        education: [],
        experience: [],
        socialLink: [],
        industryPreference: [],
        // Basic info (firstName, lastName, bio, semester, ipk, etc.) akan di-cache di sini juga
    }, 
    isEditingItem: false,
    editingItemId: null, // Menyimpan ID item yang sedang diedit (bisa client_id atau db_id)
    isPageInitialized: false,
    
    // Konfigurasi untuk setiap tipe item dinamis
    itemTypeConfigs: {
        programmingSkill: { 
            listElementId: 'programmingSkillsListProfile', 
            modalTitle: 'Bahasa Pemrograman', 
            icon: 'fas fa-code',
            fieldsTemplateId: 'skillFieldsTemplate', // Template ini akan digunakan untuk skill, framework, tool, otherSkill
            nameFieldInTemplate: 'modal_skill_name', // ID input nama utama di template
            dbNameField: 'skill_name', // Nama kolom di DB untuk nama utama
            fields: ['skill_name', 'skill_level', 'experience_duration'] // Kolom DB yang relevan
        },
        framework: { 
            listElementId: 'frameworksListProfile', 
            modalTitle: 'Framework', 
            icon: 'fas fa-cubes',
            fieldsTemplateId: 'skillFieldsTemplate',
            nameFieldInTemplate: 'modal_skill_name',
            dbNameField: 'framework_name',
            fields: ['framework_name', 'skill_level', 'experience_duration']
        },
        tool: { // Baru
            listElementId: 'toolsListProfile',
            modalTitle: 'Tool',
            icon: 'fas fa-wrench', // Ikon disesuaikan
            fieldsTemplateId: 'skillFieldsTemplate', // Menggunakan template skill
            nameFieldInTemplate: 'modal_skill_name',
            dbNameField: 'tool_name',
            fields: ['tool_name', 'skill_level', 'experience_duration']
        },
        otherSkill: { 
            listElementId: 'otherSkillsListProfile', 
            modalTitle: 'Keahlian Lain', 
            icon: 'fas fa-puzzle-piece', // Ikon diubah
            fieldsTemplateId: 'skillFieldsTemplate',
            nameFieldInTemplate: 'modal_skill_name',
            dbNameField: 'skill_name',
            fields: ['skill_name', 'skill_level', 'experience_duration']
        },
        education: { 
            listElementId: 'educationListProfile', 
            modalTitle: 'Riwayat Pendidikan', 
            icon: 'fas fa-graduation-cap',
            fieldsTemplateId: 'educationFieldsTemplate',
            nameFieldInTemplate: 'modal_institution_name',
            dbNameField: 'institution_name',
            fields: ['institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'description']
        },
        experience: { 
            listElementId: 'experienceListProfile', 
            modalTitle: 'Pengalaman Kerja/Proyek', 
            icon: 'fas fa-briefcase',
            fieldsTemplateId: 'experienceFieldsTemplate',
            nameFieldInTemplate: 'modal_company_name',
            dbNameField: 'company_name',
            fields: ['company_name', 'job_title', 'start_date', 'end_date', 'description']
        },
        socialLink: {
            listElementId: 'socialLinksListProfile',
            modalTitle: 'Link Sosial Media/Portfolio',
            icon: 'fas fa-link',
            fieldsTemplateId: 'socialLinkFieldsTemplate',
            nameFieldInTemplate: 'modal_platform_name', // Platform sebagai 'nama' utama di modal
            dbNameField: 'platform_name', // Meskipun URL mungkin lebih unik, platform lebih deskriptif
            fields: ['platform_name', 'url']
        },
        industryPreference: { // Baru
            listElementId: 'industryPreferencesListProfile',
            modalTitle: 'Preferensi Bidang Industri',
            icon: 'fas fa-industry',
            fieldsTemplateId: 'industryPreferenceFieldsTemplate',
            nameFieldInTemplate: 'modal_industry_name',
            dbNameField: 'industry_name',
            fields: ['industry_name'] // Hanya nama industri
        }
    },

    initialize: () => {
        if (PageProfile.isPageInitialized) return;
        console.log("PageProfile: Initializing...");

        PageProfile.profileForm = UI.getElement('#fullProfileForm');
        PageProfile.profilePageMessageDiv = UI.getElement('#profilePageMessage');
        PageProfile.saveProfileDataBtn = UI.getElement('#saveProfileDataBtn');

        // Cache elemen info dasar
        PageProfile.firstNameInput = UI.getElement('#profile_firstName');
        PageProfile.lastNameInput = UI.getElement('#profile_lastName');
        PageProfile.emailInput = UI.getElement('#profile_email');
        PageProfile.nimInput = UI.getElement('#profile_nim');
        PageProfile.semesterSelect = UI.getElement('#profile_semester');
        PageProfile.ipkInput = UI.getElement('#profile_ipk');
        PageProfile.bioInput = UI.getElement('#profile_bio');
        PageProfile.avatarPreviewPage = UI.getElement('#profile_avatarPreviewPage');
        PageProfile.avatarUploadInput = UI.getElement('#profile_avatarUpload');
        PageProfile.kotaAsalInput = UI.getElement('#profile_kota_asal');
        PageProfile.kecamatanInput = UI.getElement('#profile_kecamatan');
        PageProfile.kelurahanInput = UI.getElement('#profile_kelurahan');

        // Cache elemen list dan tombol tambah
        for (const type in PageProfile.itemTypeConfigs) {
            const config = PageProfile.itemTypeConfigs[type];
            PageProfile.itemLists[type] = UI.getElement(`#${config.listElementId}`);
        }
        PageProfile.addItemButtons = UI.getAllElements('.add-item-btn');

        // Cache elemen modal
        PageProfile.itemEntryModal = UI.getElement('#itemEntryModal');
        PageProfile.itemEntryForm = UI.getElement('#itemEntryForm');
        PageProfile.itemModalTitle = UI.getElement('#itemModalTitle');
        PageProfile.itemTypeInputModal = UI.getElement('#itemType'); // Hidden input
        PageProfile.itemIdInputModal = UI.getElement('#itemId');     // Hidden input
        PageProfile.modalSpecificFieldsContainer = UI.getElement('#modalSpecificFieldsContainer');
        PageProfile.itemModalMessageDiv = UI.getElement('#itemModalMessage');

        if (!PageProfile.profileForm || !PageProfile.saveProfileDataBtn) {
            console.error("PageProfile: Profile form or save button not found. Aborting further initialization.");
            return;
        }
        
        PageProfile.profileForm.addEventListener('submit', PageProfile.handleSaveFullProfile);
        
        if (PageProfile.avatarUploadInput && PageProfile.avatarPreviewPage) {
            PageProfile.avatarUploadInput.addEventListener('change', PageProfile.handleAvatarPreview);
        }

        PageProfile._initAddItemButtons();
        PageProfile._initModalFormSubmit();
        
        PageProfile.isPageInitialized = true;
        console.log("PageProfile: Basic initialization complete.");
        // Data akan dimuat oleh loadPageData() saat halaman aktif
    },

    loadPageData: async () => {
        console.log("PageProfile: Loading page data...");
        if (!PageProfile.isPageInitialized) {
            PageProfile.initialize();
        }
        if (PageProfile.profilePageMessageDiv) UI.hideMessage(PageProfile.profilePageMessageDiv);
        UI.showButtonSpinner(PageProfile.saveProfileDataBtn, 'Simpan Semua Data Profil', 'Memuat Data...');
        
        const response = await Api.getProfileData();
        UI.hideButtonSpinner(PageProfile.saveProfileDataBtn);

        if (response.status === 'success' && response.data) {
            PageProfile.currentProfileData = { ...PageProfile.currentProfileData, ...response.data }; // Gabungkan data
            PageProfile._populateFullProfileForm(response.data);
        } else {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Gagal memuat data profil.', 'error');
            // Jika gagal load, coba populate dari initialUserData jika ada (misal data sesi)
            if (window.sikmaApp && window.sikmaApp.initialUserData) {
                 PageProfile._populateFullProfileForm(window.sikmaApp.initialUserData);
            }
        }
    },
    
    _populateFullProfileForm: (userData) => {
        if (!userData) return;
        // Populate basic info
        const nameParts = (userData.nama_lengkap || '').split(' ');
        if (PageProfile.firstNameInput) PageProfile.firstNameInput.value = userData.firstName || nameParts[0] || '';
        if (PageProfile.lastNameInput) PageProfile.lastNameInput.value = userData.lastName || nameParts.slice(1).join(' ') || '';
        if (PageProfile.emailInput) PageProfile.emailInput.value = userData.email || '';
        if (PageProfile.nimInput) PageProfile.nimInput.value = userData.nim || '';
        if (PageProfile.semesterSelect) PageProfile.semesterSelect.value = userData.semester || '';
        if (PageProfile.ipkInput) PageProfile.ipkInput.value = userData.ipk || '';
        if (PageProfile.bioInput) PageProfile.bioInput.value = userData.bio || '';
        if (PageProfile.avatarPreviewPage) {
            PageProfile.avatarPreviewPage.src = userData.avatar || (window.sikmaApp.baseUrl + '/assets/images/default_avatar.png');
            PageProfile.avatarPreviewPage.onerror = () => { PageProfile.avatarPreviewPage.src = window.sikmaApp.baseUrl + '/assets/images/default_avatar.png';};
        }
        if (PageProfile.kotaAsalInput) PageProfile.kotaAsalInput.value = userData.kota_asal || '';
        if (PageProfile.kecamatanInput) PageProfile.kecamatanInput.value = userData.kecamatan || '';
        if (PageProfile.kelurahanInput) PageProfile.kelurahanInput.value = userData.kelurahan || '';

        // Populate dynamic items
        for (const itemType in PageProfile.itemTypeConfigs) {
            const items = userData[itemType] || [];
            PageProfile.currentProfileData[itemType] = [...items]; // Update data store lokal
            PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
        }
    },

    resetPage: () => {
        console.log("PageProfile: Resetting page...");
        if (PageProfile.profileForm) UI.resetForm(PageProfile.profileForm);
        if (PageProfile.profilePageMessageDiv) UI.hideMessage(PageProfile.profilePageMessageDiv);
        if (PageProfile.avatarPreviewPage) PageProfile.avatarPreviewPage.src = window.sikmaApp.baseUrl + '/assets/images/default_avatar.png';
        
        for (const type in PageProfile.itemLists) {
            if (PageProfile.itemLists[type]) PageProfile.itemLists[type].innerHTML = '';
        }
        // Reset currentProfileData ke struktur awal dengan array kosong
        PageProfile.currentProfileData = {
            programmingSkill: [], framework: [], tool: [], otherSkill: [],
            education: [], experience: [], socialLink: [], industryPreference: []
            // Info dasar akan di-clear oleh UI.resetForm
        };
        // PageProfile.isPageInitialized = false; // Jangan di-reset agar initialize() tidak dipanggil berulang
    },

    handleAvatarPreview: (event) => {
        const file = event.target.files[0];
        if (file && PageProfile.avatarPreviewPage) {
            if (file.size > 5 * 1024 * 1024) { // Maks 5MB
                UI.showMessage(PageProfile.profilePageMessageDiv, 'Ukuran file avatar terlalu besar (Maks 5MB).', 'error');
                event.target.value = ""; // Reset file input
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                UI.showMessage(PageProfile.profilePageMessageDiv, 'Format file avatar tidak valid (hanya JPG, PNG, GIF).', 'error');
                event.target.value = ""; // Reset file input
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                PageProfile.avatarPreviewPage.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    },

    _initAddItemButtons: () => {
        PageProfile.addItemButtons.forEach(button => {
            button.removeEventListener('click', PageProfile._handleAddItemButtonClick); // Hapus listener lama
            button.addEventListener('click', PageProfile._handleAddItemButtonClick);
        });
    },
    _handleAddItemButtonClick: function() { // 'this' akan merujuk ke tombol
        const itemType = this.dataset.type;
        const config = PageProfile.itemTypeConfigs[itemType];
        if (config) {
            PageProfile.openItemModal(itemType, config.modalTitle, config.icon);
        } else {
            console.error("Config not found for item type:", itemType);
        }
    },
    
    openItemModal: (itemType, title, icon, itemDataToEdit = null, clientOrDbId = null) => {
        PageProfile.isEditingItem = !!itemDataToEdit;
        PageProfile.editingItemId = PageProfile.isEditingItem ? clientOrDbId : null;

        UI.resetForm(PageProfile.itemEntryForm);
        if (PageProfile.itemModalMessageDiv) UI.hideMessage(PageProfile.itemModalMessageDiv);

        PageProfile.itemTypeInputModal.value = itemType;
        PageProfile.itemIdInputModal.value = PageProfile.editingItemId || ''; 
        UI.setModalTitle('itemEntryModal', PageProfile.isEditingItem ? `Edit ${title}` : `Tambah ${title}`, icon);

        PageProfile.modalSpecificFieldsContainer.innerHTML = ''; // Kosongkan field spesifik
        const config = PageProfile.itemTypeConfigs[itemType];
        if (config && config.fieldsTemplateId) {
            const template = UI.getElement(`#${config.fieldsTemplateId}`);
            if (template) {
                const clone = template.cloneNode(true);
                clone.style.display = 'block'; // Pastikan template terlihat
                clone.id = ''; // Hapus ID dari clone agar tidak duplikat
                PageProfile.modalSpecificFieldsContainer.appendChild(clone);

                // Populate form jika sedang edit
                if (PageProfile.isEditingItem && itemDataToEdit) {
                    const formElements = PageProfile.itemEntryForm.elements;
                    // Populate field nama utama (misal: skill_name, institution_name)
                    // yang ada di dalam template yang di-clone
                    if (formElements[config.nameFieldInTemplate]) {
                         formElements[config.nameFieldInTemplate].value = itemDataToEdit[config.dbNameField] || '';
                    }

                    // Populate field spesifik lainnya dari config.fields
                    config.fields.forEach(fieldKey => {
                        // Jangan populate ulang nama utama jika sudah dihandle di atas
                        if (fieldKey !== config.dbNameField && formElements[fieldKey] && itemDataToEdit[fieldKey] !== undefined) {
                           if (formElements[fieldKey].type === 'checkbox') {
                                formElements[fieldKey].checked = !!itemDataToEdit[fieldKey];
                            } else {
                                formElements[fieldKey].value = itemDataToEdit[fieldKey];
                            }
                        }
                    });
                }
            } else {
                console.error("Template not found for ID:", config.fieldsTemplateId);
                 PageProfile.modalSpecificFieldsContainer.innerHTML = `<p class="text-danger">Error: Template modal untuk tipe item ini tidak ditemukan.</p>`;
            }
        }
        UI.openModal('itemEntryModal');
    },

    _initModalFormSubmit: () => {
        if (PageProfile.itemEntryForm) {
            PageProfile.itemEntryForm.removeEventListener('submit', PageProfile._handleModalFormSubmit); // Hapus listener lama
            PageProfile.itemEntryForm.addEventListener('submit', PageProfile._handleModalFormSubmit);
        }
    },
    _handleModalFormSubmit: (e) => {
        e.preventDefault();
        const formData = new FormData(PageProfile.itemEntryForm);
        const rawItemData = Object.fromEntries(formData.entries()); // Ambil semua data dari form modal
        const itemType = rawItemData.itemType; // Dari hidden input
        const clientOrDbId = rawItemData.itemId; // Dari hidden input (PageProfile.editingItemId)
        const config = PageProfile.itemTypeConfigs[itemType];

        if (!config) {
            UI.showMessage(PageProfile.itemModalMessageDiv, 'Tipe item tidak dikenal.', 'error');
            return;
        }

        // Validasi nama utama (misal skill_name, institution_name)
        // Nama field di form modal (misal modal_skill_name) sudah di-map ke nama kolom DB di rawItemData
        // oleh atribut 'name' pada input di template.
        // Jadi, kita cek berdasarkan config.dbNameField
        if (!rawItemData[config.dbNameField] || rawItemData[config.dbNameField].trim() === '') {
            UI.showMessage(PageProfile.itemModalMessageDiv, `Nama/Judul utama untuk ${config.modalTitle} wajib diisi.`, 'error');
            const nameInputInModal = PageProfile.itemEntryForm.elements[config.nameFieldInTemplate];
            if(nameInputInModal) nameInputInModal.focus();
            return;
        }
        
        // Siapkan objek data item yang akan disimpan
        const itemDataToStore = {};
        config.fields.forEach(fieldKey => {
            // Ambil nilai dari rawItemData (yang key-nya sesuai nama kolom DB)
            itemDataToStore[fieldKey] = rawItemData[fieldKey] !== undefined ? rawItemData[fieldKey] : null;
        });


        if (PageProfile.isEditingItem && clientOrDbId) {
            itemDataToStore.id = clientOrDbId; // Pastikan ID ada untuk update (bisa jadi client_id atau db_id)
            PageProfile._updateItemInDataStore(itemType, itemDataToStore, clientOrDbId);
        } else {
            const tempClientId = `${itemType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            itemDataToStore.client_id = tempClientId; // ID sementara untuk item baru
            PageProfile._addItemToDataStore(itemType, itemDataToStore);
        }
        
        PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
        UI.closeModal('itemEntryModal');
    },

    _addItemToDataStore: (itemType, itemData) => {
        if (!PageProfile.currentProfileData[itemType]) {
            PageProfile.currentProfileData[itemType] = [];
        }
        PageProfile.currentProfileData[itemType].push(itemData);
    },

    _updateItemInDataStore: (itemType, newItemData, idToUpdate) => {
        const itemIndex = PageProfile.currentProfileData[itemType].findIndex(item => 
            (item.id && String(item.id) === String(idToUpdate)) || 
            (item.client_id && item.client_id === idToUpdate)
        );
        if (itemIndex > -1) {
            // Gabungkan data lama dengan data baru, pertahankan ID asli jika ada
            const oldItem = PageProfile.currentProfileData[itemType][itemIndex];
            PageProfile.currentProfileData[itemType][itemIndex] = { ...oldItem, ...newItemData };
        } else {
            console.warn("Item not found in data store for update:", idToUpdate, "Type:", itemType);
        }
    },
    
    _removeItemFromDataStoreAndDOM: (itemType, itemIdToRemove) => {
        const itemIndex = PageProfile.currentProfileData[itemType].findIndex(item => 
            (item.id && String(item.id) === String(itemIdToRemove)) || 
            (item.client_id && item.client_id === itemIdToRemove)
        );
        
        if (itemIndex > -1) {
            PageProfile.currentProfileData[itemType].splice(itemIndex, 1);
            PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]); // Re-render list
        } else {
            console.warn("Item not found for removal:", itemIdToRemove, "Type:", itemType);
            // Fallback: coba hapus dari DOM jika tidak ketemu di data store (seharusnya tidak terjadi)
            const listElement = PageProfile.itemLists[itemType];
            const itemTag = listElement ? listElement.querySelector(`.item-tag[data-item-id="${itemIdToRemove}"]`) : null;
            if (itemTag) itemTag.remove();
        }
    },
    
    _populateDynamicList: (itemType, itemsArray) => {
        const listElement = PageProfile.itemLists[itemType];
        const config = PageProfile.itemTypeConfigs[itemType];
        if (!listElement || !config) {
            console.warn("Cannot populate list for item type:", itemType, "List element or config missing.");
            return;
        }

        listElement.innerHTML = ''; // Clear existing items
        if (itemsArray && itemsArray.length > 0) {
            itemsArray.forEach(item => {
                // Gunakan item.id (dari DB) jika ada, jika tidak (item baru) gunakan item.client_id
                const displayId = item.id || item.client_id; 
                PageProfile._addItemToDOM(itemType, item, displayId);
            });
        }
        // Placeholder akan otomatis muncul jika listElement kosong (via CSS :empty::before)
    },

    _addItemToDOM: (itemType, itemData, displayId) => {
        const listElement = PageProfile.itemLists[itemType];
        const config = PageProfile.itemTypeConfigs[itemType];
        if (!listElement || !config) return;

        const mainName = itemData[config.dbNameField] || 'N/A';
        let detailsString = PageProfile._getDetailsStringForItem(itemType, itemData, config);
        
        const itemTag = UI.createItemTag(mainName, detailsString, config.icon, displayId);
        
        const editBtn = itemTag.querySelector('.edit-item');
        const removeBtn = itemTag.querySelector('.remove-item');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const fullItemData = PageProfile.currentProfileData[itemType].find(item => 
                    (item.id && String(item.id) === String(displayId)) || 
                    (item.client_id && item.client_id === displayId)
                );
                if (fullItemData) {
                    PageProfile.openItemModal(itemType, config.modalTitle, config.icon, fullItemData, displayId);
                } else {
                    console.error("Could not find item data for edit:", displayId, "Type:", itemType);
                    UI.showMessage(PageProfile.profilePageMessageDiv, 'Gagal mengambil data item untuk diedit.', 'error');
                }
            });
        }
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (confirm(`Apakah Anda yakin ingin menghapus item "${UI.escapeHTML(mainName)}"? Tindakan ini tidak dapat dibatalkan setelah disimpan ke server.`)) {
                    PageProfile._removeItemFromDataStoreAndDOM(itemType, displayId);
                }
            });
        }
        listElement.appendChild(itemTag);
    },
    
    _getDetailsStringForItem: (itemType, itemData, config) => {
        let detailsString = "";
        switch (itemType) {
            case 'programmingSkill':
            case 'framework':
            case 'tool':
            case 'otherSkill':
                detailsString = itemData.skill_level ? `Level: ${itemData.skill_level}` : '';
                if (itemData.experience_duration) {
                    detailsString += (detailsString ? ', ' : '') + `Peng: ${itemData.experience_duration}`;
                }
                break;
            case 'education':
                detailsString = itemData.degree || '';
                if (itemData.field_of_study) detailsString += (detailsString ? ' di ' : '') + itemData.field_of_study;
                if (itemData.start_date || itemData.end_date) {
                    const start = itemData.start_date ? itemData.start_date.substring(0, 7).replace('-', '/') : ''; // YYYY/MM
                    const end = itemData.end_date ? itemData.end_date.substring(0, 7).replace('-', '/') : 'Sekarang';
                    if (start || end !== 'Sekarang') detailsString += ` (${start} - ${end})`;
                }
                break;
            case 'experience':
                detailsString = itemData.job_title || '';
                if (itemData.start_date || itemData.end_date) {
                     const start = itemData.start_date ? itemData.start_date.substring(0, 7).replace('-', '/') : '';
                    const end = itemData.end_date ? itemData.end_date.substring(0, 7).replace('-', '/') : 'Sekarang';
                    if (start || end !== 'Sekarang') detailsString += ` (${start} - ${end})`;
                }
                break;
            case 'socialLink':
                // Nama utama (platform_name) sudah ditampilkan, URL bisa jadi detail jika perlu
                detailsString = itemData.url ? itemData.url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : ''; // Domain singkat
                break;
            case 'industryPreference':
                // Nama utama (industry_name) sudah ditampilkan, tidak ada detail tambahan
                detailsString = ""; 
                break;
        }
        return detailsString.trim();
    },

    handleSaveFullProfile: async (e) => {
        e.preventDefault();
        if (PageProfile.profilePageMessageDiv) UI.hideMessage(PageProfile.profilePageMessageDiv);
        
        // Validasi form dasar
        if (!PageProfile.profileForm.checkValidity()) {
            PageProfile.profileForm.reportValidity(); // Tampilkan pesan validasi browser default
            UI.showMessage(PageProfile.profilePageMessageDiv, 'Harap isi semua field yang wajib (*).', 'error');
            return;
        }

        UI.showButtonSpinner(PageProfile.saveProfileDataBtn, 'Simpan Semua Data Profil', 'Menyimpan...');

        const profilePayload = {
            firstName: PageProfile.firstNameInput.value,
            lastName: PageProfile.lastNameInput.value,
            bio: PageProfile.bioInput.value,
            semester: PageProfile.semesterSelect.value,
            ipk: PageProfile.ipkInput.value,
            kota_asal: PageProfile.kotaAsalInput.value,
            kecamatan: PageProfile.kecamatanInput.value,
            kelurahan: PageProfile.kelurahanInput.value,
        };
        
        if (PageProfile.avatarUploadInput.files && PageProfile.avatarUploadInput.files[0]) {
            profilePayload.avatar = PageProfile.avatarUploadInput.files[0];
        }

        for (const itemType in PageProfile.itemTypeConfigs) {
            profilePayload[itemType] = JSON.stringify(PageProfile.currentProfileData[itemType] || []);
        }
        
        const response = await Api.saveFullProfileData(profilePayload);
        UI.hideButtonSpinner(PageProfile.saveProfileDataBtn);

        if (response.status === 'success') {
            UI.showMessage(PageProfile.profilePageMessageDiv, response.message || 'Data profil berhasil disimpan!', 'success');
            
            // Update local data store dengan ID dari backend
            if (response.saved_item_ids) {
                for (const itemType in response.saved_item_ids) {
                    if (PageProfile.currentProfileData[itemType]) {
                        const idMap = response.saved_item_ids[itemType]; // { client_id_1: db_id_1, ... }
                        PageProfile.currentProfileData[itemType].forEach(item => {
                            if (item.client_id && idMap[item.client_id]) {
                                item.id = idMap[item.client_id];
                                delete item.client_id;
                            }
                        });
                        // Re-render list untuk update data-item-id di DOM (opsional, karena ID hanya penting untuk edit/delete berikutnya)
                        // PageProfile._populateDynamicList(itemType, PageProfile.currentProfileData[itemType]);
                    }
                }
            }
            // Update data pengguna global dan UI bersama
            if (response.user_data) { // Backend harus mengembalikan data user yang terupdate
                window.sikmaApp.initialUserData = { ...window.sikmaApp.initialUserData, ...response.user_data };
                UI.updateSharedUserUI(window.sikmaApp.initialUserData);
                 // Update juga form di halaman Settings jika sudah diinisialisasi
                if (typeof PageSettings !== 'undefined' && PageSettings.isPageInitialized) {
                    PageSettings.populateSettingsForm(window.sikmaApp.initialUserData);
                }
                // Cek ulang kelengkapan profil
                window.sikmaApp.needsProfileCompletion = !response.user_data.is_profile_complete;
                AuthFlow.checkInitialProfileCompletion(); 
            }
        } else {
            const errorMsg = response.errors ? response.errors : (response.message || 'Gagal menyimpan data profil.');
            UI.showMessage(PageProfile.profilePageMessageDiv, errorMsg, 'error');
        }
    }
};

// Panggil initialize dasar saat script dimuat jika elemen sudah ada
// document.addEventListener('DOMContentLoaded', PageProfile.initialize);
// Inisialisasi akan dipanggil oleh AppCore.navigateToPage
