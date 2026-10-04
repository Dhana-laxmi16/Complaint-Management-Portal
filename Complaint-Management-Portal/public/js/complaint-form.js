renderNavbar('submit');
guardUserPage();

// Pre-fill complainant details from logged-in user
const currentUser = getUserInfo();

async function loadMetaOptions() {
  try {
    const data = await apiFetch('/complaints/meta/options');
    const categorySelect = document.getElementById('category');
    const prioritySelect = document.getElementById('priority');

    data.categories.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat; opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
    data.priorities.forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p; opt.textContent = p;
      prioritySelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load options', err);
  }
}
loadMetaOptions();

if (currentUser) {
  document.getElementById('name').value = currentUser.name || '';
  document.getElementById('email').value = currentUser.email || '';
  document.getElementById('phone').value = currentUser.phone || '';
}

document.getElementById('attachment').addEventListener('change', function () {
  const label = document.getElementById('fileLabel');
  if (this.files && this.files[0]) {
    label.textContent = `Selected: ${this.files[0].name}`;
  } else {
    label.textContent = 'Click to upload an image, PDF or document (max 5MB)';
  }
});

document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert('alertBox');

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  document.getElementById('btnText').innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Submitting...';

  const formData = new FormData();
  formData.append('name', document.getElementById('name').value.trim());
  formData.append('email', document.getElementById('email').value.trim());
  formData.append('phone', document.getElementById('phone').value.trim());
  formData.append('location', document.getElementById('location').value.trim());
  formData.append('category', document.getElementById('category').value);
  formData.append('priority', document.getElementById('priority').value);
  formData.append('title', document.getElementById('title').value.trim());
  formData.append('description', document.getElementById('description').value.trim());

  const fileInput = document.getElementById('attachment');
  if (fileInput.files && fileInput.files[0]) {
    formData.append('attachment', fileInput.files[0]);
  }

  try {
    const data = await apiFetch('/complaints', { method: 'POST', body: formData });
    const c = data.complaint;

    document.getElementById('successComplaintId').textContent = c.complaintId;
    document.getElementById('sTitle').textContent = c.title;
    document.getElementById('sCategory').textContent = c.category;
    document.getElementById('sPriority').textContent = c.priority;
    document.getElementById('sDate').textContent = formatDate(c.createdAt);

    document.getElementById('formView').classList.add('d-none');
    document.getElementById('successView').classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showAlert('alertBox', err.message, 'danger');
    btn.disabled = false;
    document.getElementById('btnText').innerHTML = '<i class="bi bi-send-fill me-1"></i> Submit Complaint';
  }
});

document.getElementById('newComplaintBtn').addEventListener('click', () => {
  document.getElementById('complaintForm').reset();
  if (currentUser) {
    document.getElementById('name').value = currentUser.name || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('phone').value = currentUser.phone || '';
  }
  document.getElementById('fileLabel').textContent = 'Click to upload an image, PDF or document (max 5MB)';
  document.getElementById('successView').classList.add('d-none');
  document.getElementById('formView').classList.remove('d-none');
  const btn = document.getElementById('submitBtn');
  btn.disabled = false;
  document.getElementById('btnText').innerHTML = '<i class="bi bi-send-fill me-1"></i> Submit Complaint';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
