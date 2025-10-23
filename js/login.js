// login.js - simple register / login using localStorage, minimal password rules
// Users are stored in localStorage key: 'ms_users' as array of {email,name,passwordHash?}

// Helper simple hashing (not secure, only for demo)
function simpleHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return String(Math.abs(h));
  }
  
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('ms_users') || '[]'); }
    catch { return []; }
  }
  function saveUsers(users) { localStorage.setItem('ms_users', JSON.stringify(users)); }
  
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const showRegister = document.getElementById('showRegister');
    const registerSection = document.getElementById('registerSection');
    const registerForm = document.getElementById('registerForm');
    const cancelRegister = document.getElementById('cancelRegister');
  
    // toggle register form
    showRegister?.addEventListener('click', (e) => {
      e.preventDefault();
      registerSection.classList.toggle('d-none');
    });
  
    cancelRegister?.addEventListener('click', (e) => {
      e.preventDefault();
      registerSection.classList.add('d-none');
    });
  
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) {
        loginMessage.textContent = 'Please provide email and password.';
        loginMessage.className = 'text-danger';
        return;
      }
      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === simpleHash(password));
      if (user) {
        // set session — use sessionStorage for session; localStorage for "remember"
        sessionStorage.setItem('sessionUser', user.name);
        localStorage.setItem('sessionUser', user.name); // keep for demo; remove to prefer session-only
        loginMessage.textContent = 'Login successful! Redirecting...';
        loginMessage.className = 'text-success';
        setTimeout(()=> window.location.href = 'dashboard.html', 800);
      } else {
        loginMessage.textContent = 'Invalid credentials or user not found. Try registering.';
        loginMessage.className = 'text-danger';
      }
    });
  
    registerForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const password = document.getElementById('regPassword').value;
      if (name.length < 3 || !email || password.length < 6) {
        alert('Please fill valid registration details.');
        return;
      }
      let users = getUsers();
      if (users.some(u => u.email === email)) {
        alert('User with this email already exists.');
        return;
      }
      users.push({ name, email, password: simpleHash(password) });
      saveUsers(users);
      alert('Registration successful. You can now log in.');
      registerForm.reset();
      registerSection.classList.add('d-none');
    });
  });
  