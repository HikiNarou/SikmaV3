<?php
// Ini akan menjadi router utama untuk semua aksi backend
// Selalu mulai session dan set header JSON
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json');

require_once 'includes/db_connect.php'; // $pdo akan tersedia
require_once 'includes/session_utils.php';
require_once 'includes/user_handler.php';
require_once 'includes/company_handler.php';
require_once 'includes/profile_data_handler.php';


$action = $_POST['action'] ?? $_GET['action'] ?? '';
$response = ['status' => 'error', 'message' => 'Aksi tidak valid atau tidak diberikan.'];

switch ($action) {
    // User Authentication & Management
    case 'register':
        $response = handle_register($pdo);
        break;
    case 'login':
        $response = handle_login($pdo);
        break;
    case 'logout':
        $response = handle_logout();
        break;
    case 'check_session':
        $response = handle_check_session($pdo);
        break;
    case 'update_profile': // Untuk update dasar (nama, bio, avatar) dari settings
        $response = handle_update_profile($pdo);
        break;
    case 'change_password':
        $response = handle_change_password($pdo);
        break;

    // Profile Data (skills, experience, etc.)
    case 'save_full_profile': // Untuk menyimpan semua data dari halaman "Lengkapi Profil"
        $response = handle_save_full_profile($pdo);
        break;
    case 'get_profile_data': // Untuk mengambil data profil lengkap untuk ditampilkan di halaman profil
        $response = handle_get_profile_data($pdo);
        break;

    // Company Data
    case 'get_company_details':
        $response = handle_get_company_details($pdo); // Masih menggunakan dummy data
        break;
    
    // Tambahkan case lain jika ada aksi baru
    // default:
    //     $response tetap default error message
}

echo json_encode($response);
exit;
?>