<?php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root'); // Sesuaikan dengan konfigurasi Anda
define('DB_PASSWORD', '');   // Sesuaikan dengan konfigurasi Anda
define('DB_NAME', 'sikma_dbv3'); // Sesuaikan dengan nama database Anda

try {
    $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("SET NAMES 'utf8mb4'");
} catch(PDOException $e){
    // Di lingkungan produksi, ini harus dicatat ke log, bukan ditampilkan ke pengguna.
    // Untuk tujuan pengembangan, kita bisa menampilkan pesan dasar.
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => "Koneksi database gagal. Silakan hubungi administrator. Error: " . $e->getMessage() // Hapus $e->getMessage() di produksi
    ]);
    exit; // Hentikan eksekusi
}
?>