// SikmaV2 - assets/js/page_company_detail.js

const PageCompanyDetail = {
    // DOM Elements
    pageContainer: null, // The <main id="page-company-detail"> element
    loadingIndicator: null,
    errorMessageDiv: null,
    contentContainer: null, // The div that holds all company details

    // Specific detail elements
    companyNameEl: null,
    companyCategoryTagEl: null,
    companyTypeEl: null,
    companyLogoEl: null,
    companyBannerImgEl: null,
    companyLongDescriptionEl: null,
    companyAddressEl: null,
    companyWebsiteLinkEl: null,
    companyEmailLinkEl: null,
    companyPhoneEl: null,
    whyInternCompanyNameEl: null,
    whyInternListEl: null,
    internshipInfoEl: null,
    backToExploreBtn: null,

    currentCompanyId: null, // To keep track of which company is being displayed

    initialize: () => {
        // This page is typically not "initialized" in the same way as others on load,
        // as its content is dynamic based on user interaction.
        // However, we can cache static elements and set up the back button.
        console.log("PageCompanyDetail: Initializing (caching elements)...");

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
        PageCompanyDetail.companyAddressEl = UI.getElement('#companyDetailAddress');
        PageCompanyDetail.companyWebsiteLinkEl = UI.getElement('#companyDetailWebsite');
        PageCompanyDetail.companyEmailLinkEl = UI.getElement('#companyDetailEmail');
        PageCompanyDetail.companyPhoneEl = UI.getElement('#companyDetailPhone');
        PageCompanyDetail.whyInternCompanyNameEl = UI.getElement('#whyInternCompanyName');
        PageCompanyDetail.whyInternListEl = UI.getElement('#companyDetailWhyIntern');
        PageCompanyDetail.internshipInfoEl = UI.getElement('#companyDetailInternshipInfo');
        PageCompanyDetail.backToExploreBtn = UI.getElement('#backToExploreBtn');

        if (PageCompanyDetail.backToExploreBtn) {
            PageCompanyDetail.backToExploreBtn.addEventListener('click', () => {
                // Navigate back to home or the previous relevant page
                AppCore.navigateToPage('page-home', UI.getElement('a[data-page="page-home"]'), 'Dashboard');
            });
        }
        console.log("PageCompanyDetail: Elements cached.");
    },

    resetPage: () => {
        console.log("PageCompanyDetail: Resetting page content...");
        if (PageCompanyDetail.contentContainer) UI.hideElement(PageCompanyDetail.contentContainer);
        if (PageCompanyDetail.loadingIndicator) UI.hideElement(PageCompanyDetail.loadingIndicator);
        if (PageCompanyDetail.errorMessageDiv) UI.hideElement(PageCompanyDetail.errorMessageDiv);
        
        // Reset text/src of elements to placeholders if needed, though hiding container is usually enough
        if(PageCompanyDetail.companyNameEl) PageCompanyDetail.companyNameEl.textContent = 'Nama Perusahaan';
        if(PageCompanyDetail.companyLogoEl) PageCompanyDetail.companyLogoEl.src = 'https://placehold.co/100x100/ccc/999?text=Logo';
        // ... reset other elements if they are not inside contentContainer or if you want explicit reset
        PageCompanyDetail.currentCompanyId = null;
    },

    displayCompanyDetails: async (companyId) => {
        if (!companyId) {
            console.error("PageCompanyDetail: Company ID is required.");
            return;
        }
        
        // Ensure elements are cached if not already
        if (!PageCompanyDetail.pageContainer) {
            PageCompanyDetail.initialize(); 
        }

        PageCompanyDetail.currentCompanyId = companyId;
        AppCore.navigateToPage('page-company-detail', null, 'Loading...'); // Navigate first

        if (PageCompanyDetail.loadingIndicator) UI.showElement(PageCompanyDetail.loadingIndicator);
        if (PageCompanyDetail.errorMessageDiv) UI.hideElement(PageCompanyDetail.errorMessageDiv);
        if (PageCompanyDetail.contentContainer) UI.hideElement(PageCompanyDetail.contentContainer);

        const response = await Api.getCompanyDetails(companyId);

        if (PageCompanyDetail.loadingIndicator) UI.hideElement(PageCompanyDetail.loadingIndicator);

        if (response.status === 'success' && response.company) {
            PageCompanyDetail._populateCompanyData(response.company);
            if (PageCompanyDetail.contentContainer) UI.showElement(PageCompanyDetail.contentContainer);
            // Update page title with company name
            AppCore.navigateToPage('page-company-detail', null, response.company.name || 'Detail Perusahaan');
        } else {
            if (PageCompanyDetail.errorMessageDiv) {
                PageCompanyDetail.errorMessageDiv.textContent = response.message || 'Gagal memuat detail perusahaan.';
                UI.showElement(PageCompanyDetail.errorMessageDiv);
            }
            AppCore.navigateToPage('page-company-detail', null, 'Error Memuat Data');
        }
    },

    _populateCompanyData: (companyData) => {
        if (!PageCompanyDetail.companyNameEl) { // Check if elements are ready
            console.error("PageCompanyDetail: Detail elements not initialized properly.");
            return;
        }

        PageCompanyDetail.companyNameEl.textContent = companyData.name || 'Nama Tidak Tersedia';
        
        if(PageCompanyDetail.companyCategoryTagEl) {
            PageCompanyDetail.companyCategoryTagEl.textContent = companyData.category || 'Kategori';
            // Optional: Add a class based on category for specific styling
            // PageCompanyDetail.companyCategoryTagEl.className = `category-tag tag-${(companyData.category || '').toLowerCase().replace(/[^a-z0-9]/gi, '')}`;
        }
        if(PageCompanyDetail.companyTypeEl) PageCompanyDetail.companyTypeEl.textContent = companyData.type || 'Tipe';
        
        if(PageCompanyDetail.companyLogoEl) {
            PageCompanyDetail.companyLogoEl.src = companyData.logo_url || 'https://placehold.co/100x100/ccc/999?text=Logo';
            PageCompanyDetail.companyLogoEl.alt = companyData.name ? `Logo ${companyData.name}` : 'Logo Perusahaan';
        }
        if(PageCompanyDetail.companyBannerImgEl) {
            PageCompanyDetail.companyBannerImgEl.src = companyData.image_url || 'https://placehold.co/800x300/eee/ccc?text=Banner+Perusahaan';
            PageCompanyDetail.companyBannerImgEl.alt = companyData.name ? `Banner ${companyData.name}` : 'Banner Perusahaan';
        }
        
        if(PageCompanyDetail.companyLongDescriptionEl) {
            // Sanitize HTML if description can contain it, or use textContent if it's plain text.
            // For now, assuming plain text that might have newlines.
            PageCompanyDetail.companyLongDescriptionEl.innerHTML = UI.escapeHTML(companyData.long_description || 'Deskripsi tidak tersedia.').replace(/\n/g, '<br>');
        }
        
        if(PageCompanyDetail.companyAddressEl) PageCompanyDetail.companyAddressEl.textContent = companyData.address || 'Alamat tidak tersedia';
        
        if(PageCompanyDetail.companyWebsiteLinkEl) {
            const website = companyData.website;
            if (website && website !== '#') {
                PageCompanyDetail.companyWebsiteLinkEl.href = website.startsWith('http') ? website : `https://${website}`;
                PageCompanyDetail.companyWebsiteLinkEl.textContent = website;
                PageCompanyDetail.companyWebsiteLinkEl.style.pointerEvents = 'auto';
                UI.showElement(PageCompanyDetail.companyWebsiteLinkEl.closest('li'));
            } else {
                PageCompanyDetail.companyWebsiteLinkEl.textContent = 'Tidak tersedia';
                PageCompanyDetail.companyWebsiteLinkEl.href = '#';
                PageCompanyDetail.companyWebsiteLinkEl.style.pointerEvents = 'none';
                UI.hideElement(PageCompanyDetail.companyWebsiteLinkEl.closest('li')); // Hide if no website
            }
        }
        
        if(PageCompanyDetail.companyEmailLinkEl) {
            const email = companyData.email;
            if (email) {
                PageCompanyDetail.companyEmailLinkEl.href = `mailto:${email}`;
                PageCompanyDetail.companyEmailLinkEl.textContent = email;
                PageCompanyDetail.companyEmailLinkEl.style.pointerEvents = 'auto';
                UI.showElement(PageCompanyDetail.companyEmailLinkEl.closest('li'));
            } else {
                PageCompanyDetail.companyEmailLinkEl.textContent = 'Tidak tersedia';
                PageCompanyDetail.companyEmailLinkEl.href = '#';
                 PageCompanyDetail.companyEmailLinkEl.style.pointerEvents = 'none';
                UI.hideElement(PageCompanyDetail.companyEmailLinkEl.closest('li'));
            }
        }
        
        if(PageCompanyDetail.companyPhoneEl) {
            if (companyData.phone) {
                PageCompanyDetail.companyPhoneEl.textContent = companyData.phone;
                UI.showElement(PageCompanyDetail.companyPhoneEl.closest('li'));
            } else {
                PageCompanyDetail.companyPhoneEl.textContent = 'Tidak tersedia';
                UI.hideElement(PageCompanyDetail.companyPhoneEl.closest('li'));
            }
        }

        if(PageCompanyDetail.whyInternCompanyNameEl) PageCompanyDetail.whyInternCompanyNameEl.textContent = companyData.name || 'Perusahaan Ini';
        
        if(PageCompanyDetail.whyInternListEl) {
            PageCompanyDetail.whyInternListEl.innerHTML = ''; // Clear previous
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

        if(PageCompanyDetail.internshipInfoEl) {
            PageCompanyDetail.internshipInfoEl.innerHTML = UI.escapeHTML(companyData.internship_application_info || 'Informasi lebih lanjut mengenai proses lamaran magang dapat ditanyakan langsung ke perusahaan terkait.').replace(/\n/g, '<br>');
        }
    }
};

// Initialize static parts of the page detail module when DOM is ready,
// even if it's not the active page. This sets up the back button.
document.addEventListener('DOMContentLoaded', () => {
    // Call initialize only once. displayCompanyDetails will call it if needed.
    if (UI.getElement('#page-company-detail')) { // Only init if the page structure exists
        PageCompanyDetail.initialize();
    }
});