// SikmaV3 - assets/js/page_company_detail.js (Diperbarui)

const PageCompanyDetail = {
    // Default values
    DEFAULT_LOGO_URL: 'https://placehold.co/100x100/ccc/999?text=Logo',
    DEFAULT_BANNER_URL: 'https://placehold.co/800x380/eee/ccc?text=Banner+Perusahaan',

    // DOM Elements
    pageContainer: null,
    loadingIndicator: null,
    errorMessageDiv: null,
    contentContainer: null,

    companyNameEl: null,
    companyCategoryTagEl: null,
    companyTypeEl: null,
    companyLogoEl: null,
    companyBannerImgEl: null,
    companyLongDescriptionEl: null,
    companyRelevantTechSection: null,
    companyRelevantTechContainer: null,
    companyAddressEl: null,
    companyWebsiteLinkEl: null,
    companyWebsiteItemEl: null,
    companyEmailLinkEl: null,
    companyEmailItemEl: null,
    companyPhoneEl: null,
    companyPhoneItemEl: null,
    whyInternCompanyNameEl: null,
    whyInternListEl: null,
    internshipInfoEl: null,
    backToExploreBtn: null,

    currentCompanyId: null,
    isPageInitialized: false,

    initialize: () => {
        if (PageCompanyDetail.isPageInitialized) return;
        console.log("PageCompanyDetail: Initializing (caching static elements)...");

        PageCompanyDetail.pageContainer = UI.getElement('#page-company-detail');
        PageCompanyDetail.loadingIndicator = UI.getElement('#companyDetailLoading');
        PageCompanyDetail.errorMessageDiv = UI.getElement('#companyDetailErrorMessage');
        PageCompanyDetail.contentContainer = UI.getElement('#companyDetailContentContainer');

        PageCompanyDetail.companyNameEl = UI.getElement('#companyDetailName');
        PageCompanyDetail.companyCategoryTagEl = UI.getElement('#companyDetailCategoryTag');
        PageCompanyDetail.companyTypeEl = UI.getElement('#companyDetailType');
        PageCompanyDetail.companyLogoEl = UI.getElement('#companyDetailLogo');
        PageCompanyDetail.companyBannerImgEl = UI.getElement('#companyDetailBannerImg');
        PageCompanyDetail.companyLongDescriptionEl = UI.getElement('#companyDetailLongDescription');
        PageCompanyDetail.companyRelevantTechSection = UI.getElement('#companyRelevantTechSection');
        PageCompanyDetail.companyRelevantTechContainer = UI.getElement('#companyDetailRelevantTech');
        PageCompanyDetail.companyAddressEl = UI.getElement('#companyDetailAddress');
        
        PageCompanyDetail.companyWebsiteLinkEl = UI.getElement('#companyDetailWebsite');
        PageCompanyDetail.companyWebsiteItemEl = UI.getElement('#companyDetailWebsiteItem');
        PageCompanyDetail.companyEmailLinkEl = UI.getElement('#companyDetailEmail');
        PageCompanyDetail.companyEmailItemEl = UI.getElement('#companyDetailEmailItem');
        PageCompanyDetail.companyPhoneEl = UI.getElement('#companyDetailPhone');
        PageCompanyDetail.companyPhoneItemEl = UI.getElement('#companyDetailPhoneItem');
        
        PageCompanyDetail.whyInternCompanyNameEl = UI.getElement('#whyInternCompanyName');
        PageCompanyDetail.whyInternListEl = UI.getElement('#companyDetailWhyIntern');
        PageCompanyDetail.internshipInfoEl = UI.getElement('#companyDetailInternshipInfo');
        PageCompanyDetail.backToExploreBtn = UI.getElement('#backToExploreBtn');

        if (PageCompanyDetail.backToExploreBtn) {
            PageCompanyDetail.backToExploreBtn.removeEventListener('click', PageCompanyDetail._handleBackButtonClick);
            PageCompanyDetail.backToExploreBtn.addEventListener('click', PageCompanyDetail._handleBackButtonClick);
        }
        PageCompanyDetail.isPageInitialized = true;
        console.log("PageCompanyDetail: Basic initialization complete.");
    },

    _handleBackButtonClick: () => {
        if (AppCore && typeof AppCore.navigateToPage === 'function') {
            AppCore.navigateToPage('page-home', UI.getElement('a[data-page="page-home"]'), 'Dashboard');
        } else {
            window.location.hash = '#page-home';
        }
    },

    preparePage: () => {
        if (!PageCompanyDetail.isPageInitialized) {
            PageCompanyDetail.initialize();
        }
        if (!PageCompanyDetail.currentCompanyId && PageCompanyDetail.contentContainer && PageCompanyDetail.contentContainer.style.display !== 'none') {
            PageCompanyDetail.resetPage();
            if (PageCompanyDetail.errorMessageDiv) {
                UI.showElement(PageCompanyDetail.errorMessageDiv, 'block');
                PageCompanyDetail.errorMessageDiv.innerHTML = `<p><i class="fas fa-info-circle"></i> Pilih perusahaan dari halaman utama untuk melihat detailnya.</p>`;
            }
        }
    },
    
    _setElementText: (element, text, defaultText = '') => {
        if (element) element.textContent = UI.escapeHTML(text || defaultText);
    },

    _setElementSrc: (element, src, defaultSrc, altText = '') => {
        if (element) {
            element.src = src || defaultSrc;
            if (altText) element.alt = UI.escapeHTML(altText);
            element.onerror = () => { element.src = defaultSrc; };
        }
    },

    _setElementHtml: (element, html, defaultHtml = '') => {
        if (element) element.innerHTML = (html || defaultHtml).replace(/\n/g, '<br>');
    },

    resetPage: () => {
        console.log("PageCompanyDetail: Resetting page content...");
        if (PageCompanyDetail.contentContainer) UI.hideElement(PageCompanyDetail.contentContainer);
        if (PageCompanyDetail.loadingIndicator) UI.hideElement(PageCompanyDetail.loadingIndicator);
        if (PageCompanyDetail.errorMessageDiv) UI.hideElement(PageCompanyDetail.errorMessageDiv);
        
        PageCompanyDetail._setElementText(PageCompanyDetail.companyNameEl, 'Nama Perusahaan');
        PageCompanyDetail._setElementText(PageCompanyDetail.companyCategoryTagEl, 'Kategori');
        PageCompanyDetail._setElementText(PageCompanyDetail.companyTypeEl, 'Tipe');
        PageCompanyDetail._setElementSrc(PageCompanyDetail.companyLogoEl, '', PageCompanyDetail.DEFAULT_LOGO_URL, 'Logo Perusahaan');
        PageCompanyDetail._setElementSrc(PageCompanyDetail.companyBannerImgEl, '', PageCompanyDetail.DEFAULT_BANNER_URL, 'Banner Perusahaan');
        PageCompanyDetail._setElementHtml(PageCompanyDetail.companyLongDescriptionEl, 'Deskripsi akan dimuat...');
        
        if (PageCompanyDetail.companyRelevantTechContainer) PageCompanyDetail.companyRelevantTechContainer.innerHTML = '';
        if (PageCompanyDetail.companyRelevantTechSection) UI.hideElement(PageCompanyDetail.companyRelevantTechSection);
        
        PageCompanyDetail._setElementText(PageCompanyDetail.companyAddressEl, 'Alamat akan dimuat...');
        
        [PageCompanyDetail.companyWebsiteLinkEl, PageCompanyDetail.companyEmailLinkEl].forEach(el => {
            if (el) { el.href = '#'; el.textContent = 'Memuat...'; }
        });
        PageCompanyDetail._setElementText(PageCompanyDetail.companyPhoneEl, 'Memuat...');
        [PageCompanyDetail.companyWebsiteItemEl, PageCompanyDetail.companyEmailItemEl, PageCompanyDetail.companyPhoneItemEl].forEach(el => {
            if (el) UI.hideElement(el);
        });

        PageCompanyDetail._setElementText(PageCompanyDetail.whyInternCompanyNameEl, 'Perusahaan Ini');
        PageCompanyDetail._setElementHtml(PageCompanyDetail.whyInternListEl, '<li>Informasi akan dimuat...</li>');
        PageCompanyDetail._setElementHtml(PageCompanyDetail.internshipInfoEl, 'Informasi akan dimuat...');
        
        PageCompanyDetail.currentCompanyId = null;
    },

    displayCompanyDetails: async (companyId) => {
        if (!companyId) {
            console.error("PageCompanyDetail: Company ID is required.");
            PageCompanyDetail.resetPage();
            if (PageCompanyDetail.errorMessageDiv) {
                UI.showElement(PageCompanyDetail.errorMessageDiv, 'block');
                PageCompanyDetail.errorMessageDiv.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ID Perusahaan tidak valid untuk menampilkan detail.</p>`;
            }
            AppCore.navigateToPage('page-company-detail', null, 'Error Data Perusahaan');
            return;
        }
        
        if (!PageCompanyDetail.isPageInitialized) {
            PageCompanyDetail.initialize(); 
        }

        PageCompanyDetail.currentCompanyId = companyId;
        if (AppCore.activePageId !== 'page-company-detail') {
            AppCore.navigateToPage('page-company-detail', null, 'Memuat Detail Perusahaan...');
        } else {
            document.title = `${window.sikmaApp.appName || 'SIKMA'} - Memuat Detail Perusahaan...`;
        }

        PageCompanyDetail.resetPageVisuals();
        if (PageCompanyDetail.loadingIndicator) UI.showElement(PageCompanyDetail.loadingIndicator, 'block');

        const response = await Api.getCompanyDetails(companyId);

        if (PageCompanyDetail.loadingIndicator) UI.hideElement(PageCompanyDetail.loadingIndicator);

        if (response.status === 'success' && response.company) {
            PageCompanyDetail._populateCompanyData(response.company);
            if (PageCompanyDetail.contentContainer) UI.showElement(PageCompanyDetail.contentContainer, 'block');
            document.title = `${window.sikmaApp.appName || 'SIKMA'} - ${response.company.name || 'Detail Perusahaan'}`;
        } else {
            if (PageCompanyDetail.errorMessageDiv) {
                UI.showElement(PageCompanyDetail.errorMessageDiv, 'block');
                PageCompanyDetail.errorMessageDiv.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ${UI.escapeHTML(response.message || 'Gagal memuat detail perusahaan.')}</p>`;
            }
            document.title = `${window.sikmaApp.appName || 'SIKMA'} - Error Memuat Data`;
        }
    },
    
    resetPageVisuals: () => {
        if (PageCompanyDetail.contentContainer) UI.hideElement(PageCompanyDetail.contentContainer);
        if (PageCompanyDetail.loadingIndicator) UI.hideElement(PageCompanyDetail.loadingIndicator); // Ensure loading is hidden before showing new loading
        if (PageCompanyDetail.errorMessageDiv) UI.hideElement(PageCompanyDetail.errorMessageDiv);
    },

    _populateCompanyData: (companyData) => {
        if (!PageCompanyDetail.companyNameEl) { 
            console.error("PageCompanyDetail: Detail elements not initialized properly for population.");
            return;
        }

        PageCompanyDetail._setElementText(PageCompanyDetail.companyNameEl, companyData.name, 'Nama Tidak Tersedia');
        
        if (PageCompanyDetail.companyCategoryTagEl) {
            PageCompanyDetail.companyCategoryTagEl.textContent = UI.escapeHTML(companyData.category || 'Kategori');
            const tagClass = `tag-${(companyData.category || 'lainnya').toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/&/g, 'and')}`;
            PageCompanyDetail.companyCategoryTagEl.className = `category-tag ${tagClass}`;
        }
        PageCompanyDetail._setElementText(PageCompanyDetail.companyTypeEl, companyData.type, 'Tipe');
        
        PageCompanyDetail._setElementSrc(PageCompanyDetail.companyLogoEl, companyData.logo_url, PageCompanyDetail.DEFAULT_LOGO_URL, companyData.name ? `Logo ${companyData.name}` : 'Logo Perusahaan');
        PageCompanyDetail._setElementSrc(PageCompanyDetail.companyBannerImgEl, companyData.image_url, PageCompanyDetail.DEFAULT_BANNER_URL, companyData.name ? `Banner ${companyData.name}` : 'Banner Perusahaan');
        
        PageCompanyDetail._setElementHtml(PageCompanyDetail.companyLongDescriptionEl, companyData.long_description, 'Deskripsi tidak tersedia.');

        if (PageCompanyDetail.companyRelevantTechContainer && PageCompanyDetail.companyRelevantTechSection) {
            PageCompanyDetail.companyRelevantTechContainer.innerHTML = ''; 
            if (companyData.relevant_tech && Array.isArray(companyData.relevant_tech) && companyData.relevant_tech.length > 0) {
                companyData.relevant_tech.forEach(tech => {
                    const tag = document.createElement('span');
                    tag.className = 'tech-tag';
                    tag.textContent = UI.escapeHTML(tech);
                    PageCompanyDetail.companyRelevantTechContainer.appendChild(tag);
                });
                UI.showElement(PageCompanyDetail.companyRelevantTechSection, 'block');
            } else {
                UI.hideElement(PageCompanyDetail.companyRelevantTechSection);
            }
        }
        
        PageCompanyDetail._setElementText(PageCompanyDetail.companyAddressEl, companyData.address, 'Alamat tidak tersedia');
        
        const setupContactItem = (itemEl, linkOrTextEl, value, type) => {
            if (value && value.trim() !== '' && value.trim() !== '#') {
                linkOrTextEl.textContent = UI.escapeHTML(value);
                if (type === 'website' && linkOrTextEl.tagName === 'A') linkOrTextEl.href = value.startsWith('http') ? value : `https://${value}`;
                else if (type === 'email' && linkOrTextEl.tagName === 'A') linkOrTextEl.href = `mailto:${value}`;
                UI.showElement(itemEl, 'flex');
            } else {
                UI.hideElement(itemEl);
            }
        };
        setupContactItem(PageCompanyDetail.companyWebsiteItemEl, PageCompanyDetail.companyWebsiteLinkEl, companyData.website, 'website');
        setupContactItem(PageCompanyDetail.companyEmailItemEl, PageCompanyDetail.companyEmailLinkEl, companyData.email, 'email');
        setupContactItem(PageCompanyDetail.companyPhoneItemEl, PageCompanyDetail.companyPhoneEl, companyData.phone, 'phone');

        PageCompanyDetail._setElementText(PageCompanyDetail.whyInternCompanyNameEl, companyData.name, 'Perusahaan Ini');
        
        if (PageCompanyDetail.whyInternListEl) {
            PageCompanyDetail.whyInternListEl.innerHTML = '';
            if (companyData.why_intern_here && Array.isArray(companyData.why_intern_here) && companyData.why_intern_here.length > 0) {
                companyData.why_intern_here.forEach(point => {
                    const li = document.createElement('li');
                    li.textContent = UI.escapeHTML(point);
                    PageCompanyDetail.whyInternListEl.appendChild(li);
                });
            } else {
                PageCompanyDetail.whyInternListEl.innerHTML = '<li>Informasi tidak tersedia saat ini.</li>';
            }
        }

        PageCompanyDetail._setElementHtml(PageCompanyDetail.internshipInfoEl, companyData.internship_application_info, 'Informasi lebih lanjut mengenai proses lamaran magang dapat ditanyakan langsung ke perusahaan terkait.');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (UI.getElement('#page-company-detail')) {
        PageCompanyDetail.initialize();
    }
});
