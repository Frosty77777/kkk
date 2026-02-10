const API_BASE_URL = '/api/products';
const AUTH_API_BASE_URL = '/api/auth';

// DOM Elements
const productForm = document.getElementById('productForm');
const productsList = document.getElementById('productsList');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const formMessage = document.getElementById('formMessage');
const refreshBtn = document.getElementById('refreshBtn');
const authBtn = document.getElementById('authBtn');
const authStatus = document.getElementById('authStatus');
const logoutBtn = document.getElementById('logoutBtn');
const ordersBtn = document.getElementById('ordersBtn');

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    checkAuthStatus();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Product form submission
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Auth buttons
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
    if (ordersBtn) {
        ordersBtn.addEventListener('click', () => {
            window.location.href = 'orders.html';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Removed modal-related event listeners - using separate pages now
}

// Product form submission handler
async function handleProductSubmit(e) {
    e.preventDefault();
    const imageInput = document.getElementById('image');
    
    // Use FormData so file uploads work
    const fd = new FormData();
    fd.append('name', document.getElementById('name').value);
    fd.append('price', document.getElementById('price').value);
    fd.append('description', document.getElementById('description').value);
    fd.append('category', document.getElementById('category').value);
    if (imageInput && imageInput.files && imageInput.files[0]) {
        fd.append('image', imageInput.files[0]);
    }

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            credentials: 'include', // Include cookies for session
            body: fd,
        });
        const data = await response.json();

        if (response.ok) {
            showMessage('Product added successfully!', 'success');
            productForm.reset();
            loadProducts();
        } else {
            if (response.status === 401 || response.status === 403) {
                showMessage('You must be logged in as an admin to add products', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(data.error || 'Failed to add product', 'error');
            }
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Load all products
async function loadProducts() {
    loading.style.display = 'block';
    errorMessage.classList.remove('show');
    productsList.innerHTML = '';

    try {
        const response = await fetch(API_BASE_URL);
        const data = await response.json();

        if (response.ok) {
            loading.style.display = 'none';
            
            if (data.products && data.products.length > 0) {
                displayProducts(data.products);
            } else {
                productsList.innerHTML = `
                    <div class="empty-state">
                        <h3>No products yet</h3>
                        <p>Add your first product using the form on the left!</p>
                    </div>
                `;
            }
        } else {
            throw new Error(data.error || 'Failed to load products');
        }
    } catch (error) {
        loading.style.display = 'none';
        errorMessage.textContent = 'Error loading products: ' + error.message;
        errorMessage.classList.add('show');
    }
}

// Display products in the grid
function displayProducts(products) {
    productsList.innerHTML = products.map(product => `
        <div class="product-card">
            <img class="product-image" src="${product.image ? product.image : 'https://via.placeholder.com/150?text=No+Image'}" alt="${escapeHtml(product.name)}">
            <div class="product-actions">
                <button class="btn btn-danger delete-btn" onclick="deleteProduct('${product._id}')">Delete</button>
                <button class="btn btn-success order-btn" onclick="orderProduct('${product._id}')">Order</button>
                <button class="btn btn-secondary" onclick="changeImage('${product._id}')">Change Image</button>
                <button class="btn btn-warning" onclick="removeImage('${product._id}')">Remove Image</button>
            </div>
            <h3>${escapeHtml(product.name)}</h3>
            <span class="category">${escapeHtml(product.category)}</span>
            <div class="price">$${product.price.toFixed(2)}</div>
            <p class="description">${escapeHtml(product.description)}</p>
            <div class="meta">
                Created: ${formatDate(product.createdAt)}<br>
                Updated: ${formatDate(product.updatedAt)}
            </div>
        </div>
    `).join('');
}

// Delete a product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            credentials: 'include', // Include cookies for session
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Product deleted successfully!', 'success');
            loadProducts();
        } else {
            if (response.status === 401 || response.status === 403) {
                showMessage('You must be logged in as an admin to delete products', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(data.error || 'Failed to delete product', 'error');
            }
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Refresh button handler
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadProducts());
}

// Show message
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `message ${type}`;
    
    setTimeout(() => {
        formMessage.className = 'message';
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- Authentication functions ---

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch(`${AUTH_API_BASE_URL}/profile`, {
            credentials: 'include', // Include cookies for session
        });

        if (response.ok) {
            const data = await response.json();
            updateAuthStatus(data.user);
        } else {
            updateAuthStatus(null);
        }
    } catch (error) {
        updateAuthStatus(null);
    }
}

// Update auth status display
function updateAuthStatus(user) {
    if (!authStatus) return;
    
    if (user) {
        authStatus.textContent = `Logged in as ${user.email} (${user.role})`;
        if (authBtn) authBtn.textContent = 'Account';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        authStatus.textContent = 'Not logged in';
        if (authBtn) authBtn.textContent = 'Login';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return authStatus && authStatus.textContent !== 'Not logged in';
}

// Removed handleLogin and handleRegister - now handled in separate pages

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch(`${AUTH_API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include', // Include cookies for session
        });

        if (response.ok) {
            showMessage('Logout successful!', 'success');
            checkAuthStatus();
            loadProducts();
        } else {
            showMessage('Logout failed', 'error');
        }
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Removed modal functions - using separate pages now

// Quick order flow for single product
async function orderProduct(productId) {
    if (!isAuthenticated()) {
        alert('Please login to place an order.');
        window.location.href = 'login.html';
        return;
    }

    const qtyStr = prompt('Enter quantity', '1');
    const qty = parseInt(qtyStr, 10);
    if (!qty || qty < 1) {
        alert('Invalid quantity');
        return;
    }
    // Simple order payload without shipping address
    const payload = {
        items: [{ productId, quantity: qty }],
    };

    try {
        const resp = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        const data = await resp.json();
        if (resp.ok) {
            alert('Order placed successfully!');
            window.location.href = 'orders.html';
        } else {
            alert(data.error || 'Failed to place order');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Change product image (authenticated users)
function changeImage(productId) {
    if (!isAuthenticated()) {
        alert('Please login to change images.');
        window.location.href = 'login.html';
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
        if (!input.files || !input.files[0]) return;
        const fd = new FormData();
        fd.append('image', input.files[0]);
        try {
            const resp = await fetch(`/api/products/${productId}/image`, {
                method: 'POST',
                credentials: 'include',
                body: fd,
            });
            const data = await resp.json();
            if (resp.ok) {
                alert('Image updated');
                loadProducts();
            } else {
                alert(data.error || 'Failed to update image');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };
    input.click();
}

// Remove product image
async function removeImage(productId) {
    if (!isAuthenticated()) {
        alert('Please login to remove images.');
        window.location.href = 'login.html';
        return;
    }
    if (!confirm('Remove image for this product?')) return;
    try {
        const resp = await fetch(`/api/products/${productId}/image`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ removeImage: 'true' }),
        });
        const data = await resp.json();
        if (resp.ok) {
            alert('Image removed');
            loadProducts();
        } else {
            alert(data.error || 'Failed to remove image');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}