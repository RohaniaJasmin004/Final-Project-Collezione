// cart.js - manage localStorage cart, render cart page, remove/update quantities
function formatPrice(n){ return `$${Number(n).toFixed(2)}`; }

function getCart() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
  catch(e){ return []; }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.ModernShop?.refreshCartCount();
}

function updateCartUI() {
  const cart = getCart();
  const cartEmpty = document.getElementById('cartEmpty');
  const cartList = document.getElementById('cartList');
  const cartBody = document.getElementById('cartBody');
  const cartSubtotal = document.getElementById('cartSubtotal');

  if (!cartBody) return;

  if (!cart || cart.length === 0) {
    cartEmpty.classList.remove('d-none');
    cartList.classList.add('d-none');
    return;
  }
  cartEmpty.classList.add('d-none');
  cartList.classList.remove('d-none');
  cartBody.innerHTML = '';

  let subtotal = 0;
  cart.forEach(item => {
    const row = document.createElement('tr');
    const itemSubtotal = (item.price || 0) * (item.quantity || 1);
    subtotal += itemSubtotal;
    row.innerHTML = `
      <td>
        <div class="d-flex gap-3 align-items-center">
          <img src="${item.image}" alt="${item.title}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">
          <div>
            <div class="fw-semibold">${item.title}</div>
            <div class="small text-muted">${item.category || ''}</div>
          </div>
        </div>
      </td>
      <td class="text-center">${formatPrice(item.price)}</td>
      <td class="text-center">
        <div class="d-flex justify-content-center align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary btn-decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
          <input type="number" min="1" value="${item.quantity || 1}" class="form-control form-control-sm qty-input" style="width:70px" data-id="${item.id}">
          <button class="btn btn-sm btn-outline-secondary btn-increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
      </td>
      <td class="text-center">${formatPrice(itemSubtotal)}</td>
      <td class="text-center"><button class="btn btn-sm btn-danger btn-remove" data-id="${item.id}" aria-label="Remove ${item.title}"><i class="fas fa-trash"></i></button></td>
    `;
    cartBody.appendChild(row);
  });

  cartSubtotal.textContent = formatPrice(subtotal);

  // Attach events
  cartBody.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const id = btn.dataset.id;
      let c = getCart();
      c = c.filter(i => String(i.id) !== String(id));
      saveCart(c);
      updateCartUI();
    });
  });

  cartBody.querySelectorAll('.btn-increase').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const c = getCart();
      const it = c.find(i => String(i.id) === String(id));
      if (it) { it.quantity = (it.quantity || 1) + 1; saveCart(c); updateCartUI(); }
    });
  });
  cartBody.querySelectorAll('.btn-decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const c = getCart();
      const it = c.find(i => String(i.id) === String(id));
      if (it) {
        it.quantity = Math.max(1, (it.quantity || 1) - 1);
        saveCart(c); updateCartUI();
      }
    });
  });

  cartBody.querySelectorAll('.qty-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const val = Math.max(1, parseInt(inp.value) || 1);
      const id = inp.dataset.id;
      const c = getCart();
      const it = c.find(i => String(i.id) === String(id));
      if (it) it.quantity = val;
      saveCart(c); updateCartUI();
    });
  });
}

// clear cart button
document.addEventListener('DOMContentLoaded', () => {
  const clearBtn = document.getElementById('clearCart');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    localStorage.removeItem('cart');
    updateCartUI();
  });

  const proceedBtn = document.getElementById('proceedCheckout');
  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      const cart = getCart();
      if (!cart || cart.length === 0) {
        // show warning on cart page
        const alertEl = document.getElementById('cartEmpty');
        if (alertEl) { alertEl.classList.remove('d-none'); }
      } else {
        window.location.href = 'checkout.html';
      }
    });
  }

  updateCartUI();
  window.Collezione?.refreshCartCount();
});