const ORDERS_API = '/api/orders';

const ordersList = document.getElementById('ordersList');
const ordersLoading = document.getElementById('ordersLoading');
const ordersError = document.getElementById('ordersError');
const backBtn = document.getElementById('backBtn');

document.addEventListener('DOMContentLoaded', () => {
    if (backBtn) backBtn.addEventListener('click', () => window.location.href = '/');
    loadOrders();
});

async function loadOrders() {
    ordersLoading.style.display = 'block';
    ordersError.textContent = '';
    ordersList.innerHTML = '';

    try {
        const resp = await fetch(ORDERS_API, { credentials: 'include' });
        const data = await resp.json();
        ordersLoading.style.display = 'none';
        if (!resp.ok) {
            ordersError.textContent = data.error || 'Failed to load orders';
            return;
        }

        if (!data.orders || data.orders.length === 0) {
            ordersList.innerHTML = '<div class="empty-state"><h3>No orders yet</h3></div>';
            return;
        }

        ordersList.innerHTML = data.orders.map(order => {
            // expose orders data globally for client-side updates
            window.ordersData = data.orders;
            const itemsHtml = order.items.map(i => {
                const name = i.product?.name || 'Product';
                const img = i.product?.image ? `<img src="${i.product.image}" alt="${escapeHtml(name)}" class="order-item-image">` : '';
                const prodId = i.product?._id || '';
                const changeBtn = prodId ? `<button class="btn btn-secondary" onclick="changeImageInOrders('${prodId}')">Change Image</button>` : '';
                const removeBtn = prodId ? `<button class="btn btn-warning" onclick="removeImageInOrders('${prodId}')">Remove Image</button>` : '';
                const qtyBtn = order.status === 'pending' ? `<button class="btn btn-secondary" onclick="changeItemQuantity('${order._id}','${prodId}', ${i.quantity})">Change Qty</button>` : '';
                return `<li>${img} ${escapeHtml(name)} — qty: ${i.quantity} — $${(i.price * i.quantity).toFixed(2)} ${qtyBtn} ${changeBtn} ${removeBtn}</li>`;
            }).join('');

            return `
                <div class="order-card" data-order-id="${escapeHtml(order._id)}">
                    <div class="order-meta">Status: ${escapeHtml(order.status)} • Total: $${order.totalAmount.toFixed(2)}</div>
                    <ul>${itemsHtml}</ul>
                    <div style="margin-top:10px;">
                        <button class="btn btn-danger" onclick="deleteOrder('${order._id}')">Delete Order</button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        ordersLoading.style.display = 'none';
        ordersError.textContent = 'Error: ' + err.message;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Change product image from orders page
function changeImageInOrders(productId) {
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
                loadOrders();
            } else {
                alert(data.error || 'Failed to update image');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };
    input.click();
}

// Remove product image from orders page
async function removeImageInOrders(productId) {
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
            loadOrders();
        } else {
            alert(data.error || 'Failed to remove image');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Change item quantity within an order
async function changeItemQuantity(orderId, productId, currentQty) {
    const newQtyStr = prompt('Enter new quantity', String(currentQty));
    const newQty = parseInt(newQtyStr, 10);
    if (!newQty || newQty < 1) {
        alert('Invalid quantity');
        return;
    }

    // find order in ordersData
    const order = (window.ordersData || []).find(o => o._id === orderId);
    if (!order) return alert('Order not found locally');

    // build updated items array (compare ObjectId with string)
    const updatedItems = order.items.map(i => {
        const prodId = i.product?._id?.toString?.() ?? String(i.product?._id ?? '');
        if (prodId === String(productId)) {
            return { productId: i.product._id || i.product, quantity: newQty };
        }
        return { productId: i.product._id || i.product, quantity: i.quantity };
    });

    try {
        const resp = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: updatedItems }),
        });
        const data = await resp.json();
        if (resp.ok) {
            alert('Quantity updated');
            loadOrders();
        } else {
            alert(data.error || 'Failed to update order');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Delete an order (user's own)
async function deleteOrder(orderId) {
    if (!confirm('Delete this order?')) return;
    try {
        const resp = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        const data = await resp.json();
        if (resp.ok) {
            alert('Order deleted');
            loadOrders();
        } else {
            alert(data.error || 'Failed to delete order');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

