// ==========================================
// MANAJEMEN STOK - PRODUCT MANAGEMENT
// ==========================================

let productsData = [];

// ==========================================
// LOAD PRODUCTS FOR MANAGEMENT
// ==========================================
async function loadProductsForManagement() {
    try {
        const response = await fetch(`${API_URL}?action=get_all_products`);
        const result = await response.json();
        
        if (result.status === 200) {
            productsData = result.data;
            renderProductTable(productsData);
        }
    } catch (error) {
        showNotification('Error loading products: ' + error.message, 'error');
    }
}

// ==========================================
// RENDER PRODUCT TABLE
// ==========================================
function renderProductTable(products) {
    const tbody = document.getElementById('productTableBody');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data produk</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.nama_produk}</td>
            <td>Rp ${formatNumber(product.harga)}</td>
            <td>${product.stok}</td>
            <td><span class="badge ${getStockBadgeClass(product.stok)}">${getStockStatus(product.stok)}</span></td>
            <td>${product.kategori || '-'}</td>
            <td class="actions">
                <button class="btn btn-sm btn-warning" onclick="editProduct(${product.id_produk})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id_produk})">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function getStockBadgeClass(stok) {
    if (stok === 0) return 'badge-danger';
    if (stok < 10) return 'badge-warning';
    return 'badge-success';
}

function getStockStatus(stok) {
    if (stok === 0) return 'Habis';
    if (stok < 10) return 'Menipis';
    return 'Tersedia';
}

// ==========================================
// ADD PRODUCT
// ==========================================
async function handleAddProduct() {
    const formData = {
        nama_produk: document.getElementById('namaProduk').value.trim(),
        harga: document.getElementById('hargaProduk').value,
        stok: document.getElementById('stokProduk').value,
        kategori: document.getElementById('kategoriProduk').value.trim(),
        deskripsi: document.getElementById('deskripsiProduk').value.trim()
    };
    
    // Validasi
    if (!formData.nama_produk || !formData.harga || !formData.stok) {
        showNotification('Mohon lengkapi data produk!', 'warning');
        return;
    }
    
    if (parseFloat(formData.harga) <= 0) {
        showNotification('Harga harus lebih dari 0!', 'warning');
        return;
    }
    
    if (parseInt(formData.stok) < 0) {
        showNotification('Stok tidak boleh negatif!', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?action=add_product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            showNotification('Produk berhasil ditambahkan!', 'success');
            clearProductForm();
            await loadProductsForManagement();
            await loadProducts(); // Refresh products for kasir page
        } else {
            showNotification('Gagal menambahkan produk: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// ==========================================
// EDIT PRODUCT
// ==========================================
async function editProduct(id) {
    const product = productsData.find(p => p.id_produk == id);
    if (!product) return;
    
    // Fill form with product data
    document.getElementById('namaProduk').value = product.nama_produk;
    document.getElementById('hargaProduk').value = product.harga;
    document.getElementById('stokProduk').value = product.stok;
    document.getElementById('kategoriProduk').value = product.kategori || '';
    document.getElementById('deskripsiProduk').value = product.deskripsi || '';
    
    // Change button to update mode
    const btnAdd = document.getElementById('btnAddProduct');
    btnAdd.textContent = 'Update Produk';
    btnAdd.onclick = () => handleUpdateProduct(id);
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

async function handleUpdateProduct(id) {
    const formData = {
        id_produk: id,
        nama_produk: document.getElementById('namaProduk').value.trim(),
        harga: document.getElementById('hargaProduk').value,
        stok: document.getElementById('stokProduk').value,
        kategori: document.getElementById('kategoriProduk').value.trim(),
        deskripsi: document.getElementById('deskripsiProduk').value.trim()
    };
    
    // Validasi
    if (!formData.nama_produk || !formData.harga || !formData.stok) {
        showNotification('Mohon lengkapi data produk!', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?action=update_product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            showNotification('Produk berhasil diupdate!', 'success');
            clearProductForm();
            resetAddButton();
            await loadProductsForManagement();
            await loadProducts();
        } else {
            showNotification('Gagal mengupdate produk: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// ==========================================
// DELETE PRODUCT
// ==========================================
async function deleteProduct(id) {
    const product = productsData.find(p => p.id_produk == id);
    if (!product) return;
    
    if (!confirm(`Yakin ingin menghapus produk "${product.nama_produk}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?action=delete_product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_produk: id })
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            showNotification('Produk berhasil dihapus!', 'success');
            await loadProductsForManagement();
            await loadProducts();
        } else {
            showNotification('Gagal menghapus produk: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// ==========================================
// SEARCH PRODUCT TABLE
// ==========================================
function handleProductTableSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = productsData.filter(p => 
        p.nama_produk.toLowerCase().includes(searchTerm) ||
        (p.kategori && p.kategori.toLowerCase().includes(searchTerm))
    );
    renderProductTable(filtered);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function clearProductForm() {
    document.getElementById('namaProduk').value = '';
    document.getElementById('hargaProduk').value = '';
    document.getElementById('stokProduk').value = '';
    document.getElementById('kategoriProduk').value = '';
    document.getElementById('deskripsiProduk').value = '';
}

function resetAddButton() {
    const btnAdd = document.getElementById('btnAddProduct');
    btnAdd.textContent = 'Tambah Produk';
    btnAdd.onclick = handleAddProduct;
}

// Make functions globally accessible
window.loadProductsForManagement = loadProductsForManagement;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.handleAddProduct = handleAddProduct;
window.handleProductTableSearch = handleProductTableSearch;