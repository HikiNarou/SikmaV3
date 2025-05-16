<?php
// File: includes/profile_data_handler.php

function handle_get_profile_data($pdo) {
    if (!userIsLoggedIn()) {
        return ['status' => 'error', 'message' => 'Anda harus login untuk melihat data profil.'];
    }
    $userId = $_SESSION['user_id'];
    $response = ['status' => 'error', 'message' => 'Gagal mengambil data profil.'];

    try {
        $profileData = [];
        $stmt = $pdo->prepare("SELECT id, nama_lengkap, email, nim, avatar, bio, is_profile_complete FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userData) {
            return ['status' => 'error', 'message' => 'Data pengguna tidak ditemukan.'];
        }

        $nameParts = explode(' ', $userData['nama_lengkap'] ?? '', 2);
        $profileData['id'] = $userData['id'];
        $profileData['firstName'] = $nameParts[0] ?? '';
        $profileData['lastName'] = $nameParts[1] ?? '';
        $profileData['nama_lengkap'] = $userData['nama_lengkap'];
        $profileData['email'] = $userData['email'];
        $profileData['nim'] = $userData['nim'];
        $profileData['avatar'] = $userData['avatar'];
        $profileData['bio'] = $userData['bio'];
        $profileData['is_profile_complete'] = (bool)$userData['is_profile_complete'];

        $itemTypes = [
            'programmingSkill' => 'user_programming_skills',
            'framework' => 'user_frameworks',
            'otherSkill' => 'user_other_skills',
            'education' => 'user_education_history',
            'experience' => 'user_work_experience',
            'socialLink' => 'user_social_links',
        ];

        foreach ($itemTypes as $frontendKey => $tableName) {
            $stmt = $pdo->prepare("SELECT * FROM {$tableName} WHERE user_id = :user_id ORDER BY created_at ASC, id ASC");
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            $fetchedItems = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Ensure all expected keys are present, even if null, to match JS expectations
            $profileData[$frontendKey] = array_map(function($item) use ($frontendKey) {
                // Add default nulls for fields expected by JS if not present in DB (though schema should ensure they are)
                // This is more for robustness if schema changes or data is old
                $expectedFields = [];
                 switch ($frontendKey) {
                    case 'programmingSkill': $expectedFields = ['id', 'user_id', 'skill_name', 'skill_level', 'experience_duration', 'created_at']; break;
                    case 'framework': $expectedFields = ['id', 'user_id', 'framework_name', 'skill_level', 'experience_duration', 'created_at']; break;
                    case 'otherSkill': $expectedFields = ['id', 'user_id', 'skill_name', 'skill_level', 'experience_duration', 'created_at']; break;
                    case 'education': $expectedFields = ['id', 'user_id', 'institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'description', 'created_at']; break;
                    case 'experience': $expectedFields = ['id', 'user_id', 'company_name', 'job_title', 'start_date', 'end_date', 'description', 'created_at']; break;
                    case 'socialLink': $expectedFields = ['id', 'user_id', 'platform_name', 'url', 'created_at']; break;
                }
                foreach ($expectedFields as $field) {
                    if (!array_key_exists($field, $item)) {
                        $item[$field] = null;
                    }
                }
                return $item;
            }, $fetchedItems);
        }
        $response = ['status' => 'success', 'data' => $profileData];
    } catch (PDOException $e) {
        error_log("PDOException in handle_get_profile_data for user $userId: " . $e->getMessage() . " | SQL: " . ($stmt ? $stmt->queryString : "N/A"));
        $response['message'] = 'Terjadi kesalahan server saat mengambil data profil.';
    }
    return $response;
}

function handle_save_full_profile($pdo) {
    if (!userIsLoggedIn()) {
        return ['status' => 'error', 'message' => 'Anda harus login untuk menyimpan data profil.'];
    }
    $userId = $_SESSION['user_id'];
    $response = ['status' => 'error', 'message' => 'Gagal menyimpan data profil. Kesalahan Umum.'];

    $firstName = trim($_POST['firstName'] ?? '');
    $lastName = trim($_POST['lastName'] ?? '');
    $bio = trim($_POST['bio'] ?? '');
    $nama_lengkap = trim($firstName . " " . $lastName);
    $avatarPath = $_SESSION['user_avatar'];

    if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] == UPLOAD_ERR_OK) {
        $uploadDir = "uploads/avatars/"; // Path relative to web root
        $physicalUploadDir = dirname(__FILE__) . '/../' . $uploadDir; // Physical path from this script

        if (!is_dir($physicalUploadDir)) {
            if (!mkdir($physicalUploadDir, 0775, true)) {
                error_log("Failed to create avatar directory: " . $physicalUploadDir);
                $response['message'] = "Gagal membuat direktori upload avatar.";
                return $response;
            }
        }

        $fileName = $userId . "_" . time() . "_" . basename($_FILES["avatar"]["name"]);
        $targetFilePath = $physicalUploadDir . $fileName;
        $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
        $allowTypes = ['jpg', 'png', 'jpeg', 'gif'];

        if (!in_array($fileType, $allowTypes)) {
            $response['message'] = "Format file avatar tidak diizinkan (hanya JPG, JPEG, PNG, GIF).";
        } elseif ($_FILES["avatar"]["size"] > (5 * 1024 * 1024)) {
            $response['message'] = "Ukuran file avatar terlalu besar (Maks 5MB).";
        } elseif (move_uploaded_file($_FILES["avatar"]["tmp_name"], $targetFilePath)) {
            $avatarPath = $uploadDir . $fileName; // Web relative path for DB
            if ($_SESSION['user_avatar'] && strpos($_SESSION['user_avatar'], 'placehold.co') === false) {
                $oldAvatarPhysicalPath = dirname(__FILE__) . '/../' . $_SESSION['user_avatar'];
                if (file_exists($oldAvatarPhysicalPath) && $_SESSION['user_avatar'] !== $avatarPath) {
                    unlink($oldAvatarPhysicalPath);
                }
            }
        } else {
            error_log("Avatar move_uploaded_file failed. Error code: " . $_FILES['avatar']['error']);
            $response['message'] = "Gagal mengupload file avatar.";
            return $response;
        }
    } elseif (isset($_FILES['avatar']) && $_FILES['avatar']['error'] != UPLOAD_ERR_NO_FILE) {
        error_log("Avatar upload error code: " . $_FILES['avatar']['error']);
        $response['message'] = "Masalah dengan file avatar yang diupload.";
        return $response;
    }

    try {
        $pdo->beginTransaction();

        $stmtUser = $pdo->prepare("UPDATE users SET nama_lengkap = :nama_lengkap, bio = :bio, avatar = :avatar WHERE id = :user_id");
        $stmtUser->bindParam(':nama_lengkap', $nama_lengkap, PDO::PARAM_STR);
        $stmtUser->bindParam(':bio', $bio, PDO::PARAM_STR);
        $stmtUser->bindParam(':avatar', $avatarPath, PDO::PARAM_STR);
        $stmtUser->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmtUser->execute();

        $_SESSION['user_nama_lengkap'] = $nama_lengkap;
        $_SESSION['user_bio'] = $bio;
        $_SESSION['user_avatar'] = $avatarPath;

        // Config: frontendKey => [tableName, [db_columns_expected_from_item_object]]
        // **PENTING**: Nama kolom di $dbColumns HARUS SAMA PERSIS dengan nama kolom di tabel database Anda.
        $itemTypeMappings = [
            'programmingSkill' => ['user_programming_skills', ['skill_name', 'skill_level', 'experience_duration']],
            'framework' => ['user_frameworks', ['framework_name', 'skill_level', 'experience_duration']],
            'otherSkill' => ['user_other_skills', ['skill_name', 'skill_level', 'experience_duration']],
            'education' => ['user_education_history', ['institution_name', 'degree', 'field_of_study', 'start_date', 'end_date', 'description']],
            'experience' => ['user_work_experience', ['company_name', 'job_title', 'start_date', 'end_date', 'description']],
            'socialLink' => ['user_social_links', ['platform_name', 'url']],
        ];
        
        $savedItemIdsMap = [];

        foreach ($itemTypeMappings as $frontendKey => $config) {
            $tableName = $config[0];
            $dbColumns = $config[1]; // These are the columns we expect in each item object from frontend

            if (isset($_POST[$frontendKey])) {
                $itemsJson = $_POST[$frontendKey];
                $items = json_decode($itemsJson, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    error_log("Invalid JSON for $frontendKey: $itemsJson. Error: " . json_last_error_msg());
                    throw new Exception("Data JSON tidak valid untuk: " . $frontendKey);
                }
                
                if (is_array($items)) {
                    $deleteStmt = $pdo->prepare("DELETE FROM {$tableName} WHERE user_id = :user_id");
                    $deleteStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                    $deleteStmt->execute();

                    if (!empty($items)) {
                        // Build column list and placeholder list for the INSERT statement
                        $insertColumnNames = implode(', ', $dbColumns);
                        $insertPlaceholders = ':' . implode(', :', $dbColumns);
                        
                        $insertSql = "INSERT INTO {$tableName} (user_id, {$insertColumnNames}) VALUES (:user_id, {$insertPlaceholders})";
                        $insertStmt = $pdo->prepare($insertSql);

                        foreach ($items as $item) {
                            $insertStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                            foreach ($dbColumns as $col) {
                                // Bind value or null if the key doesn't exist in the item
                                $value = isset($item[$col]) ? $item[$col] : null;
                                // Explicitly bind null for empty strings for date fields if they are nullable
                                if (in_array($col, ['start_date', 'end_date']) && $value === '') {
                                    $value = null;
                                }
                                $insertStmt->bindValue(":$col", $value); // Use named placeholders
                            }
                            if (!$insertStmt->execute()) {
                                $errorInfo = $insertStmt->errorInfo();
                                error_log("Failed to insert item into $tableName for user $userId. SQL Error: " . $errorInfo[2] . " | Item data: " . json_encode($item));
                                throw new PDOException("Gagal menyisipkan item ke $tableName. Error: " . $errorInfo[2]);
                            }
                            
                            $lastInsertId = $pdo->lastInsertId();
                            if (isset($item['client_id'])) {
                                if (!isset($savedItemIdsMap[$frontendKey])) {
                                    $savedItemIdsMap[$frontendKey] = [];
                                }
                                $savedItemIdsMap[$frontendKey][$item['client_id']] = $lastInsertId;
                            }
                        }
                    }
                }
            } else {
                // If the key is not in $_POST, it means the user has no items of this type.
                // Ensure existing items are cleared.
                $deleteStmt = $pdo->prepare("DELETE FROM {$tableName} WHERE user_id = :user_id");
                $deleteStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
                $deleteStmt->execute();
            }
        }

        $isProfileComplete = checkProfileCompleteness($pdo, $userId);

        $pdo->commit();
        $response = [
            'status' => 'success',
            'message' => 'Data profil berhasil disimpan!',
            'user_data' => [
                'nama_lengkap' => $nama_lengkap,
                'avatar' => $avatarPath,
                'bio' => $bio,
                'is_profile_complete' => $isProfileComplete
            ],
            'saved_item_ids' => $savedItemIdsMap
        ];

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        // Log more detailed error
        error_log("PDOException in handle_save_full_profile for user $userId: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
        $response['message'] = 'Terjadi kesalahan database saat menyimpan data profil.';
        // $response['db_error_details'] = $e->getMessage(); // For debugging on client, REMOVE IN PRODUCTION
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Exception in handle_save_full_profile for user $userId: " . $e->getMessage());
        $response['message'] = 'Terjadi kesalahan server: ' . $e->getMessage();
    }
    return $response;
}
?>