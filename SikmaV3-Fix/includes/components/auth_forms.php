<div class="auth-container" id="authContainer" style="<?php echo $isLoggedIn ? 'display: none;' : 'display: flex;'; ?>">
    <div class="auth-form-wrapper">
        <div class="logo-auth">
            <img src="assets/images/sikma-logo-main.png" alt="Logo SIKMA">
        </div>
        <form id="loginForm" style="display: block;">
            <h1>Selamat Datang!</h1>
            <p class="subtitle">Silakan login untuk melanjutkan ke <?php echo APP_NAME; ?>.</p>
            <div id="loginMessage" class="auth-message" style="display:none;"></div>
            <div class="form-group">
                <label for="login_email_nim">Email atau NIM</label>
                <input type="text" id="login_email_nim" name="email_nim" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="login_password">Password</label>
                <div class="password-wrapper">
                    <input type="password" id="login_password" name="password" required autocomplete="current-password">
                    <i class="fas fa-eye-slash toggle-password" data-target="login_password"></i>
                </div>
            </div>
            <div class="form-group form-inline-group">
                <label class="checkbox-container">
                    <input type="checkbox" name="remember_me" id="remember_me">
                    <span class="checkmark"></span>
                    Ingat Saya
                </label>
                <a href="#" id="forgotPasswordLink" class="forgot-password-link">Lupa Password?</a>
            </div>
            <button type="submit" class="btn-auth">Login</button>
            <p class="switch-form-link">Belum punya akun? <a href="#" id="switchToRegister">Daftar di sini</a></p>
        </form>
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
                <input type="text" id="register_nim" name="nim" required pattern="\d{5,12}" title="NIM harus berupa 5-12 digit angka.">
            </div>
            <div class="form-group">
                <label for="register_semester">Semester Saat Ini</label>
                <select id="register_semester" name="semester" required>
                    <option value="">Pilih Semester</option>
                    <?php for ($i = 5; $i <= 10; $i++): ?>
                        <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
                    <?php endfor; ?>
                </select>
            </div>
            <div class="form-group">
                <label for="register_password">Password</label>
                 <div class="password-wrapper">
                    <input type="password" id="register_password" name="password" required minlength="6">
                    <i class="fas fa-eye-slash toggle-password" data-target="register_password"></i>
                </div>
                <small class="password-strength-indicator" id="register_password_strength"></small>
            </div>
            <div class="form-group">
                <label for="register_confirm_password">Konfirmasi Password</label>
                <div class="password-wrapper">
                    <input type="password" id="register_confirm_password" name="confirm_password" required>
                     <i class="fas fa-eye-slash toggle-password" data-target="register_confirm_password"></i>
                </div>
            </div>
            <div class="form-group">
                <label class="checkbox-container">
                    <input type="checkbox" name="terms" id="register_terms" required>
                    <span class="checkmark"></span>
                    Saya menyetujui <a href="/terms" target="_blank">Syarat & Ketentuan</a> yang berlaku.
                </label>
            </div>
            <button type="submit" class="btn-auth">Daftar</button>
            <p class="switch-form-link">Sudah punya akun? <a href="#" id="switchToLogin">Login di sini</a></p>
        </form>
    </div>
</div>
