// SikmaV3 - assets/js/page_settings.js (Diperbarui)

const PageSettings = {
    // DOM Elements
    profileSettingsForm: null,
    changePasswordForm: null,
    settingsPageMessageDiv: null,
    
    firstNameInput: null,
    lastNameInput: null,
    emailInput: null,
    nimInput: null,
    semesterSelect: null,
    bioInput: null,
    avatarUploadInput: null,
    avatarPreview: null,
    profileUpdateMessageDiv: null,
    profileSubmitBtn: null,

    currentPasswordInput: null,
    newPasswordInput: null,
    confirmNewPasswordInput: null,
    newPasswordStrengthIndicator: null,
    passwordChangeMessageDiv: null,
    passwordSubmitBtn: null,

    darkModeToggleSettings: null,
    deactivateAccountBtn: null,
    deactivationMessageDiv: null,

    isPageInitialized: false,

    initialize: () => {
        if (PageSettings.isPageInitialized) return;
        console.log("PageSettings: Initializing...");

        PageSettings.settingsPageMessageDiv = UI.getElement('#settingsPageMessage');

        PageSettings.profileSettingsForm = UI.getElement('#profileSettingsForm');
        if (PageSettings.profileSettingsForm) {
            PageSettings.firstNameInput = UI.getElement('#settings_firstName');
            PageSettings.lastNameInput = UI.getElement('#settings_lastName');
            PageSettings.emailInput = UI.getElement('#settings_email');
            PageSettings.nimInput = UI.getElement('#settings_nim');
            PageSettings.semesterSelect = UI.getElement('#settings_semester');
            PageSettings.bioInput = UI.getElement('#settings_bio');
            PageSettings.avatarUploadInput = UI.getElement('#settings_avatarUpload');
            PageSettings.avatarPreview = UI.getElement('#settings_avatarPreview');
            PageSettings.profileUpdateMessageDiv = UI.getElement('#profileUpdateMessage');
            PageSettings.profileSubmitBtn = PageSettings.profileSettingsForm.querySelector('button[type="submit"]');
            PageSettings.profileSettingsForm.addEventListener('submit', PageSettings.handleProfileUpdateSubmit);
            if (PageSettings.avatarUploadInput && PageSettings.avatarPreview && PageSettings.profileUpdateMessageDiv) {
                PageSettings.avatarUploadInput.addEventListener('change', (event) => {
                    UI.handleAvatarPreview(event, PageSettings.avatarPreview, PageSettings.profileUpdateMessageDiv);
                });
            }
        }

        PageSettings.changePasswordForm = UI.getElement('#changePasswordForm');
        if (PageSettings.changePasswordForm) {
            PageSettings.currentPasswordInput = UI.getElement('#currentPassword');
            PageSettings.newPasswordInput = UI.getElement('#newPassword');
            PageSettings.confirmNewPasswordInput = UI.getElement('#confirmNewPassword');
            PageSettings.newPasswordStrengthIndicator = UI.getElement('#new_password_strength');
            PageSettings.passwordChangeMessageDiv = UI.getElement('#passwordChangeMessage');
            PageSettings.passwordSubmitBtn = PageSettings.changePasswordForm.querySelector('button[type="submit"]');
            PageSettings.changePasswordForm.addEventListener('submit', PageSettings.handleChangePasswordSubmit);
            if (PageSettings.newPasswordInput && PageSettings.newPasswordStrengthIndicator && typeof AppCore !== 'undefined') {
                PageSettings.newPasswordInput.addEventListener('input', function() {
                    AppCore.updatePasswordStrengthIndicator(this, PageSettings.newPasswordStrengthIndicator);
                });
            }
        }
        
        PageSettings.darkModeToggleSettings = UI.getElement('#darkModeToggleSettings');
        if (PageSettings.darkModeToggleSettings && typeof AppCore !== 'undefined') {
            PageSettings.darkModeToggleSettings.checked = document.body.classList.contains('dark-theme');
            PageSettings.darkModeToggleSettings.removeEventListener('change', PageSettings._handleThemeToggle);
            PageSettings.darkModeToggleSettings.addEventListener('change', PageSettings._handleThemeToggle);
        }
        
        PageSettings.deactivateAccountBtn = UI.getElement('#deactivateAccountBtn');
        PageSettings.deactivationMessageDiv = UI.getElement('#deactivationMessage');
        if (PageSettings.deactivateAccountBtn) {
            PageSettings.deactivateAccountBtn.addEventListener('click', PageSettings.handleDeactivateAccount);
        }
        
        PageSettings.isPageInitialized = true;
        console.log("PageSettings: Basic initialization complete.");
    },

    _handleThemeToggle: function() {
        if (typeof AppCore !== 'undefined' && typeof AppCore._applyTheme === 'function') {
            AppCore._applyTheme(this.checked ? 'dark-theme' : 'light-theme', true);
        }
    },
    
    loadPageData: () => {
        console.log("PageSettings: Loading page data...");
        if (!PageSettings.isPageInitialized) {
            PageSettings.initialize();
        }
        
        if (PageSettings.profileUpdateMessageDiv) UI.hideMessage(PageSettings.profileUpdateMessageDiv);
        if (PageSettings.passwordChangeMessageDiv) UI.hideMessage(PageSettings.passwordChangeMessageDiv);
        if (PageSettings.settingsPageMessageDiv) UI.hideMessage(PageSettings.settingsPageMessageDiv);
        if (PageSettings.deactivationMessageDiv) UI.hideMessage(PageSettings.deactivationMessageDiv);

        if (window.sikmaApp && window.sikmaApp.initialUserData) {
            PageSettings.populateSettingsForm(window.sikmaApp.initialUserData);
        } else {
            console.warn("PageSettings: No initial user data found to populate form.");
            if (PageSettings.settingsPageMessageDiv) UI.showMessage(PageSettings.settingsPageMessageDiv, "Gagal memuat data pengguna.", "error");
        }
        if (PageSettings.darkModeToggleSettings) {
            PageSettings.darkModeToggleSettings.checked = document.body.classList.contains('dark-theme');
        }
    },

    resetPage: () => {
        console.log("PageSettings: Resetting page...");
        if (PageSettings.profileSettingsForm) UI.resetForm(PageSettings.profileSettingsForm);
        if (PageSettings.changePasswordForm) UI.resetForm(PageSettings.changePasswordForm);
        
        if (PageSettings.profileUpdateMessageDiv) UI.hideMessage(PageSettings.profileUpdateMessageDiv);
        if (PageSettings.passwordChangeMessageDiv) UI.hideMessage(PageSettings.passwordChangeMessageDiv);
        if (PageSettings.settingsPageMessageDiv) UI.hideMessage(PageSettings.settingsPageMessageDiv);
        if (PageSettings.deactivationMessageDiv) UI.hideMessage(PageSettings.deactivationMessageDiv);

        if (PageSettings.avatarPreview && window.sikmaApp?.baseUrl) {
            PageSettings.avatarPreview.src = window.sikmaApp.baseUrl + '/assets/images/default_avatar.png';
        }
    },

    populateSettingsForm: (userData) => {
        if (!userData || !PageSettings.profileSettingsForm) {
            console.warn("PageSettings: Cannot populate form, user data or form element missing.");
            return;
        }

        const nameParts = (userData.nama_lengkap || '').split(' ');
        if (PageSettings.firstNameInput) PageSettings.firstNameInput.value = userData.firstName || nameParts[0] || '';
        if (PageSettings.lastNameInput) PageSettings.lastNameInput.value = userData.lastName || nameParts.slice(1).join(' ') || '';
        if (PageSettings.emailInput) PageSettings.emailInput.value = userData.email || '';
        if (PageSettings.nimInput) PageSettings.nimInput.value = userData.nim || '';
        if (PageSettings.semesterSelect) PageSettings.semesterSelect.value = userData.semester || '';
        if (PageSettings.bioInput) PageSettings.bioInput.value = userData.bio || '';
        if (PageSettings.avatarPreview && window.sikmaApp?.baseUrl) {
            const defaultAvatarSrc = window.sikmaApp.baseUrl + '/assets/images/default_avatar.png';
            PageSettings.avatarPreview.src = userData.avatar || defaultAvatarSrc;
            PageSettings.avatarPreview.onerror = () => { PageSettings.avatarPreview.src = defaultAvatarSrc; };
        }
    },

    // Removed local handleAvatarPreview, now uses UI.handleAvatarPreview

    handleProfileUpdateSubmit: async (e) => {
        e.preventDefault();
        if (!PageSettings.profileSettingsForm || !PageSettings.profileUpdateMessageDiv || !PageSettings.profileSubmitBtn || !PageSettings.semesterSelect) return;

        UI.hideMessage(PageSettings.profileUpdateMessageDiv);
        
        if (!PageSettings.profileSettingsForm.checkValidity()) {
            PageSettings.profileSettingsForm.reportValidity();
            UI.showMessage(PageSettings.profileUpdateMessageDiv, 'Harap isi semua field yang wajib (*).', 'error');
            return;
        }

        const formData = new FormData(PageSettings.profileSettingsForm);
        formData.append('semester', PageSettings.semesterSelect.value);

        UI.showButtonSpinner(PageSettings.profileSubmitBtn, 'Simpan Perubahan Profil');
        const response = await Api.updateUserProfile(formData);
        UI.hideButtonSpinner(PageSettings.profileSubmitBtn);

        if (response.status === 'success' && response.user) {
            UI.showMessage(PageSettings.profileUpdateMessageDiv, response.message || 'Profil berhasil diperbarui!', 'success');
            
            window.sikmaApp.initialUserData = { ...window.sikmaApp.initialUserData, ...response.user };
            UI.updateSharedUserUI(window.sikmaApp.initialUserData);
            
            if (typeof PageProfile !== 'undefined' && PageProfile.isPageInitialized) {
                PageProfile._populateFullProfileForm(window.sikmaApp.initialUserData);
            }
            window.sikmaApp.needsProfileCompletion = !response.user.is_profile_complete;
            if (typeof AuthFlow !== 'undefined') AuthFlow.checkInitialProfileCompletion();

        } else {
            const errorMsg = response.errors ? UI.formatErrors(response.errors) : (response.message || 'Gagal memperbarui profil.');
            UI.showMessage(PageSettings.profileUpdateMessageDiv, errorMsg, 'error');
        }
    },

    handleChangePasswordSubmit: async (e) => {
        e.preventDefault();
        if (!PageSettings.changePasswordForm || !PageSettings.passwordChangeMessageDiv || 
            !PageSettings.newPasswordInput || !PageSettings.confirmNewPasswordInput || !PageSettings.passwordSubmitBtn) return;

        UI.hideMessage(PageSettings.passwordChangeMessageDiv);

        if (!PageSettings.changePasswordForm.checkValidity()) {
            PageSettings.changePasswordForm.reportValidity();
            UI.showMessage(PageSettings.passwordChangeMessageDiv, 'Harap isi semua field kata sandi.', 'error');
            return;
        }
        if (PageSettings.newPasswordInput.value !== PageSettings.confirmNewPasswordInput.value) {
            UI.showMessage(PageSettings.passwordChangeMessageDiv, 'Konfirmasi kata sandi baru tidak cocok.', 'error');
            PageSettings.confirmNewPasswordInput.focus();
            return;
        }

        const formData = new FormData(PageSettings.changePasswordForm);
        UI.showButtonSpinner(PageSettings.passwordSubmitBtn, 'Ubah Kata Sandi');
        const response = await Api.changePassword(formData);
        UI.hideButtonSpinner(PageSettings.passwordSubmitBtn);

        if (response.status === 'success') {
            UI.showMessage(PageSettings.passwordChangeMessageDiv, response.message || 'Kata sandi berhasil diubah.', 'success');
            UI.resetForm(PageSettings.changePasswordForm);
            if (PageSettings.newPasswordStrengthIndicator) PageSettings.newPasswordStrengthIndicator.textContent = '';
        } else {
            const errorMsg = response.errors ? UI.formatErrors(response.errors) : (response.message || 'Gagal mengubah kata sandi.');
            UI.showMessage(PageSettings.passwordChangeMessageDiv, errorMsg, 'error');
        }
    },
    
    handleDeactivateAccount: async () => {
        if (!PageSettings.deactivationMessageDiv || !PageSettings.settingsPageMessageDiv || !PageSettings.deactivateAccountBtn) return;
        
        UI.hideMessage(PageSettings.deactivationMessageDiv);
        
        const password = prompt("Untuk keamanan, masukkan kata sandi Anda saat ini untuk menonaktifkan akun:");
        if (password === null) return;

        if (!password) {
            UI.showMessage(PageSettings.deactivationMessageDiv, 'Kata sandi diperlukan untuk menonaktifkan akun.', 'warning');
            return;
        }

        if (!confirm("Apakah Anda YAKIN ingin menonaktifkan akun Anda? Tindakan ini mungkin memerlukan bantuan administrator untuk diaktifkan kembali.")) {
            return;
        }
        
        UI.showButtonSpinner(PageSettings.deactivateAccountBtn, 'Nonaktifkan Akun Saya', 'Memproses...');
        
        const response = await Api.deactivateAccount(password); 
        UI.hideButtonSpinner(PageSettings.deactivateAccountBtn);

        if (response.status === 'success') {
            UI.showMessage(PageSettings.settingsPageMessageDiv, response.message || 'Akun Anda telah dinonaktifkan. Anda akan segera logout.', 'success', 0);
            setTimeout(() => {
                if (typeof AuthFlow !== 'undefined' && typeof AuthFlow.handleLogout === 'function') {
                    AuthFlow.handleLogout();
                }
            }, 4000);
        } else {
            UI.showMessage(PageSettings.deactivationMessageDiv, response.message || 'Gagal menonaktifkan akun.', 'error');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (UI.getElement('#page-settings')) { // Ensure this runs only if page-settings exists
        PageSettings.initialize();
    }
});
