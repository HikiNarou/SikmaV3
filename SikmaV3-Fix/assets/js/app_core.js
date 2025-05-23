// SikmaV3 - assets/js/app_core.js (Diperbarui)

const AppCore = {
    // DOM Elements
    pageSidebar: null,
    sidebarToggleBtn: null,
    mainContentWrapper: null,
    pageHeader: null,
    navLinks: null,
    pages: null,
    darkModeToggleSettings: null, // Toggle di halaman settings
    darkModeToggleHeader: null,   // Toggle di header

    // App State
    isNavigationRestricted: false,
    allowedPageDuringRestriction: '',
    isInitialized: false,
    activePageId: null,

    initializeMainApp: () => {
        if (AppCore.isInitialized && window.sikmaApp.mainAppFullyInitialized) {
            console.log("AppCore: Main app already initialized. Possibly re-checking state.");
            AuthFlow.checkInitialProfileCompletion(); // Pastikan state restriksi navigasi benar
            return;
        }
        console.log("AppCore: Initializing main application components...");

        // Cache DOM elements
        AppCore.pageSidebar = UI.getElement('#pageSidebar');
        AppCore.sidebarToggleBtn = UI.getElement('#sidebarToggleBtn');
        AppCore.mainContentWrapper = UI.getElement('#mainContentWrapper');
        AppCore.pageHeader = UI.getElement('#pageHeader');
        AppCore.navLinks = UI.getAllElements('.navigation ul li a[data-page]');
        AppCore.pages = UI.getAllElements('.page-content');
        AppCore.darkModeToggleSettings = UI.getElement('#darkModeToggleSettings');
        AppCore.darkModeToggleHeader = UI.getElement('#darkModeToggleHeader');

        if (!AppCore.mainContentWrapper || !AppCore.pageSidebar || AppCore.navLinks.length === 0) {
            console.error("AppCore: Critical layout elements not found. Aborting initialization.");
            UI.showElement(AuthFlow.authContainer, 'flex');
            UI.hideElement(AuthFlow.appContainer);
            return;
        }
        
        if (window.sikmaApp && window.sikmaApp.initialUserData) {
            UI.updateSharedUserUI(window.sikmaApp.initialUserData);
        }

        AppCore._initSidebar();
        AppCore._initTheme();
        AppCore._initNavigation();
        AppCore._initHeaderScroll();
        AppCore._initGlobalEventListeners();

        if (!(window.sikmaApp && window.sikmaApp.needsProfileCompletion)) {
            const hashPage = window.location.hash.substring(1);
            const initialPageId = AppCore.isValidPageId(hashPage) ? hashPage : 'page-home';
            const initialNavLink = UI.getElement(`.navigation ul li a[data-page="${initialPageId}"]`);
            const initialPageTitle = initialNavLink?.querySelector('.nav-text')?.textContent || (initialPageId === 'page-home' ? 'Dashboard' : 'Halaman');
            AppCore.navigateToPage(initialPageId, initialNavLink, initialPageTitle);
        } else {
            AppCore.activePageId = 'page-profile';
        }
        
        AppCore.isInitialized = true;
        window.sikmaApp.mainAppFullyInitialized = true;
        console.log("AppCore: Main application components initialized.");
    },

    isValidPageId: (pageId) => {
        if (!pageId) return false;
        const pageElement = UI.getElement(`#${pageId}`);
        return pageElement && pageElement.classList.contains('page-content');
    },

    _initSidebar: () => {
        if (AppCore.sidebarToggleBtn && AppCore.pageSidebar) {
            AppCore.sidebarToggleBtn.removeEventListener('click', AppCore._handleSidebarToggle);
            AppCore.sidebarToggleBtn.addEventListener('click', AppCore._handleSidebarToggle);
            const savedSidebarState = localStorage.getItem('sidebarCollapsed');
            AppCore._setSidebarState(savedSidebarState === 'true', false);
        }
    },

    _handleSidebarToggle: () => {
        const isCollapsed = AppCore.pageSidebar.classList.contains('collapsed');
        AppCore._setSidebarState(!isCollapsed);
    },

    _setSidebarState: (collapsed, animate = true) => {
        if (!AppCore.pageSidebar || !AppCore.mainContentWrapper || !AppCore.sidebarToggleBtn) return;

        const icon = AppCore.sidebarToggleBtn.querySelector('i');
        const elementsToAnimate = [AppCore.pageSidebar, AppCore.mainContentWrapper];

        elementsToAnimate.forEach(el => el.style.transition = animate ? '' : 'none');

        if (collapsed) {
            AppCore.pageSidebar.classList.add('collapsed');
            AppCore.mainContentWrapper.classList.add('sidebar-collapsed');
            if (icon) { 
                icon.classList.remove('fa-chevron-left'); 
                icon.classList.add('fa-chevron-right'); 
            }
            localStorage.setItem('sidebarCollapsed', 'true');
        } else {
            AppCore.pageSidebar.classList.remove('collapsed');
            AppCore.mainContentWrapper.classList.remove('sidebar-collapsed');
            if (icon) { 
                icon.classList.remove('fa-chevron-right'); 
                icon.classList.add('fa-chevron-left'); 
            }
            localStorage.setItem('sidebarCollapsed', 'false');
        }
        
        if (!animate) {
            setTimeout(() => elementsToAnimate.forEach(el => el.style.transition = ''), 50);
        }
    },

    _initTheme: () => {
        const themeToggleHandler = function() { // 'this' will refer to the checkbox element
            AppCore._applyTheme(this.checked ? 'dark-theme' : 'light-theme', true);
        };

        if (AppCore.darkModeToggleSettings) {
            AppCore.darkModeToggleSettings.removeEventListener('change', themeToggleHandler);
            AppCore.darkModeToggleSettings.addEventListener('change', themeToggleHandler);
        }
        if (AppCore.darkModeToggleHeader) {
            AppCore.darkModeToggleHeader.removeEventListener('change', themeToggleHandler);
            AppCore.darkModeToggleHeader.addEventListener('change', themeToggleHandler);
        }

        const cookieTheme = document.cookie.split('; ').find(row => row.startsWith('theme='))?.split('=')[1];
        const storedTheme = cookieTheme || localStorage.getItem('theme') || 'light-theme';
        AppCore._applyTheme(storedTheme, false);
    },

    _applyTheme: (theme, fromUserInteraction = false) => {
        const isDark = theme === 'dark-theme';
        document.body.classList.toggle('dark-theme', isDark);
        document.body.classList.toggle('light-theme', !isDark);

        if (AppCore.darkModeToggleSettings) AppCore.darkModeToggleSettings.checked = isDark;
        if (AppCore.darkModeToggleHeader) AppCore.darkModeToggleHeader.checked = isDark;

        if (fromUserInteraction) {
            const cookieOptions = ";path=/;max-age=" + (60 * 60 * 24 * 30) + ";SameSite=Lax";
            document.cookie = `theme=${theme}${cookieOptions}`;
            localStorage.setItem('theme', theme);
        }
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: theme } }));
    },

    _initNavigation: () => {
        AppCore.navLinks.forEach(link => {
            link.removeEventListener('click', AppCore._handleNavLinkClick);
            link.addEventListener('click', AppCore._handleNavLinkClick);
        });
        window.addEventListener('popstate', AppCore._handlePopState);
    },

    _handleNavLinkClick: function(e) {
        e.preventDefault();
        const pageId = this.dataset.page;
        const pageTitle = this.querySelector('.nav-text')?.textContent || 'Halaman';

        if (AppCore.isNavigationRestricted && pageId !== AppCore.allowedPageDuringRestriction) {
            UI.showMessage(AppCore.pageHeader || AppCore.mainContentWrapper, 'Harap lengkapi profil Anda terlebih dahulu untuk mengakses halaman ini.', 'warning', 3000);
            return;
        }
        AppCore.navigateToPage(pageId, this, pageTitle);
    },

    _handlePopState: (event) => {
        const pageId = event.state?.pageId || (window.location.hash.substring(1) || 'page-home');
        const navLink = UI.getElement(`.navigation ul li a[data-page="${pageId}"]`);
        const pageTitle = navLink?.querySelector('.nav-text')?.textContent || 'Halaman';
        
        if (AppCore.isValidPageId(pageId)) {
            AppCore.navigateToPage(pageId, navLink, pageTitle, false);
        } else {
            AppCore.navigateToPage('page-home', UI.getElement('.navigation ul li a[data-page="page-home"]'), 'Dashboard', false);
        }
    },

    navigateToPage: (pageId, clickedElement = null, pageTitleSuffix = null, addToHistory = true) => {
        if (!AppCore.isValidPageId(pageId)) {
            console.warn(`AppCore: Page with id "${pageId}" not found. Redirecting to home.`);
            pageId = 'page-home';
            clickedElement = UI.getElement(`.navigation ul li a[data-page="page-home"]`);
            pageTitleSuffix = 'Dashboard';
        }
        
        AppCore.activePageId = pageId;
        AppCore.pages.forEach(page => UI.toggleClass(page, 'active', page.id === pageId));

        AppCore.navLinks.forEach(link => link.classList.remove('active-link'));
        const targetNavLink = clickedElement || UI.getElement(`.navigation ul li a[data-page="${pageId}"]`);
        if (targetNavLink) {
            targetNavLink.classList.add('active-link');
        }
        
        const baseTitle = window.sikmaApp.appName || 'SIKMA';
        let newTitle = baseTitle;
        if (pageTitleSuffix && pageTitleSuffix.toLowerCase() !== 'utama' && pageTitleSuffix.toLowerCase() !== 'dashboard') {
            newTitle = `${baseTitle} - ${pageTitleSuffix}`;
        } else if (pageId === 'page-home' && (pageTitleSuffix.toLowerCase() === 'utama' || pageTitleSuffix.toLowerCase() === 'dashboard')) {
            newTitle = `${baseTitle} - Dashboard`;
        } else if (pageTitleSuffix) {
            newTitle = `${baseTitle} - ${pageTitleSuffix}`;
        }

        document.title = newTitle;

        if (addToHistory) {
            const newUrl = `#${pageId}`;
            history.pushState({ pageId: pageId }, newTitle, newUrl);
        }

        if (AppCore.mainContentWrapper) AppCore.mainContentWrapper.scrollTop = 0;

        switch (pageId) {
            case 'page-home':
                if (typeof PageHome !== 'undefined' && typeof PageHome.loadPageData === 'function') PageHome.loadPageData();
                else if (typeof PageHome !== 'undefined' && typeof PageHome.initialize === 'function') PageHome.initialize();
                break;
            case 'page-profile':
                if (typeof PageProfile !== 'undefined' && typeof PageProfile.loadPageData === 'function') PageProfile.loadPageData();
                else if (typeof PageProfile !== 'undefined' && typeof PageProfile.initialize === 'function') PageProfile.initialize();
                break;
            case 'page-settings':
                if (typeof PageSettings !== 'undefined' && typeof PageSettings.loadPageData === 'function') PageSettings.loadPageData();
                else if (typeof PageSettings !== 'undefined' && typeof PageSettings.initialize === 'function') PageSettings.initialize();
                break;
            case 'page-company-detail':
                if (typeof PageCompanyDetail !== 'undefined' && typeof PageCompanyDetail.preparePage === 'function') PageCompanyDetail.preparePage();
                break;
        }
    },
    
    _initHeaderScroll: () => {
        if (AppCore.pageHeader && AppCore.mainContentWrapper) {
            AppCore.mainContentWrapper.removeEventListener('scroll', AppCore._handleHeaderScroll);
            AppCore.mainContentWrapper.addEventListener('scroll', AppCore._handleHeaderScroll);
        }
    },

    _handleHeaderScroll: () => {
        if (!AppCore.pageHeader || !AppCore.mainContentWrapper) return;
        UI.toggleClass(AppCore.pageHeader, 'scrolled', AppCore.mainContentWrapper.scrollTop > 20);
    },

    _initGlobalEventListeners: () => {
        const mainSearchButton = UI.getElement('#mainSearchButton');
        const mainSearchInput = UI.getElement('#mainSearchInput');

        const performSearch = () => {
            const searchTerm = mainSearchInput.value.trim();
            if (!searchTerm) return;

            if (typeof PageHome !== 'undefined' && typeof PageHome.filterCompaniesBySearch === 'function') {
                if (AppCore.activePageId === 'page-home') {
                    PageHome.filterCompaniesBySearch(searchTerm);
                } else {
                    AppCore.navigateToPage('page-home', UI.getElement('a[data-page="page-home"]'), 'Dashboard');
                    setTimeout(() => {
                        if (UI.getElement('#mainSearchInput')) UI.getElement('#mainSearchInput').value = searchTerm;
                        PageHome.filterCompaniesBySearch(searchTerm);
                    }, 300);
                }
            } else {
                console.log("Global search for:", searchTerm);
                UI.showMessage(AppCore.pageHeader, `Pencarian untuk "${searchTerm}" belum diimplementasikan pada halaman ini.`, 'info');
            }
        };

        if (mainSearchButton && mainSearchInput) {
            mainSearchButton.addEventListener('click', performSearch);
            mainSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    },

    resetMainAppUI: () => {
        console.log("AppCore: Resetting main application UI...");
        UI.resetSharedUserUI();

        if (typeof PageHome !== 'undefined' && typeof PageHome.resetPage === 'function') PageHome.resetPage();
        if (typeof PageProfile !== 'undefined' && typeof PageProfile.resetPage === 'function') PageProfile.resetPage();
        if (typeof PageSettings !== 'undefined' && typeof PageSettings.resetPage === 'function') PageSettings.resetPage();
        if (typeof PageCompanyDetail !== 'undefined' && typeof PageCompanyDetail.resetPage === 'function') PageCompanyDetail.resetPage();

        ['#profileSettingsForm', '#changePasswordForm', '#fullProfileForm', '#itemEntryForm'].forEach(formId => {
            const form = UI.getElement(formId);
            if (form) UI.resetForm(form);
        });
        
        AppCore._setSidebarState(false, false);
        AppCore._applyTheme('light-theme', false);

        UI.getAllElements('.auth-message').forEach(msgDiv => UI.hideMessage(msgDiv));
        if (AppCore.pageHeader) UI.removeClass(AppCore.pageHeader, 'scrolled');

        AppCore.restrictNavigation(false);
        if(AppCore.pageSidebar) UI.removeClass(AppCore.pageSidebar, 'profile-incomplete-restricted');
        
        history.pushState("", document.title, window.location.pathname + window.location.search);

        AppCore.isInitialized = false;
        window.sikmaApp.mainAppFullyInitialized = false;
        console.log("AppCore: Main app UI reset complete.");
    },

    restrictNavigation: (shouldRestrict, allowedPageId = '') => {
        AppCore.isNavigationRestricted = shouldRestrict;
        AppCore.allowedPageDuringRestriction = allowedPageId;

        AppCore.navLinks.forEach(link => {
            const pageId = link.dataset.page;
            const isAllowed = !shouldRestrict || pageId === allowedPageId || link.id === 'nav-logout'; // Logout link by ID
            UI.toggleClass(link, 'disabled-nav-link', !isAllowed);
            if (link.parentElement) UI.toggleClass(link.parentElement, 'restricted', !isAllowed);
        });
        if (AppCore.pageSidebar) {
            UI.toggleClass(AppCore.pageSidebar, 'profile-incomplete-restricted', shouldRestrict);
        }
    },

    updatePasswordStrengthIndicator: (passwordInputEl, strengthIndicatorEl) => {
        if (!passwordInputEl || !strengthIndicatorEl) return;

        const value = passwordInputEl.value;
        let strength = 0;
        if (value.length >= 8) strength++;
        if (value.match(/[a-z]/) && value.match(/[A-Z]/)) strength++; 
        if (value.match(/\d/)) strength++;
        if (value.match(/[^a-zA-Z\d\s]/)) strength++;

        const strengthLevels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
        const strengthClasses = ['strength-0', 'strength-1', 'strength-2', 'strength-3', 'strength-4'];
        
        strengthIndicatorEl.className = 'password-strength-indicator';
        
        if (value.length > 0) {
            strengthIndicatorEl.textContent = strengthLevels[strength] || strengthLevels[0];
            strengthIndicatorEl.classList.add(strengthClasses[strength] || strengthClasses[0]);
        } else {
            strengthIndicatorEl.textContent = '';
        }
    },
};

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('appcore-styles')) {
        const style = document.createElement('style');
        style.id = 'appcore-styles';
        style.textContent = `
            .navigation ul li a.disabled-nav-link {
                opacity: 0.5;
                cursor: not-allowed !important;
            }
        `;
        document.head.appendChild(style);
    }
});
