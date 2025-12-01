// ==========================================
// RECEIPT / NOTA SYSTEM
// ==========================================

async function printReceipt(saleId) {
    try {
        // Get sale data
        const saleResponse = await fetch(`${API_URL}?action=get_sales`);
        const saleResult = await saleResponse.json();
        
        if (saleResult.status !== 200) {
            showNotification('Gagal memuat data penjualan', 'error');
            return;
        }
        
        const sale = saleResult.data.find(s => s.id_penjualan == saleId);
        if (!sale) {
            showNotification('Data penjualan tidak ditemukan', 'error');
            return;
        }
        
        // Get sale details
        const detailResponse = await fetch(`${API_URL}?action=get_sale_detail&id=${saleId}`);
        const detailResult = await detailResponse.json();
        
        if (detailResult.status !== 200) {
            showNotification('Gagal memuat detail penjualan', 'error');
            return;
        }
        
        const details = detailResult.data;
        
        // Generate receipt HTML
        const receiptHTML = generateReceiptHTML(sale, details);
        
        // Create print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
        }, 250);
        
    } catch (error) {
        console.error('Error printing receipt:', error);
        showNotification('Error: ' + error.message, 'error');
    }
}

function generateReceiptHTML(sale, details) {
    const now = new Date();
    const saleDate = new Date(sale.tanggal_penjualan);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nota #${sale.id_penjualan}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 80mm;
            margin: 0 auto;
        }
        
        .receipt {
            border: 2px dashed #000;
            padding: 10px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        
        .header h1 {
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .header p {
            font-size: 11px;
            margin: 2px 0;
        }
        
        .info-section {
            margin-bottom: 15px;
            font-size: 12px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }
        
        .items-table {
            width: 100%;
            margin-bottom: 15px;
            font-size: 11px;
        }
        
        .items-table th {
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 5px 0;
            text-align: left;
        }
        
        .items-table td {
            padding: 5px 0;
            border-bottom: 1px dashed #ccc;
        }
        
        .item-name {
            font-weight: bold;
        }
        
        .item-details {
            font-size: 10px;
            color: #666;
        }
        
        .totals {
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-bottom: 15px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
        }
        
        .total-row.grand-total {
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px double #000;
        }
        
        .footer {
            text-align: center;
            margin-top: 15px;
            border-top: 2px solid #000;
            padding-top: 10px;
            font-size: 11px;
        }
        
        .footer p {
            margin: 3px 0;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .receipt {
                border: none;
            }
            
            @page {
                margin: 0;
                size: 80mm auto;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>TOKO UMKM</h1>
            <p>Jl. Contoh No. 123</p>
            <p>Telp: 083131130557</p>
        </div>
        
        <div class="info-section">
            <div class="info-row">
                <span>No. Nota:</span>
                <span><strong>#${sale.id_penjualan}</strong></span>
            </div>
            <div class="info-row">
                <span>Tanggal:</span>
                <span>${saleDate.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}</span>
            </div>
            <div class="info-row">
                <span>Waktu:</span>
                <span>${saleDate.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
            </div>
            <div class="info-row">
                <span>Kasir:</span>
                <span>Admin</span>
            </div>
            <div class="info-row">
                <span>Pelanggan:</span>
                <span>${sale.nama_pelanggan || 'Pelanggan Umum'}</span>
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 60%;">Item</th>
                    <th style="width: 20%; text-align: center;">Qty</th>
                    <th style="width: 20%; text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${details.map(item => `
                    <tr>
                        <td>
                            <div class="item-name">${item.nama_produk}</div>
                            <div class="item-details">
                                @ Rp ${formatNumber(item.harga_satuan)}
                            </div>
                        </td>
                        <td style="text-align: center;">${item.jumlah}</td>
                        <td style="text-align: right;">Rp ${formatNumber(item.subtotal)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>Rp ${formatNumber(sale.total_harga)}</span>
            </div>
            <div class="total-row grand-total">
                <span>TOTAL:</span>
                <span>Rp ${formatNumber(sale.total_harga)}</span>
            </div>
            <div class="total-row" style="margin-top: 10px;">
                <span>Bayar:</span>
                <span>Rp ${formatNumber(sale.bayar)}</span>
            </div>
            <div class="total-row">
                <span>Kembalian:</span>
                <span>Rp ${formatNumber(sale.kembalian)}</span>
            </div>
        </div>
        
        <div class="footer">
            <p>*** TERIMA KASIH ***</p>
            <p>Barang yang sudah dibeli</p>
            <p>tidak dapat ditukar/dikembalikan</p>
            <p style="margin-top: 10px;">Dicetak: ${now.toLocaleString('id-ID')}</p>
        </div>
    </div>
</body>
</html>
    `;
}

// Auto-print receipt after successful checkout
function autoPrintReceipt(saleId) {
    if (confirm('Transaksi berhasil! Cetak nota sekarang?')) {
        printReceipt(saleId);
    }
}

// Make functions globally accessible
window.printReceipt = printReceipt;
window.autoPrintReceipt = autoPrintReceipt;