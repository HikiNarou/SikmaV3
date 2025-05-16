<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

function userIsLoggedIn() {
    return isset($_SESSION['user_id']);
}

function requireLogin() {
    if (!userIsLoggedIn()) {
        // Mungkin lebih baik mengirim respons JSON jika ini adalah permintaan API
        // atau redirect jika ini adalah akses halaman langsung yang tidak seharusnya.
        // Untuk API, kita akan handle di auth.php atau handler spesifik.
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Akses ditolak. Anda harus login.']);
        exit;
    }
}

function startUserSession($user) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nama_lengkap'] = $user['nama_lengkap'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_nim'] = $user['nim'];
    $_SESSION['user_avatar'] = $user['avatar'] ?: 'https://placehold.co/80x80/3498db/ffffff?text=' . strtoupper(substr($user['nama_lengkap'],0,1));
    $_SESSION['user_bio'] = $user['bio'] ?? '';
    // Tambahkan flag kelengkapan profil
    $_SESSION['is_profile_complete'] = $user['is_profile_complete'] ?? false;
}

function destroyUserSession() {
    session_unset();
    session_destroy();
}

function getCurrentUserData() {
    if (!userIsLoggedIn()) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'nama_lengkap' => $_SESSION['user_nama_lengkap'],
        'email' => $_SESSION['user_email'],
        'nim' => $_SESSION['user_nim'],
        'avatar' => $_SESSION['user_avatar'],
        'bio' => $_SESSION['user_bio'] ?? '',
        'is_profile_complete' => $_SESSION['is_profile_complete'] ?? false
    ];
}

function checkProfileCompleteness($pdo, $userId) {
    // Implementasi ini sangat bergantung pada definisi "profil lengkap" Anda.
    // Contoh: memeriksa apakah 'bio' dan 'nim' (jika NIM bisa diedit/ditambah nanti) diisi.
    // Atau jika ada tabel user_profile_details, periksa apakah data penting ada.
    // Untuk sekarang, kita akan buat placeholder sederhana.
    // Anda HARUS menyesuaikan ini.
    try {
        $stmt = $pdo->prepare("SELECT bio, nim, programming_skills FROM users WHERE id = :id"); // Asumsi ada kolom programming_skills
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && !empty($user['bio']) && !empty($user['nim']) /* && !empty($user['programming_skills']) */ ) {
            // Tandai di session dan database bahwa profil sudah lengkap
            $_SESSION['is_profile_complete'] = true;
            $updateStmt = $pdo->prepare("UPDATE users SET is_profile_complete = 1 WHERE id = :id");
            $updateStmt->bindParam(':id', $userId, PDO::PARAM_INT);
            $updateStmt->execute();
            return true;
        }
        $_SESSION['is_profile_complete'] = false; // Pastikan di set false jika belum lengkap
        return false;
    } catch (PDOException $e) {
        error_log("Error checking profile completeness: " . $e->getMessage());
        return false; // Anggap tidak lengkap jika ada error
    }
}
?>