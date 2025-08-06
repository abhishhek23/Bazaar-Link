
// Global variables
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users') || '[]');
let products = JSON.parse(localStorage.getItem('products') || '[]');
let orders = JSON.parse(localStorage.getItem('orders') || '[]');
let cart = [];
let selectedRole = null;

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function () {
            closeBtn.closest('.modal').style.display = 'none';
        }
    });

    // Close modal when clicking outside
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }

    // Role selection
    document.querySelectorAll('.role-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedRole = this.dataset.role;
        });
    });

    // Form submissions
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function handleRegister(e) {
    e.preventDefault();

    if (!selectedRole) {
        alert('Please select your role');
        return;
    }

    const userData = {
        id: Date.now(),
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        mobile: document.getElementById('regMobile').value,
        password: document.getElementById('regPassword').value,
        role: selectedRole
    };

    // Check if email already exists
    if (users.find(user => user.email === userData.email)) {
        alert('Email already exists');
        return;
    }

    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful! Please login.');
    closeModal('registerModal');
    openModal('loginModal');
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal('loginModal');
        showDashboard();
    } else {
        alert('Invalid email or password');
    }
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
}

function showDashboard() {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('authButtons').classList.add('hidden');
    document.getElementById('userMenu').classList.remove('hidden');

    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name.split(' ')[0]}!`;

    setupDashboardTabs();
    loadUserData();
}

function setupDashboardTabs() {
    // Show/hide tabs based on user role
    const role = currentUser.role;

    if (role === 'buyer') {
        document.getElementById('addProductSection').style.display = 'none';
        document.getElementById('ordersTab').style.display = 'block';
        document.getElementById('cartTab').style.display = 'block';
        document.getElementById('rentalsTab').style.display = 'none';
        document.getElementById('analyticsTab').style.display = 'none';
    } else if (role === 'seller') {
        document.getElementById('addProductSection').style.display = 'block';
        document.getElementById('ordersTab').style.display = 'block';
        document.getElementById('cartTab').style.display = 'none';
        document.getElementById('rentalsTab').style.display = 'block';
        document.getElementById('analyticsTab').style.display = 'block';
    } else { // both
        document.getElementById('addProductSection').style.display = 'block';
        document.getElementById('ordersTab').style.display = 'block';
        document.getElementById('cartTab').style.display = 'block';
        document.getElementById('rentalsTab').style.display = 'block';
        document.getElementById('analyticsTab').style.display = 'block';
    }
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    // Load tab-specific data
    if (tabName === 'products') {
        loadProducts();
    } else if (tabName === 'cart') {
        loadCart();
    } else if (tabName === 'orders') {
        loadOrders();
    }
}

function handleAddProduct(e) {
    e.preventDefault();

    const productData = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        description: document.getElementById('productDescription').value,
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        dateAdded: new Date().toISOString()
    };

    products.push(productData);
    localStorage.setItem('products', JSON.stringify(products));

    // Reset form
    document.getElementById('addProductForm').reset();

    // Reload products
    loadProducts();

    alert('Product added successfully!');
}

function loadProducts() {
    const myProductsContainer = document.getElementById('myProducts');
    const userProducts = products.filter(p => p.sellerId === currentUser.id);

    if (userProducts.length === 0) {
        myProductsContainer.innerHTML = '<p>No products added yet.</p>';
        return;
    }

    myProductsContainer.innerHTML = userProducts.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="product-info">
                        <div class="product-title">${product.name}</div>
                        <div class="product-price">₹${product.price}</div>
                        <p>Category: ${product.category}</p>
                        <p>Quantity: ${product.quantity}</p>
                        <p>${product.description}</p>
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button class="btn btn-secondary" onclick="editProduct(${product.id})">Edit</button>
                            <button class="btn btn-primary" onclick="deleteProduct(${product.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
}

function loadCart() {
    const cartContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalContainer.style.display = 'none';
        return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <i class="fas fa-box"></i>
                        </div>
                        <div style="flex: 1;">
                            <h4>${item.name}</h4>
                            <p>₹${item.price} x ${item.quantity}</p>
                        </div>
                        <button class="btn btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                `;
    }).join('');

    document.getElementById('totalAmount').textContent = total;
    cartTotalContainer.style.display = 'block';
}

function loadOrders() {
    const ordersContainer = document.getElementById('ordersList');
    const userOrders = orders.filter(o => o.buyerId === currentUser.id || o.sellerId === currentUser.id);

    if (userOrders.length === 0) {
        ordersContainer.innerHTML = '<p>No orders found.</p>';
        return;
    }

    ordersContainer.innerHTML = userOrders.map(order => `
                <div class="product-card">
                    <div class="product-info">
                        <div class="product-title">Order #${order.id}</div>
                        <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                        <p>Total: ₹${order.total}</p>
                        <p>Status: ${order.status}</p>
                    </div>
                </div>
            `).join('');
}

function loadUserData() {
    // Update statistics
    const userProducts = products.filter(p => p.sellerId === currentUser.id);
    const userOrders = orders.filter(o => o.sellerId === currentUser.id);
    const totalRevenue = userOrders.reduce((sum, order) => sum + order.total, 0);

    document.getElementById('totalProducts').textContent = userProducts.length;
    document.getElementById('totalOrders').textContent = userOrders.length;
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue}`;

    // Load initial data
    loadProducts();
    loadCart();
    loadOrders();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        loadCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    loadCart();
}

function checkout() {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = {
        id: Date.now(),
        buyerId: currentUser.id,
        items: cart,
        total: total,
        date: new Date().toISOString(),
        status: 'Pending'
    };

    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    cart = [];
    loadCart();
    alert('Order placed successfully!');
}

function editProduct(productId) {
    // Implementation for editing products
    alert('Edit product feature - to be implemented');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    cart = [];
    showHome();
}

function showHome() {
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('authButtons').classList.remove('hidden');
    document.getElementById('userMenu').classList.add('hidden');
}

function showPage(page) {
    // Implementation for showing different pages
    alert(`${page} page - to be implemented`);
}

// Fix the modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        if(modalId === 'loginModal') {
            document.getElementById('loginModalContent').style.margin = '13% auto';
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add sample data for demonstration
function addSampleData() {
    if (products.length === 0) {
        const sampleProducts = [
            {
                id: 1,
                name: "iPhone 15",
                category: "electronics",
                price: 79999,
                quantity: 5,
                description: "Latest iPhone with advanced features",
                sellerId: 999,
                sellerName: "Tech Store",
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                name: "Nike Air Max",
                category: "sports",
                price: 8999,
                quantity: 10,
                description: "Comfortable running shoes",
                sellerId: 998,
                sellerName: "Sports World",
                dateAdded: new Date().toISOString()
            }
        ];

        products = sampleProducts;
        localStorage.setItem('products', JSON.stringify(products));
    }
}

function clearLocalStorage() {
                        localStorage.clear();
                        alert('Local storage has been cleared!');
                        location.reload(); // optional: refresh page
                    }
