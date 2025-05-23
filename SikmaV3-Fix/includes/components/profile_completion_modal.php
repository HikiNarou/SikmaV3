<div id="profileCompletionOverlay" class="profile-completion-overlay" style="display: <?php echo $isLoggedIn && $needsProfileCompletion ? 'flex' : 'none'; ?>;">
    <div class="profile-completion-content">
        <h2>Lengkapi Profil Anda</h2>
        <p>Untuk melanjutkan dan mendapatkan rekomendasi terbaik, harap lengkapi data profil Anda terlebih dahulu.</p>
        <div id="profileCompletionMessage" class="auth-message" style="display:none;"></div>
        <button id="goToProfileCompletionBtn" class="btn btn-primary" style="margin-top:15px;">Lengkapi Profil Sekarang</button>
    </div>
</div>
