// SikmaV2 - assets/js/page_home.js

const PageHome = {
    // DOM Elements
    recommendationSwiperWrapper: null,
    companyCategoryFilter: null,
    companyGrid: null,
    activeFilterDisplay: null,
    noResultsMessage: null,

    // State
    recommendationSwiperInstance: null,
    allCompanyCardsData: [], // Akan menyimpan data asli kartu perusahaan untuk filtering

    initialize: () => {
        console.log("PageHome: Initializing...");

        PageHome.recommendationSwiperWrapper = UI.getElement('#recommendationSwiperWrapper');
        PageHome.companyCategoryFilter = UI.getElement('#companyCategoryFilter');
        PageHome.companyGrid = UI.getElement('#companyGrid');
        PageHome.activeFilterDisplay = UI.getElement('#activeFilterDisplay');
        PageHome.noResultsMessage = UI.getElement('#noResultsMessage');


        PageHome._initSwiper();
        PageHome._initCategoryFilter();
        PageHome._initCompanyCardLinks(); // Untuk kartu yang mungkin sudah ada di HTML
        PageHome._loadInitialCompanyData(); // Jika data perusahaan dimuat dinamis

        console.log("PageHome: Initialized.");
    },

    resetPage: () => {
        console.log("PageHome: Resetting page...");
        if (PageHome.recommendationSwiperInstance && typeof PageHome.recommendationSwiperInstance.destroy === 'function') {
            try {
                PageHome.recommendationSwiperInstance.destroy(true, true);
            } catch(e) { console.warn("Swiper destroy error:", e); }
            PageHome.recommendationSwiperInstance = null;
        }
        if (PageHome.recommendationSwiperWrapper) PageHome.recommendationSwiperWrapper.innerHTML = ''; // Clear slides
        if (PageHome.companyGrid) PageHome.companyGrid.innerHTML = ''; // Clear company cards
        if (PageHome.companyCategoryFilter) PageHome.companyCategoryFilter.value = ''; // Reset filter
        if (PageHome.activeFilterDisplay) UI.hideElement(PageHome.activeFilterDisplay);
        if (PageHome.noResultsMessage) UI.hideElement(PageHome.noResultsMessage);
        PageHome.allCompanyCardsData = [];
    },

    _initSwiper: () => {
        const swiperContainer = UI.getElement('.recommendation-swiper-container');
        if (swiperContainer && typeof Swiper !== 'undefined') {
            if (PageHome.recommendationSwiperInstance) {
                try {
                    PageHome.recommendationSwiperInstance.destroy(true, true);
                } catch(e) { console.warn("Swiper destroy error on re-init:", e); }
            }
            PageHome.recommendationSwiperInstance = new Swiper(swiperContainer, {
                effect: 'slide', // or 'coverflow', 'cube' etc.
                slidesPerView: 1.2,
                spaceBetween: 15,
                centeredSlides: false, // Set true if you want the active slide centered
                loop: true, // Consider setting to false if few slides initially
                autoplay: {
                    delay: 4000, // Increased delay
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
                    640: { slidesPerView: 1.8, spaceBetween: 20 }, // Adjusted for better view
                    768: { slidesPerView: 2.2, spaceBetween: 20 },
                    1024: { slidesPerView: 2.8, spaceBetween: 25 },
                    1200: { slidesPerView: 3.2, spaceBetween: 25 }
                }
            });
            // Add event listeners to swiper slides for navigation
            PageHome._initSwiperCardLinks();
        } else if (typeof Swiper === 'undefined') {
            console.warn("Swiper library is not loaded.");
        }
    },
    
    _initSwiperCardLinks: () => {
        if (PageHome.recommendationSwiperWrapper) {
            PageHome.recommendationSwiperWrapper.addEventListener('click', (event) => {
                const cardLink = event.target.closest('.recommendation-card[data-companyid], .btn-detail[data-companyid]');
                if (cardLink) {
                    event.preventDefault();
                    const companyId = cardLink.dataset.companyid;
                    if (companyId && typeof PageCompanyDetail !== 'undefined' && typeof PageCompanyDetail.displayCompanyDetails === 'function') {
                        PageCompanyDetail.displayCompanyDetails(companyId);
                    } else if (companyId) { // Fallback if PageCompanyDetail module not fully loaded/integrated
                        AppCore.navigateToPage('page-company-detail', null, 'Detail Perusahaan');
                        // Attempt to call directly, assuming the page content has the function
                        if(window.fetchAndDisplayCompanyDetails) window.fetchAndDisplayCompanyDetails(companyId);
                    }
                }
            });
        }
    },

    _initCategoryFilter: () => {
        if (PageHome.companyCategoryFilter && PageHome.companyGrid && PageHome.activeFilterDisplay) {
            PageHome.companyCategoryFilter.addEventListener('change', function() {
                const selectedCategory = this.value; // Value is already lowercase from HTML or should be
                PageHome.filterCompanyGrid(selectedCategory);
            });
        }
    },

    filterCompanyGrid: (selectedCategory) => {
        const companyCards = PageHome.companyGrid.querySelectorAll('.card.card-hover-effect');
        let visibleCount = 0;
        selectedCategory = selectedCategory.toLowerCase();

        companyCards.forEach(card => {
            const cardCategory = card.dataset.category ? card.dataset.category.toLowerCase() : "";
            if (selectedCategory === "" || cardCategory === selectedCategory) {
                UI.removeClass(card, 'hidden-by-filter');
                visibleCount++;
            } else {
                UI.addClass(card, 'hidden-by-filter');
            }
        });

        if (selectedCategory === "") {
            UI.hideElement(PageHome.activeFilterDisplay);
            PageHome.activeFilterDisplay.textContent = '';
        } else {
            const selectedOptionText = PageHome.companyCategoryFilter.options[PageHome.companyCategoryFilter.selectedIndex].text;
            PageHome.activeFilterDisplay.textContent = `Filter aktif: ${selectedOptionText} (${visibleCount} hasil)`;
            UI.showElement(PageHome.activeFilterDisplay);
        }

        if (visibleCount === 0 && selectedCategory !== "") {
            if(PageHome.noResultsMessage) UI.showElement(PageHome.noResultsMessage);
        } else {
            if(PageHome.noResultsMessage) UI.hideElement(PageHome.noResultsMessage);
        }
    },
    
    filterCompaniesBySearch: (searchTerm) => {
        if (!PageHome.companyGrid) return;
        searchTerm = searchTerm.toLowerCase().trim();
        const companyCards = PageHome.companyGrid.querySelectorAll('.card.card-hover-effect');
        let visibleCount = 0;
        const currentCategoryFilter = PageHome.companyCategoryFilter ? PageHome.companyCategoryFilter.value.toLowerCase() : "";

        companyCards.forEach(card => {
            const cardTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || "";
            const cardDescription = card.querySelector('.card-creator')?.textContent.toLowerCase() || "";
            const cardCategory = card.dataset.category ? card.dataset.category.toLowerCase() : "";
            
            const matchesSearch = cardTitle.includes(searchTerm) || cardDescription.includes(searchTerm);
            const matchesCategory = (currentCategoryFilter === "" || cardCategory === currentCategoryFilter);

            if (matchesSearch && matchesCategory) {
                UI.removeClass(card, 'hidden-by-filter');
                visibleCount++;
            } else {
                UI.addClass(card, 'hidden-by-filter');
            }
        });

        if (PageHome.activeFilterDisplay) {
            let filterText = "";
            if (currentCategoryFilter !== "") {
                 const selectedOptionText = PageHome.companyCategoryFilter.options[PageHome.companyCategoryFilter.selectedIndex].text;
                 filterText += `Kategori: ${selectedOptionText}`;
            }
            if (searchTerm !== "") {
                filterText += (filterText ? " & " : "") + `Pencarian: "${searchTerm}"`;
            }
            
            if (filterText) {
                PageHome.activeFilterDisplay.textContent = `Filter aktif: ${filterText} (${visibleCount} hasil)`;
                UI.showElement(PageHome.activeFilterDisplay);
            } else {
                 UI.hideElement(PageHome.activeFilterDisplay);
            }
        }
         if (visibleCount === 0 && (searchTerm !== "" || currentCategoryFilter !== "")) {
            if(PageHome.noResultsMessage) UI.showElement(PageHome.noResultsMessage);
        } else {
            if(PageHome.noResultsMessage) UI.hideElement(PageHome.noResultsMessage);
        }
    },

    _initCompanyCardLinks: () => {
        if (PageHome.companyGrid) {
            // Use event delegation for dynamically added cards too
            PageHome.companyGrid.addEventListener('click', (event) => {
                const cardLink = event.target.closest('.company-detail-link');
                if (cardLink) {
                    event.preventDefault();
                    const companyId = cardLink.dataset.companyid;
                    if (companyId && typeof PageCompanyDetail !== 'undefined' && typeof PageCompanyDetail.displayCompanyDetails === 'function') {
                        PageCompanyDetail.displayCompanyDetails(companyId);
                    } else if (companyId) { // Fallback
                        AppCore.navigateToPage('page-company-detail', null, 'Detail Perusahaan');
                        if(window.fetchAndDisplayCompanyDetails) window.fetchAndDisplayCompanyDetails(companyId); // Legacy call if needed
                    }
                }
            });
        }
    },

    _loadInitialCompanyData: async () => {
        // Placeholder: In a real app, this would fetch data from an API
        // For now, we assume some cards might be hardcoded in home_content.php
        // or we can populate with dummy data.
        // If you have an API endpoint like Api.getCompanyList(), call it here.
        
        // Example of storing existing card data if they are already in DOM
        const existingCards = PageHome.companyGrid ? PageHome.companyGrid.querySelectorAll('.card.card-hover-effect') : [];
        if (existingCards.length > 0) {
            PageHome.allCompanyCardsData = Array.from(existingCards).map(card => ({
                id: card.dataset.companyId,
                category: card.dataset.category,
                element: card // Store the element itself or its HTML
            }));
        } else {
            // If grid is empty, populate with some dummy data for demonstration
            const dummyCompanies = [
                { id: '1', name: 'PT Anjas Sejati (Dinamis)', category: 'Teknologi', type: 'PT', description: 'Pengembangan solusi AI inovatif.', imageUrl: 'https://placehold.co/325x200/A9CCE3/2C3E50?text=Anjas+Dinamis&font=Roboto' },
                { id: '2', name: 'PT Maju Bersama (Dinamis)', category: 'Keuangan', type: 'BUMN', description: 'Lembaga keuangan terpercaya.', imageUrl: 'https://placehold.co/325x200/A2D9CE/1E8449?text=Maju+Dinamis&font=Roboto' },
                { id: '3', name: 'PT Cipta Karya (Dinamis)', category: 'Manufaktur', type: 'Swasta', description: 'Produsen barang konsumsi.', imageUrl: 'https://placehold.co/325x200/F5B7B1/922B21?text=Cipta+Dinamis&font=Roboto' },
                { id: 'dummy-pertamina', name: 'Pertamina (Dinamis)', category: 'Energi & Pertambangan', type: 'BUMN', description: 'Kesempatan emas berkarir.', imageUrl: 'https://placehold.co/325x200/E67E22/FFFFFF?text=Pertamina+D&font=Poppins' },
                { id: 'dummy-kai', name: 'PT. KAI (Dinamis)', category: 'Transportasi & Logistik', type: 'BUMN', description: 'Tulang punggung transportasi.', imageUrl: 'https://placehold.co/325x200/2980B9/FFFFFF?text=KAI+D&font=Poppins' },
            ];
            dummyCompanies.forEach(company => PageHome.addCompanyToGrid(company));
            // After adding, re-capture all cards for allCompanyCardsData
             const dynamicCards = PageHome.companyGrid ? PageHome.companyGrid.querySelectorAll('.card.card-hover-effect') : [];
             PageHome.allCompanyCardsData = Array.from(dynamicCards).map(card => ({
                id: card.dataset.companyId,
                category: card.dataset.category,
                element: card
            }));
        }
    },

    addCompanyToGrid: (companyData) => {
        if (!PageHome.companyGrid) return;

        const card = document.createElement('div');
        card.className = `card card-hover-effect company-card-${companyData.id}`; // Unique class if needed
        card.dataset.companyId = companyData.id;
        card.dataset.category = companyData.category; // Make sure category is consistent (e.g., lowercase)

        // Sanitize data before inserting into HTML
        const name = UI.escapeHTML(companyData.name);
        const categoryDisplay = UI.escapeHTML(companyData.category);
        const typeDisplay = UI.escapeHTML(companyData.type);
        const description = UI.escapeHTML(companyData.description);
        const imageUrl = UI.escapeHTML(companyData.imageUrl || 'https://placehold.co/325x200/ccc/999?text=No+Image');

        card.innerHTML = `
            <div class="card-img"></div> <!-- Placeholder for structure, not displayed -->
            <a href="#" class="card-link company-detail-link" data-companyid="${companyData.id}">
                <div class="card-img-hovered" style="background-image: var(--card-img-hovered-overlay), url('${imageUrl}');"></div>
            </a>
            <div class="card-info">
                <div class="card-about">
                    <span class="card-tag tag-${categoryDisplay.toLowerCase().replace(/[^a-z0-9]/gi, '')}">${categoryDisplay}</span>
                    <div class="card-time">${typeDisplay}</div>
                </div>
                <h1 class="card-title">${name}</h1>
                <div class="card-creator">${description}</div>
                <button class="btn btn-detail explore-btn-detail company-detail-link" data-companyid="${companyData.id}"><i class="fas fa-arrow-right"></i> Lihat Detail</button>
            </div>
        `;
        PageHome.companyGrid.appendChild(card);
    }
};