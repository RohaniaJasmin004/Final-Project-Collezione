// products.js - fetch products (API, fallback to local), render list, search, product modal + add-to-cart
const PRODUCTS_API = 'https://fakestoreapi.com/products';
const LOCAL_PRODUCTS = 'data/products.json';

const featuredList = document.getElementById('featured-list');
const productsGrid = document.getElementById('products-grid');
const loadingEl = document.getElementById('loading');
const fetchError = document.getElementById('fetchError');

async function fetchProducts() {
  // Try remote API first, then fallback to local JSON
  try {
    const res = await fetch(PRODUCTS_API, {cache: "no-store"});
    if (!res.ok) throw new Error('API fetch failed');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API failed, using local products.json', err);
    if (fetchError) fetchError.classList.remove('d-none');
    const res2 = await fetch(LOCAL_PRODUCTS);
    if (!res2.ok) throw new Error('Local products fetch failed');
    const data = await res2.json();
    return data;
  }
}

function createProductCard(product) {
  const col = document.createElement('div');
  col.className = 'col-sm-6 col-md-4 fade-in-up';
  col.innerHTML = `
    <div class="card product-card h-100" data-id="${product.id}">
      <img src="${product.image}" class="card-img-top product-image" alt="${product.title}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.title}</h5>
        <p class="small text-muted mb-2">${product.category || ''}</p>
        <p class="card-text text-truncate">${product.description}</p>
        <div class="mt-auto d-flex justify-content-between align-items-center">
          <strong class="me-2">$${Number(product.price).toFixed(2)}</strong>
          <div>
            <button class="btn btn-sm btn-outline-secondary me-2 btn-details" aria-label="View details for ${product.title}">Details</button>
            <button class="btn btn-sm btn-dark add-to-cart">Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  `;
  // event delegation will handle clicks
  return col;
}

function renderFeatured(products) {
  if (!featuredList) return;
  featuredList.innerHTML = '';
  // show first 3 as featured
  products.slice(0, 3).forEach(p => {
    const el = document.createElement('div');
    el.className = 'col-md-4';
    el.innerHTML = `
      <div class="card h-100">
        <img src="${p.image}" alt="${p.title}" class="card-img-top" style="height:220px; object-fit:cover">
        <div class="card-body">
          <h5>${p.title}</h5>
          <p class="small text-muted">${p.category || ''}</p>
          <p class="mb-1"><strong>$${Number(p.price).toFixed(2)}</strong></p>
          <a href="products.html" class="btn btn-outline-dark btn-sm">View</a>
        </div>
      </div>
    `;
    featuredList.appendChild(el);
  });
}

async function initProductsPage() {
  if (!productsGrid) return; // only for products.html
  loadingEl?.classList.remove('d-none');
  try {
    const products = await fetchProducts();
    loadingEl?.classList.add('d-none');
    productsGrid.innerHTML = '';
    products.forEach(p => productsGrid.appendChild(createProductCard(p)));
    attachProductEvents();
  } catch (err) {
    console.error(err);
    loadingEl?.classList.add('d-none');
    if (fetchError) fetchError.classList.remove('d-none');
  }
}

async function initIndexFeatured() {
  if (!featuredList) return;
  try {
    const products = await fetchProducts();
    renderFeatured(products);
    // index page may show "add to cart" functionality — handled by cart module
  } catch (e) {
    console.error(e);
  }
}

// Product event handlers (delegation)
function attachProductEvents() {
  // productsGrid exists on products page
  const grid = productsGrid || document.getElementById('featured-list');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card) {
      // for index featured cards
      const parentCard = e.target.closest('.card');
      if (parentCard && parentCard.dataset.id) {
        // do something if necessary
      }
      return;
    }
    const id = card.dataset.id;
    if (e.target.closest('.add-to-cart')) {
      const product = extractProductDataFromCard(card);
      addToCart(product);
      // animation
      e.target.classList.add('cart-bounce');
      setTimeout(()=> e.target.classList.remove('cart-bounce'), 400);
    } else if (e.target.closest('.btn-details')) {
      showProductModal(card, id);
    }
  });
}

function extractProductDataFromCard(card) {
  const img = card.querySelector('img')?.src || '';
  const title = card.querySelector('.card-title')?.textContent || '';
  const priceText = card.querySelector('strong')?.textContent || '';
  const price = parseFloat(priceText.replace('$','')) || 0;
  return {
    id: card.dataset.id,
    title, price, image: img
  };
}

function showProductModal(card, id) {
  // For simplicity, show native modal with details loaded from card
  const title = card.querySelector('.card-title').textContent;
  const img = card.querySelector('img').src;
  const desc = card.querySelector('.card-text')?.textContent || '';
  const price = card.querySelector('strong')?.textContent || '';

  // create modal dynamically
  const modalId = 'productModal';
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();
  modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'modal fade';
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${title}</h5>
          <button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body d-flex gap-4">
          <img src="${img}" alt="${title}" style="width:40%; object-fit:contain">
          <div>
            <p class="mb-2">${desc}</p>
            <p class="mb-2"><strong>${price}</strong></p>
            <div>
              <button class="btn btn-dark add-to-cart">Add to cart</button>
              <button class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();

  // event for add-to-cart inside modal
  modal.addEventListener('click', (ev) => {
    if (ev.target.closest('.add-to-cart')) {
      addToCart({id, title, price: parseFloat(price.replace('$','')) || 0, image: img});
      bsModal.hide();
    }
  });
}

/* --- CART integration (uses functions from cart.js, but addToCart kept global) --- */
function addToCart(product) {
  // product: {id, title, price, image}
  const cartStr = localStorage.getItem('cart') || '[]';
  let cart = JSON.parse(cartStr);
  const existing = cart.find(i => String(i.id) === String(product.id));
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({...product, quantity:1});
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  window.ModernShop?.refreshCartCount();
  // user feedback: small toast
  showTempToast(`${product.title} added to cart`);
}

// temporary toast (simple)
function showTempToast(message) {
  const id = 'tempToast';
  let t = document.getElementById(id);
  if (t) t.remove();
  t = document.createElement('div');
  t.id = id;
  t.className = 'position-fixed bottom-0 end-0 m-3';
  t.innerHTML = `<div class="toast show align-items-center text-bg-dark" role="status" aria-live="polite" aria-atomic="true"><div class="d-flex"><div class="toast-body">${message}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`;
  document.body.appendChild(t);
  setTimeout(()=> { t?.remove(); }, 2500);
}

// search (on products.html)
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
if (searchBtn && searchInput) {
  searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim().toLowerCase();
    filterProducts(q);
  });
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') searchBtn.click();
  });
}

let _allProductsCache = null;
async function loadAndCacheProducts() {
  if (_allProductsCache) return _allProductsCache;
  const data = await fetchProducts();
  _allProductsCache = data;
  return data;
}

async function filterProducts(query) {
  const all = await loadAndCacheProducts();
  const filtered = all.filter(p => (p.title + ' ' + (p.description || '') + ' ' + (p.category || '')).toLowerCase().includes(query));
  productsGrid.innerHTML = '';
  filtered.forEach(p => productsGrid.appendChild(createProductCard(p)));
  attachProductEvents();
}

// Init entry points
document.addEventListener('DOMContentLoaded', () => {
  initIndexFeatured(); // for index page
  initProductsPage();   // for products page
});