// ==========================================
// DASHBOARD FUNCTIONS
// ==========================================

let dashboardData = {
    sales: [],
    products: [],
    customers: []
};

// ==========================================
// LOAD DASHBOARD DATA
// ==========================================
async function loadDashboardData() {
    try {
        await Promise.all([
            loadDashboardStats(),
            loadRecentTransactions(),
            loadSalesChart()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ==========================================
// LOAD STATS
// ==========================================
async function loadDashboardStats() {
    try {
        // Get today's sales
        const salesResponse = await fetch(`${API_URL}?action=get_sales`);
        const salesResult = await salesResponse.json();
        
        if (salesResult.status === 200) {
            const today = new Date().toISOString().split('T')[0];
            const todaySales = salesResult.data.filter(sale => {
                const saleDate = new Date(sale.tanggal_penjualan).toISOString().split('T')[0];
                return saleDate === today && sale.status === 'selesai';
            });
            
            const todayRevenue = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total_harga), 0);
            const transactionCount = todaySales.length;
            
            document.getElementById('revenueToday').textContent = 'Rp ' + formatNumber(todayRevenue);
            document.getElementById('transactionCount').textContent = transactionCount;
        }
        
        // Get products count
        const productsResponse = await fetch(`${API_URL}?action=get_all_products`);
        const productsResult = await productsResponse.json();
        
        if (productsResult.status === 200) {
            document.getElementById('productCount').textContent = productsResult.data.length;
        }
        
        // Get customers count
        const customersResponse = await fetch(`${API_URL}?action=get_customers`);
        const customersResult = await customersResponse.json();
        
        if (customersResult.status === 200) {
            document.getElementById('customerCount').textContent = customersResult.data.length;
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ==========================================
// LOAD RECENT TRANSACTIONS
// ==========================================
async function loadRecentTransactions() {
    try {
        const response = await fetch(`${API_URL}?action=get_sales`);
        const result = await response.json();
        
        if (result.status === 200) {
            const today = new Date().toISOString().split('T')[0];
            const todayTransactions = result.data.filter(sale => {
                const saleDate = new Date(sale.tanggal_penjualan).toISOString().split('T')[0];
                return saleDate === today;
            }).slice(0, 5); // Get last 5 transactions
            
            renderRecentTransactions(todayTransactions);
        }
    } catch (error) {
        console.error('Error loading recent transactions:', error);
    }
}

function renderRecentTransactions(transactions) {
    const container = document.getElementById('recentTransactionsList');
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="bi bi-graph-up"></i></div>
                <p class="empty-text">Belum ada transaksi hari ini</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(sale => `
        <div class="transaction-item">
            <div class="transaction-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z" fill="currentColor"/>
                </svg>
            </div>
            <div class="transaction-details">
                <div class="transaction-header">
                    <span class="transaction-id">#${sale.id_penjualan}</span>
                    <span class="transaction-time">${formatTime(sale.tanggal_penjualan)}</span>
                </div>
                <div class="transaction-customer">${sale.nama_pelanggan || 'Pelanggan Umum'}</div>
                <div class="transaction-amount">Rp ${formatNumber(sale.total_harga)}</div>
            </div>
            <button class="transaction-action" onclick="printReceipt(${sale.id_penjualan})" title="Cetak Nota">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" fill="currentColor"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Update time and date display
function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');
    
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// Start clock
setInterval(updateDateTime, 1000);
updateDateTime();

// ==========================================
// LOAD SALES CHART
// ==========================================
async function loadSalesChart() {
    try {
        const response = await fetch(`${API_URL}?action=get_sales`);
        const result = await response.json();
        
        if (result.status === 200) {
            const salesData = result.data;
            
            // Get last 7 days
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                last7Days.push(date.toISOString().split('T')[0]);
            }
            
            // Calculate daily sales
            const dailySales = last7Days.map(date => {
                const daySales = salesData.filter(sale => {
                    const saleDate = new Date(sale.tanggal_penjualan).toISOString().split('T')[0];
                    return saleDate === date && sale.status === 'selesai';
                });
                
                return daySales.reduce((sum, sale) => sum + parseFloat(sale.total_harga), 0);
            });
            
            renderChart(last7Days, dailySales);
        }
    } catch (error) {
        console.error('Error loading chart:', error);
    }
}

function renderChart(labels, data) {
    const canvas = document.getElementById('salesChart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = 300;
    
    const maxValue = Math.max(...data, 1);
    const chartHeight = canvas.height - 60;
    const chartWidth = canvas.width - 60;
    const barWidth = chartWidth / labels.length;
    const padding = 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();
    }
    
    // Draw bars with gradient
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + (index * barWidth) + (barWidth * 0.1);
        const y = padding + chartHeight - barHeight;
        const width = barWidth * 0.8;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#001B48');
        gradient.addColorStop(1, '#02457A');
        
        // Draw bar with rounded top
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, width, barHeight, [8, 8, 0, 0]);
        ctx.fill();
        
        // Draw value on top of bar if there's space
        if (value > 0) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            const valueText = 'Rp ' + (value >= 1000 ? (value/1000).toFixed(0) + 'k' : value);
            ctx.fillText(valueText, x + width/2, y - 5);
        }
        
        // Draw date label
        ctx.fillStyle = '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        const date = new Date(labels[index]);
        const dateLabel = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        ctx.fillText(dateLabel, x + width/2, padding + chartHeight + 20);
    });
    
    // Draw Y-axis labels
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = maxValue - (maxValue / 5) * i;
        const y = padding + (chartHeight / 5) * i;
        ctx.fillText('Rp ' + formatNumber(Math.round(value)), padding - 5, y + 4);
    }
}

// ==========================================
// SALES HISTORY
// ==========================================
async function loadSalesHistory() {
    try {
        const response = await fetch(`${API_URL}?action=get_sales`);
        const result = await response.json();
        
        if (result.status === 200) {
            renderSalesHistory(result.data);
        }
    } catch (error) {
        console.error('Error loading sales history:', error);
    }
}

function renderSalesHistory(sales) {
    const tbody = document.getElementById('salesHistoryBody');
    
    if (!sales || sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada transaksi</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>#${sale.id_penjualan}</td>
            <td>${formatDateTime(sale.tanggal_penjualan)}</td>
            <td>${sale.nama_pelanggan || 'Pelanggan Umum'}</td>
            <td>Rp ${formatNumber(sale.total_harga)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="printReceipt(${sale.id_penjualan})">
                    <i class="bi bi-printer"></i> Detail
                </button>
            </td>
        </tr>
    `).join('');
}

function filterByDate() {
    const filterDate = document.getElementById('filterDate').value;
    // Implementation for date filtering
    loadSalesHistory();
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
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

// Make functions globally accessible
window.loadDashboardData = loadDashboardData;
window.loadSalesHistory = loadSalesHistory;
window.filterByDate = filterByDate;