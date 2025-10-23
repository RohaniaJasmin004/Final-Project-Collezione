// main.js - general utilities and theme + small helpers

// Set current year footers
document.querySelectorAll('[id^="year"]').forEach(el => el.textContent = new Date().getFullYear());

// Theme toggle (light/dark) and persistence
const THEME_KEY = 'modernshop_theme';
function applyTheme(theme) {
  if (theme === 'dark') document.body.classList.add('dark-theme');
  else document.body.classList.remove('dark-theme');
  // Update icon
  document.querySelectorAll('#themeToggle, #themeToggle2').forEach(btn => {
    if (!btn) return;
    btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    btn.setAttribute('aria-pressed', theme === 'dark');
  });
}
const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
applyTheme(savedTheme);

document.querySelectorAll('#themeToggle, #themeToggle2').forEach(btn => {
  if (!btn) return;
  btn.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  });
});

// Simple cart count indicator refresh
function refreshCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((s, item) => s + (item.quantity || 1), 0);
    const els = [document.getElementById('navCartCount'), document.getElementById('navCartCount2')];
    els.forEach(el => { if (el) el.textContent = count; });
  } catch (e) {
    console.error('cart count error', e);
  }
}
refreshCartCount();

// Small accessible skip link (optional)
// Keyboard: focus visible outline is in CSS

// Export for other modules (if using bundler — here just keep global)
window.Collezione = { refreshCartCount };