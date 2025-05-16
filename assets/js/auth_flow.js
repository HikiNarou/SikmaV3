// SikmaV2 - assets/js/auth_flow.js

const AuthFlow = {
    // DOM Elements related to Auth
    loginForm: null,
    registerForm: null,
    authContainer: null,
    appContainer: null,
    logoutLink: null,
    loginMessageDiv: null,
    registerMessageDiv: null,
    profileCompletionOverlay: null,
    profileCompletionMessageDiv: null,

    initializeAuthForms: () => {
        AuthFlow.loginForm = UI.getElement('#loginForm');
        AuthFlow.registerForm = UI.getElement('#registerForm');
        AuthFlow.authContainer = UI.getElement('#authContainer');
        AuthFlow.appContainer = UI.getElement('#appContainer'); // Needed for showing/hiding
        AuthFlow.logoutLink = UI.getElement('#nav-logout'); // For re-attaching listener if app re-initializes
        AuthFlow.loginMessageDiv = UI.getElement('#loginMessage');
        AuthFlow.registerMessageDiv = UI.getElement('#registerMessage');
        AuthFlow.profileCompletionOverlay = UI.getElement('#profileCompletionOverlay');
        AuthFlow.profileCompletionMessageDiv = UI.getElement('#profileCompletionMessage');


        const switchToRegisterLink = UI.getElement('#switchToRegister');
        const switchToLoginLink = UI.getElement('#switchToLogin');

        if (switchToRegisterLink) {
            switchToRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                AuthFlow.showRegisterForm();
            });
        }
        if (switchToLoginLink) {
            switchToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                AuthFlow.showLoginForm();
            });
        }

        if (AuthFlow.loginForm) {
            AuthFlow.loginForm.addEventListener('submit', AuthFlow.handleLoginSubmit);
        }
        if (AuthFlow.registerForm) {
            AuthFlow.registerForm.addEventListener('submit', AuthFlow.handleRegisterSubmit);
        }
        
        // If logout link exists (it might be part of app_core initialization too)
        if (AuthFlow.logoutLink) {
             // Ensure only one listener if re-initialized
            AuthFlow.logoutLink.removeEventListener('click', AuthFlow.handleLogout);
            AuthFlow.logoutLink.addEventListener('click', AuthFlow.handleLogout);
        }

        // Show login form by default if auth container is visible
        if (AuthFlow.authContainer && AuthFlow.authContainer.style.display !== 'none') {
            AuthFlow.showLoginForm();
        }
    },

    showLoginForm: () => {
        if (AuthFlow.loginForm) UI.showElement(AuthFlow.loginForm);
        if (AuthFlow.registerForm) UI.hideElement(AuthFlow.registerForm);
        if (AuthFlow.registerMessageDiv) UI.hideMessage(AuthFlow.registerMessageDiv);
        if (AuthFlow.loginForm) UI.resetForm(AuthFlow.loginForm);
        document.title = 'SIKMA Terintegrasi - Login';
    },

    showRegisterForm: () => {
        if (AuthFlow.loginForm) UI.hideElement(AuthFlow.loginForm);
        if (AuthFlow.registerForm) UI.showElement(AuthFlow.registerForm);
        if (AuthFlow.loginMessageDiv) UI.hideMessage(AuthFlow.loginMessageDiv);
        if (AuthFlow.registerForm) UI.resetForm(AuthFlow.registerForm);
        document.title = 'SIKMA Terintegrasi - Daftar';
    },

    handleLoginSubmit: async (e) => {
        e.preventDefault();
        if (AuthFlow.loginMessageDiv) UI.hideMessage(AuthFlow.loginMessageDiv);
        const formData = new FormData(AuthFlow.loginForm);
        const submitBtn = AuthFlow.loginForm.querySelector('button[type="submit"]');
        UI.showButtonSpinner(submitBtn, 'Login');

        const response = await Api.login(formData);
        UI.hideButtonSpinner(submitBtn);

        if (response.status === 'success') {
            window.sikmaApp.isUserLoggedIn = true;
            window.sikmaApp.initialUserData = response.user; // Store user data globally
            
            UI.hideElement(AuthFlow.authContainer);
            UI.showElement(AuthFlow.appContainer);
            
            AppCore.initializeMainApp(); // Initialize the main application UI and logic
            AuthFlow.checkInitialProfileCompletion(); // Check and handle profile completion

        } else {
            UI.showMessage(AuthFlow.loginMessageDiv, response.message || 'Login gagal, coba lagi.', 'error');
        }
    },

    handleRegisterSubmit: async (e) => {
        e.preventDefault();
        if (AuthFlow.registerMessageDiv) UI.hideMessage(AuthFlow.registerMessageDiv);
        const formData = new FormData(AuthFlow.registerForm);
        const submitBtn = AuthFlow.registerForm.querySelector('button[type="submit"]');
        UI.showButtonSpinner(submitBtn, 'Daftar');

        const response = await Api.register(formData);
        UI.hideButtonSpinner(submitBtn);

        if (response.status === 'success') {
            UI.showMessage(AuthFlow.registerMessageDiv, response.message || 'Registrasi berhasil! Silakan login.', 'success');
            UI.resetForm(AuthFlow.registerForm);
            setTimeout(AuthFlow.showLoginForm, 2000); // Switch to login form after a delay
        } else {
            UI.showMessage(AuthFlow.registerMessageDiv, response.message || 'Registrasi gagal, coba lagi.', 'error');
        }
    },

    handleLogout: async (e) => {
        if (e) e.preventDefault();
        // Optional: Show a confirmation dialog before logout
        // if (!confirm("Apakah Anda yakin ingin logout?")) return;

        const response = await Api.logout();
        if (response.status === 'success') {
            window.sikmaApp.isUserLoggedIn = false;
            window.sikmaApp.initialUserData = null;
            
            AppCore.resetMainAppUI(); // Reset the main app state
            UI.hideElement(AuthFlow.appContainer);
            UI.showElement(AuthFlow.authContainer);
            AuthFlow.showLoginForm(); // Show login form
            document.cookie = "theme=;path=/;max-age=0"; // Clear theme cookie
            localStorage.removeItem('theme');
            localStorage.removeItem('sidebarCollapsed');
            document.body.classList.remove('dark-theme'); // Ensure theme is reset visually
        } else {
            UI.showMessage(UI.getElement('#pageHeader'), response.message || 'Logout gagal.', 'error', 3000); // Show message in header if available
            // alert('Logout gagal: ' + (response.message || 'Kesalahan tidak diketahui.'));
        }
    },

    checkSessionStatus: async () => {
        // This is called if PHP didn't initialize the app (e.g. user opened a new tab, or session expired)
        if (window.sikmaApp.isUserLoggedIn && window.sikmaApp.initialUserData) {
            // Already handled by PHP pre-load or a previous check
            AppCore.initializeMainApp();
            AuthFlow.checkInitialProfileCompletion();
            return;
        }

        const response = await Api.checkSession();
        if (response.status === 'success' && response.loggedIn) {
            window.sikmaApp.isUserLoggedIn = true;
            window.sikmaApp.initialUserData = response.user;

            UI.hideElement(AuthFlow.authContainer);
            UI.showElement(AuthFlow.appContainer);
            AppCore.initializeMainApp();
            AuthFlow.checkInitialProfileCompletion();
        } else {
            window.sikmaApp.isUserLoggedIn = false;
            window.sikmaApp.initialUserData = null;
            UI.hideElement(AuthFlow.appContainer);
            UI.showElement(AuthFlow.authContainer);
            AuthFlow.showLoginForm();
        }
    },

    /**
     * Checks if the user's profile is complete upon login/session check.
     * If not complete, it shows an overlay and redirects/forces to the profile page.
     */
    checkInitialProfileCompletion: () => {
        if (!window.sikmaApp.isUserLoggedIn || !window.sikmaApp.initialUserData) {
            return; // Not logged in, nothing to check
        }
        // The flag `is_profile_complete` should come from the backend (initialUserData)
        const needsCompletion = !window.sikmaApp.initialUserData.is_profile_complete;
        window.sikmaApp.needsProfileCompletion = needsCompletion; // Update global state

        if (needsCompletion) {
            if (AuthFlow.profileCompletionOverlay) {
                UI.showElement(AuthFlow.profileCompletionOverlay);
                UI.showMessage(AuthFlow.profileCompletionMessageDiv, 'Harap lengkapi profil Anda untuk melanjutkan.', 'info', 0);
            } else {
                 // Fallback if overlay element is not found
                UI.showMessage(UI.getElement('#pageHeader') || 'body', 'Profil Anda belum lengkap. Harap lengkapi data diri Anda.', 'warning', 0);
            }
            
            // Force navigation to profile page and restrict other navigation
            AppCore.navigateToPage('page-profile', null, 'Lengkapi Profil');
            AppCore.restrictNavigation(true, 'page-profile'); // Restrict nav, allow 'page-profile'

            // Set a flag or class on the body/sidebar to indicate restricted mode
            if(UI.getElement('.sidebar')) UI.addClass(UI.getElement('.sidebar'), 'profile-incomplete-restricted');

        } else {
            if (AuthFlow.profileCompletionOverlay) UI.hideElement(AuthFlow.profileCompletionOverlay);
            AppCore.restrictNavigation(false); // Allow full navigation
            if(UI.getElement('.sidebar')) UI.removeClass(UI.getElement('.sidebar'), 'profile-incomplete-restricted');
        }
    }
};