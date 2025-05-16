// SikmaV2 - assets/js/page_settings.js

const PageSettings = {
    // DOM Elements
    profileSettingsForm: null,
    changePasswordForm: null,
    
    // Profile Form Elements
    firstNameInput: null,
    lastNameInput: null,
    emailInput: null, // Readonly
    bioInput: null,
    avatarUploadInput: null,
    avatarPreview: null,
    profileUpdateMessageDiv: null,

    // Password Form Elements
    currentPasswordInput: null,
    newPasswordInput: null,
    confirmNewPasswordInput: null,
    passwordChangeMessageDiv: null,

    // Other Settings Elements
    darkModeToggle: null, // Already handled by AppCore, but can reference if needed
    deactivateAccountBtn: null,
    settingsPageMessageDiv: null, // General message for the page

    isInitialized: false,

    initialize: () => {
        console.log("PageSettings: Initializing...");

        PageSettings.profileSettingsForm = UI.getElement('#profileSettingsForm');
        PageSettings.changePasswordForm = UI.getElement('#changePasswordForm');
        PageSettings.settingsPageMessageDiv = UI.getElement('#settingsPageMessage');

        // Profile form elements
        PageSettings.firstNameInput = UI.getElement('#settings_firstName');
        PageSettings.lastNameInput = UI.getElement('#settings_lastName');
        PageSettings.emailInput = UI.getElement('#settings_email');
        PageSettings.bioInput = UI.getElement('#settings_bio');
        PageSettings.avatarUploadInput = UI.getElement('#settings_avatarUpload');
        PageSettings.avatarPreview = UI.getElement('#settings_avatarPreview');
        PageSettings.profileUpdateMessageDiv = UI.getElement('#profileUpdateMessage');

        // Password form elements
        PageSettings.currentPasswordInput = UI.getElement('#currentPassword');
        PageSettings.newPasswordInput = UI.getElement('#newPassword');
        PageSettings.confirmNewPasswordInput = UI.getElement('#confirmNewPassword');
        PageSettings.passwordChangeMessageDiv = UI.getElement('#passwordChangeMessage');
        
        PageSettings.deactivateAccountBtn = UI.getElement('#deactivateAccountBtn');

        if (PageSettings.profileSettingsForm) {
            PageSettings.profileSettingsForm.addEventListener('submit', PageSettings.handleProfileUpdateSubmit);
        }
        if (PageSettings.changePasswordForm) {
            PageSettings.changePasswordForm.addEventListener('submit', PageSettings.handleChangePasswordSubmit);
        }
        if (PageSettings.avatarUploadInput && PageSettings.avatarPreview) {
            PageSettings.avatarUploadInput.addEventListener('change', PageSettings.handleAvatarPreview);
        }
        if (PageSettings.deactivateAccountBtn) {
            PageSettings.deactivateAccountBtn.addEventListener('click', PageSettings.handleDeactivateAccount);
        }

        // Populate forms with current user data
        if (window.sikmaApp && window.sikmaApp.initialUserData) {
            PageSettings.populateSettingsForm(window.sikmaApp.initialUserData);
        }
        
        PageSettings.isInitialized = true;
        console.log("PageSettings: Initialized.");
    },

    resetPage: () => {
        console.log("PageSettings: Resetting page...");
        if (PageSettings.profileSettingsForm) UI.resetForm(PageSettings.profileSettingsForm);
        if (PageSettings.changePasswordForm) UI.resetForm(PageSettings.changePasswordForm);
        
        if (PageSettings.profileUpdateMessageDiv) UI.hideMessage(PageSettings.profileUpdateMessageDiv);
        if (PageSettings.passwordChangeMessageDiv) UI.hideMessage(PageSettings.passwordChangeMessageDiv);
        if (PageSettings.settingsPageMessageDiv) UI.hideMessage(PageSettings.settingsPageMessageDiv);

        // Repopulate with initial data if available (e.g. after a failed save attempt that cleared fields)
        if (window.sikmaApp && window.sikmaApp.initialUserData) {
            PageSettings.populateSettingsForm(window.sikmaApp.initialUserData);
        } else if (PageSettings.avatarPreview) {
            PageSettings.avatarPreview.src = 'https://placehold.co/80x80/3498db/ffffff?text=U'; // Default
        }
        PageSettings.isInitialized = false;
    },

    populateSettingsForm: (userData) => {
        if (!userData || !PageSettings.isInitialized && !UI.getElement('#page-settings').classList.contains('active')) {
            // Don't populate if page is not active or not initialized, unless explicitly called
            // This check helps if initializeMainApp calls this before page is active
            if (!UI.getElement('#page-settings').classList.contains('active')) return;
        }


        const nameParts = (userData.nama_lengkap || '').split(' ');
        if (PageSettings.firstNameInput) PageSettings.firstNameInput.value = nameParts[0] || '';
        if (PageSettings.lastNameInput) PageSettings.lastNameInput.value = nameParts.slice(1).join(' ');
        if (PageSettings.emailInput) PageSettings.emailInput.value = userData.email || '';
        if (PageSettings.bioInput) PageSettings.bioInput.value = userData.bio || '';
        if (PageSettings.avatarPreview) PageSettings.avatarPreview.src = userData.avatar || 'https://placehold.co/80x80/3498db/ffffff?text=U';
    },

    handleAvatarPreview: (event) => {
        const file = event.target.files[0];
        if (file && PageSettings.avatarPreview) {
            const reader = new FileReader();
            reader.onload = (e) => {
                PageSettings.avatarPreview.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    },

    handleProfileUpdateSubmit: async (e) => {
        e.preventDefault();
        if (PageSettings.profileUpdateMessageDiv) UI.hideMessage(PageSettings.profileUpdateMessageDiv);
        
        const formData = new FormData(PageSettings.profileSettingsForm);
        // Note: 'email' is readonly and won't be sent by default unless explicitly added.
        // Backend's user_handler.php for 'update_profile' doesn't expect email change.
        
        const submitBtn = PageSettings.profileSettingsForm.querySelector('button[type="submit"]');
        UI.showButtonSpinner(submitBtn, 'Simpan Perubahan Profil');

        const response = await Api.updateUserProfile(formData);
        UI.hideButtonSpinner(submitBtn);

        if (response.status === 'success') {
            UI.showMessage(PageSettings.profileUpdateMessageDiv, response.message || 'Profil berhasil diperbarui!', 'success');
            if (response.user) {
                // Update global user data and shared UI
                window.sikmaApp.initialUserData = { ...window.sikmaApp.initialUserData, ...response.user };
                UI.updateSharedUserUI(window.sikmaApp.initialUserData);
                // Also update profile page data if it's loaded/cached
                if (typeof PageProfile !== 'undefined' && PageProfile.isInitialized) {
                    PageProfile._populateBasicInfo(window.sikmaApp.initialUserData);
                }
            }
        } else {
            let errorMsg = response.message || 'Gagal memperbarui profil.';
            if (response.debug_upload_error) { // From original auth.js
                errorMsg += ` (Kode Error Upload: ${response.debug_upload_error})`;
                console.error("Upload error details:", response.debug_upload_error_details);
            }
            UI.showMessage(PageSettings.profileUpdateMessageDiv, errorMsg, 'error');
        }
    },

    handleChangePasswordSubmit: async (e) => {
        e.preventDefault();
        if (PageSettings.passwordChangeMessageDiv) UI.hideMessage(PageSettings.passwordChangeMessageDiv);

        const formData = new FormData(PageSettings.changePasswordForm);
        const submitBtn = PageSettings.changePasswordForm.querySelector('button[type="submit"]');
        UI.showButtonSpinner(submitBtn, 'Ubah Kata Sandi');

        const response = await Api.changePassword(formData);
        UI.hideButtonSpinner(submitBtn);

        if (response.status === 'success') {
            UI.showMessage(PageSettings.passwordChangeMessageDiv, response.message || 'Kata sandi berhasil diubah.', 'success');
            UI.resetForm(PageSettings.changePasswordForm);
        } else {
            UI.showMessage(PageSettings.passwordChangeMessageDiv, response.message || 'Gagal mengubah kata sandi.', 'error');
        }
    },
    
    handleDeactivateAccount: () => {
        // Implement a more user-friendly confirmation modal later
        if (confirm("Apakah Anda yakin ingin menonaktifkan akun Anda? Tindakan ini tidak dapat diurungkan secara langsung melalui antarmuka ini.")) {
            console.log("PageSettings: Deactivate account initiated (placeholder).");
            // TODO: Call an API endpoint for deactivation
            // Api.deactivateAccount().then(response => { ... });
            UI.showMessage(PageSettings.settingsPageMessageDiv, 'Fungsi deaktivasi akun belum diimplementasikan sepenuhnya di backend.', 'info');
        }
    }
};