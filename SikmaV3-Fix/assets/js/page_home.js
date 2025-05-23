// SikmaV3 - assets/js/page_home.js (Diperbarui)

const PageHome = {
    // DOM Elements
    recommendationSwiperWrapper: null,
    recommendationSwiperContainer: null,
    noRecommendationsMessage: null,

    companyCategoryFilter: null,
    companyGrid: null,
    activeFilterDisplay: null,
    noCompanyResultsMessage: null,
    companyListLoading: null,

    // State
    recommendationSwiperInstance: null,
    allCompanyData: [],
    isPageInitialized: false,

    initialize: () => {
        if (PageHome.isPageInitialized) return;
        console.log("PageHome: Initializing (caching static elements & base listeners)...");

        PageHome.recommendationSwiperWrapper = UI.getElement('#recommendationSwiperWrapper');
        PageHome.recommendationSwiperContainer = UI.getElement('.recommendation-swiper-container');
        PageHome.noRecommendationsMessage = UI.getElement('#noRecommendationsMessage');

        PageHome.companyCategoryFilter = UI.getElement('#companyCategoryFilter');
        PageHome.companyGrid = UI.getElement('#companyGrid');
        PageHome.activeFilterDisplay = UI.getElement('#activeFilterDisplay');
        PageHome.noCompanyResultsMessage = UI.getElement('#noCompanyResultsMessage');
        PageHome.companyListLoading = UI.getElement('#companyListLoading');

        PageHome._initCategoryFilter();
        PageHome._initCompanyCardLinks();

        PageHome.isPageInitialized = true;
        console.log("PageHome: Basic initialization complete.");
    },

    loadPageData: async () => {
        console.log("PageHome: Loading page data...");
        if (!PageHome.isPageInitialized) {
            PageHome.initialize();
        }

        PageHome.resetPageVisuals();
        await PageHome._loadAndDisplayCompanies();
        PageHome._populateRecommendationSwiper();
        PageHome._initSwiper();
    },

    resetPageVisuals: () => {
        console.log("PageHome: Resetting page visuals...");
        if (PageHome.recommendationSwiperInstance && typeof PageHome.recommendationSwiperInstance.destroy === 'function') {
            try {
                PageHome.recommendationSwiperInstance.destroy(true, true);
            } catch (e) { console.warn("Swiper destroy error:", e); }
            PageHome.recommendationSwiperInstance = null;
        }
        if (PageHome.recommendationSwiperWrapper) PageHome.recommendationSwiperWrapper.innerHTML = '';
        if (PageHome.companyGrid) PageHome.companyGrid.innerHTML = '';
        
        if (PageHome.companyCategoryFilter) PageHome.companyCategoryFilter.value = '';
        if (PageHome.activeFilterDisplay) UI.hideElement(PageHome.activeFilterDisplay);
        if (PageHome.noRecommendationsMessage) UI.hideElement(PageHome.noRecommendationsMessage);
        if (PageHome.noCompanyResultsMessage) UI.hideElement(PageHome.noCompanyResultsMessage);
        if (PageHome.companyListLoading) UI.hideElement(PageHome.companyListLoading);
    },
    
    resetPage: () => {
        PageHome.resetPageVisuals();
        PageHome.allCompanyData = [];
        console.log("PageHome: Full page reset.");
    },

    _initSwiper: () => {
        if (PageHome.recommendationSwiperContainer && PageHome.recommendationSwiperWrapper && PageHome.recommendationSwiperWrapper.children.length > 0 && typeof Swiper !== 'undefined') {
            if (PageHome.recommendationSwiperInstance) {
                try {
                    PageHome.recommendationSwiperInstance.destroy(true, true);
                } catch(e) { console.warn("Swiper destroy error on re-init:", e); }
            }
            PageHome.recommendationSwiperInstance = new Swiper(PageHome.recommendationSwiperContainer, {
                effect: 'slide',
                slidesPerView: 1.2,
                spaceBetween: 15,
                centeredSlides: false,
                loop: PageHome.recommendationSwiperWrapper.children.length > 3,
                autoplay: {
                    delay: 4500,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    640: { slidesPerView: 1.8, spaceBetween: 20 },
                    768: { slidesPerView: 2.2, spaceBetween: 20 },
                    1024: { slidesPerView: 2.8, spaceBetween: 25 },
                    1200: { slidesPerView: 3.2, spaceBetween: 25 }
                }
            });
            PageHome._initSwiperCardLinks();
        } else if (typeof Swiper === 'undefined') {
            console.warn("Swiper library is not loaded.");
        } else if (PageHome.recommendationSwiperWrapper && PageHome.recommendationSwiperWrapper.children.length === 0) {
            console.log("PageHome: No slides to initialize Swiper.");
            if (PageHome.noRecommendationsMessage) UI.showElement(PageHome.noRecommendationsMessage, 'block');
        }
    },
    
    _populateRecommendationSwiper: () => {
        if (!PageHome.recommendationSwiperWrapper) return;
        PageHome.recommendationSwiperWrapper.innerHTML = '';

        const recommendedCompanies = PageHome.allCompanyData.slice(0, 5); 

        if (recommendedCompanies.length === 0) {
            if (PageHome.noRecommendationsMessage) UI.showElement(PageHome.noRecommendationsMessage, 'block');
            return;
        }
        if (PageHome.noRecommendationsMessage) UI.hideElement(PageHome.noRecommendationsMessage);

        recommendedCompanies.forEach(company => {
            const matchScore = Math.floor(Math.random() * (95 - 70 + 1)) + 70 + "%";
            const reasons = ["Cocok dengan keahlian Anda.", "Sesuai preferensi industri.", "Populer di kalangan mahasiswa.", "Lokasi strategis."];
            const matchReason = reasons[Math.floor(Math.random() * reasons.length)];

            const slide = document.createElement('div');
            slide.className = 'swiper-slide card recommendation-card';
            slide.style.backgroundImage = `url('${UI.escapeHTML(company.imageUrl || company.logo_url || 'https://placehold.co/400x240/777/fff?text=Image')}')`;
            slide.dataset.companyid = company.id;

            slide.innerHTML = `
                <div class="card-overlay"></div>
                <div class="card-content">
                    <h3>${UI.escapeHTML(company.name)}</h3>
                    <p class="card-subtitle">${UI.escapeHTML(company.category || 'Industri Umum')}</p>
                    <div class="recommendation-details">
                        <p class="match-score"><strong>Kecocokan:</strong> <span class="score-value">${matchScore}</span></p> 
                        <p class="match-reason"><strong>Alasan:</strong> <span class="reason-text">${matchReason}</span></p>
                    </div>
                    <p class="card-description">${UI.escapeHTML(company.description || 'Deskripsi tidak tersedia.')}</p>
                    <button class="btn btn-sm btn-primary btn-detail company-detail-link" data-companyid="${company.id}"><i class="fas fa-arrow-right"></i> Lihat Detail</button>
                </div>
            `;
            PageHome.recommendationSwiperWrapper.appendChild(slide);
        });
    },

    _initSwiperCardLinks: () => {
        if (PageHome.recommendationSwiperWrapper) {
            PageHome.recommendationSwiperWrapper.addEventListener('click', (event) => {
                const cardLink = event.target.closest('.recommendation-card[data-companyid], .btn-detail[data-companyid]');
                if (cardLink) {
                    event.preventDefault();
                    const companyId = cardLink.dataset.companyid;
                    PageHome._navigateToCompanyDetail(companyId);
                }
            });
        }
    },

    _initCategoryFilter: () => {
        if (PageHome.companyCategoryFilter) {
            PageHome.companyCategoryFilter.removeEventListener('change', PageHome._handleCategoryFilterChange);
            PageHome.companyCategoryFilter.addEventListener('change', PageHome._handleCategoryFilterChange);
        }
    },

    _handleCategoryFilterChange: function() {
        const selectedCategory = this.value;
        PageHome._applyFiltersAndSearch(selectedCategory, UI.getElement('#mainSearchInput')?.value.trim() || "");
    },
    
    filterCompaniesBySearch: (searchTerm) => { // Called by AppCore global search
        const currentCategoryFilter = PageHome.companyCategoryFilter ? PageHome.companyCategoryFilter.value : "";
        PageHome._applyFiltersAndSearch(currentCategoryFilter, searchTerm);
    },

    _applyFiltersAndSearch: (category, searchTerm) => {
        if (!PageHome.companyGrid) return;
        
        const currentCategory = category.toLowerCase();
        const currentSearchTerm = searchTerm.toLowerCase().trim();
        let visibleCount = 0;
        
        const companyCards = PageHome.companyGrid.querySelectorAll('.card.card-hover-effect');
        companyCards.forEach(card => {
            const cardCategory = card.dataset.category ? card.dataset.category.toLowerCase() : "";
            const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || "";
            const cardDescription = card.querySelector('.card-creator')?.textContent.toLowerCase() || ""; // Assuming description is in .card-creator
            
            const matchesCategory = (currentCategory === "" || cardCategory === currentCategory);
            const matchesSearch = (currentSearchTerm === "" || cardTitle.includes(currentSearchTerm) || cardDescription.includes(currentSearchTerm));

            if (matchesCategory && matchesSearch) {
                UI.removeClass(card, 'hidden-by-filter');
                visibleCount++;
            } else {
                UI.addClass(card, 'hidden-by-filter');
            }
        });
        PageHome._updateFilterDisplayAndNoResults(currentCategory, currentSearchTerm, visibleCount);
    },

    _updateFilterDisplayAndNoResults: (category, searchTerm, visibleCount) => {
        if (!PageHome.activeFilterDisplay || !PageHome.noCompanyResultsMessage) return;

        let filterTextParts = [];
        if (category !== "" && PageHome.companyCategoryFilter) {
            const selectedOptionText = PageHome.companyCategoryFilter.options[PageHome.companyCategoryFilter.selectedIndex].text;
            if (selectedOptionText !== "Semua Kategori") {
                 filterTextParts.push(`Kategori: ${selectedOptionText}`);
            }
        }
        if (searchTerm !== "") {
            filterTextParts.push(`Pencarian: "${UI.escapeHTML(searchTerm)}"`);
        }

        if (filterTextParts.length > 0) {
            PageHome.activeFilterDisplay.textContent = `Filter aktif: ${filterTextParts.join(' & ')} (${visibleCount} hasil)`;
            UI.showElement(PageHome.activeFilterDisplay, 'block');
        } else {
            UI.hideElement(PageHome.activeFilterDisplay);
        }

        if (visibleCount === 0 && (category !== "" || searchTerm !== "")) {
            UI.showElement(PageHome.noCompanyResultsMessage, 'block');
        } else {
            UI.hideElement(PageHome.noCompanyResultsMessage);
        }
    },

    _initCompanyCardLinks: () => {
        if (PageHome.companyGrid) {
            PageHome.companyGrid.addEventListener('click', (event) => {
                const cardLink = event.target.closest('.company-detail-link');
                if (cardLink) {
                    event.preventDefault();
                    const companyId = cardLink.dataset.companyid;
                    PageHome._navigateToCompanyDetail(companyId);
                }
            });
        }
    },

    _navigateToCompanyDetail: (companyId) => {
        if (companyId && typeof PageCompanyDetail !== 'undefined' && typeof PageCompanyDetail.displayCompanyDetails === 'function') {
            PageCompanyDetail.displayCompanyDetails(companyId);
        } else if (companyId) { // Fallback if PageCompanyDetail might not be fully ready (less likely with current AppCore flow)
            console.warn("PageCompanyDetail.displayCompanyDetails not available, attempting navigation via AppCore.");
            AppCore.navigateToPage('page-company-detail', null, 'Detail Perusahaan');
            // Consider a way to pass companyId if AppCore.navigateToPage doesn't handle parameters for this.
            // For now, this relies on PageCompanyDetail being able to pick up an ID if it's set elsewhere (e.g. URL hash manually).
        }
    },

    _loadAndDisplayCompanies: async () => {
        if (!PageHome.companyGrid || !PageHome.companyListLoading || !PageHome.noCompanyResultsMessage) return;

        UI.showElement(PageHome.companyListLoading, 'block');
        UI.hideElement(PageHome.noCompanyResultsMessage);
        PageHome.companyGrid.innerHTML = '';

        const response = await Api.getCompanyList();

        UI.hideElement(PageHome.companyListLoading);

        if (response.status === 'success' && response.companies && response.companies.length > 0) {
            PageHome.allCompanyData = response.companies;
            response.companies.forEach(company => PageHome.addCompanyToGrid(company));
        } else if (response.status === 'success' && (!response.companies || response.companies.length === 0)) {
            PageHome.allCompanyData = [];
            if (PageHome.noCompanyResultsMessage) {
                UI.showElement(PageHome.noCompanyResultsMessage, 'block');
                PageHome.noCompanyResultsMessage.innerHTML = `<p><i class="fas fa-info-circle"></i> Belum ada data perusahaan yang tersedia saat ini.</p>`;
            }
        } else {
            PageHome.allCompanyData = [];
            if (PageHome.noCompanyResultsMessage) {
                UI.showElement(PageHome.noCompanyResultsMessage, 'block');
                PageHome.noCompanyResultsMessage.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ${UI.escapeHTML(response.message || 'Gagal memuat daftar perusahaan.')}</p>`;
            }
        }
        const currentCategory = PageHome.companyCategoryFilter?.value || "";
        const currentSearchTerm = UI.getElement('#mainSearchInput')?.value.trim() || "";
        PageHome._applyFiltersAndSearch(currentCategory, currentSearchTerm); // Apply initial/empty filters
    },

    addCompanyToGrid: (companyData) => {
        if (!PageHome.companyGrid) return;

        const card = document.createElement('div');
        card.className = `card card-hover-effect company-card-${companyData.id}`;
        card.dataset.companyId = companyData.id;
        card.dataset.category = companyData.category || 'Lainnya';

        const name = UI.escapeHTML(companyData.name);
        const categoryDisplay = UI.escapeHTML(companyData.category || 'Lainnya');
        const typeDisplay = UI.escapeHTML(companyData.type || 'N/A');
        const description = UI.escapeHTML(companyData.description_short || companyData.description || 'Deskripsi tidak tersedia.'); // Prioritize short description
        const imageUrl = UI.escapeHTML(companyData.logo_url || 'https://placehold.co/325x200/ccc/999?text=No+Image'); // Use logo_url for grid
        const tagClass = `tag-${categoryDisplay.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/&/g, 'and')}`;

        card.innerHTML = `
            <div class="card-img"></div> 
            <a href="#page-company-detail?id=${companyData.id}" class="card-link company-detail-link" data-companyid="${companyData.id}" aria-label="Lihat detail untuk ${name}">
                <div class="card-img-hovered" style="background-image: var(--card-img-hovered-overlay), url('${imageUrl}');">
                    <span class="visually-hidden">Logo ${name}</span>
                </div>
            </a>
            <div class="card-info">
                <div class="card-about">
                    <span class="card-tag ${tagClass}">${categoryDisplay}</span>
                    <div class="card-time">${typeDisplay}</div>
                </div>
                <h3 class="card-title">${name}</h3> 
                <div class="card-creator">${description}</div>
                <button class="btn btn-sm btn-primary btn-detail explore-btn-detail company-detail-link" data-companyid="${companyData.id}">
                    <i class="fas fa-arrow-right"></i> Lihat Detail
                </button>
            </div>
        `;
        PageHome.companyGrid.appendChild(card);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (UI.getElement('#page-home')) { // Ensure this runs only if page-home exists
        PageHome.initialize();
    }
});
