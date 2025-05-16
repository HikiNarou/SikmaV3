<?php
require_once 'includes/session_utils.php'; // Mengurus session_start()
require_once 'includes/db_connect.php';   // Dibutuhkan untuk checkProfileCompleteness

$isLoggedIn = userIsLoggedIn();
$initialUserData = null;
$needsProfileCompletion = false;

if ($isLoggedIn) {
    $initialUserData = getCurrentUserData(); // Mengambil data user dari session
    // Cek ulang status kelengkapan profil, bisa jadi user baru login pertama kali
    // atau session lama tapi profil belum lengkap
    if (!checkProfileCompleteness($pdo, $_SESSION['user_id'])) {
        $needsProfileCompletion = true;
        // Pastikan session flag juga terupdate jika checkProfileCompleteness mengubahnya
        $initialUserData['is_profile_complete'] = false; 
    } else {
        $initialUserData['is_profile_complete'] = true;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIKMA Terintegrasi <?php echo $isLoggedIn && !$needsProfileCompletion ? '- Dashboard' : ($needsProfileCompletion ? '- Lengkapi Profil' : '- Login'); ?></title>
    
    <!-- Vendor CSS -->
    <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Song+Myung&display=swap" rel="stylesheet">

    <!-- Modular App CSS -->
    <link rel="stylesheet" href="assets/css/main.css">       <!-- Global styles, themes, resets -->
    <link rel="stylesheet" href="assets/css/auth_forms.css"> <!-- Styles for login/register forms -->
    <link rel="stylesheet" href="assets/css/sidebar.css">
    <link rel="stylesheet" href="assets/css/header.css">
    <link rel="stylesheet" href="assets/css/modals.css">
    
    <!-- Page-Specific CSS (loaded as needed or all at once if small) -->
    <link rel="stylesheet" href="assets/css/home.css">
    <link rel="stylesheet" href="assets/css/profile_page.css">
    <link rel="stylesheet" href="assets/css/settings_page.css">
    <link rel="stylesheet" href="assets/css/company_detail.css">

</head>
<body class="<?php echo $isLoggedIn && isset($_COOKIE['theme']) && $_COOKIE['theme'] === 'dark-theme' ? 'dark-theme' : ''; ?>">

    <!-- Authentication Container -->
    <div class="auth-container" id="authContainer" style="<?php echo $isLoggedIn ? 'display: none;' : 'display: flex;'; ?>">
        <div class="auth-form-wrapper">
            <div class="logo-auth">
                <img src="https://i.ibb.co/mCpp6NzJ/sikma-logo2-removebg-preview.png" alt="Logo SIKMA">
            </div>
            <!-- Login Form -->
            <form id="loginForm" style="display: block;">
                <h1>Selamat Datang!</h1>
                <p class="subtitle">Silakan login untuk melanjutkan ke SIKMA.</p>
                <div id="loginMessage" class="auth-message" style="display:none;"></div>
                <div class="form-group">
                    <label for="login_email_nim">Email atau NIM</label>
                    <input type="text" id="login_email_nim" name="email_nim" required>
                </div>
                <div class="form-group">
                    <label for="login_password">Password</label>
                    <input type="password" id="login_password" name="password" required>
                </div>
                <button type="submit" class="btn-auth">Login</button>
                <p class="switch-form-link">Belum punya akun? <a href="#" id="switchToRegister">Daftar di sini</a></p>
            </form>
            <!-- Registration Form -->
            <form id="registerForm" style="display: none;">
                <h1>Buat Akun Baru</h1>
                <p class="subtitle">Isi data diri Anda untuk mendaftar.</p>
                <div id="registerMessage" class="auth-message" style="display:none;"></div>
                <div class="form-group">
                    <label for="register_nama_lengkap">Nama Lengkap</label>
                    <input type="text" id="register_nama_lengkap" name="nama_lengkap" required>
                </div>
                <div class="form-group">
                    <label for="register_email">Email</label>
                    <input type="email" id="register_email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="register_nim">NIM (Nomor Induk Mahasiswa)</label>
                    <input type="text" id="register_nim" name="nim" required>
                </div>
                <div class="form-group">
                    <label for="register_password">Password</label>
                    <input type="password" id="register_password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="register_confirm_password">Konfirmasi Password</label>
                    <input type="password" id="register_confirm_password" name="confirm_password" required>
                </div>
                <button type="submit" class="btn-auth">Daftar</button>
                <p class="switch-form-link">Sudah punya akun? <a href="#" id="switchToLogin">Login di sini</a></p>
            </form>
        </div>
    </div>

    <!-- Main Application Container -->
    <div class="app-container" id="appContainer" style="<?php echo $isLoggedIn ? 'display: flex;' : 'display: none;'; ?>">
        <!-- Sidebar -->
        <aside class="sidebar" id="pageSidebar">
            <button class="sidebar-toggle" id="sidebarToggleBtn" aria-label="Toggle Sidebar">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="logo">
                <img src="https://i.ibb.co/mCpp6NzJ/sikma-logo2-removebg-preview.png" alt="Logo SIKMA Alternatif">
            </div>
            <nav class="navigation">
                <ul>
                    <li id="nav-home" class="active"><a href="#" data-page="page-home"><i class="fas fa-home icon"></i><span class="nav-text">Utama</span></a></li>
                    <li id="nav-profile"><a href="#" data-page="page-profile"><i class="fas fa-user-edit icon"></i><span class="nav-text">Profil Data</span></a></li>
                    <li id="nav-settings"><a href="#" data-page="page-settings"><i class="fas fa-cog icon"></i><span class="nav-text">Setelan</span></a></li>
                    <!-- Logout dihandle JS, tidak perlu data-page -->
                    <li id="nav-logout-li"><a href="#" id="nav-logout" class="logout-link"><i class="fas fa-sign-out-alt icon"></i><span class="nav-text">Logout</span></a></li>
                </ul>
            </nav>
        </aside>

        <!-- Main Content Wrapper -->
        <div class="main-content-wrapper" id="mainContentWrapper">
            <!-- Header -->
            <header class="header" id="pageHeader">
                <div class="user-profile">
                    <img src="<?php echo htmlspecialchars($initialUserData['avatar'] ?? 'https://placehold.co/45x45/3498db/ffffff?text=U'); ?>" alt="Foto Profil" class="avatar" id="sharedAvatarPreview">
                    <span id="sharedUserName"><?php echo htmlspecialchars($initialUserData['nama_lengkap'] ?? 'Nama Mahasiswa'); ?></span>
                </div>
                <div class="header-actions">
                    <div class="notification-icon" id="notificationBtn"><i class="fas fa-bell"></i></div>
                    <div class="search-bar">
                        <input type="text" id="mainSearchInput" placeholder="Cari perusahaan...">
                        <button class="search-button" id="mainSearchButton"><i class="fas fa-search"></i></button>
                    </div>
                </div>
            </header>

            <!-- Page Content Area -->
            <main id="page-home" class="page-content active">
                <?php include 'pages/home_content.php'; ?>
            </main>

            <main id="page-profile" class="page-content">
                <?php include 'pages/profile_content.php'; ?>
            </main>

            <main id="page-settings" class="page-content">
                <?php include 'pages/settings_content.php'; ?>
            </main>
            
            <main id="page-company-detail" class="page-content">
                <?php include 'pages/company_detail_content.php'; ?>
            </main>
             <!-- Profile Completion Overlay/Modal (jika diperlukan secara terpisah dari page-profile) -->
            <div id="profileCompletionOverlay" class="profile-completion-overlay" style="display: none;">
                <div class="profile-completion-content">
                    <h2>Lengkapi Profil Anda</h2>
                    <p>Untuk melanjutkan, harap lengkapi data profil Anda terlebih dahulu.</p>
                    <p>Anda akan diarahkan ke halaman profil.</p>
                    <div id="profileCompletionMessage" class="auth-message" style="display:none;"></div>
                    <!-- Bisa tambahkan tombol "Lengkapi Sekarang" jika tidak redirect otomatis -->
                </div>
            </div>
        </div>
    </div>

    <!-- Modals (Contoh: Item Modal untuk Profile Data) -->
    <div id="itemEntryModal" class="modal item-entry-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="itemModalTitle"><i class="fas fa-plus-square"></i>Tambah Item</h3>
                <button class="close-btn" data-modal-id="itemEntryModal">&times;</button>
            </div>
            <form id="itemEntryForm">
                <input type="hidden" id="itemType" name="itemType">
                <input type="hidden" id="itemId" name="itemId"> <!-- Untuk edit -->
                
                <div id="commonFieldsModal">
                    <div class="form-group">
                        <label for="itemName">Nama/Judul/Institusi:</label>
                        <input type="text" id="itemName" name="itemName" required>
                    </div>
                </div>

                <!-- Bidang Spesifik per Tipe Item (akan di-clone dan diisi oleh JS) -->
                <div id="modalSpecificFieldsContainer">
                    <!-- Template untuk Skill -->
                    <div id="skillFieldsTemplate" class="modal-fields-group" style="display:none;">
                        <div class="form-group">
                            <label for="itemLevel">Tingkat Keahlian:</label>
                            <select id="itemLevel" name="itemLevel">
                                <option value="">Pilih Tingkat</option>
                                <option value="Dasar">Dasar</option>
                                <option value="Pemula">Pemula</option>
                                <option value="Menengah">Menengah</option>
                                <option value="Mahir">Mahir</option>
                                <option value="Ahli">Ahli</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="itemExperienceDuration">Lama Pengalaman/Menekuni:</label>
                            <input type="text" id="itemExperienceDuration" name="itemExperienceDuration" placeholder="cth: 1 tahun, 6 bulan">
                        </div>
                    </div>
                    <!-- Template untuk Edukasi -->
                    <div id="educationFieldsTemplate" class="modal-fields-group" style="display:none;">
                        <div class="form-group">
                            <label for="educationDegree">Gelar/Jenjang:</label>
                            <input type="text" id="educationDegree" name="educationDegree" placeholder="cth: S1, D3, SMA/SMK">
                        </div>
                        <div class="form-group">
                            <label for="educationFieldOfStudy">Bidang Studi:</label>
                            <input type="text" id="educationFieldOfStudy" name="educationFieldOfStudy" placeholder="cth: Teknik Informatika">
                        </div>
                         <div class="form-row">
                            <div class="form-group">
                                <label for="educationStartDate">Tanggal Mulai:</label>
                                <input type="month" id="educationStartDate" name="educationStartDate">
                            </div>
                            <div class="form-group">
                                <label for="educationEndDate">Tanggal Selesai (atau ожидаемый):</label>
                                <input type="month" id="educationEndDate" name="educationEndDate">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="educationDescription">Deskripsi Tambahan:</label>
                            <textarea id="educationDescription" name="educationDescription" rows="3"></textarea>
                        </div>
                    </div>
                     <!-- Template untuk Pengalaman Kerja -->
                    <div id="experienceFieldsTemplate" class="modal-fields-group" style="display:none;">
                        <div class="form-group">
                            <label for="experienceJobTitle">Posisi/Jabatan:</label>
                            <input type="text" id="experienceJobTitle" name="experienceJobTitle" placeholder="cth: Web Developer Intern">
                        </div>
                         <div class="form-row">
                            <div class="form-group">
                                <label for="experienceStartDate">Tanggal Mulai:</label>
                                <input type="month" id="experienceStartDate" name="experienceStartDate">
                            </div>
                            <div class="form-group">
                                <label for="experienceEndDate">Tanggal Selesai (kosong jika masih):</label>
                                <input type="month" id="experienceEndDate" name="experienceEndDate">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="experienceDescription">Deskripsi Pekerjaan/Proyek:</label>
                            <textarea id="experienceDescription" name="experienceDescription" rows="4"></textarea>
                        </div>
                    </div>
                    <!-- Template untuk Social Link -->
                    <div id="socialLinkFieldsTemplate" class="modal-fields-group" style="display:none;">
                        <div class="form-group">
                            <label for="socialPlatform">Platform:</label>
                             <select id="socialPlatform" name="socialPlatform">
                                <option value="">Pilih Platform</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="GitHub">GitHub</option>
                                <option value="Portfolio">Portfolio Website</option>
                                <option value="Twitter">Twitter/X</option>
                                <option value="Instagram">Instagram</option>
                                <option value="Other">Lainnya</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="socialUrl">URL Profil:</label>
                            <input type="url" id="socialUrl" name="socialUrl" placeholder="https://...">
                        </div>
                    </div>
                </div>
                
                <div id="itemModalMessage" class="auth-message" style="display:none;"></div>
                <button type="submit" class="btn btn-primary" style="width:100%;"><i class="fas fa-check-circle"></i>Simpan Item</button>
            </form>
        </div>
    </div>


    <!-- JavaScript -->
    <script>
        // Data awal dari PHP untuk JavaScript
        window.sikmaApp = {
            isUserLoggedIn: <?php echo json_encode($isLoggedIn); ?>,
            initialUserData: <?php echo json_encode($initialUserData); ?>,
            needsProfileCompletion: <?php echo json_encode($needsProfileCompletion); ?>,
            baseUrl: "<?php echo dirname($_SERVER['SCRIPT_NAME']) === '/' ? '' : dirname($_SERVER['SCRIPT_NAME']); ?>/" // Untuk path relatif jika app tidak di root
        };
    </script>

    <!-- Modular App JS -->
    <script src="assets/js/api.js"></script>
    <script src="assets/js/ui.js"></script>
    <script src="assets/js/auth_flow.js"></script>
    <script src="assets/js/app_core.js"></script> <!-- Main app logic, navigation, theme -->
    
    <!-- Page-Specific JS -->
    <script src="assets/js/page_home.js"></script>
    <script src="assets/js/page_profile.js"></script>
    <script src="assets/js/page_settings.js"></script>
    <script src="assets/js/page_company_detail.js"></script>
    
    <!-- Vendor JS -->
    <script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>

    <script>
        // Inisialisasi aplikasi utama setelah semua script dimuat
        document.addEventListener('DOMContentLoaded', () => {
            if (window.sikmaApp.isUserLoggedIn) {
                AppCore.initializeMainApp();
                AuthFlow.checkInitialProfileCompletion(); // Cek setelah app init
            } else {
                AuthFlow.initializeAuthForms();
            }
        });
    </script>
</body>
</html>