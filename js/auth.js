// Base API URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginAlert = document.getElementById('loginAlert');
const registerAlert = document.getElementById('registerAlert');
const togglePasswordBtns = document.querySelectorAll('#togglePassword');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname;
  
  // If user is logged in and tries to access login or register page, redirect to index
  if (token && (currentPage.includes('login.html') || currentPage.includes('register.html'))) {
    window.location.href = 'index.html';
  }
  
  // If user is not logged in and tries to access index, redirect to login
  if (!token && currentPage.includes('index.html')) {
    window.location.href = 'login.html';
  }
});

// Toggle password visibility
if (togglePasswordBtns) {
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const passwordInput = this.previousElementSibling;
      const icon = this.querySelector('i');
      
      // Toggle type attribute
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle icon
      icon.classList.toggle('bi-eye');
      icon.classList.toggle('bi-eye-slash');
    });
  });
}

// Handle Login
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        }));
        
        // If remember me is not checked, set token to expire in 1 day
        if (!rememberMe) {
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }, 24 * 60 * 60 * 1000);
        }
        
        // Redirect to dashboard
        window.location.href = 'index.html';
      } else {
        // Show error message
        loginAlert.textContent = data.message || 'Login failed';
        loginAlert.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Login error:', error);
      loginAlert.textContent = 'An error occurred. Please try again.';
      loginAlert.classList.remove('d-none');
    }
  });
}

// Handle Registration
if (registerForm) {
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Password validation
    if (password.length < 6) {
      registerAlert.textContent = 'Password must be at least 6 characters';
      registerAlert.classList.remove('d-none');
      return;
    }
    
    if (password !== confirmPassword) {
      registerAlert.textContent = 'Passwords do not match';
      registerAlert.classList.remove('d-none');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        }));
        
        // Redirect to dashboard
        window.location.href = 'index.html';
      } else {
        // Show error message
        registerAlert.textContent = data.message || 'Registration failed';
        registerAlert.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Registration error:', error);
      registerAlert.textContent = 'An error occurred. Please try again.';
      registerAlert.classList.remove('d-none');
    }
  });
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Function to get current user
function getCurrentUser() {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
}

// Add getAuthHeader function to include auth token in requests
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
} 