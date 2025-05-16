<?php
// db_connect.php dan session_utils.php di-include oleh auth.php

function handle_save_full_profile($pdo) {
    if (!userIsLoggedIn()) {
        return ['status' => 'error', 'message' => 'Anda harus login untuk menyimpan data profil.'];
    }
    $userId = $_SESSION['user_id'];
    $response = ['status' => 'error', 'message' => 'Gagal menyimpan data profil.'];

    // Data dari form utama (nama, bio sudah dihandle di update_profile, tapi bisa juga di sini)
    // $nama_lengkap = trim($_POST['nama_lengkap'] ?? $_SESSION['user_nama_lengkap']);
    // $bio = trim($_POST['bio'] ?? $_SESSION['user_bio']);

    // Data dari item-item dinamis (skills, frameworks, etc.)
    // Frontend akan mengirimkan data ini dalam format JSON string, jadi kita perlu decode
    $programming_skills_json = $_POST['programming_skills'] ?? '[]';
    $frameworks_json = $_POST['frameworks'] ?? '[]';
    $other_skills_json = $_POST['other_skills'] ?? '[]'; // Misal
    $education_json = $_POST['education'] ?? '[]';       // Misal
    $experience_json = $_POST['experience'] ?? '[]';     // Misal

    // Validasi JSON (opsional tapi bagus)
    $programming_skills = json_decode($programming_skills_json, true);
    $frameworks = json_decode($frameworks_json, true);
    $other_skills = json_decode($other_skills_json, true);
    $education = json_decode($education_json, true);
    $experience = json_decode($experience_json, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        $response['message'] = 'Format data profil tidak valid.';
        return $response;
    }

    try {
        // Simpan data ini ke tabel `users` atau tabel terpisah (misal `user_profile_details`)
        // Contoh: menyimpan sebagai JSON di kolom `users` (jika kolomnya ada dan bertipe TEXT/JSON)
        // Anda mungkin perlu membuat kolom baru: programming_skills (TEXT), frameworks (TEXT), etc.
        // Atau, lebih baik, buat tabel relasional seperti user_skills, user_education, user_experience.
        // Untuk contoh ini, kita asumsikan menyimpan JSON di kolom `users`.

        // $sql = "UPDATE users SET 
        //             programming_skills = :prog_skills, 
        //             frameworks = :frameworks,
        //             other_skills = :other_skills,
        //             education_history = :education,
        //             work_experience = :experience
        //         WHERE id = :id";
        
        // Ini adalah contoh sederhana, Anda harus menyesuaikan dengan struktur DB Anda.
        // Untuk sekarang, kita hanya akan fokus pada update `bio` dan `programming_skills` sebagai contoh.
        // Dan set `is_profile_complete` menjadi true.

        $stmt = $pdo->prepare("UPDATE users SET 
                                programming_skills = :prog_skills, 
                                frameworks = :frameworks,
                                -- Tambahkan kolom lain di sini jika ada di tabel users
                                is_profile_complete = 1 
                               WHERE id = :id");
        
        $stmt->bindParam(':prog_skills', $programming_skills_json, PDO::PARAM_STR);
        $stmt->bindParam(':frameworks', $frameworks_json, PDO::PARAM_STR);
        // Bind parameter lain
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);

        if ($stmt->execute()) {
            // Update session juga
            $_SESSION['is_profile_complete'] = true;
            // Jika Anda menyimpan data ini di session, update juga:
            // $_SESSION['user_programming_skills'] = $programming_skills; 
            // $_SESSION['user_frameworks'] = $frameworks;

            // Cek ulang kelengkapan profil untuk memastikan (atau langsung set true jika save berhasil)
            checkProfileCompleteness($pdo, $userId); 

            $response = [
                'status' => 'success',
                'message' => 'Data profil berhasil disimpan!',
                'user_data' => [ // Kirim balik data yang mungkin diperbarui untuk UI
                    'is_profile_complete' => true
                ]
            ];
        } else {
            $response['message'] = 'Gagal menyimpan data profil ke database.';
        }

    } catch (PDOException $e) {
        error_log("Database error on save_full_profile: " . $e->getMessage());
        $response['message'] = 'Terjadi kesalahan server saat menyimpan data profil.';
    }
    return $response;
}


function handle_get_profile_data($pdo) {
    if (!userIsLoggedIn()) {
        return ['status' => 'error', 'message' => 'Anda harus login untuk melihat data profil.'];
    }
    $userId = $_SESSION['user_id'];
    $response = ['status' => 'error', 'message' => 'Gagal mengambil data profil.'];

    try {
        // Ambil semua data profil yang relevan, termasuk yang disimpan sebagai JSON
        $stmt = $pdo->prepare("SELECT nama_lengkap, email, nim, avatar, bio, is_profile_complete, 
                                      programming_skills, frameworks -- dan kolom lain yang Anda tambahkan
                               FROM users WHERE id = :id");
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($userData) {
            $response = [
                'status' => 'success',
                'data' => [
                    'nama_lengkap' => $userData['nama_lengkap'],
                    'email' => $userData['email'],
                    'nim' => $userData['nim'],
                    'avatar' => $userData['avatar'],
                    'bio' => $userData['bio'],
                    'is_profile_complete' => (bool)$userData['is_profile_complete'],
                    'programming_skills' => json_decode($userData['programming_skills'] ?? '[]', true),
                    'frameworks' => json_decode($userData['frameworks'] ?? '[]', true)
                    // ... decode JSON untuk field lain ...
                ]
            ];
        } else {
            $response['message'] = 'Data pengguna tidak ditemukan.';
        }
    } catch (PDOException $e) {
        error_log("Database error on get_profile_data: " . $e->getMessage());
        $response['message'] = 'Terjadi kesalahan server saat mengambil data profil.';
    }
    return $response;
}

?>