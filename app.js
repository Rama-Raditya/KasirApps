// ==========================================
// APLIKASI KASIR UMKM - MAIN APP
// ==========================================

// API Configuration
const API_URL = 'api.php';

// Global State
const AppState = {
    products: [],
    customers: [],
    cart: [],
    currentPage: 'dashboard'
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    loadInitialData();
    setupEventListeners();
    showPage('dashboard');
}

// ==========================================
// NAVIGATION
// ==========================================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
        });
    });
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active from nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`${pageName}Page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Add active to nav link
    const selectedLink = document.querySelector(`[data-page="${pageName}"]`);
    if (selectedLink) {
        selectedLink.classList.add('active');
    }
    
    AppState.currentPage = pageName;
    
    // Load data for specific pages
    if (pageName === 'dashboard') {
        loadDashboardData();
    } else if (pageName === 'stok') {
        loadProductsForManagement();
    } else if (pageName === 'pelanggan') {
        loadCustomersForManagement();
    } else if (pageName === 'riwayat') {
        loadSalesHistory();
    }
}

// ==========================================
// DATA LOADING
// ==========================================
async function loadInitialData() {
    await Promise.all([
        loadProducts(),
        loadCustomers()
    ]);
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}?action=get_products`);
        const result = await response.json();
        
        if (result.status === 200) {
            AppState.products = result.data;
            renderProducts(AppState.products);
        }
    } catch (error) {
        showNotification('Error loading products: ' + error.message, 'error');
    }
}

async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}?action=get_customers`);
        const result = await response.json();
        
        if (result.status === 200) {
            AppState.customers = result.data;
            renderCustomerSelect(AppState.customers);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupEventListeners() {
    // Kasir Page
    const searchProduct = document.getElementById('searchProduct');
    if (searchProduct) {
        searchProduct.addEventListener('input', handleProductSearch);
    }
    
    const customerSelect = document.getElementById('customerSelect');
    if (customerSelect) {
        customerSelect.addEventListener('change', updateSummary);
    }
    
    const paymentAmount = document.getElementById('paymentAmount');
    if (paymentAmount) {
        paymentAmount.addEventListener('input', updateChangeDisplay);
    }
    
    const btnCheckout = document.getElementById('btnCheckout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', handleCheckout);
    }
    
    // Manajemen Stok
    const btnAddProduct = document.getElementById('btnAddProduct');
    if (btnAddProduct) {
        btnAddProduct.addEventListener('click', handleAddProduct);
    }
    
    const searchProductTable = document.getElementById('searchProductTable');
    if (searchProductTable) {
        searchProductTable.addEventListener('input', handleProductTableSearch);
    }
    
    // Manajemen Pelanggan
    const btnAddCustomer = document.getElementById('btnAddCustomer');
    if (btnAddCustomer) {
        btnAddCustomer.addEventListener('click', handleAddCustomer);
    }
    
    const searchCustomerTable = document.getElementById('searchCustomerTable');
    if (searchCustomerTable) {
        searchCustomerTable.addEventListener('input', handleCustomerTableSearch);
    }
}

// ==========================================
// KASIR FUNCTIONS
// ==========================================
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (!products || products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Tidak ada produk tersedia</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="addToCart(${product.id_produk})">
            <div class="product-name">${product.nama_produk}</div>
            <div class="product-price">Rp ${formatNumber(product.harga)}</div>
            <div class="product-stock">Stok: ${product.stok}</div>
        </div>
    `).join('');
}

function renderCustomerSelect(customers) {
    const select = document.getElementById('customerSelect');
    if (!select) return;
    
    let optionsHtml = customers.map(customer => `
        <option value="${customer.id_pelanggan}">${customer.nama_pelanggan}</option>
    `).join('');

    if (!customers.some(c => c.id_pelanggan == 1)) {
        optionsHtml = `<option value="1">Pelanggan Umum</option>` + optionsHtml;
    }

    select.innerHTML = optionsHtml;
    if (Array.from(select.options).some(o => o.value == '1')) {
        select.value = '1';
    }
}

function addToCart(productId) {
    const product = AppState.products.find(p => p.id_produk == productId);
    
    if (!product) return;
    
    const existingItem = AppState.cart.find(item => item.id_produk == productId);
    
    if (existingItem) {
        if (existingItem.jumlah >= product.stok) {
            showNotification('Stok tidak mencukupi!', 'warning');
            return;
        }
        existingItem.jumlah++;
    } else {
        AppState.cart.push({
            id_produk: product.id_produk,
            nama_produk: product.nama_produk,
            harga_satuan: parseFloat(product.harga),
            jumlah: 1,
            stok: parseInt(product.stok)
        });
    }
    
    renderCart();
    updateSummary();
}

function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    
    if (AppState.cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart">
                <div style="font-size: 3em;">🛒</div>
                <p>Keranjang masih kosong</p>
            </div>
        `;
        return;
    }
    
    cartContainer.innerHTML = AppState.cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-header">
                <div class="cart-item-name">${item.nama_produk}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="decreaseQuantity(${index})">−</button>
                    <span class="quantity">${item.jumlah}</span>
                    <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
                </div>
                <div class="item-subtotal">Rp ${formatNumber(item.harga_satuan * item.jumlah)}</div>
            </div>
        </div>
    `).join('');
}

function removeFromCart(index) {
    AppState.cart.splice(index, 1);
    renderCart();
    updateSummary();
}

function increaseQuantity(index) {
    if (AppState.cart[index].jumlah >= AppState.cart[index].stok) {
        showNotification('Stok tidak mencukupi!', 'warning');
        return;
    }
    AppState.cart[index].jumlah++;
    renderCart();
    updateSummary();
}

function decreaseQuantity(index) {
    if (AppState.cart[index].jumlah > 1) {
        AppState.cart[index].jumlah--;
        renderCart();
        updateSummary();
    }
}

function updateSummary() {
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.jumlah, 0);
    const totalPrice = AppState.cart.reduce((sum, item) => sum + (item.harga_satuan * item.jumlah), 0);
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalPrice').textContent = 'Rp ' + formatNumber(totalPrice);
    
    const btnCheckout = document.getElementById('btnCheckout');
    const customerId = document.getElementById('customerSelect').value;
    btnCheckout.disabled = AppState.cart.length === 0 || !customerId;
    
    updateChangeDisplay();
}

function updateChangeDisplay() {
    const paymentInput = document.getElementById('paymentAmount');
    const changeDisplay = document.getElementById('changeDisplay');
    const changeAmount = document.getElementById('changeAmount');
    
    const payment = parseFloat(paymentInput.value) || 0;
    const total = AppState.cart.reduce((sum, item) => sum + (item.harga_satuan * item.jumlah), 0);
    
    if (payment > 0 && payment >= total) {
        const change = payment - total;
        changeAmount.textContent = 'Rp ' + formatNumber(change);
        changeDisplay.style.display = 'block';
    } else {
        changeDisplay.style.display = 'none';
    }
}

async function handleCheckout() {
    const customerId = document.getElementById('customerSelect').value;
    const payment = parseFloat(document.getElementById('paymentAmount').value) || 0;
    const total = AppState.cart.reduce((sum, item) => sum + (item.harga_satuan * item.jumlah), 0);
    
    if (!customerId) {
        showNotification('Pilih pelanggan terlebih dahulu!', 'warning');
        return;
    }
    
    if (AppState.cart.length === 0) {
        showNotification('Keranjang masih kosong!', 'warning');
        return;
    }
    
    if (payment < total) {
        showNotification('Jumlah bayar kurang dari total!', 'warning');
        return;
    }
    
    const transactionData = {
        id_pelanggan: customerId,
        items: AppState.cart,
        total_harga: total,
        bayar: payment
    };
    
    try {
        const response = await fetch(`${API_URL}?action=checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            showNotification('Transaksi berhasil! Kembalian: Rp ' + formatNumber(result.data.kembalian), 'success');
            
            // Auto print receipt
            setTimeout(() => {
                autoPrintReceipt(result.data.id_penjualan);
            }, 500);
            
            AppState.cart = [];
            document.getElementById('customerSelect').value = '1';
            document.getElementById('paymentAmount').value = '';
            renderCart();
            updateSummary();
            await loadProducts();
        } else {
            showNotification('Transaksi gagal: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function handleProductSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = AppState.products.filter(p => 
        p.nama_produk.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('id-ID');
}

// Make functions globally accessible
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;