// SikmaV2 - assets/js/app_core.js

const AppCore = {
    // DOM Elements
    pageSidebar: null,
    sidebarToggleBtn: null,
    mainContentWrapper: null,
    pageHeader: null,
    navLinks: null,
    pages: null,
    darkModeToggle: null,
    // App State
    isNavigationRestricted: false,
    allowedPageDuringRestriction: '',

    initializeMainApp: () => {
        console.log("AppCore: Initializing main application...");

        // Cache DOM elements
        AppCore.pageSidebar = UI.getElement('#pageSidebar');
        AppCore.sidebarToggleBtn = UI.getElement('#sidebarToggleBtn');
        AppCore.mainContentWrapper = UI.getElement('#mainContentWrapper');
        AppCore.pageHeader = UI.getElement('#pageHeader');
        AppCore.navLinks = UI.getAllElements('.navigation ul li a[data-page]');
        AppCore.pages = UI.getAllElements('.page-content');
        AppCore.darkModeToggle = UI.getElement('#darkModeToggle');

        if (!AppCore.mainContentWrapper || !AppCore.pageSidebar || AppCore.navLinks.length === 0) {
            console.error("AppCore: Critical layout elements not found. Aborting initialization.");
            return;
        }
        
        // Update shared UI elements with user data
        if (window.sikmaApp && window.sikmaApp.initialUserData) {
            UI.updateSharedUserUI(window.sikmaApp.initialUserData);
            // Populate settings form fields if on settings page initially (though unlikely)
            if (PageSettings && typeof PageSettings.populateSettingsForm === 'function') {
                 PageSettings.populateSettingsForm(window.sikmaApp.initialUserData);
            }
            // Populate profile page form fields if on profile page initially
             if (PageProfile && typeof PageProfile.loadAndDisplayProfileData === 'function' && window.sikmaApp.needsProfileCompletion) {
                // PageProfile.loadAndDisplayProfileData will be called by navigateToPage or AuthFlow
            }
        }

        AppCore._initSidebar();
        AppCore._initTheme();
        AppCore._initNavigation();
        AppCore._initHeaderScroll();
        AppCore._initGlobalEventListeners(); // For things like search if it's global

        // Determine initial page
        // AuthFlow.checkInitialProfileCompletion will handle navigation if profile is incomplete
        if (!(window.sikmaApp && window.sikmaApp.needsProfileCompletion)) {
            const initialPageId = 'page-home'; // Default to home
            const initialNavLink = UI.getElement(`.navigation ul li a[data-page="${initialPageId}"]`);
            AppCore.navigateToPage(initialPageId, initialNavLink, 'Dashboard');
        }
        
        console.log("AppCore: Main application components initialized.");
        window.sikmaApp.mainAppFullyInitialized = true; // Flag for other modules
    },

    _initSidebar: () => {
        if (AppCore.sidebarToggleBtn && AppCore.pageSidebar) {
            // Remove previous listener if any, to prevent duplicates on re-init (e.g., during development)
            const newBtn = AppCore.sidebarToggleBtn.cloneNode(true);
            AppCore.sidebarToggleBtn.parentNode.replaceChild(newBtn, AppCore.sidebarToggleBtn);
            AppCore.sidebarToggleBtn = newBtn;

            AppCore.sidebarToggleBtn.addEventListener('click', () => {
                const isCollapsed = AppCore.pageSidebar.classList.contains('collapsed');
                AppCore._setSidebarState(!isCollapsed);
            });

            const savedSidebarState = localStorage.getItem('sidebarCollapsed');
            AppCore._setSidebarState(savedSidebarState === 'true', false); // false for no animation on load
        }
    },

    _setSidebarState: (collapsed, animate = true) => {
        if (!AppCore.pageSidebar || !AppCore.mainContentWrapper || !AppCore.sidebarToggleBtn) return;

        const icon = AppCore.sidebarToggleBtn.querySelector('i');
        // Add/remove transition class if animation is desired
        if (animate) {
            AppCore.pageSidebar.style.transition = 'width 0.3s ease';
            AppCore.mainContentWrapper.style.transition = 'margin-left 0.3s ease';
        } else {
            AppCore.pageSidebar.style.transition = 'none';
            AppCore.mainContentWrapper.style.transition = 'none';
        }

        if (collapsed) {
            AppCore.pageSidebar.classList.add('collapsed');
            AppCore.mainContentWrapper.classList.add('sidebar-collapsed');
            if (icon) { icon.classList.remove('fa-chevron-left'); icon.classList.add('fa-chevron-right'); }
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            AppCore.pageSidebar.classList.remove('collapsed');
            AppCore.mainContentWrapper.classList.remove('sidebar-collapsed');
            if (icon) { icon.classList.remove('fa-chevron-right'); icon.classList.add('fa-chevron-left'); }
            localStorage.setItem('sidebarCollapsed', 'false');
        }
        // Re-enable transitions after a short delay if they were disabled
        if (!animate) {
            setTimeout(() => {
                AppCore.pageSidebar.style.transition = '';
                AppCore.mainContentWrapper.style.transition = '';
            }, 50);
        }
    },

    _initTheme: () => {
        if (AppCore.darkModeToggle) {
             // Remove previous listener
            const newToggle = AppCore.darkModeToggle.cloneNode(true);
            AppCore.darkModeToggle.parentNode.replaceChild(newToggle, AppCore.darkModeToggle);
            AppCore.darkModeToggle = newToggle;

            AppCore.darkModeToggle.addEventListener('change', function() {
                AppCore._applyTheme(this.checked ? 'dark-theme' : 'light-theme', true);
            });
        }
        // Apply initial theme based on cookie or localStorage
        const cookieTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
        const storedTheme = cookieTheme || localStorage.getItem('theme') || 'light-theme'; // Default to light
        AppCore._applyTheme(storedTheme, false); // false for no user interaction (don't set cookie again if from cookie)
    },

    _applyTheme: (theme, fromUserInteraction = false) => {
        if (theme === 'dark-theme') {
            document.body.classList.add('dark-theme');
            if (AppCore.darkModeToggle) AppCore.darkModeToggle.checked = true;
            if (fromUserInteraction) {
                document.cookie = "theme=dark-theme;path=/;max-age=" + (60 * 60 * 24 * 30) + ";SameSite=Lax";
                localStorage.setItem('theme', 'dark-theme');
            }
        } else {
            document.body.classList.remove('dark-theme');
            if (AppCore.darkModeToggle) AppCore.darkModeToggle.checked = false;
            if (fromUserInteraction) {
                document.cookie = "theme=light-theme;path=/;max-age=" + (60 * 60 * 24 * 30) + ";SameSite=Lax";
                localStorage.setItem('theme', 'light-theme');
            }
        }
    },

    _initNavigation: () => {
        AppCore.navLinks.forEach(link => {
            // Remove previous listener
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                const pageId = this.dataset.page;
                const pageTitle = this.querySelector('.nav-text')?.textContent || 'Page';

                if (AppCore.isNavigationRestricted && pageId !== AppCore.allowedPageDuringRestriction) {
                    UI.showMessage(UI.getElement('#pageHeader') || AppCore.mainContentWrapper, 'Harap lengkapi profil Anda terlebih dahulu untuk mengakses halaman ini.', 'warning', 3000);
                    return;
                }
                AppCore.navigateToPage(pageId, this, pageTitle);
            });
        });
    },

    navigateToPage: (pageId, clickedElement = null, pageTitleSuffix = null) => {
        const targetPage = UI.getElement(`#${pageId}`);
        if (!targetPage) {
            console.warn(`AppCore: Page with id "${pageId}" not found.`);
            // Optionally navigate to a default page or show an error
            AppCore.navigateToPage('page-home', UI.getElement('.navigation ul li a[data-page="page-home"]'), 'Dashboard');
            return;
        }

        AppCore.pages.forEach(page => page.classList.remove('active'));
        targetPage.classList.add('active');

        AppCore.navLinks.forEach(link => link.classList.remove('active-link'));
        if (clickedElement) {
            clickedElement.classList.add('active-link');
        } else { // If navigating programmatically, find the corresponding nav link
            const correspondingNavLink = UI.getElement(`.navigation ul li a[data-page="${pageId}"]`);
            if (correspondingNavLink) correspondingNavLink.classList.add('active-link');
        }
        
        const baseTitle = 'SIKMA Terintegrasi';
        if (pageTitleSuffix && pageTitleSuffix.toLowerCase() !== 'utama' && pageTitleSuffix.toLowerCase() !== 'dashboard') {
            document.title = `${baseTitle} - ${pageTitleSuffix}`;
        } else {
            document.title = `${baseTitle} - Dashboard`;
        }

        if (AppCore.mainContentWrapper) AppCore.mainContentWrapper.scrollTop = 0;

        // Call page-specific initializers
        switch (pageId) {
            case 'page-home':
                if (typeof PageHome !== 'undefined' && typeof PageHome.initialize === 'function') PageHome.initialize();
                break;
            case 'page-profile':
                if (typeof PageProfile !== 'undefined' && typeof PageProfile.initialize === 'function') PageProfile.initialize();
                break;
            case 'page-settings':
                if (typeof PageSettings !== 'undefined' && typeof PageSettings.initialize === 'function') PageSettings.initialize();
                break;
            case 'page-company-detail':
                // Initialization for company detail is usually triggered by clicking a link,
                // but if navigated to directly (e.g. via URL routing later), it might need an init call.
                // For now, PageCompanyDetail.displayCompanyDetails is the main function.
                break;
        }
    },
    
    _initHeaderScroll: () => {
        if (AppCore.pageHeader && AppCore.mainContentWrapper) {
            // Remove previous listener
            AppCore.mainContentWrapper.removeEventListener('scroll', AppCore._handleHeaderScroll);
            AppCore.mainContentWrapper.addEventListener('scroll', AppCore._handleHeaderScroll);
        }
    },
    _handleHeaderScroll: () => { // Make it a property to be able to remove it
        if (AppCore.mainContentWrapper.scrollTop > 20) {
            AppCore.pageHeader.classList.add('scrolled');
        } else {
            AppCore.pageHeader.classList.remove('scrolled');
        }
    },

    _initGlobalEventListeners: () => {
        // Example: Main search button
        const mainSearchButton = UI.getElement('#mainSearchButton');
        const mainSearchInput = UI.getElement('#mainSearchInput');
        if (mainSearchButton && mainSearchInput) {
            mainSearchButton.addEventListener('click', () => {
                const searchTerm = mainSearchInput.value.trim();
                if (searchTerm && typeof PageHome !== 'undefined' && typeof PageHome.filterCompaniesBySearch === 'function') {
                    // If on home page, trigger company search/filter
                    if (UI.getElement('#page-home').classList.contains('active')) {
                        PageHome.filterCompaniesBySearch(searchTerm);
                    } else {
                        // Navigate to home and then search
                        AppCore.navigateToPage('page-home', UI.getElement('a[data-page="page-home"]'), 'Dashboard');
                        // Need a slight delay for page to render before filtering
                        setTimeout(() => PageHome.filterCompaniesBySearch(searchTerm), 100);
                    }
                } else if (searchTerm) {
                    console.log("Global search for:", searchTerm); // Placeholder for more global search
                    UI.showMessage(AppCore.pageHeader, `Pencarian untuk "${searchTerm}" belum diimplementasikan sepenuhnya.`, 'info');
                }
            });
            mainSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    mainSearchButton.click();
                }
            });
        }
    },

    resetMainAppUI: () => {
        console.log("AppCore: Resetting main application UI...");
        UI.resetSharedUserUI();

        // Clear dynamic content on pages
        if (typeof PageHome !== 'undefined' && typeof PageHome.resetPage === 'function') PageHome.resetPage();
        if (typeof PageProfile !== 'undefined' && typeof PageProfile.resetPage === 'function') PageProfile.resetPage();
        if (typeof PageSettings !== 'undefined' && typeof PageSettings.resetPage === 'function') PageSettings.resetPage();
        if (typeof PageCompanyDetail !== 'undefined' && typeof PageCompanyDetail.resetPage === 'function') PageCompanyDetail.resetPage();

        // Reset forms that might hold data
        UI.resetForm('#profileSettingsForm');
        UI.resetForm('#changePasswordForm');
        UI.resetForm('#fullProfileForm'); // If it exists and is separate

        // Reset sidebar and theme to defaults (or let AuthFlow handle showing login which has its own defaults)
        AppCore._setSidebarState(false, false); // Not collapsed, no animation
        AppCore._applyTheme('light-theme', false); // Default to light, don't set cookie as logout clears it
        if (AppCore.darkModeToggle) AppCore.darkModeToggle.checked = false;

        // Hide any active messages
        UI.hideMessage('#profileUpdateMessage');
        UI.hideMessage('#passwordChangeMessage');
        UI.hideMessage('#settingsPageMessage');
        UI.hideMessage('#profilePageMessage');
        UI.hideMessage('#itemModalMessage');
        UI.hideMessage(UI.getElement('#pageHeader'));


        // Remove restriction class from sidebar
        if(AppCore.pageSidebar) UI.removeClass(AppCore.pageSidebar, 'profile-incomplete-restricted');
        AppCore.restrictNavigation(false); // Allow full navigation before potential redirect to login

        // Specific component resets
        if (window.recommendationSwiperInstance && typeof window.recommendationSwiperInstance.destroy === 'function') {
            try {
                window.recommendationSwiperInstance.destroy(true, true);
            } catch (e) { console.warn("Error destroying swiper:", e); }
            window.recommendationSwiperInstance = null;
        }
        
        console.log("AppCore: Main app UI reset complete.");
    },

    /**
     * Restricts or allows navigation based on profile completion.
     * @param {boolean} shouldRestrict - True to restrict, false to allow.
     * @param {string} [allowedPageIdDuringRestriction] - If restricting, this page ID will still be allowed.
     */
    restrictNavigation: (shouldRestrict, allowedPageIdDuringRestriction = '') => {
        AppCore.isNavigationRestricted = shouldRestrict;
        AppCore.allowedPageDuringRestriction = allowedPageIdDuringRestriction;

        AppCore.navLinks.forEach(link => {
            const pageId = link.dataset.page;
            if (shouldRestrict && pageId !== allowedPageIdDuringRestriction) {
                link.classList.add('disabled-nav-link');
                // Parent LI might also need styling
                if(link.parentElement) link.parentElement.classList.add('restricted');
            } else {
                link.classList.remove('disabled-nav-link');
                 if(link.parentElement) link.parentElement.classList.remove('restricted');
            }
        });
        // Also update sidebar class for general styling of restriction
        if (AppCore.pageSidebar) {
            UI.toggleClass(AppCore.pageSidebar, 'profile-incomplete-restricted', shouldRestrict);
        }
    },
};

// Add CSS for disabled nav links if not already present
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .navigation ul li a.disabled-nav-link {
            opacity: 0.5;
            cursor: not-allowed !important;
            pointer-events: none; /* Redundant with AppCore logic but good fallback */
        }
        .sidebar.profile-incomplete-restricted .navigation ul li.restricted:not(#nav-profile) a {
             /* Styles defined in sidebar.css should take precedence */
        }
    `;
    document.head.appendChild(style);
});