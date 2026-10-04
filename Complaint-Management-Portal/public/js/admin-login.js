renderNavbar('admin');
if (isAdminLoggedIn()) window.location.href = '/admin-dashboard.html';

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert('alertBox');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  document.getElementById('btnText').innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Logging in...';

  try {
    const data = await apiFetch('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(data.token);
    setRole('admin');
    setUserInfo(data.admin);
    showAlert('alertBox', data.message, 'success');
    setTimeout(() => window.location.href = '/admin-dashboard.html', 700);
  } catch (err) {
    showAlert('alertBox', err.message, 'danger');
    btn.disabled = false;
    document.getElementById('btnText').innerHTML = '<i class="bi bi-shield-lock me-1"></i> Login as Admin';
  }
});
