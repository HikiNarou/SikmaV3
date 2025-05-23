<?php
// SikmaV3 - index.php (Diperbarui Total)

// Pastikan config.php di-include pertama untuk konstanta global
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/session_utils.php'; // Mengurus session_start() dan utilitas sesi
require_once __DIR__ . '/includes/db_connect.php';   // Dibutuhkan untuk checkProfileCompleteness

$isLoggedIn = userIsLoggedIn();
$initialUserData = null;
$needsProfileCompletion = false;
$activeTheme = 'light-theme'; // Default theme

if ($isLoggedIn) {
    $initialUserData = getCurrentUserData(); // Mengambil data user dari session
    // Cek ulang status kelengkapan profil
    if (!checkProfileCompleteness($pdo, $_SESSION['user_id'])) {
        $needsProfileCompletion = true;
        // Pastikan session flag juga terupdate
        if ($initialUserData) $initialUserData['is_profile_complete'] = false; 
        $_SESSION['is_profile_complete'] = false;
    } else {
        if ($initialUserData) $initialUserData['is_profile_complete'] = true;
        $_SESSION['is_profile_complete'] = true;
    }
    // Ambil tema dari cookie jika ada
    if (isset($_COOKIE['theme']) && ($_COOKIE['theme'] === 'dark-theme' || $_COOKIE['theme'] === 'light-theme')) {
        $activeTheme = $_COOKIE['theme'];
    }
} else {
    // Jika tidak login, mungkin ada cookie tema dari sesi sebelumnya, bisa diabaikan atau dibersihkan
    // Untuk saat ini, kita set default jika tidak login
    $activeTheme = 'light-theme';
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo APP_NAME; ?> <?php echo $isLoggedIn && !$needsProfileCompletion ? '- Dashboard' : ($needsProfileCompletion ? '- Lengkapi Profil' : '- Login'); ?></title>
    
    <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/auth_forms.css">
    <link rel="stylesheet" href="assets/css/sidebar.css">
    <link rel="stylesheet" href="assets/css/header.css">
    <link rel="stylesheet" href="assets/css/modals.css">
    
    <link rel="stylesheet" href="assets/css/home.css">
    <link rel="stylesheet" href="assets/css/profile_page.css">
    <link rel="stylesheet" href="assets/css/settings_page.css">
    <link rel="stylesheet" href="assets/css/company_detail.css">

    <link rel="icon" href="assets/images/sikma-logo-favicon.png" type="image/png">

</head>
<body class="<?php echo $activeTheme; ?>">

    <?php require_once __DIR__ . '/includes/components/auth_forms.php'; ?>

    <div class="app-container" id="appContainer" style="<?php echo $isLoggedIn ? 'display: flex;' : 'display: none;'; ?>">
        <?php require_once __DIR__ . '/includes/components/sidebar.php'; ?>

        <div class="main-content-wrapper" id="mainContentWrapper">
            <?php require_once __DIR__ . '/includes/components/header.php'; ?>

            <main id="page-home" class="page-content active">
                <?php include __DIR__ . '/pages/home_content.php'; ?>
            </main>
            <main id="page-profile" class="page-content">
                <?php include __DIR__ . '/pages/profile_content.php'; ?>
            </main>
            <main id="page-settings" class="page-content">
                <?php include __DIR__ . '/pages/settings_content.php'; ?>
            </main>
            <main id="page-company-detail" class="page-content">
                <?php include __DIR__ . '/pages/company_detail_content.php'; ?>
            </main>

            <?php require_once __DIR__ . '/includes/components/profile_completion_modal.php'; ?>
        </div>
    </div>

    <?php require_once __DIR__ . '/includes/components/item_entry_modal.php'; ?>

    <script>
        // Data awal dari PHP untuk JavaScript
        window.sikmaApp = {
            isUserLoggedIn: <?php echo json_encode($isLoggedIn); ?>,
            initialUserData: <?php echo json_encode($initialUserData); ?>,
            needsProfileCompletion: <?php echo json_encode($needsProfileCompletion); ?>,
            baseUrl: "<?php echo APP_BASE_URL; ?>", // Menggunakan konstanta dari config.php
            csrfToken: "<?php // echo $_SESSION['csrf_token'] ?? ''; ?>" // Jika menggunakan CSRF token
        };
    </script>

    <script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>

    <script src="assets/js/ui.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/auth_flow.js"></script>
    <script src="assets/js/app_core.js"></script>
    
    <script src="assets/js/page_home.js"></script>
    <script src="assets/js/page_profile.js"></script>
    <script src="assets/js/page_settings.js"></script>
    <script src="assets/js/page_company_detail.js"></script>
    
    <script>
        // Inisialisasi aplikasi utama setelah semua script dimuat
        document.addEventListener('DOMContentLoaded', () => {
            // Inisialisasi dark mode toggle di header (jika belum dihandle AppCore secara spesifik untuk header)
            const headerToggle = document.getElementById('darkModeToggleHeader');
            if (headerToggle && AppCore && typeof AppCore._applyTheme === 'function') {
                 headerToggle.addEventListener('change', function() {
                    AppCore._applyTheme(this.checked ? 'dark-theme' : 'light-theme', true);
                });
            }


            if (window.sikmaApp.isUserLoggedIn) {
                AppCore.initializeMainApp(); // Ini akan memanggil page-specific init jika diperlukan
                AuthFlow.checkInitialProfileCompletion(); // Cek setelah app init
            } else {
                AuthFlow.initializeAuthForms();
            }

            // Password toggle visibility
            document.querySelectorAll('.toggle-password').forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const targetId = this.dataset.target;
                    const passwordInput = document.getElementById(targetId);
                    if (passwordInput) {
                        if (passwordInput.type === 'password') {
                            passwordInput.type = 'text';
                            this.classList.remove('fa-eye-slash');
                            this.classList.add('fa-eye');
                        } else {
                            passwordInput.type = 'password';
                            this.classList.remove('fa-eye');
                            this.classList.add('fa-eye-slash');
                        }
                    }
                });
            });
            // Password strength indicator (sederhana)
            const regPassInput = document.getElementById('register_password');
            const strengthIndicator = document.getElementById('register_password_strength');
            if (regPassInput && strengthIndicator) {
                regPassInput.addEventListener('input', function() {
                    let strength = 0;
                    if (this.value.length >= 8) strength++;
                    if (this.value.match(/[a-z]/) && this.value.match(/[A-Z]/)) strength++;
                    if (this.value.match(/\d/)) strength++;
                    if (this.value.match(/[^a-zA-Z\d]/)) strength++;
                    
                    strengthIndicator.textContent = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'][strength] || '';
                    strengthIndicator.className = `password-strength-indicator strength-${strength}`;
                });
            }

            // Tombol "Lengkapi Profil Sekarang" di overlay
            const goToProfileBtn = document.getElementById('goToProfileCompletionBtn');
            if (goToProfileBtn) {
                goToProfileBtn.addEventListener('click', () => {
                    if (AppCore && typeof AppCore.navigateToPage === 'function') {
                        AppCore.navigateToPage('page-profile', document.querySelector('a[data-page="page-profile"]'), 'Lengkapi Profil');
                        if (AuthFlow && AuthFlow.profileCompletionOverlay) {
                            UI.hideElement(AuthFlow.profileCompletionOverlay);
                        }
                    }
                });
            }
        });
    </script>
</body>
</html>
