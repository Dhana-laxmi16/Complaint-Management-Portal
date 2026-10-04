renderNavbar('track');

const STAGES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

// Support deep-linking: /track.html?id=CMP20260001
const params = new URLSearchParams(window.location.search);
const prefilledId = params.get('id');
if (prefilledId) {
  document.getElementById('complaintIdInput').value = prefilledId;
}

function renderTimeline(currentStatus) {
  const currentIndex = STAGES.indexOf(currentStatus);
  document.querySelectorAll('#statusTimelineBar li').forEach((li) => {
    const stage = li.getAttribute('data-stage');
    const stageIndex = STAGES.indexOf(stage);
    li.classList.remove('active', 'current');
    if (stageIndex < currentIndex) li.classList.add('active');
    if (stageIndex === currentIndex) li.classList.add('current');
  });
}

function renderComplaint(c) {
  document.getElementById('emptyState').classList.add('d-none');
  document.getElementById('resultCard').classList.remove('d-none');

  document.getElementById('rComplaintId').textContent = c.complaintId;
  const statusBadge = document.getElementById('rStatusBadge');
  statusBadge.textContent = c.status;
  statusBadge.className = statusBadgeClass(c.status);

  renderTimeline(c.status);

  document.getElementById('rTitle').textContent = c.title;
  document.getElementById('rCategory').textContent = c.category;
  document.getElementById('rPriority').innerHTML = `<span class="${priorityBadgeClass(c.priority)}">${c.priority}</span>`;
  document.getElementById('rLocation').textContent = c.location;
  document.getElementById('rName').textContent = `${c.name} (${c.email})`;
  document.getElementById('rDate').textContent = formatDate(c.createdAt);
  document.getElementById('rDescription').textContent = c.description;
  document.getElementById('rRemarks').textContent = c.adminRemarks && c.adminRemarks.trim() ? c.adminRemarks : 'No remarks yet. Your complaint is being processed.';

  if (c.attachment && c.attachment.url) {
    document.getElementById('rAttachmentWrap').style.display = 'block';
    document.getElementById('rAttachmentLink').href = c.attachment.url;
    document.getElementById('rAttachmentName').textContent = c.attachment.originalName;
  } else {
    document.getElementById('rAttachmentWrap').style.display = 'none';
  }

  const historyList = document.getElementById('rHistoryList');
  historyList.innerHTML = '';
  const timeline = [...c.timeline].reverse();
  timeline.forEach((entry) => {
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
}

document.getElementById('trackForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert('alertBox');

  const id = document.getElementById('complaintIdInput').value.trim();
  if (!id) return;

  const btn = document.getElementById('trackBtn');
  btn.disabled = true;
  document.getElementById('trackBtnText').innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

  try {
    const data = await apiFetch(`/complaints/track/${encodeURIComponent(id)}`);
    renderComplaint(data.complaint);
  } catch (err) {
    document.getElementById('resultCard').classList.add('d-none');
    document.getElementById('emptyState').classList.remove('d-none');
    showAlert('alertBox', err.message, 'danger');
  } finally {
    btn.disabled = false;
    document.getElementById('trackBtnText').textContent = 'Track';
  }
});

// Auto-track if ID was passed via query string
if (prefilledId) {
  document.getElementById('trackForm').dispatchEvent(new Event('submit'));
}
