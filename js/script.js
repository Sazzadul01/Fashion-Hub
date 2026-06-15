/* script.js - Handles products, shop rendering and cart logic
   - Add to cart
   - Remove from cart
   - Update quantity
   - Cart counter
   - Product search
   - LocalStorage persistence
*/

/* ---------------------------
   Sample product data
   In a real app this would come from a backend/API.
----------------------------*/
const products = [
  {
    id: 'p1',
    name: 'Soft Jersey Hijab - Dusty Rose',
    price: 19.99,
    category: 'Jersey',
    image: 'images/product1.jpg',
    description: 'Stretchy jersey fabric, breathable and comfortable for daily use.'
  },
  {
    id: 'p2',
    name: 'Chiffon Layered Hijab - Pearl',
    price: 24.50,
    category: 'Chiffon',
    image: 'images/product2.jpg',
    description: 'Lightweight chiffon with elegant drape and soft finish.'
  },
  {
    id: 'p3',
    name: 'Silk Luxe Hijab - Sand',
    price: 39.00,
    category: 'Silk',
    image: 'images/product3.jpg',
    description: 'Silky smooth finish for a luxurious look suitable for events.'
  },
  {
    id: 'p4',
    name: 'Instant Easy Hijab - Beige',
    price: 22.00,
    category: 'Instant',
    image: 'images/product1.jpg',
    description: 'Easy-to-wear instant hijab with inner grip for quick styling.'
  },
  {
    id: 'p5',
    name: 'Premium Jersey Hijab - Mauve',
    price: 21.75,
    category: 'Jersey',
    image: 'images/product2.jpg',
    description: 'Soft premium jersey with excellent color retention.'
  }
];

/* ---------------------------
   LocalStorage cart helpers
----------------------------*/
const CART_KEY = 'hijabCart';

// Get cart from localStorage (array of {id, qty})
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse cart from storage', e);
    return [];
  }
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCountElements();
}

/* ---------------------------
   Cart utilities
----------------------------*/
function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty += quantity;
  } else {
    cart.push({ id: productId, qty: quantity });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
}

function updateQuantity(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.qty = Math.max(1, parseInt(qty) || 1);
    saveCart(cart);
  }
}

function getCartTotal() {
  const cart = getCart();
  let total = 0;
  for (const it of cart) {
    const p = products.find(pp => pp.id === it.id);
    if (p) total += p.price * it.qty;
  }
  return total;
}

function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((s, i) => s + i.qty, 0);
}

/* ---------------------------
   DOM helpers & renderers
----------------------------*/
function updateCartCountElements() {
  const count = getCartItemCount();
  const els = document.querySelectorAll('#cartCount, #cartCountShop, #cartCountProduct, #cartCountCart, #cartCountAbout, #cartCountContact');
  els.forEach(e => {
    if (!e) return;
    e.textContent = count;
  });
}

/* Render featured / new products on index page */
function renderHomeSections() {
  const featuredContainer = document.getElementById('featuredProducts');
  const newArrivalContainer = document.getElementById('newArrivals');
  if (!featuredContainer && !newArrivalContainer) return;

  // Pick first 3 as featured, last 3 as new
  const featured = products.slice(0, 3);
  const newArr = products.slice(-3);

  if (featuredContainer) {
    featuredContainer.innerHTML = featured.map(p => `
      <div class="col-6 col-md-4">
        <div class="card product-card">
          <img src="${p.image}" class="card-img-top" alt="${escapeHtml(p.name)}">
          <div class="card-body">
            <h6 class="product-name">${escapeHtml(p.name)}</h6>
            <p class="price">$${p.price.toFixed(2)}</p>
            <div class="d-flex gap-2">
              <a href="product.html?id=${p.id}" class="btn btn-sm btn-outline-secondary">View</a>
              <button class="btn btn-sm btn-primary" onclick="addToCartHandler('${p.id}')">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  if (newArrivalContainer) {
    newArrivalContainer.innerHTML = newArr.map(p => `
      <div class="col-6 col-md-4">
        <div class="card product-card">
          <img src="${p.image}" class="card-img-top" alt="${escapeHtml(p.name)}">
          <div class="card-body">
            <h6 class="product-name">${escapeHtml(p.name)}</h6>
            <p class="price">$${p.price.toFixed(2)}</p>
            <div class="d-flex gap-2">
              <a href="product.html?id=${p.id}" class="btn btn-sm btn-outline-secondary">View</a>
              <button class="btn btn-sm btn-primary" onclick="addToCartHandler('${p.id}')">Add to cart</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

/* Render products on shop page */
function renderProductsGrid(filteredProducts) {
  const container = document.getElementById('productsGrid');
  if (!container) return;

  container.innerHTML = filteredProducts.map(p => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="card product-card h-100">
        <img src="${p.image}" class="card-img-top" alt="${escapeHtml(p.name)}">
        <div class="card-body d-flex flex-column">
          <h6 class="product-name">${escapeHtml(p.name)}</h6>
          <p class="price mb-2">$${p.price.toFixed(2)}</p>
          <div class="mt-auto d-flex gap-2">
            <a class="btn btn-sm btn-outline-secondary" href="product.html?id=${p.id}">View</a>
            <button class="btn btn-sm btn-primary" onclick="addToCartHandler('${p.id}')">Add</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const countEl = document.getElementById('productCount');
  if (countEl) countEl.textContent = filteredProducts.length;
}

/* Render single product page */
function renderProductDetail(productId) {
  const container = document.getElementById('productDetails');
  if (!container) return;

  const p = products.find(item => item.id === productId);
  if (!p) {
    container.innerHTML = '<div class="col-12">Product not found.</div>';
    return;
  }

  container.innerHTML = `
    <div class="col-md-6">
      <img src="${p.image}" class="img-fluid rounded" alt="${escapeHtml(p.name)}">
    </div>
    <div class="col-md-6">
      <h3>${escapeHtml(p.name)}</h3>
      <p class="price h4">$${p.price.toFixed(2)}</p>
      <p>${escapeHtml(p.description)}</p>
      <div class="d-flex align-items-center gap-3 my-3">
        <label class="mb-0">Quantity:</label>
        <input id="productQty" type="number" min="1" value="1" class="form-control" style="width:90px;">
      </div>
      <div class="d-flex gap-2">
        <button id="addToCartBtn" class="btn btn-primary">Add to Cart</button>
        <a href="shop.html" class="btn btn-outline-secondary">Back to Shop</a>
      </div>
    </div>
  `;

  document.getElementById('addToCartBtn').addEventListener('click', function() {
    const qty = parseInt(document.getElementById('productQty').value) || 1;
    addToCart(p.id, qty);
    showToast('Added to cart');
  });

  // Render related products
  const relatedContainer = document.getElementById('relatedProducts');
  if (relatedContainer) {
    const related = products.filter(pp => pp.category === p.category && pp.id !== p.id).slice(0,3);
    relatedContainer.innerHTML = related.map(r => `
      <div class="col-6 col-md-4">
        <div class="card product-card">
          <img src="${r.image}" class="card-img-top" alt="${escapeHtml(r.name)}">
          <div class="card-body">
            <h6 class="product-name">${escapeHtml(r.name)}</h6>
            <p class="price">$${r.price.toFixed(2)}</p>
            <div class="d-flex gap-2">
              <a href="product.html?id=${r.id}" class="btn btn-sm btn-outline-secondary">View</a>
              <button class="btn btn-sm btn-primary" onclick="addToCartHandler('${r.id}')">Add</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

/* Render Cart page */
function renderCartPage() {
  const cartArea = document.getElementById('cartArea');
  if (!cartArea) return;

  const cart = getCart();
  if (cart.length === 0) {
    cartArea.innerHTML = '<div class="alert alert-info">Your cart is empty. <a href="shop.html">Shop now</a>.</div>';
    document.getElementById('cartTotal').textContent = '$0.00';
    return;
  }

  const rows = cart.map(item => {
    const p = products.find(pp => pp.id === item.id);
    if (!p) return '';
    const subtotal = (p.price * item.qty).toFixed(2);
    return `
      <div class="row align-items-center py-3 border-bottom">
        <div class="col-2 col-md-1">
          <img src="${p.image}" class="table-img rounded" alt="${escapeHtml(p.name)}">
        </div>
        <div class="col-6 col-md-5">
          <a href="product.html?id=${p.id}" class="text-decoration-none product-name">${escapeHtml(p.name)}</a>
          <div class="text-muted small">Category: ${escapeHtml(p.category)}</div>
        </div>
        <div class="col-4 col-md-2">
          <strong>$${p.price.toFixed(2)}</strong>
        </div>
        <div class="col-6 col-md-2 d-flex align-items-center gap-2 mt-2 mt-md-0">
          <input data-id="${p.id}" class="form-control form-control-sm cart-qty" type="number" min="1" value="${item.qty}" style="width:80px;">
        </div>
        <div class="col-6 col-md-2 text-end mt-2 mt-md-0">
          <div><strong>$${subtotal}</strong></div>
          <button class="btn btn-sm btn-link text-danger remove-item-btn" data-id="${p.id}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  cartArea.innerHTML = rows;

  // Attach event listeners for quantity inputs and remove buttons
  cartArea.querySelectorAll('.cart-qty').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const val = parseInt(e.target.value) || 1;
      updateQuantity(id, val);
      renderCartPage(); // re-render to update totals
    });
  });

  cartArea.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      removeFromCart(id);
      renderCartPage();
      showToast('Item removed');
    });
  });

  document.getElementById('cartTotal').textContent = '$' + getCartTotal().toFixed(2);

  // Checkout button event
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.onclick = function() {
      alert('Checkout flow is not implemented in this demo. Thank you!');
    };
  }
}

/* ---------------------------
   Utilities & event wiring
----------------------------*/

function addToCartHandler(id) {
  addToCart(id, 1);
  showToast('Added to cart');
}

function showToast(message) {
  // Simple toast / feedback using alert-less approach
  const el = document.createElement('div');
  el.textContent = message;
  el.style.position = 'fixed';
  el.style.right = '20px';
  el.style.bottom = '20px';
  el.style.background = 'rgba(0,0,0,0.8)';
  el.style.color = '#fff';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '8px';
  el.style.zIndex = 9999;
  el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 1800);
}

/* Escape HTML for safety in templates */
function escapeHtml(unsafe) {
  return (''+unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ---------------------------
   Search, filter & sort
----------------------------*/
function getFilteredProducts() {
  // Read controls if present
  const categoryEl = document.getElementById('categoryFilter');
  const searchEl = document.getElementById('shopSearchInput');
  const sortEl = document.getElementById('sortSelect');

  let list = [...products];

  if (categoryEl && categoryEl.value) {
    list = list.filter(p => p.category === categoryEl.value);
  }

  // Shop search
  if (searchEl && searchEl.value.trim()) {
    const q = searchEl.value.trim().toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  // sort
  if (sortEl) {
    const v = sortEl.value;
    if (v === 'price-asc') list.sort((a,b)=> a.price - b.price);
    if (v === 'price-desc') list.sort((a,b)=> b.price - a.price);
  }

  return list;
}

/* ---------------------------
   Global initialization
----------------------------*/
function init() {
  updateCartCountElements();

  // If on index page
  if (document.getElementById('featuredProducts')) {
    renderHomeSections();

    // hook newsletter / home search
    const homeSearchBtn = document.getElementById('homeSearchBtn');
    if (homeSearchBtn) homeSearchBtn.onclick = () => {
      const q = document.getElementById('homeSearchInput').value.trim();
      if (q) {
        location.href = `shop.html?search=${encodeURIComponent(q)}`;
      } else {
        location.href = 'shop.html';
      }
    };

    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) newsletterForm.addEventListener('submit', () => {
      const email = document.getElementById('newsletterEmail').value;
      if (email) {
        alert('Thanks for subscribing: ' + email);
        document.getElementById('newsletterEmail').value = '';
      }
    });
  }

  // If on shop page
  if (document.getElementById('productsGrid')) {
    // Prefill search from URL if provided
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      const s = document.getElementById('shopSearchInput');
      if (s) s.value = searchParam;
    }

    // Render initial list
    const applyFilters = () => renderProductsGrid(getFilteredProducts());
    applyFilters();

    // Controls binding
    const categoryEl = document.getElementById('categoryFilter');
    const searchEl = document.getElementById('shopSearchInput');
    const sortEl = document.getElementById('sortSelect');

    if (categoryEl) categoryEl.addEventListener('change', applyFilters);
    if (searchEl) {
      document.getElementById('shopSearchBtn').addEventListener('click', applyFilters);
      searchEl.addEventListener('keydown', (e)=> { if (e.key === 'Enter') applyFilters(); });
    }
    if (sortEl) sortEl.addEventListener('change', applyFilters);

    // Also hookup navbar search
    const navSearchBtn2 = document.getElementById('navSearchBtn2');
    if (navSearchBtn2) {
      navSearchBtn2.addEventListener('click', () => {
        const q = document.getElementById('navSearchInput2').value.trim();
        if (q) {
          document.getElementById('shopSearchInput').value = q;
          applyFilters();
        }
      });
    }
  }

  // If on product page
  if (document.getElementById('productDetails')) {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    renderProductDetail(id || products[0].id);
  }

  // If on cart page
  if (document.getElementById('cartArea')) {
    renderCartPage();
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      const name = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const message = document.getElementById('contactMessage').value;
      if (name && email && message) {
        alert('Thanks for your message, ' + name + '! We will reply to ' + email + '.');
        contactForm.reset();
      }
    });
  }

  // Nav search (global)
  const navSearchBtn = document.getElementById('navSearchBtn');
  if (navSearchBtn) {
    navSearchBtn.addEventListener('click', () => {
      const q = document.getElementById('navSearchInput').value.trim();
      if (q) location.href = `shop.html?search=${encodeURIComponent(q)}`;
    });
  }
  const navSearchBtnHome = document.getElementById('navSearchBtn2');
  if (navSearchBtnHome) {
    navSearchBtnHome.addEventListener('click', () => {
      const q = document.getElementById('navSearchInput2').value.trim();
      if (q) location.href = `shop.html?search=${encodeURIComponent(q)}`;
    });
  }

  // Hook cart count update for changes in other tabs/windows
  window.addEventListener('storage', () => updateCartCountElements());
}

/* Initialize when DOM is ready */
document.addEventListener('DOMContentLoaded', init);