renderNavbar('dashboard');
guardUserPage();

const user = getUserInfo();
document.getElementById('welcomeName').textContent = user ? user.name : 'User';

let allComplaints = [];

async function loadStats() {
  try {
    const data = await apiFetch('/complaints/my/stats');
    document.getElementById('statTotal').textContent = data.stats.total;
    document.getElementById('statPending').textContent = data.stats.pending;
    document.getElementById('statInProgress').textContent = data.stats.inProgress;
    document.getElementById('statResolved').textContent = data.stats.resolved;
  } catch (err) {
    console.error(err);
  }
}

function renderTable(list) {
  const tbody = document.getElementById('complaintsTableBody');
  const emptyState = document.getElementById('emptyState');

  if (!list.length) {
    tbody.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  tbody.innerHTML = list.map((c) => `
    <tr>
      <td class="fw-semibold text-primary">${c.complaintId}</td>
      <td>${c.title}</td>
      <td>${c.category}</td>
      <td><span class="${priorityBadgeClass(c.priority)}">${c.priority}</span></td>
      <td><span class="${statusBadgeClass(c.status)}">${c.status}</span></td>
      <td>${formatDate(c.createdAt)}</td>
      <td><a href="/track.html?id=${c.complaintId}" class="btn btn-sm btn-outline-cmp"><i class="bi bi-eye me-1"></i>View</a></td>
    </tr>
  `).join('');
}

async function loadComplaints() {
  try {
    const data = await apiFetch('/complaints/my');
    allComplaints = data.complaints;
    renderTable(allComplaints);
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('searchInput').addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  const filtered = allComplaints.filter((c) =>
    c.complaintId.toLowerCase().includes(q) ||
    c.title.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  );
  renderTable(filtered);
});

loadStats();
loadComplaints();
