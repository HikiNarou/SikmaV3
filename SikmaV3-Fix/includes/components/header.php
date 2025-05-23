<header class="header" id="pageHeader">
    <div class="user-profile">
        <img src="<?php echo htmlspecialchars($initialUserData['avatar'] ?? DEFAULT_AVATAR_PLACEHOLDER_URL . 'U'); ?>" alt="Foto Profil" class="avatar" id="sharedAvatarPreview">
        <span id="sharedUserName"><?php echo htmlspecialchars($initialUserData['nama_lengkap'] ?? 'Nama Mahasiswa'); ?></span>
    </div>
    <div class="header-actions">
        <div class="notification-icon" id="notificationBtn" title="Notifikasi (Belum aktif)">
            <i class="fas fa-bell"></i>
            </div>
        <div class="search-bar">
            <input type="text" id="mainSearchInput" placeholder="Cari perusahaan...">
            <button class="search-button" id="mainSearchButton" aria-label="Cari"><i class="fas fa-search"></i></button>
        </div>
         <label class="theme-switch-label" for="darkModeToggleHeader" title="Ganti Tema">
            <input type="checkbox" id="darkModeToggleHeader" class="theme-switch-checkbox" <?php echo $activeTheme === 'dark-theme' ? 'checked' : ''; ?>>
            <span class="theme-switch-slider">
                <i class="fas fa-sun sun-icon"></i>
                <i class="fas fa-moon moon-icon"></i>
            </span>
        </label>
    </div>
</header>
