<?php
// ============================================
// APLIKASI KASIR UMKM - API ENDPOINTS
// ============================================

session_start();

// Check authentication
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['status' => 401, 'message' => 'Unauthorized']);
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

$action = isset($_GET['action']) ? $_GET['action'] : '';
$method = $_SERVER['REQUEST_METHOD'];

function sendResponse($status, $message, $data = null) {
    http_response_code($status);
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

try {
    switch($action) {
        
        // =====================================
        // DASHBOARD ENDPOINTS
        // =====================================
        
        case 'get_dashboard_stats':
            if ($method !== 'GET') {
                sendResponse(405, 'Method not allowed');
            }
            
            $today = date('Y-m-d');
            
            // Today's revenue
            $query = "SELECT SUM(total_harga) as revenue, COUNT(*) as transactions 
                      FROM penjualan 
                      WHERE DATE(tanggal_penjualan) = :today AND status = 'selesai'";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':today', $today);
            $stmt->execute();
            $todayStats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Products count
            $query = "SELECT COUNT(*) as total FROM produk";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $productsCount = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Customers count
            $query = "SELECT COUNT(*) as total FROM pelanggan";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $customersCount = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $stats = [
                'revenue_today' => $todayStats['revenue'] ?? 0,
                'transactions_today' => $todayStats['transactions'] ?? 0,
                'total_products' => $productsCount['total'] ?? 0,
                'total_customers' => $customersCount['total'] ?? 0
            ];
            
            sendResponse(200, 'Success', $stats);
            break;
        
        // =====================================
        // PRODUCTS ENDPOINTS
        // =====================================
        
        case 'get_products':
            if ($method !== 'GET') {
                sendResponse(405, 'Method not allowed');
            }
            
            $query = "SELECT * FROM produk WHERE stok > 0 ORDER BY nama_produk ASC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, 'Success', $products);
            break;
        
        case 'get_all_products':
            if ($method !== 'GET') {
                sendResponse(405, 'Method not allowed');
            }
            
            $query = "SELECT * FROM produk ORDER BY nama_produk ASC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, 'Success', $products);
            break;
        
        case 'add_product':
            if ($method !== 'POST') {
                sendResponse(405, 'Method not allowed');
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->nama_produk) || !isset($data->harga) || !isset($data->stok)) {
                sendResponse(400, 'Data tidak lengkap');
            }
            
            $query = "INSERT INTO produk (nama_produk, harga, stok, kategori, deskripsi) 
                      VALUES (:nama_produk, :harga, :stok, :kategori, :deskripsi)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':nama_produk', $data->nama_produk);
            $stmt->bindParam(':harga', $data->harga);
            $stmt->bindParam(':stok', $data->stok);
            $stmt->bindParam(':kategori', $data->kategori);
            $stmt->bindParam(':deskripsi', $data->deskripsi);
            
            if ($stmt->execute()) {
                sendResponse(200, 'Produk berhasil ditambahkan', ['id' => $db->lastInsertId()]);
            } else {
                sendResponse(500, 'Gagal menambahkan produk');
            }
            break;
        
        case 'update_product':
            if ($method !== 'POST') {
                sendResponse(405, 'Method not allowed');
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->id_produk)) {
                sendResponse(400, 'ID produk tidak ditemukan');
            }
            
            $query = "UPDATE produk SET 
                      nama_produk = :nama_produk,
                      harga = :harga,
                      stok = :stok,
                      kategori = :kategori,
                      deskripsi = :deskripsi
                      WHERE id_produk = :id_produk";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id_produk', $data->id_produk);
            $stmt->bindParam(':nama_produk', $data->nama_produk);
            $stmt->bindParam(':harga', $data->harga);
            $stmt->bindParam(':stok', $data->stok);
            $stmt->bindParam(':kategori', $data->kategori);
            $stmt->bindParam(':deskripsi', $data->deskripsi);
            
            if ($stmt->execute()) {
                sendResponse(200, 'Produk berhasil diupdate');
            } else {
                sendResponse(500, 'Gagal mengupdate produk');
            }
            break;
        
        case 'delete_product':
            if ($method !== 'POST') {
                sendResponse(405, 'Method not allowed');
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->id_produk)) {
                sendResponse(400, 'ID produk tidak ditemukan');
            }
            
            $query = "DELETE FROM produk WHERE id_produk = :id_produk";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id_produk', $data->id_produk);
            
            if ($stmt->execute()) {
                sendResponse(200, 'Produk berhasil dihapus');
            } else {
                sendResponse(500, 'Gagal menghapus produk');
            }
            break;
        
        // =====================================
        // CUSTOMERS ENDPOINTS
        // =====================================
        
        case 'get_customers':
            if ($method !== 'GET') {
                sendResponse(405, 'Method not allowed');
            }
            
            $query = "SELECT * FROM pelanggan ORDER BY nama_pelanggan ASC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, 'Success', $customers);
            break;
        
        case 'add_customer':
            if ($method !== 'POST') {
                sendResponse(405, 'Method not allowed');
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->nama_pelanggan)) {
                sendResponse(400, 'Nama pelanggan harus diisi');
            }
            
            $query = "INSERT INTO pelanggan (nama_pelanggan, no_telepon, alamat) 
                      VALUES (:nama_pelanggan, :no_telepon, :alamat)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':nama_pelanggan', $data->nama_pelanggan);
            $stmt->bindParam(':no_telepon', $data->no_telepon);
            $stmt->bindParam(':alamat', $data->alamat);
            
            if ($stmt->execute()) {
                sendResponse(200, 'Pelanggan berhasil ditambahkan', ['id' => $db->lastInsertId()]);
            } else {
                sendResponse(500, 'Gagal menambahkan pelanggan');
            }
            break;
        
        case 'update_customer':
            if ($method !== 'POST') {
                sendResponse(405, 'Method not allowed');
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->id_pelanggan)) {
                sendResponse(400, 'ID pelanggan tidak ditemukan');
            }
            
            $query = "UPDATE pelanggan SET 
                      nama_pelanggan = :nama_pelanggan,
                      no_telepon = :no_telepon,
                      alamat = :alamat
                      WHERE id_pelanggan = :id_pelanggan";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id_pelanggan', $data->id_pelanggan);
            $stmt->bindParam(':nama_pelanggan', $data->nama_pelanggan);
            $stmt->bindParam(':no_telepon', $data->no_telepon);
            $stmt->bindParam(':alamat', $data->alamat);
            
            if ($stmt->execute()) {
                sendResponse(200, 'Pelanggan berhasil diupdate');
            } else {
                sendResponse(500, 'Gagal mengupdate pelanggan');
            }
            break;
        
        case 'delete_customer':
            if ($method !== 'POST') {
                sendResponse(405, 'Method not allowed');
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->id_pelanggan)) {
                sendResponse(400, 'ID pelanggan tidak ditemukan');
            }
            
            // Prevent deleting default customer
            if ($data->id_pelanggan == 1) {
                sendResponse(400, 'Pelanggan "Umum" tidak dapat dihapus');
            }
            
            $query = "DELETE FROM pelanggan WHERE id_pelanggan = :id_pelanggan";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id_pelanggan', $data->id_pelanggan);
            
            if ($stmt->execute()) {
                sendResponse(200, 'Pelanggan berhasil dihapus');
            } else {
                sendResponse(500, 'Gagal menghapus pelanggan');
            }
            break;
        
        // =====================================
        // CHECKOUT ENDPOINT
        // =====================================
        
        case 'checkout':
            if ($method !== 'POST') {
                sendResponse(405, 'Method not allowed');
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->id_pelanggan) || !isset($data->items) || 
                !isset($data->total_harga) || !isset($data->bayar)) {
                sendResponse(400, 'Data tidak lengkap');
            }
            
            if ($data->bayar < $data->total_harga) {
                sendResponse(400, 'Jumlah bayar kurang dari total harga');
            }
            
            $db->beginTransaction();
            
            try {
                // Cek stok
                foreach($data->items as $item) {
                    $query = "SELECT stok FROM produk WHERE id_produk = :id FOR UPDATE";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':id', $item->id_produk);
                    $stmt->execute();
                    $produk = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if (!$produk || $produk['stok'] < $item->jumlah) {
                        throw new Exception('Stok produk ID ' . $item->id_produk . ' tidak mencukupi');
                    }
                }
                
                // Insert penjualan
                $kembalian = $data->bayar - $data->total_harga;
                $query = "INSERT INTO penjualan (id_pelanggan, total_harga, bayar, kembalian, status) 
                          VALUES (:id_pelanggan, :total_harga, :bayar, :kembalian, 'selesai')";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id_pelanggan', $data->id_pelanggan);
                $stmt->bindParam(':total_harga', $data->total_harga);
                $stmt->bindParam(':bayar', $data->bayar);
                $stmt->bindParam(':kembalian', $kembalian);
                $stmt->execute();
                
                $id_penjualan = $db->lastInsertId();
                
                // Insert detail dan update stok
                foreach($data->items as $item) {
                    $subtotal = $item->harga_satuan * $item->jumlah;
                    $query = "INSERT INTO detail_penjualan 
                              (id_penjualan, id_produk, jumlah, harga_satuan, subtotal) 
                              VALUES (:id_penjualan, :id_produk, :jumlah, :harga_satuan, :subtotal)";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':id_penjualan', $id_penjualan);
                    $stmt->bindParam(':id_produk', $item->id_produk);
                    $stmt->bindParam(':jumlah', $item->jumlah);
                    $stmt->bindParam(':harga_satuan', $item->harga_satuan);
                    $stmt->bindParam(':subtotal', $subtotal);
                    $stmt->execute();
                    
                    $query = "UPDATE produk SET stok = stok - :jumlah WHERE id_produk = :id_produk";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(':jumlah', $item->jumlah);
                    $stmt->bindParam(':id_produk', $item->id_produk);
                    $stmt->execute();
                }
                
                $db->commit();
                
                sendResponse(200, 'Transaksi berhasil', [
                    'id_penjualan' => $id_penjualan,
                    'kembalian' => $kembalian
                ]);
                
            } catch(Exception $e) {
                $db->rollBack();
                sendResponse(500, 'Transaksi gagal: ' . $e->getMessage());
            }
            break;
        
        case 'check_stock':
            if ($method !== 'GET') {
                sendResponse(405, 'Method not allowed');
            }
            
            $id_produk = isset($_GET['id']) ? $_GET['id'] : 0;
            
            $query = "SELECT stok FROM produk WHERE id_produk = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id_produk);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            sendResponse(200, 'Success', $result);
            break;
        
        case 'get_sales':
            if ($method !== 'GET') {
                sendResponse(405, 'Method not allowed');
            }
            
            $query = "SELECT * FROM view_laporan_penjualan LIMIT 100";
            $stmt = $db->prepare($query);
            $stmt->execute();
            
            $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, 'Success', $sales);
            break;
        
        case 'get_sale_detail':
            if ($method !== 'GET') {
                sendResponse(405, 'Method not allowed');
            }
            
            $id_penjualan = isset($_GET['id']) ? $_GET['id'] : 0;
            
            $query = "SELECT dp.*, pr.nama_produk 
                      FROM detail_penjualan dp
                      JOIN produk pr ON dp.id_produk = pr.id_produk
                      WHERE dp.id_penjualan = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id_penjualan);
            $stmt->execute();
            
            $details = $stmt->fetchAll(PDO::FETCH_ASSOC);
            sendResponse(200, 'Success', $details);
            break;
        
        default:
            sendResponse(404, 'Action tidak ditemukan');
            break;
    }
    
} catch(Exception $e) {
    sendResponse(500, 'Server error: ' . $e->getMessage());
}
?>