<?php
session_start();

// Check authentication
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aplikasi Kasir UMKM</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
</head>
<body>
    <!-- NAVBAR -->
    <nav class="navbar">
        <div class="navbar-container">
            <div class="navbar-brand">
                <i class="bi bi-cart3"></i> Aplikasi Kasir
            </div>
            <ul class="navbar-menu">
                <li><a href="#" class="nav-link active" data-page="dashboard">Dashboard</a></li>
                <li><a href="#" class="nav-link" data-page="kasir">Kasir</a></li>
                <li><a href="#" class="nav-link" data-page="stok">Stok Barang</a></li>
                <li><a href="#" class="nav-link" data-page="pelanggan">Pelanggan</a></li>
                <li><a href="#" class="nav-link" data-page="riwayat">Riwayat</a></li>
                <li><a href="#" class="nav-link" data-page="laporan">Laporan</a></li>
            </ul>
            <div class="navbar-user">
                <span><i class="bi bi-person-fill"></i> <?php echo htmlspecialchars($_SESSION['username']); ?></span>
                <a href="logout.php" class="btn-logout">Logout</a>
            </div>
        </div>
    </nav>

    <div class="container">
        
        <!-- ==========================================
             HALAMAN DASHBOARD
             ========================================== -->
        <div id="dashboardPage" class="page active">
            <div class="dashboard-wrapper">
                <!-- Header dengan Greeting -->
                <div class="dashboard-header">
                    <div class="greeting-section">
                        <h1 class="greeting-title">Dashboard Overview</h1>
                        <p class="greeting-subtitle">Selamat datang kembali, <?php echo htmlspecialchars($_SESSION['username']); ?>! 👋</p>
                    </div>
                    <div class="date-display">
                        <i class="bi bi-calendar3"></i>
                        <div class="date-info">
                            <div class="current-date" id="currentDate"></div>
                            <div class="current-time" id="currentTime"></div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-content">
                    <!-- Stats Cards dengan Design Baru -->
                    <div class="stats-container">
                        <div class="stat-card-modern revenue-card">
                            <div class="stat-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Pendapatan Hari Ini</div>
                                <div class="stat-card-value" id="revenueToday">Rp 0</div>
                                <div class="stat-card-trend positive">
                                    <span class="trend-icon">↑</span>
                                    <span class="trend-text">Revenue dari transaksi hari ini</span>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card-modern transaction-card">
                            <div class="stat-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Transaksi Hari Ini</div>
                                <div class="stat-card-value" id="transactionCount">0</div>
                                <div class="stat-card-trend neutral">
                                    <span class="trend-icon">●</span>
                                    <span class="trend-text">Total transaksi selesai</span>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card-modern product-card">
                            <div class="stat-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Total Produk</div>
                                <div class="stat-card-value" id="productCount">0</div>
                                <div class="stat-card-trend neutral">
                                    <span class="trend-icon">●</span>
                                    <span class="trend-text">Produk dalam database</span>
                                </div>
                            </div>
                        </div>

                        <div class="stat-card-modern customer-card">
                            <div class="stat-card-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
                                </svg>
                            </div>
                            <div class="stat-card-content">
                                <div class="stat-card-label">Total Pelanggan</div>
                                <div class="stat-card-value" id="customerCount">0</div>
                                <div class="stat-card-trend neutral">
                                    <span class="trend-icon">●</span>
                                    <span class="trend-text">Pelanggan terdaftar</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Chart dan Transactions dalam 2 Kolom -->
                    <div class="dashboard-grid">
                        <!-- Chart Section -->
                        <div class="dashboard-card chart-card">
                            <div class="card-header">
                                <h3 class="card-title">Penjualan 7 Hari Terakhir</h3>
                                <div class="card-badge">Grafik</div>
                            </div>
                            <div class="chart-container">
                                <canvas id="salesChart"></canvas>
                            </div>
                        </div>

                        <!-- Recent Transactions -->
                        <div class="dashboard-card transactions-card">
                            <div class="card-header">
                                <h3 class="card-title">Transaksi Terbaru</h3>
                                <div class="card-badge">Hari Ini</div>
                            </div>
                            <div class="transactions-list" id="recentTransactionsList">
                                <div class="loading-state">
                                    <div class="loading-spinner"></div>
                                    <p>Memuat data...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- ==========================================
             HALAMAN KASIR
             ========================================== -->
        <div id="kasirPage" class="page">
            <div class="content-wrapper">
                <div class="page-header">
                    <h2>Point of Sale</h2>
                    <p>Pilih produk dan lakukan transaksi penjualan</p>
                </div>
                
                <div class="kasir-layout">
                    <!-- Products Section -->
                    <div class="products-section">
                        <div class="search-bar">
                            <input type="text" id="searchProduct" placeholder="🔍 Cari produk...">
                        </div>
                        <div class="products-grid" id="productsGrid">
                            <!-- Products akan dimuat di sini -->
                        </div>
                    </div>

                    <!-- Cart Section -->
                    <div class="cart-section">
                        <div class="customer-select">
                            <label>Pilih Pelanggan:</label>
                            <select id="customerSelect">
                                <option value="1">Pelanggan Umum</option>
                            </select>
                        </div>

                        <div class="cart-items" id="cartItems">
                            <div class="empty-cart">
                                <div style="font-size: 3em;"><i class="bi bi-cart2"></i></div>
                                <p>Keranjang Kosong</p>
                            </div>
                        </div>

                        <div class="cart-summary">
                            <div class="summary-row">
                                <span>Total Items:</span>
                                <span id="totalItems">0</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total:</span>
                                <span id="totalPrice">Rp 0</span>
                            </div>
                        </div>

                        <div class="payment-section">
                            <label>Jumlah Bayar:</label>
                            <input type="number" id="paymentAmount" placeholder="0" min="0">
                        </div>

                        <div class="change-display" id="changeDisplay" style="display: none;">
                            <div class="label">Kembalian:</div>
                            <div class="amount" id="changeAmount">Rp 0</div>
                        </div>

                        <button class="btn btn-primary btn-block" id="btnCheckout" disabled>
                            Bayar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==========================================
             HALAMAN MANAJEMEN STOK
             ========================================== -->
        <div id="stokPage" class="page">
            <div class="content-wrapper">
                <div class="page-header">
                    <h2>Manajemen Stok</h2>
                    <p>Kelola data produk dan stok barang</p>
                </div>
                
                <div style="padding: 30px;">
                    <!-- Form Tambah Produk -->
                    <div class="form-section">
                        <h3>Tambah Produk Baru</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nama Produk *</label>
                                <input type="text" id="namaProduk" placeholder="Masukkan nama produk">
                            </div>
                            <div class="form-group">
                                <label>Harga *</label>
                                <input type="number" id="hargaProduk" placeholder="0" min="0">
                            </div>
                            <div class="form-group">
                                <label>Stok Awal *</label>
                                <input type="number" id="stokProduk" placeholder="0" min="0">
                            </div>
                            <div class="form-group">
                                <label>Kategori</label>
                                <input type="text" id="kategoriProduk" placeholder="Contoh: Minuman, Makanan">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Deskripsi</label>
                            <textarea id="deskripsiProduk" placeholder="Deskripsi produk (opsional)"></textarea>
                        </div>
                        <button class="btn btn-primary" id="btnAddProduct">Tambah Produk</button>
                    </div>

                    <!-- Daftar Produk -->
                    <div class="table-container">
                        <div class="table-header">
                            <h3>Daftar Produk</h3>
                            <div class="table-controls">
                                <input type="text" id="searchProductTable" placeholder="Cari produk...">
                            </div>
                        </div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nama Produk</th>
                                    <th>Harga</th>
                                    <th>Stok Saat Ini</th>
                                    <th>Status Stok</th>
                                    <th>Kategori</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="productTableBody">
                                <tr><td colspan="6" class="text-center">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==========================================
             HALAMAN MANAJEMEN PELANGGAN
             ========================================== -->
        <div id="pelangganPage" class="page">
            <div class="content-wrapper">
                <div class="page-header">
                    <h2>Manajemen Pelanggan</h2>
                    <p>Kelola data pelanggan</p>
                </div>
                
                <div style="padding: 30px;">
                    <!-- Form Tambah Pelanggan -->
                    <div class="form-section">
                        <h3>Tambah Pelanggan Baru</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nama Pelanggan *</label>
                                <input type="text" id="namaPelanggan" placeholder="Masukkan nama pelanggan">
                            </div>
                            <div class="form-group">
                                <label>Nomor Telepon</label>
                                <input type="text" id="noTelepon" placeholder="08xxxxxxxxxx">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Alamat</label>
                            <textarea id="alamatPelanggan" placeholder="Alamat lengkap (opsional)"></textarea>
                        </div>
                        <button class="btn btn-primary" id="btnAddCustomer">Tambah Pelanggan</button>
                    </div>

                    <!-- Daftar Pelanggan -->
                    <div class="table-container">
                        <div class="table-header">
                            <h3>Daftar Pelanggan</h3>
                            <div class="table-controls">
                                <input type="text" id="searchCustomerTable" placeholder="🔍 Cari pelanggan...">
                            </div>
                        </div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nama Pelanggan</th>
                                    <th>Nomor Telepon</th>
                                    <th>Alamat</th>
                                    <th>Terdaftar</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="customerTableBody">
                                <tr><td colspan="5" class="text-center">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==========================================
             HALAMAN RIWAYAT TRANSAKSI
             ========================================== -->
        <div id="riwayatPage" class="page">
            <div class="content-wrapper">
                <div class="page-header">
                    <h2>Riwayat Transaksi</h2>
                    <p>Riwayat transaksi penjualan</p>
                </div>
                
                <div style="padding: 30px;">
                    <div class="table-container">
                        <div class="table-header">
                            <h3>Riwayat Transaksi Penjualan</h3>
                            <div class="table-controls">
                                <input type="date" id="filterDate">
                                <button class="btn btn-sm btn-primary" onclick="filterByDate()">Filter</button>
                            </div>
                        </div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>No. Nota</th>
                                    <th>Tanggal</th>
                                    <th>Pelanggan</th>
                                    <th>Total</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="salesHistoryBody">
                                <tr><td colspan="5" class="text-center">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==========================================
             HALAMAN LAPORAN
             ========================================== -->
        <div id="laporanPage" class="page">
            <div class="content-wrapper">
                <div class="page-header">
                    <h2>Laporan Transaksi</h2>
                    <p>Cetak dan export laporan penjualan</p>
                </div>
                
                <div style="padding: 30px;">
                    <!-- Filter Section -->
                    <div class="report-filter-section">
                        <h3><i class="bi bi-funnel"></i> Filter Laporan</h3>
                        
                        <div class="filter-controls">
                            <div class="filter-row">
                                <div class="filter-group">
                                    <label>Jenis Filter:</label>
                                    <select id="filterType" onchange="toggleFilterInputs()">
                                        <option value="all">Semua Data</option>
                                        <option value="today">Hari Ini</option>
                                        <option value="range">Rentang Tanggal</option>
                                        <option value="month">Per Bulan</option>
                                    </select>
                                </div>
                                
                                <div class="filter-group" id="dateRangeFilter" style="display: none;">
                                    <label>Dari Tanggal:</label>
                                    <input type="date" id="filterStartDate">
                                    <label>Sampai Tanggal:</label>
                                    <input type="date" id="filterEndDate">
                                </div>
                                
                                <div class="filter-group" id="monthFilter" style="display: none;">
                                    <label>Pilih Bulan:</label>
                                    <input type="month" id="filterMonth">
                                </div>
                            </div>
                            
                            <div class="filter-actions">
                                <button class="btn btn-primary" onclick="applyFilters()">
                                    <i class="bi bi-search"></i> Terapkan Filter
                                </button>
                                <button class="btn btn-warning" onclick="resetFilters()">
                                    <i class="bi bi-arrow-clockwise"></i> Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Summary Cards -->
                    <div class="report-summary">
                        <div class="summary-card">
                            <div class="summary-icon">
                                <i class="bi bi-receipt"></i>
                            </div>
                            <div class="summary-content">
                                <div class="summary-label">Total Transaksi</div>
                                <div class="summary-value" id="reportTotalTransaksi">0</div>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="summary-icon">
                                <i class="bi bi-cash-stack"></i>
                            </div>
                            <div class="summary-content">
                                <div class="summary-label">Total Pendapatan</div>
                                <div class="summary-value" id="reportTotalPendapatan">Rp 0</div>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="summary-icon">
                                <i class="bi bi-wallet2"></i>
                            </div>
                            <div class="summary-content">
                                <div class="summary-label">Total Bayar</div>
                                <div class="summary-value" id="reportTotalBayar">Rp 0</div>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <div class="summary-icon">
                                <i class="bi bi-arrow-return-left"></i>
                            </div>
                            <div class="summary-content">
                                <div class="summary-label">Total Kembalian</div>
                                <div class="summary-value" id="reportTotalKembalian">Rp 0</div>
                            </div>
                        </div>
                    </div>

                    <!-- Export Actions -->
                    <div class="export-actions">
                        <button class="btn btn-danger" onclick="exportToPDF()">
                            <i class="bi bi-file-pdf"></i> Export ke PDF
                        </button>
                        <button class="btn btn-success" onclick="exportToExcel()">
                            <i class="bi bi-file-excel"></i> Export ke Excel
                        </button>
                    </div>

                    <!-- Report Table -->
                    <div class="table-container">
                        <div class="table-header">
                            <h3>Detail Transaksi</h3>
                        </div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>No. Nota</th>
                                    <th>Tanggal & Waktu</th>
                                    <th>Pelanggan</th>
                                    <th>Total</th>
                                    <th>Bayar</th>
                                    <th>Kembalian</th>
                                </tr>
                            </thead>
                            <tbody id="reportTableBody">
                                <tr><td colspan="6" class="text-center">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- Receipt Print Template (Hidden) -->
    <div id="receiptTemplate" style="display: none;">
        <!-- Template will be populated by JavaScript -->
    </div>

    <!-- JavaScript Files -->
    <script src="app.js"></script>
    <script src="stok-manager.js"></script>
    <script src="customer-manager.js"></script>
    <script src="dashboard.js"></script>
    <script src="receipt.js"></script>
    <script src="report.js"></script>
</body>
</html>