<?php
// session_utils.php sudah di-include oleh auth.php atau index.php jika perlu
// db_connect.php juga sudah di-include

function handle_register($pdo) {
    $response = ['status' => 'error', 'message' => 'Registrasi gagal. Data tidak lengkap.'];

    $nama_lengkap = trim($_POST['nama_lengkap'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $nim = trim($_POST['nim'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    if (empty($nama_lengkap) || empty($email) || empty($nim) || empty($password) || empty($confirm_password)) {
        $response['message'] = 'Semua field registrasi wajib diisi.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Format email tidak valid.';
    } elseif (strlen($nim) < 5) { // Contoh validasi NIM sederhana
        $response['message'] = 'NIM tidak valid (minimal 5 karakter).';
    } elseif (strlen($password) < 6) {
        $response['message'] = 'Password minimal harus 6 karakter.';
    } elseif ($password !== $confirm_password) {
        $response['message'] = 'Konfirmasi password tidak cocok.';
    } else {
        try {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email OR nim = :nim");
            $stmt->bindParam(':email', $email, PDO::PARAM_STR);
            $stmt->bindParam(':nim', $nim, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $response['message'] = 'Email atau NIM sudah terdaftar.';
            } else {
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                $default_avatar = 'https://placehold.co/80x80/3498db/ffffff?text=' . strtoupper(substr($nama_lengkap, 0, 1));
                // Tambahkan is_profile_complete default ke false (0)
                $stmt = $pdo->prepare("INSERT INTO users (nama_lengkap, email, nim, password, avatar, is_profile_complete) VALUES (:nama_lengkap, :email, :nim, :password, :avatar, 0)");
                $stmt->bindParam(':nama_lengkap', $nama_lengkap, PDO::PARAM_STR);
                $stmt->bindParam(':email', $email, PDO::PARAM_STR);
                $stmt->bindParam(':nim', $nim, PDO::PARAM_STR);
                $stmt->bindParam(':password', $hashed_password, PDO::PARAM_STR);
                $stmt->bindParam(':avatar', $default_avatar, PDO::PARAM_STR);

                if ($stmt->execute()) {
                    $response = ['status' => 'success', 'message' => 'Registrasi berhasil! Silakan login.'];
                } else {
                    $response['message'] = 'Registrasi gagal. Kesalahan server.';
                }
            }
        } catch (PDOException $e) {
            error_log("Database error on register: " . $e->getMessage());
            $response['message'] = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
        }
    }
    return $response;
}

function handle_login($pdo) {
    $response = ['status' => 'error', 'message' => 'Login gagal.'];
    $email_nim = trim($_POST['email_nim'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($email_nim) || empty($password)) {
        $response['message'] = 'Email/NIM dan Password wajib diisi.';
    } else {
        try {
            // Ambil juga is_profile_complete
            $stmt = $pdo->prepare("SELECT id, nama_lengkap, email, nim, password, avatar, bio, is_profile_complete FROM users WHERE email = :email_nim OR nim = :email_nim");
            $stmt->bindParam(':email_nim', $email_nim, PDO::PARAM_STR);
            $stmt->execute();

            if ($stmt->rowCount() == 1) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if (password_verify($password, $user['password'])) {
                    startUserSession($user); // Fungsi dari session_utils.php
                    $isProfileComplete = checkProfileCompleteness($pdo, $user['id']); // Cek dan update jika perlu
                    
                    $response = [
                        'status' => 'success',
                        'message' => 'Login berhasil!',
                        'user' => [
                            'id' => $user['id'],
                            'nama_lengkap' => $user['nama_lengkap'],
                            'email' => $user['email'],
                            'avatar' => $_SESSION['user_avatar'], // Ambil dari session yang baru di-set
                            'bio' => $_SESSION['user_bio'],       // Ambil dari session
                            'is_profile_complete' => $isProfileComplete
                        ]
                    ];
                } else {
                    $response['message'] = 'Email/NIM atau Password salah.';
                }
            } else {
                $response['message'] = 'Email/NIM atau Password salah.';
            }
        } catch (PDOException $e) {
            error_log("Database error on login: " . $e->getMessage());
            $response['message'] = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
        }
    }
    return $response;
}

function handle_logout() {
    destroyUserSession(); // Fungsi dari session_utils.php
    return ['status' => 'success', 'message' => 'Logout berhasil.'];
}

function handle_check_session($pdo) {
    if (userIsLoggedIn()) {
        $userId = $_SESSION['user_id'];
        // Selalu perbarui status kelengkapan profil dari DB saat check session
        // karena bisa saja user melengkapi profil di tab lain
        $isProfileComplete = checkProfileCompleteness($pdo, $userId);
        $_SESSION['is_profile_complete'] = $isProfileComplete; // Update session

        return [
            'status' => 'success',
            'loggedIn' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'nama_lengkap' => $_SESSION['user_nama_lengkap'],
                'email' => $_SESSION['user_email'],
                'avatar' => $_SESSION['user_avatar'],
                'bio' => $_SESSION['user_bio'] ?? '',
                'is_profile_complete' => $isProfileComplete
            ]
        ];
    } else {
        return ['status' => 'success', 'loggedIn' => false];
    }
}

function handle_update_profile($pdo) {
    if (!userIsLoggedIn()) {
        return ['status' => 'error', 'message' => 'Anda harus login untuk mengubah profil.'];
    }

    $userId = $_SESSION['user_id'];
    $firstName = trim($_POST['firstName'] ?? '');
    $lastName = trim($_POST['lastName'] ?? '');
    $bio = trim($_POST['bio'] ?? ''); // Bio sekarang bagian dari profil utama
    $nama_lengkap = trim($firstName . " " . $lastName);

    $response = ['status' => 'error'];
    $avatarPath = $_SESSION['user_avatar']; // Default ke avatar saat ini

    // Logika upload avatar (sama seperti sebelumnya, tapi lebih terstruktur)
    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] == UPLOAD_ERR_OK) {
        $uploadDir = "../uploads/avatars/"; // Sesuaikan path jika user_handler.php ada di 'includes'
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0775, true)) {
                $response['message'] = "Gagal membuat direktori upload.";
                $response['debug_upload_error_details'] = "Cannot create directory: " . $uploadDir;
                return $response;
            }
        }

        $fileName = $userId . "_" . time() . "_" . basename($_FILES["avatar"]["name"]);
        $targetFilePath = $uploadDir . $fileName;
        $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
        $allowTypes = ['jpg', 'png', 'jpeg', 'gif'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB

        if (!in_array($fileType, $allowTypes)) {
            $response['message'] = "Maaf, hanya file JPG, JPEG, PNG & GIF yang diizinkan.";
        } elseif ($_FILES["avatar"]["size"] > $maxFileSize) {
            $response['message'] = "Maaf, ukuran file avatar terlalu besar (Maks 5MB).";
        } elseif (move_uploaded_file($_FILES["avatar"]["tmp_name"], $targetFilePath)) {
            // Hapus avatar lama jika bukan placeholder dan berbeda
            if ($_SESSION['user_avatar'] && strpos($_SESSION['user_avatar'], 'placehold.co') === false && $_SESSION['user_avatar'] !== $targetFilePath && file_exists($_SESSION['user_avatar'])) {
                 // Perlu path absolut atau relatif yang benar dari posisi script user_handler.php
                $oldAvatarPhysicalPath = realpath(dirname(__FILE__) . '/../' . $_SESSION['user_avatar']);
                 if ($oldAvatarPhysicalPath && file_exists($oldAvatarPhysicalPath)) {
                    unlink($oldAvatarPhysicalPath);
                }
            }
            // Path avatar untuk DB harus relatif terhadap root web, bukan filesystem
            $avatarPath = "uploads/avatars/" . $fileName;
        } else {
            $response['message'] = "Maaf, terjadi kesalahan saat mengupload file avatar Anda.";
            $response['debug_upload_error'] = $_FILES['avatar']['error'];
            // ... (detail error upload seperti sebelumnya) ...
            return $response;
        }
    } elseif (isset($_FILES['avatar']) && $_FILES['avatar']['error'] != UPLOAD_ERR_NO_FILE) {
         $response['message'] = "Terjadi masalah dengan file avatar yang diupload.";
         $response['debug_upload_error'] = $_FILES['avatar']['error'];
         return $response;
    }

    // Update database
    try {
        // Update nama_lengkap, bio, dan avatar di tabel users
        $stmt = $pdo->prepare("UPDATE users SET nama_lengkap = :nama_lengkap, bio = :bio, avatar = :avatar WHERE id = :id");
        $stmt->bindParam(':nama_lengkap', $nama_lengkap, PDO::PARAM_STR);
        $stmt->bindParam(':bio', $bio, PDO::PARAM_STR);
        $stmt->bindParam(':avatar', $avatarPath, PDO::PARAM_STR);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);

        if ($stmt->execute()) {
            $_SESSION['user_nama_lengkap'] = $nama_lengkap;
            $_SESSION['user_bio'] = $bio;
            $_SESSION['user_avatar'] = $avatarPath;
            
            // Cek kelengkapan profil setelah update
            $isProfileComplete = checkProfileCompleteness($pdo, $userId);

            $response = [
                'status' => 'success',
                'message' => 'Profil berhasil diperbarui!',
                'user' => [
                    'nama_lengkap' => $nama_lengkap,
                    'avatar' => $avatarPath,
                    'bio' => $bio,
                    'email' => $_SESSION['user_email'], // Email tidak diubah di sini
                    'is_profile_complete' => $isProfileComplete
                ]
            ];
        } else {
            $response['message'] = 'Gagal memperbarui profil di database.';
        }
    } catch (PDOException $e) {
        error_log("Database error on update_profile: " . $e->getMessage());
        $response['message'] = 'Terjadi kesalahan server saat memperbarui profil.';
    }
    return $response;
}


function handle_change_password($pdo) {
    if (!userIsLoggedIn()) {
        return ['status' => 'error', 'message' => 'Anda harus login untuk mengubah kata sandi.'];
    }

    $userId = $_SESSION['user_id'];
    $currentPassword = $_POST['currentPassword'] ?? '';
    $newPassword = $_POST['newPassword'] ?? '';
    $confirmNewPassword = $_POST['confirmNewPassword'] ?? '';
    $response = ['status' => 'error'];

    if (empty($currentPassword) || empty($newPassword) || empty($confirmNewPassword)) {
        $response['message'] = 'Semua field kata sandi wajib diisi.';
    } elseif (strlen($newPassword) < 6) {
        $response['message'] = 'Kata sandi baru minimal harus 6 karakter.';
    } elseif ($newPassword !== $confirmNewPassword) {
        $response['message'] = 'Konfirmasi kata sandi baru tidak cocok.';
    } else {
        try {
            $stmt = $pdo->prepare("SELECT password FROM users WHERE id = :id");
            $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($currentPassword, $user['password'])) {
                $hashed_new_password = password_hash($newPassword, PASSWORD_DEFAULT);
                $updateStmt = $pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
                $updateStmt->bindParam(':password', $hashed_new_password, PDO::PARAM_STR);
                $updateStmt->bindParam(':id', $userId, PDO::PARAM_INT);

                if ($updateStmt->execute()) {
                    $response = ['status' => 'success', 'message' => 'Kata sandi berhasil diubah.'];
                } else {
                    $response['message'] = 'Gagal mengubah kata sandi di database.';
                }
            } else {
                $response['message'] = 'Kata sandi saat ini salah.';
            }
        } catch (PDOException $e) {
            error_log("Database error on change_password: " . $e->getMessage());
            $response['message'] = 'Terjadi kesalahan server saat mengubah kata sandi.';
        }
    }
    return $response;
}
?>