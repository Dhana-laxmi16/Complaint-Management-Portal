renderNavbar('admin');
guardAdminPage();

const STAGES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
let currentComplaint = null;
let detailModal;

document.addEventListener('DOMContentLoaded', () => {
  detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
});

async function loadMetaOptions() {
  try {
    const data = await apiFetch('/complaints/meta/options');
    const categorySelect = document.getElementById('fCategory');
    const prioritySelect = document.getElementById('fPriority');
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
  } catch (err) { console.error(err); }
}
loadMetaOptions();

function buildQuery() {
  const params = new URLSearchParams();
  const search = document.getElementById('fSearch').value.trim();
  const complaintId = document.getElementById('fComplaintId').value.trim();
  const category = document.getElementById('fCategory').value;
  const status = document.getElementById('fStatus').value;
  const priority = document.getElementById('fPriority').value;

  if (search) params.append('q', search);
  if (complaintId) params.append('complaintId', complaintId);
  if (category && category !== 'All') params.append('category', category);
  if (status && status !== 'All') params.append('status', status);
  if (priority && priority !== 'All') params.append('priority', priority);
  return params.toString();
}

function renderStats(stats) {
  document.getElementById('statTotal').textContent = stats.total;
  document.getElementById('statPending').textContent = stats.submitted + stats.underReview;
  document.getElementById('statInProgress').textContent = stats.inProgress;
  document.getElementById('statResolved').textContent = stats.resolved;
}

function renderTable(complaints) {
  const tbody = document.getElementById('complaintsTableBody');
  const emptyState = document.getElementById('emptyState');
  document.getElementById('resultCount').textContent = `${complaints.length} result${complaints.length !== 1 ? 's' : ''}`;

  if (!complaints.length) {
    tbody.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  tbody.innerHTML = complaints.map((c) => `
    <tr>
      <td class="fw-semibold text-primary">${c.complaintId}</td>
      <td>${c.name}<br><small class="text-muted">${c.email}</small></td>
      <td>${c.category}</td>
      <td><span class="${priorityBadgeClass(c.priority)}">${c.priority}</span></td>
      <td><span class="${statusBadgeClass(c.status)}">${c.status}</span></td>
      <td>${formatDate(c.createdAt)}</td>
      <td><button class="btn btn-sm btn-outline-cmp" onclick="openDetail('${c._id}')"><i class="bi bi-eye me-1"></i>View</button></td>
    </tr>
  `).join('');
}

async function loadComplaints() {
  try {
    const query = buildQuery();
    const data = await apiFetch(`/admin/complaints${query ? '?' + query : ''}`);
    renderStats(data.stats);
    renderTable(data.complaints);
  } catch (err) {
    console.error(err);
    if (err.status === 401 || err.status === 403) {
      logout();
    }
  }
}

document.getElementById('applyFiltersBtn').addEventListener('click', loadComplaints);
['fSearch', 'fComplaintId'].forEach((id) => {
  document.getElementById(id).addEventListener('keyup', (e) => {
    if (e.key === 'Enter') loadComplaints();
  });
});
['fCategory', 'fStatus', 'fPriority'].forEach((id) => {
  document.getElementById(id).addEventListener('change', loadComplaints);
});

function renderModalTimeline(currentStatus) {
  const currentIndex = STAGES.indexOf(currentStatus);
  document.querySelectorAll('#modalTimelineBar li').forEach((li) => {
    const stage = li.getAttribute('data-stage');
    const stageIndex = STAGES.indexOf(stage);
    li.classList.remove('active', 'current');
    if (stageIndex < currentIndex) li.classList.add('active');
    if (stageIndex === currentIndex) li.classList.add('current');
  });
}

window.openDetail = async function (mongoId) {
  clearAlert('modalAlertBox');
  try {
    const data = await apiFetch(`/admin/complaints/${mongoId}`);
    currentComplaint = data.complaint;
    const c = currentComplaint;

    document.getElementById('mMongoId').value = c._id;
    document.getElementById('mComplaintId').textContent = c.complaintId;
    const statusBadge = document.getElementById('mStatusBadge');
    statusBadge.textContent = c.status;
    statusBadge.className = statusBadgeClass(c.status);
    renderModalTimeline(c.status);

    document.getElementById('mTitle').textContent = c.title;
    document.getElementById('mCategory').textContent = c.category;
    document.getElementById('mPriority').innerHTML = `<span class="${priorityBadgeClass(c.priority)}">${c.priority}</span>`;
    document.getElementById('mLocation').textContent = c.location;
    document.getElementById('mName').textContent = c.name;
    document.getElementById('mContact').textContent = `${c.email} | ${c.phone}`;
    document.getElementById('mDate').textContent = formatDate(c.createdAt);
    document.getElementById('mDescription').textContent = c.description;

    if (c.attachment && c.attachment.url) {
      document.getElementById('mAttachmentWrap').style.display = 'block';
      document.getElementById('mAttachmentLink').href = c.attachment.url;
      document.getElementById('mAttachmentName').textContent = c.attachment.originalName;
    } else {
      document.getElementById('mAttachmentWrap').style.display = 'none';
    }

    document.getElementById('updateStatus').value = c.status;
    document.getElementById('updateRemarks').value = c.adminRemarks || '';

    const historyList = document.getElementById('mHistoryList');
    historyList.innerHTML = '';
    [...c.timeline].reverse().forEach((entry) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-start flex-wrap gap-2';
      li.innerHTML = `
        <div>
          <span class="${statusBadgeClass(entry.status)} me-2">${entry.status}</span>
          <span class="text-muted small">${entry.remarks ? entry.remarks : 'No remarks added.'}</span>
        </div>
        <span class="text-muted small">${formatDate(entry.updatedAt)}</span>`;
      historyList.appendChild(li);
    });

    detailModal.show();
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById('updateForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert('modalAlertBox');

  const mongoId = document.getElementById('mMongoId').value;
  const status = document.getElementById('updateStatus').value;
  const adminRemarks = document.getElementById('updateRemarks').value.trim();

  const btn = document.getElementById('updateBtn');
  btn.disabled = true;
  document.getElementById('updateBtnText').innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Saving...';

  try {
    const data = await apiFetch(`/admin/complaints/${mongoId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminRemarks })
    });
    showAlert('modalAlertBox', 'Complaint updated successfully! The user will see this update when tracking their complaint.', 'success');

    // Refresh modal view + underlying table
    await window.openDetail(mongoId);
    await loadComplaints();
  } catch (err) {
    showAlert('modalAlertBox', err.message, 'danger');
  } finally {
    btn.disabled = false;
    document.getElementById('updateBtnText').innerHTML = '<i class="bi bi-check2-circle me-1"></i>Save Update';
  }
});

loadComplaints();
