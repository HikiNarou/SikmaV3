<!-- Konten untuk Halaman Utama (Dashboard) -->
<section class="internship-recommendations">
    <h2><i class="fas fa-star"></i> Rekomendasi Magang Untukmu</h2>
    <div class="swiper-container recommendation-swiper-container"> 
        <div class="swiper-wrapper" id="recommendationSwiperWrapper">
            <!-- Slides akan di-generate oleh JavaScript atau bisa hardcode beberapa -->
            <div class="swiper-slide card recommendation-card" style="background-image: url('https://placehold.co/400x240/E67E22/FFFFFF?text=Pertamina&font=Poppins');" data-companyid="dummy-pertamina">
                <div class="card-overlay"></div>
                <div class="card-content">
                    <h3>Pertamina</h3>
                    <p class="card-subtitle">Energi & Pertambangan</p>
                    <p class="card-description">Kesempatan emas berkarir di salah satu BUMN terbesar Indonesia.</p>
                    <button class="btn-detail company-detail-link" data-companyid="dummy-pertamina"><i class="fas fa-arrow-right"></i> Lihat Detail</button>
                </div>
            </div>
            <!-- Tambah slide lain jika perlu -->
        </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
    </div>
</section>

<section class="explore-companies">
    <div class="explore-header">
        <h2><i class="fas fa-building"></i> Jelajahi Perusahaan Lainnya</h2>
        <div class="category-filter">
            <select id="companyCategoryFilter">
                <option value="">Semua Kategori</option>
                <option value="Teknologi">Teknologi</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Manufaktur">Manufaktur</option>
                <option value="Energi & Pertambangan">Energi & Pertambangan</option>
                <option value="Transportasi & Logistik">Transportasi & Logistik</option>
                <!-- Tambahkan kategori lain jika ada -->
            </select>
        </div>
    </div>
    <div id="activeFilterDisplay" class="active-filter-display" style="display:none;"></div>
    <div class="company-grid" id="companyGrid">
        <!-- Company cards akan di-generate oleh JS dari data (dummy atau DB) -->
        <!-- Contoh card (akan dihapus/diganti oleh JS): -->
        <div class="card card-hover-effect card-1" data-company-id="1" data-category="Teknologi">
            <div class="card-img"></div>
            <a href="#" class="card-link company-detail-link" data-companyid="1">
                <div class="card-img-hovered" style="background-image: var(--card-img-hovered-overlay), url('https://placehold.co/325x200/A9CCE3/2C3E50?text=Anjas+Sejati&font=Roboto');"></div>
            </a>
            <div class="card-info">
                <div class="card-about">
                    <span class="card-tag tag-teknologi">Teknologi</span>
                    <div class="card-time">PT</div>
                </div>
                <h1 class="card-title">PT Anjas Sejati</h1>
                <div class="card-creator">Pengembangan solusi AI inovatif.</div>
                <button class="btn-detail explore-btn-detail company-detail-link" data-companyid="1"><i class="fas fa-arrow-right"></i> Lihat Detail</button>
            </div>
        </div>
         <div class="card card-hover-effect card-2" data-company-id="2" data-category="Keuangan">
            <div class="card-img"></div>
            <a href="#" class="card-link company-detail-link" data-companyid="2">
                <div class="card-img-hovered" style="background-image: var(--card-img-hovered-overlay), url('https://placehold.co/325x200/A2D9CE/1E8449?text=Maju+Bersama&font=Roboto');"></div>
            </a>
            <div class="card-info">
                <div class="card-about">
                    <span class="card-tag tag-keuangan">Keuangan</span>
                    <div class="card-time">BUMN</div>
                </div>
                <h1 class="card-title">PT Maju Bersama</h1>
                <div class="card-creator">Lembaga keuangan terpercaya.</div>
                <button class="btn-detail explore-btn-detail company-detail-link" data-companyid="2"><i class="fas fa-arrow-right"></i> Lihat Detail</button>
            </div>
        </div>
    </div>
    <div id="noResultsMessage" class="no-results-message" style="display:none;">
        <p><i class="fas fa-search-minus"></i> Tidak ada perusahaan yang cocok dengan filter Anda.</p>
    </div>
</section>