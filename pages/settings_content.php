<!-- Konten untuk Halaman Pengaturan -->
<div class="settings-page">
    <h1><i class="fas fa-cog"></i>Pengaturan Akun</h1>
    
    <div id="settingsPageMessage" class="auth-message" style="display:none;"></div>

    <section class="settings-section">
        <h2>Profil Pengguna</h2>
        <form id="profileSettingsForm" enctype="multipart/form-data">
            <div class="profile-avatar-section">
                <img src="<?php echo htmlspecialchars($initialUserData['avatar'] ?? 'https://placehold.co/80x80/3498db/ffffff?text=U'); ?>" alt="Avatar Preview" class="profile-avatar-preview" id="settings_avatarPreview">
                <div>
                    <button type="button" class="avatar-upload-btn" onclick="document.getElementById('settings_avatarUpload').click();"><i class="fas fa-camera"></i> Ubah Foto</button>
                    <input type="file" id="settings_avatarUpload" name="avatar" accept="image/*" style="display: none;">
                    <p class="avatar-upload-label">JPG, GIF atau PNG. Maks 5MB.</p>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="settings_firstName">Nama Depan</label>
                    <input type="text" id="settings_firstName" name="firstName">
                </div>
                <div class="form-group">
                    <label for="settings_lastName">Nama Belakang</label>
                    <input type="text" id="settings_lastName" name="lastName">
                </div>
            </div>
            <div class="form-group">
                <label for="settings_email">Alamat Email</label>
                <input type="email" id="settings_email" name="email" readonly>
            </div>
            <div class="form-group">
                <label for="settings_bio">Bio Singkat</label>
                <textarea id="settings_bio" name="bio" placeholder="Ceritakan sedikit tentang diri Anda..."></textarea>
            </div>
            <div id="profileUpdateMessage" class="auth-message" style="display:none;"></div>
            <button type="submit" class="btn-save-changes"><i class="fas fa-save"></i> Simpan Perubahan Profil</button>
        </form>
    </section>

    <section class="settings-section">
        <h2>Ubah Kata Sandi</h2>
        <form id="changePasswordForm">
            <div class="form-group">
                <label for="currentPassword">Kata Sandi Saat Ini</label>
                <input type="password" id="currentPassword" name="currentPassword" required>
            </div>
            <div class="form-group">
                <label for="newPassword">Kata Sandi Baru</label>
                <input type="password" id="newPassword" name="newPassword" required>
            </div>
            <div class="form-group">
                <label for="confirmNewPassword">Konfirmasi Kata Sandi Baru</label>
                <input type="password" id="confirmNewPassword" name="confirmNewPassword" required>
            </div>
            <div id="passwordChangeMessage" class="auth-message" style="display:none;"></div>
            <button type="submit" class="btn-save-changes"><i class="fas fa-key"></i> Ubah Kata Sandi</button>
        </form>
    </section>

    <section class="settings-section">
        <h2>Preferensi Situs</h2>
        <div class="preference-item">
            <p><i class="fas fa-palette"></i> Tema Gelap</p>
            <label class="toggle-switch">
                <input type="checkbox" id="darkModeToggle">
                <span class="slider"></span>
            </label>
        </div>
        <!-- Tombol simpan preferensi bisa dihilangkan jika perubahan tema langsung disimpan via JS -->
        <!-- <button type="button" class="btn-save-changes" id="savePreferencesBtn" style="margin-top:10px;">Simpan Preferensi</button> -->
    </section>

    <section class="settings-section">
        <h2>Tindakan Akun</h2>
        <div class="form-group">
            <label for="deactivateAccountBtn">Nonaktifkan Akun</label>
            <p class="setting-description">Tindakan ini akan menonaktifkan akun Anda sementara. Anda dapat mengaktifkannya kembali dengan login.</p>
            <button type="button" class="btn btn-danger" id="deactivateAccountBtn"><i class="fas fa-user-slash"></i> Nonaktifkan Akun Saya</button>
        </div>
    </section>
</div>