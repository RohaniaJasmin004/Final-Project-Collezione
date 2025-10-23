// checkout.js - validate form, simple simulated order placement
document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkoutForm');
    const checkoutAlert = document.getElementById('checkoutAlert');
  
    function getCart() {
      try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
    }
  
    const cart = getCart();
    if (!cart || cart.length === 0) {
      if (checkoutAlert) checkoutAlert.classList.remove('d-none');
      if (checkoutForm) checkoutForm.classList.add('d-none');
      return;
    }
  
    // Bootstrap validation + custom rules
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!checkoutForm.checkValidity()) {
        checkoutForm.classList.add('was-validated');
        return;
      }
      // Simulate processing
      const submitBtn = document.getElementById('submitCheckout');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      setTimeout(() => {
        // Clear cart and optionally save info
        if (document.getElementById('saveInfo').checked) {
          const saved = {
            name: document.getElementById('fullName').value,
            email: document.getElementById('emailCheckout').value,
            address: document.getElementById('address').value
          };
          localStorage.setItem('ms_checkout_info', JSON.stringify(saved));
        }
        localStorage.removeItem('cart');
        window.ModernShop?.refreshCartCount();
        alert('Order placed successfully! Thank you for your purchase.');
        window.location.href = 'index.html';
      }, 1200);
    });
  
    // Prefill from saved info
    const savedInfo = JSON.parse(localStorage.getItem('ms_checkout_info') || 'null');
    if (savedInfo) {
      document.getElementById('fullName').value = savedInfo.name || '';
      document.getElementById('emailCheckout').value = savedInfo.email || '';
      document.getElementById('address').value = savedInfo.address || '';
    }
  });
  