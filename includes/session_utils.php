<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

function userIsLoggedIn() {
    return isset($_SESSION['user_id']);
}

function requireLogin() {
    if (!userIsLoggedIn()) {
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
    // is_profile_complete akan di-set oleh checkProfileCompleteness atau dari DB saat login
    $_SESSION['is_profile_complete'] = isset($user['is_profile_complete']) ? (bool)$user['is_profile_complete'] : false;
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
    // Definisi "profil lengkap" yang lebih baik:
    // Minimal bio terisi DAN (ada minimal 1 skill ATAU 1 edukasi ATAU 1 pengalaman)
    // Anda HARUS menyesuaikan ini dengan kebutuhan aplikasi Anda.
    try {
        $userStmt = $pdo->prepare("SELECT bio FROM users WHERE id = :id");
        $userStmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $userStmt->execute();
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || empty(trim($user['bio']))) {
            $_SESSION['is_profile_complete'] = false;
            // Optional: Update users table if is_profile_complete is false and was true
            // $updateStmt = $pdo->prepare("UPDATE users SET is_profile_complete = 0 WHERE id = :id AND is_profile_complete = 1");
            // $updateStmt->bindParam(':id', $userId, PDO::PARAM_INT);
            // $updateStmt->execute();
            return false;
        }

        // Cek apakah ada minimal satu item di tabel-tabel terkait
        $hasProgrammingSkill = $pdo->query("SELECT 1 FROM user_programming_skills WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasFramework = $pdo->query("SELECT 1 FROM user_frameworks WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasOtherSkill = $pdo->query("SELECT 1 FROM user_other_skills WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasEducation = $pdo->query("SELECT 1 FROM user_education_history WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasExperience = $pdo->query("SELECT 1 FROM user_work_experience WHERE user_id = $userId LIMIT 1")->fetchColumn();
        $hasSocialLink = $pdo->query("SELECT 1 FROM user_social_links WHERE user_id = $userId LIMIT 1")->fetchColumn();


        // Contoh kriteria: bio + (minimal 1 skill ATAU 1 edukasi ATAU 1 pengalaman)
        $isComplete = !empty(trim($user['bio'])) && 
                      ($hasProgrammingSkill || $hasFramework || $hasOtherSkill || $hasEducation || $hasExperience || $hasSocialLink);

        $_SESSION['is_profile_complete'] = $isComplete;
        
        // Update kolom is_profile_complete di tabel users
        $updateStmt = $pdo->prepare("UPDATE users SET is_profile_complete = :is_complete WHERE id = :id");
        $updateStmt->bindValue(':is_complete', $isComplete ? 1 : 0, PDO::PARAM_INT);
        $updateStmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $updateStmt->execute();
        
        return $isComplete;

    } catch (PDOException $e) {
        error_log("Error checking profile completeness for user $userId: " . $e->getMessage());
        $_SESSION['is_profile_complete'] = false; // Anggap tidak lengkap jika ada error
        return false; 
    }
}
?>