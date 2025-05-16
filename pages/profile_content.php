<!-- Konten untuk Halaman Profile Data (Lengkapi Profil) -->
<div class="profile-data-page">
    <h1><i class="fas fa-id-card"></i>Lengkapi Data Profil Anda</h1>
    <p class="page-subtitle">Informasi ini akan membantu kami memberikan rekomendasi magang yang lebih sesuai dan memudahkan perusahaan mengenal Anda.</p>
    
    <div id="profilePageMessage" class="auth-message" style="display:none;"></div>

    <form id="fullProfileForm">
        <!-- Bagian Data Diri Dasar (bisa prefill dari Settings jika sudah ada) -->
        <section class="profile-data-section">
            <h2><i class="fas fa-user-circle"></i>Informasi Pribadi</h2>
            <div class="form-row">
                <div class="form-group">
                    <label for="profile_firstName">Nama Depan</label>
                    <input type="text" id="profile_firstName" name="firstName" required>
                </div>
                <div class="form-group">
                    <label for="profile_lastName">Nama Belakang</label>
                    <input type="text" id="profile_lastName" name="lastName" required>
                </div>
            </div>
            <div class="form-group">
                <label for="profile_email">Email</label>
                <input type="email" id="profile_email" name="email" readonly> <!-- Email dari session, tidak bisa diubah di sini -->
            </div>
            <div class="form-group">
                <label for="profile_nim">NIM (Nomor Induk Mahasiswa)</label>
                <input type="text" id="profile_nim" name="nim" readonly> <!-- NIM dari session, tidak bisa diubah di sini -->
            </div>
            <div class="form-group">
                <label for="profile_bio">Bio Singkat</label>
                <textarea id="profile_bio" name="bio" rows="4" placeholder="Ceritakan sedikit tentang diri Anda, minat, dan tujuan karir Anda..."></textarea>
            </div>
             <div class="form-group profile-avatar-section-profilepage">
                <label>Foto Profil</label>
                <div class="avatar-wrapper">
                    <img src="https://placehold.co/100x100/3498db/ffffff?text=U" alt="Avatar Preview" class="profile-avatar-preview-page" id="profile_avatarPreviewPage">
                    <input type="file" id="profile_avatarUpload" name="avatar" accept="image/*" style="display: none;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('profile_avatarUpload').click();"><i class="fas fa-camera"></i> Ubah Foto</button>
                </div>
                <small class="avatar-upload-label">JPG, GIF atau PNG. Maks 5MB.</small>
            </div>
        </section>

        <!-- Keahlian Bahasa Pemrograman -->
        <section class="profile-data-section" data-item-type="programmingSkill">
            <h2><i class="fas fa-code"></i>Keahlian Bahasa Pemrograman</h2>
            <div class="items-list-display" id="programmingSkillsListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="programmingSkill" data-modal-title="Tambah Bahasa Pemrograman" data-icon="fas fa-code"><i class="fas fa-plus-circle"></i>Tambah Bahasa</button>
        </section>

        <!-- Framework yang Dikuasai -->
        <section class="profile-data-section" data-item-type="framework">
            <h2><i class="fas fa-cubes"></i>Framework yang Dikuasai</h2>
            <div class="items-list-display" id="frameworksListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="framework" data-modal-title="Tambah Framework" data-icon="fas fa-cubes"><i class="fas fa-plus-circle"></i>Tambah Framework</button>
        </section>

        <!-- Keahlian Lainnya -->
        <section class="profile-data-section" data-item-type="otherSkill">
            <h2><i class="fas fa-tools"></i>Keahlian Teknis & Non-Teknis Lainnya</h2>
            <div class="items-list-display" id="otherSkillsListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="otherSkill" data-modal-title="Tambah Keahlian Lain" data-icon="fas fa-tools"><i class="fas fa-plus-circle"></i>Tambah Keahlian</button>
        </section>

        <!-- Riwayat Pendidikan -->
        <section class="profile-data-section" data-item-type="education">
            <h2><i class="fas fa-graduation-cap"></i>Riwayat Pendidikan</h2>
            <div class="items-list-display" id="educationListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="education" data-modal-title="Tambah Riwayat Pendidikan" data-icon="fas fa-graduation-cap"><i class="fas fa-plus-circle"></i>Tambah Pendidikan</button>
        </section>

        <!-- Pengalaman Kerja/Magang/Proyek -->
        <section class="profile-data-section" data-item-type="experience">
            <h2><i class="fas fa-briefcase"></i>Pengalaman Kerja/Magang/Proyek</h2>
            <div class="items-list-display" id="experienceListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="experience" data-modal-title="Tambah Pengalaman" data-icon="fas fa-briefcase"><i class="fas fa-plus-circle"></i>Tambah Pengalaman</button>
        </section>
        
        <!-- Link Sosial Media & Portfolio -->
        <section class="profile-data-section" data-item-type="socialLink">
            <h2><i class="fas fa-link"></i>Link Sosial Media & Portfolio</h2>
            <div class="items-list-display" id="socialLinksListProfile"></div>
            <button type="button" class="btn btn-secondary add-item-btn" data-type="socialLink" data-modal-title="Tambah Link" data-icon="fas fa-link"><i class="fas fa-plus-circle"></i>Tambah Link</button>
        </section>

        <button type="submit" id="saveProfileDataBtn" class="btn btn-save-all"><i class="fas fa-save"></i>Simpan Semua Data Profil</button>
    </form>
</div>