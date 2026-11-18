// ClubSync Full Stack Client-Side API Integration Layer
const API_BASE = window.location.origin.includes('github.io') ? null : window.location.origin;

// State management
let currentMember = null;
let currentTask = null;
let currentPod = null;

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardMetrics();
  // Poll every 10 seconds if backend is connected
  if (API_BASE) {
    setInterval(fetchDashboardMetrics, 10000);
  }
});

// 1. Fetch Real-Time Stats & Pods from Backend
async function fetchDashboardMetrics() {
  if (!API_BASE) return; // Static mode fallback

  try {
    const [statsRes, podsRes] = await Promise.all([
      fetch(`${API_BASE}/api/stats`),
      fetch(`${API_BASE}/api/pods`)
    ]);

    if (statsRes.ok) {
      const stats = await statsRes.json();
      document.getElementById('stat_total').innerText = stats.totalRecruits;
      document.getElementById('stat_active').innerText = stats.activeSprints;
      document.getElementById('stat_paused').innerText = stats.onBreak;
      document.getElementById('stat_blocked').innerText = stats.atRiskPods;
    }

    if (podsRes.ok) {
      const pods = await podsRes.json();
      renderPodTable(pods);
    }
  } catch (err) {
    console.log('Running in decoupled frontend mode (fallback to client state):', err);
  }
}

function renderPodTable(pods) {
  const tbody = document.getElementById('podRows');
  if (!tbody || !pods || pods.length === 0) return;

  tbody.innerHTML = '';
  pods.forEach(pod => {
    const badgeClass = pod.status === 'Optimal' ? 'badge-green' : pod.status === 'Stalled' ? 'badge-amber' : 'badge-red';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><b>${pod.name}</b></td>
      <td>${pod.mentor}</td>
      <td>${pod.memberCount} Recruits</td>
      <td><span>${pod.completedTasks} / ${pod.totalTasks} Complete</span></td>
      <td><span class="badge ${badgeClass}">● ${pod.status}</span></td>
      <td>${pod.issues || 'None (Healthy)'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 2. Real Backend Enrollment API Call
async function submitEnrollmentAPI(formData) {
  if (!API_BASE) return null;

  try {
    const res = await fetch(`${API_BASE}/api/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Enrollment API error:', e);
  }
  return null;
}

// 3. Real Backend Task Completion API Call
async function submitTaskAPI(taskId, submissionUrl) {
  if (!API_BASE || !taskId) return null;

  try {
    const res = await fetch(`${API_BASE}/api/tasks/${taskId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionUrl })
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Task API error:', e);
  }
  return null;
}

// 4. Real Backend Graceful Pause API Call
async function togglePauseAPI(memberId) {
  if (!API_BASE || !memberId) return null;

  try {
    const res = await fetch(`${API_BASE}/api/members/${memberId}/toggle-pause`, {
      method: 'PATCH'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error('Pause API error:', e);
  }
  return null;
}
