/* ============================================================
   Complaint Management Portal - Shared Frontend Utilities
   ============================================================ */

const API_BASE = '/api';

// ---------- Local storage helpers ----------
function getToken() { return localStorage.getItem('cmp_token'); }
function setToken(token) { localStorage.setItem('cmp_token', token); }
function clearToken() { localStorage.removeItem('cmp_token'); }

function getRole() { return localStorage.getItem('cmp_role'); } // 'user' | 'admin'
function setRole(role) { localStorage.setItem('cmp_role', role); }

function getUserInfo() {
  const raw = localStorage.getItem('cmp_user');
  return raw ? JSON.parse(raw) : null;
}
function setUserInfo(obj) { localStorage.setItem('cmp_user', JSON.stringify(obj)); }

function logout() {
  clearToken();
  localStorage.removeItem('cmp_role');
  localStorage.removeItem('cmp_user');
  window.location.href = '/index.html';
}

function isLoggedIn() { return !!getToken() && getRole() === 'user'; }
function isAdminLoggedIn() { return !!getToken() && getRole() === 'admin'; }

// ---------- Fetch wrapper with auth header + JSON handling ----------
async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Don't set Content-Type for FormData - browser sets the correct boundary
  if (!(options.body instanceof FormData) && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { success: false, message: 'Unexpected server response.' };
  }
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong.');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ---------- Alert helper ----------
function showAlert(containerId, message, type = 'danger') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
      <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-x-circle-fill'}"></i>
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearAlert(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}

// ---------- Badge helpers ----------
function statusBadgeClass(status) {
  return `badge-status badge-${status.replace(/\s+/g, '-')}`;
}
function priorityBadgeClass(priority) {
  return `badge-priority badge-${priority}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ---------- Navbar renderer ----------
// activePage: one of 'home','submit','track','dashboard','login','register','admin'
function renderNavbar(activePage = '') {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const loggedIn = isLoggedIn();
  const adminLoggedIn = isAdminLoggedIn();
  const user = getUserInfo();

  let rightLinks = '';
  if (adminLoggedIn) {
    rightLinks = `
      <li class="nav-item"><span class="nav-link"><i class="bi bi-shield-lock-fill me-1"></i>Admin</span></li>
      <li class="nav-item"><a class="nav-link btn-nav-cta ms-lg-2" href="#" onclick="logout(); return false;"><i class="bi bi-box-arrow-right me-1"></i>Logout</a></li>`;
  } else if (loggedIn) {
    rightLinks = `
      <li class="nav-item"><a class="nav-link ${activePage === 'submit' ? 'active' : ''}" href="/complaint-form.html"><i class="bi bi-pencil-square me-1"></i>Submit Complaint</a></li>
      <li class="nav-item"><a class="nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="/dashboard.html"><i class="bi bi-speedometer2 me-1"></i>Dashboard</a></li>
      <li class="nav-item"><span class="nav-link"><i class="bi bi-person-circle me-1"></i>${user ? user.name.split(' ')[0] : 'User'}</span></li>
      <li class="nav-item"><a class="nav-link btn-nav-cta ms-lg-2" href="#" onclick="logout(); return false;"><i class="bi bi-box-arrow-right me-1"></i>Logout</a></li>`;
  } else {
    rightLinks = `
      <li class="nav-item"><a class="nav-link ${activePage === 'login' ? 'active' : ''}" href="/login.html"><i class="bi bi-box-arrow-in-right me-1"></i>Login</a></li>
      <li class="nav-item"><a class="nav-link btn-nav-cta ms-lg-2" href="/register.html"><i class="bi bi-person-plus-fill me-1"></i>Register</a></li>`;
  }

  placeholder.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-cmp sticky-top">
    <div class="container">
      <a class="navbar-brand" href="/index.html"><i class="bi bi-megaphone-fill"></i>Complaint Portal</a>
      <button class="navbar-toggler border-0 text-white" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
        <i class="bi bi-list text-white fs-2"></i>
      </button>
      <div class="collapse navbar-collapse" id="navMain">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-1">
          <li class="nav-item"><a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="/index.html"><i class="bi bi-house-door me-1"></i>Home</a></li>
          <li class="nav-item"><a class="nav-link ${activePage === 'track' ? 'active' : ''}" href="/track.html"><i class="bi bi-search me-1"></i>Track Complaint</a></li>
          ${rightLinks}
          ${!adminLoggedIn ? `<li class="nav-item"><a class="nav-link small opacity-75" href="/admin-login.html"><i class="bi bi-shield-lock me-1"></i>Admin</a></li>` : ''}
        </ul>
      </div>
    </div>
  </nav>`;
}

// ---------- Guards ----------
function guardUserPage() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
  }
}
function guardAdminPage() {
  if (!isAdminLoggedIn()) {
    window.location.href = '/admin-login.html';
  }
}
