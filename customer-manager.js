// ==========================================
// MANAJEMEN PELANGGAN - CUSTOMER MANAGEMENT
// ==========================================

let customersData = [];

// ==========================================
// LOAD CUSTOMERS FOR MANAGEMENT
// ==========================================
async function loadCustomersForManagement() {
    try {
        const response = await fetch(`${API_URL}?action=get_customers`);
        const result = await response.json();
        
        if (result.status === 200) {
            customersData = result.data;
            renderCustomerTable(customersData);
        }
    } catch (error) {
        showNotification('Error loading customers: ' + error.message, 'error');
    }
}

// ==========================================
// RENDER CUSTOMER TABLE
// ==========================================
function renderCustomerTable(customers) {
    const tbody = document.getElementById('customerTableBody');
    
    if (!customers || customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada data pelanggan</td></tr>';
        return;
    }
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.nama_pelanggan}</td>
            <td>${customer.no_telepon || '-'}</td>
            <td>${customer.alamat || '-'}</td>
            <td>${formatDate(customer.created_at)}</td>
            <td class="actions">
                <button class="btn btn-sm btn-warning" onclick="editCustomer(${customer.id_pelanggan})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id_pelanggan})" ${customer.id_pelanggan === 1 ? 'disabled' : ''}>Hapus</button>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// ADD CUSTOMER
// ==========================================
async function handleAddCustomer() {
    const formData = {
        nama_pelanggan: document.getElementById('namaPelanggan').value.trim(),
        no_telepon: document.getElementById('noTelepon').value.trim(),
        alamat: document.getElementById('alamatPelanggan').value.trim()
    };
    
    // Validasi
    if (!formData.nama_pelanggan) {
        showNotification('Nama pelanggan harus diisi!', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?action=add_customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            showNotification('Pelanggan berhasil ditambahkan!', 'success');
            clearCustomerForm();
            await loadCustomersForManagement();
            await loadCustomers(); // Refresh customers for kasir page
        } else {
            showNotification('Gagal menambahkan pelanggan: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// ==========================================
// EDIT CUSTOMER
// ==========================================
async function editCustomer(id) {
    const customer = customersData.find(c => c.id_pelanggan == id);
    if (!customer) return;
    
    // Fill form with customer data
    document.getElementById('namaPelanggan').value = customer.nama_pelanggan;
    document.getElementById('noTelepon').value = customer.no_telepon || '';
    document.getElementById('alamatPelanggan').value = customer.alamat || '';
    
    // Change button to update mode
    const btnAdd = document.getElementById('btnAddCustomer');
    btnAdd.textContent = 'Update Pelanggan';
    btnAdd.onclick = () => handleUpdateCustomer(id);
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

async function handleUpdateCustomer(id) {
    const formData = {
        id_pelanggan: id,
        nama_pelanggan: document.getElementById('namaPelanggan').value.trim(),
        no_telepon: document.getElementById('noTelepon').value.trim(),
        alamat: document.getElementById('alamatPelanggan').value.trim()
    };
    
    // Validasi
    if (!formData.nama_pelanggan) {
        showNotification('Nama pelanggan harus diisi!', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?action=update_customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            showNotification('Pelanggan berhasil diupdate!', 'success');
            clearCustomerForm();
            resetAddCustomerButton();
            await loadCustomersForManagement();
            await loadCustomers();
        } else {
            showNotification('Gagal mengupdate pelanggan: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// ==========================================
// DELETE CUSTOMER
// ==========================================
async function deleteCustomer(id) {
    // Prevent deleting default "Umum" customer
    if (id === 1) {
        showNotification('Pelanggan "Umum" tidak dapat dihapus!', 'warning');
        return;
    }
    
    const customer = customersData.find(c => c.id_pelanggan == id);
    if (!customer) return;
    
    if (!confirm(`Yakin ingin menghapus pelanggan "${customer.nama_pelanggan}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}?action=delete_customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_pelanggan: id })
        });
        
        const result = await response.json();
        
        if (result.status === 200) {
            showNotification('Pelanggan berhasil dihapus!', 'success');
            await loadCustomersForManagement();
            await loadCustomers();
        } else {
            showNotification('Gagal menghapus pelanggan: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

// ==========================================
// SEARCH CUSTOMER TABLE
// ==========================================
function handleCustomerTableSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = customersData.filter(c => 
        c.nama_pelanggan.toLowerCase().includes(searchTerm) ||
        (c.no_telepon && c.no_telepon.toLowerCase().includes(searchTerm)) ||
        (c.alamat && c.alamat.toLowerCase().includes(searchTerm))
    );
    renderCustomerTable(filtered);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function clearCustomerForm() {
    document.getElementById('namaPelanggan').value = '';
    document.getElementById('noTelepon').value = '';
    document.getElementById('alamatPelanggan').value = '';
}

function resetAddCustomerButton() {
    const btnAdd = document.getElementById('btnAddCustomer');
    btnAdd.textContent = 'Tambah Pelanggan';
    btnAdd.onclick = handleAddCustomer;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Make functions globally accessible
window.loadCustomersForManagement = loadCustomersForManagement;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.handleAddCustomer = handleAddCustomer;
window.handleCustomerTableSearch = handleCustomerTableSearch;