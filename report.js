// ==========================================
// REPORT GENERATOR - LAPORAN TRANSAKSI
// ==========================================

let reportData = [];
let filteredReportData = [];

// ==========================================
// LOAD REPORT DATA
// ==========================================
async function loadReportData() {
    try {
        const response = await fetch(`${API_URL}?action=get_sales`);
        const result = await response.json();
        
        if (result.status === 200) {
            reportData = result.data;
            filteredReportData = reportData;
            renderReportTable(filteredReportData);
            updateReportSummary(filteredReportData);
        }
    } catch (error) {
        showNotification('Error loading report data: ' + error.message, 'error');
    }
}

// ==========================================
// RENDER REPORT TABLE
// ==========================================
function renderReportTable(data) {
    const tbody = document.getElementById('reportTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data transaksi</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(sale => `
        <tr>
            <td>#${sale.id_penjualan}</td>
            <td>${formatDateTime(sale.tanggal_penjualan)}</td>
            <td>${sale.nama_pelanggan || 'Pelanggan Umum'}</td>
            <td>Rp ${formatNumber(sale.total_harga)}</td>
            <td>Rp ${formatNumber(sale.bayar)}</td>
            <td>Rp ${formatNumber(sale.kembalian)}</td>
        </tr>
    `).join('');
}

// ==========================================
// UPDATE REPORT SUMMARY
// ==========================================
function updateReportSummary(data) {
    const totalTransaksi = data.length;
    const totalPendapatan = data.reduce((sum, sale) => sum + parseFloat(sale.total_harga), 0);
    const totalBayar = data.reduce((sum, sale) => sum + parseFloat(sale.bayar), 0);
    const totalKembalian = data.reduce((sum, sale) => sum + parseFloat(sale.kembalian), 0);
    
    document.getElementById('reportTotalTransaksi').textContent = totalTransaksi;
    document.getElementById('reportTotalPendapatan').textContent = 'Rp ' + formatNumber(totalPendapatan);
    document.getElementById('reportTotalBayar').textContent = 'Rp ' + formatNumber(totalBayar);
    document.getElementById('reportTotalKembalian').textContent = 'Rp ' + formatNumber(totalKembalian);
}

// ==========================================
// FILTER FUNCTIONS
// ==========================================
function applyFilters() {
    const filterType = document.getElementById('filterType').value;
    const filterStartDate = document.getElementById('filterStartDate').value;
    const filterEndDate = document.getElementById('filterEndDate').value;
    const filterMonth = document.getElementById('filterMonth').value;
    
    let filtered = [...reportData];
    
    // Filter by date range
    if (filterType === 'range' && filterStartDate && filterEndDate) {
        filtered = filtered.filter(sale => {
            const saleDate = new Date(sale.tanggal_penjualan).toISOString().split('T')[0];
            return saleDate >= filterStartDate && saleDate <= filterEndDate;
        });
    }
    
    // Filter by month
    if (filterType === 'month' && filterMonth) {
        filtered = filtered.filter(sale => {
            const saleMonth = new Date(sale.tanggal_penjualan).toISOString().substring(0, 7);
            return saleMonth === filterMonth;
        });
    }
    
    // Filter by today
    if (filterType === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(sale => {
            const saleDate = new Date(sale.tanggal_penjualan).toISOString().split('T')[0];
            return saleDate === today;
        });
    }
    
    filteredReportData = filtered;
    renderReportTable(filteredReportData);
    updateReportSummary(filteredReportData);
    
    showNotification(`Filter diterapkan: ${filtered.length} transaksi ditemukan`, 'info');
}

function resetFilters() {
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('filterMonth').value = '';
    
    toggleFilterInputs();
    
    filteredReportData = reportData;
    renderReportTable(filteredReportData);
    updateReportSummary(filteredReportData);
    
    showNotification('Filter direset', 'info');
}

function toggleFilterInputs() {
    const filterType = document.getElementById('filterType').value;
    
    document.getElementById('dateRangeFilter').style.display = filterType === 'range' ? 'flex' : 'none';
    document.getElementById('monthFilter').style.display = filterType === 'month' ? 'block' : 'none';
}

// ==========================================
// EXPORT TO PDF
// ==========================================
function exportToPDF() {
    if (filteredReportData.length === 0) {
        showNotification('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const html = generatePDFHTML(filteredReportData);
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function generatePDFHTML(data) {
    const now = new Date();
    const totalPendapatan = data.reduce((sum, sale) => sum + parseFloat(sale.total_harga), 0);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Transaksi</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 30px;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #001B48;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #001B48;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 14px;
        }
        
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 25px;
            padding: 15px;
            background: #f8f9fc;
            border-radius: 8px;
        }
        
        .info-item {
            text-align: center;
        }
        
        .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 18px;
            font-weight: bold;
            color: #001B48;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        
        thead {
            background: #001B48;
            color: white;
        }
        
        th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
        }
        
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
        }
        
        tbody tr:nth-child(even) {
            background: #f8f9fc;
        }
        
        tbody tr:hover {
            background: #e8f4f8;
        }
        
        .total-section {
            margin-top: 25px;
            padding: 20px;
            background: #001B48;
            color: white;
            border-radius: 8px;
            text-align: right;
        }
        
        .total-label {
            font-size: 16px;
            margin-bottom: 5px;
        }
        
        .total-value {
            font-size: 28px;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 2px solid #e0e0e0;
            padding-top: 15px;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            @page {
                margin: 1cm;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN TRANSAKSI PENJUALAN</h1>
        <p>Aplikasi Kasir UMKM</p>
        <p>Periode: ${getFilterPeriodText()}</p>
    </div>
    
    <div class="info-section">
        <div class="info-item">
            <div class="info-label">Total Transaksi</div>
            <div class="info-value">${data.length}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Total Pendapatan</div>
            <div class="info-value">Rp ${formatNumber(totalPendapatan)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">Tanggal Cetak</div>
            <div class="info-value">${now.toLocaleDateString('id-ID')}</div>
        </div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>No. Nota</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Pelanggan</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(sale => `
                <tr>
                    <td>#${sale.id_penjualan}</td>
                    <td>${new Date(sale.tanggal_penjualan).toLocaleDateString('id-ID')}</td>
                    <td>${new Date(sale.tanggal_penjualan).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</td>
                    <td>${sale.nama_pelanggan || 'Pelanggan Umum'}</td>
                    <td style="text-align: right;">Rp ${formatNumber(sale.total_harga)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="total-section">
        <div class="total-label">TOTAL PENDAPATAN</div>
        <div class="total-value">Rp ${formatNumber(totalPendapatan)}</div>
    </div>
    
    <div class="footer">
        <p>Dicetak pada: ${now.toLocaleString('id-ID')}</p>
        <p>© 2025 Aplikasi Kasir UMKM - Semua Hak Dilindungi</p>
    </div>
</body>
</html>
    `;
}

// ==========================================
// EXPORT TO EXCEL
// ==========================================
function exportToExcel() {
    if (filteredReportData.length === 0) {
        showNotification('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    
    // Prepare data for CSV
    const csvData = [
        ['LAPORAN TRANSAKSI PENJUALAN'],
        ['Aplikasi Kasir UMKM'],
        [`Periode: ${getFilterPeriodText()}`],
        [`Tanggal Export: ${new Date().toLocaleString('id-ID')}`],
        [],
        ['No. Nota', 'Tanggal', 'Waktu', 'Pelanggan', 'Total', 'Bayar', 'Kembalian']
    ];
    
    // Add transaction data
    filteredReportData.forEach(sale => {
        const date = new Date(sale.tanggal_penjualan);
        csvData.push([
            `#${sale.id_penjualan}`,
            date.toLocaleDateString('id-ID'),
            date.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}),
            sale.nama_pelanggan || 'Pelanggan Umum',
            parseFloat(sale.total_harga),
            parseFloat(sale.bayar),
            parseFloat(sale.kembalian)
        ]);
    });
    
    // Add summary
    const totalPendapatan = filteredReportData.reduce((sum, sale) => sum + parseFloat(sale.total_harga), 0);
    csvData.push([]);
    csvData.push(['TOTAL TRANSAKSI', filteredReportData.length]);
    csvData.push(['TOTAL PENDAPATAN', totalPendapatan]);
    
    // Convert to CSV string
    const csvString = csvData.map(row => 
        row.map(cell => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')
    ).join('\n');
    
    // Create download link
    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Transaksi_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('File Excel berhasil diunduh!', 'success');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function getFilterPeriodText() {
    const filterType = document.getElementById('filterType').value;
    
    if (filterType === 'today') {
        return 'Hari Ini - ' + new Date().toLocaleDateString('id-ID');
    } else if (filterType === 'range') {
        const start = document.getElementById('filterStartDate').value;
        const end = document.getElementById('filterEndDate').value;
        if (start && end) {
            return `${new Date(start).toLocaleDateString('id-ID')} - ${new Date(end).toLocaleDateString('id-ID')}`;
        }
    } else if (filterType === 'month') {
        const month = document.getElementById('filterMonth').value;
        if (month) {
            const date = new Date(month + '-01');
            return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        }
    }
    
    return 'Semua Periode';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('id-ID');
}

// Make functions globally accessible
window.loadReportData = loadReportData;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.toggleFilterInputs = toggleFilterInputs;
window.exportToPDF = exportToPDF;
window.exportToExcel = exportToExcel;