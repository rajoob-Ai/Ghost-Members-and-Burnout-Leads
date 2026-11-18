// ==============================================================================
// ClubSync Full-Stack API Integration & People Directory Engine
// Lovely Professional University · INT335 Design Thinking Project P18
// ==============================================================================

const API_BASE = (window.location.origin.includes('github.io') || window.location.protocol === 'file:') 
  ? null 
  : window.location.origin;

// In-Memory State
let appStats = { totalRecruits: 48, activeSprints: 36, onBreak: 8, atRiskPods: 4, tasksCompleted: 2 };
let appPods = [];
let allMembers = [];
let currentFilter = { status: 'all', podId: 'all', query: '' };
let selectedMember = null;
let currentMemberId = 'mem-1';
let currentTaskId = 'task-1';

// ------------------------------------------------------------------------------
// 1. INITIALIZATION & DATA FETCHING
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  await loadInitialData();
  
  // Real-time polling if connected to Node.js backend
  if (API_BASE) {
    setInterval(fetchDashboardMetrics, 8000);
  }
});

async function loadInitialData() {
  await fetchDashboardMetrics();
  await fetchMembersDirectory();
}

// ------------------------------------------------------------------------------
// 2. DASHBOARD METRICS & POD HEALTH
// ------------------------------------------------------------------------------
async function fetchDashboardMetrics() {
  if (API_BASE) {
    try {
      const [statsRes, podsRes] = await Promise.all([
        fetch(`${API_BASE}/api/stats`),
        fetch(`${API_BASE}/api/pods`)
      ]);

      if (statsRes.ok) {
        appStats = await statsRes.json();
      }
      if (podsRes.ok) {
        appPods = await podsRes.json();
      }
    } catch (e) {
      console.warn('Backend server offline; using client database store:', e);
    }
  }

  // If pods are empty, load fallback pods from data.json
  if (!appPods || appPods.length === 0) {
    try {
      const fallbackRes = await fetch('server/data.json');
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        appPods = fbData.pods || [];
      }
    } catch (err) {
      console.log('Using default client pod definitions');
    }
  }

  updateDashboardUI();
}

function updateDashboardUI() {
  // Update Stat Tiles
  const statTotal = document.getElementById('stat_total');
  const statActive = document.getElementById('stat_active');
  const statPaused = document.getElementById('stat_paused');
  const statBlocked = document.getElementById('stat_blocked');

  if (statTotal) statTotal.innerText = appStats.totalRecruits;
  if (statActive) statActive.innerText = appStats.activeSprints;
  if (statPaused) statPaused.innerText = appStats.onBreak;
  if (statBlocked) statBlocked.innerText = appStats.atRiskPods || appStats.blocked || 4;

  renderPodTable(appPods);
}

function renderPodTable(pods) {
  const tbody = document.getElementById('podRows');
  if (!tbody || !pods || pods.length === 0) return;

  tbody.innerHTML = '';
  pods.forEach(pod => {
    let badgeClass = 'badge-green';
    let badgeLabel = '● Optimal';

    if (pod.status === 'Critical Block') {
      badgeClass = 'badge-red';
      badgeLabel = '● Critical Block';
    } else if (pod.status === 'Stalled') {
      badgeClass = 'badge-amber';
      badgeLabel = '● Stalled';
    }

    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.title = `Click to view members of ${pod.name}`;
    tr.innerHTML = `
      <td>
        <div style="font-weight: 800; color: #1e293b;">${pod.name}</div>
        <div style="font-size: 0.75rem; color: #64748b;">${pod.clubId || 'dev-soc'}</div>
      </td>
      <td>
        <div style="font-weight: 700; color: #334155;">${pod.mentor}</div>
        <div style="font-size: 0.72rem; color: #0d9488;">Senior Mentor</div>
      </td>
      <td><b style="font-family: 'JetBrains Mono', monospace;">${pod.memberCount || 8}</b> Recruits</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="flex: 1; height: 6px; background: #e2e8f0; border-radius: 4px; overflow: hidden; min-width: 60px;">
            <div style="width: ${pod.completionRate || (pod.status === 'Optimal' ? 80 : 35)}%; height: 100%; background: ${pod.status === 'Optimal' ? '#10b981' : '#f59e0b'};"></div>
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; font-family: 'JetBrains Mono', monospace;">${pod.completedTasks || (pod.status === 'Optimal' ? 4 : 1)}/${pod.totalTasks || (pod.memberCount || 5)}</span>
        </div>
      </td>
      <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
      <td style="font-size: 0.8rem; color: #475569; max-width: 240px;">
        ${pod.issues || 'None (Healthy)'}
      </td>
      <td>
        <button onclick="event.stopPropagation(); filterAndShowPeople('pod', '${pod.id}')" 
          style="background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s;">
          👥 View People
        </button>
      </td>
    `;
    tr.addEventListener('click', () => filterAndShowPeople('pod', pod.id));
    tbody.appendChild(tr);
  });
}

// ------------------------------------------------------------------------------
// 3. PEOPLE & POD DIRECTORY ENGINE
// ------------------------------------------------------------------------------
async function fetchMembersDirectory() {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/members`);
      if (res.ok) {
        allMembers = await res.json();
        renderPeopleGrid();
        return;
      }
    } catch (e) {
      console.warn('API error fetching members, falling back to data.json', e);
    }
  }

  // Fallback: Fetch from server/data.json directly (works on GitHub Pages & local)
  try {
    const res = await fetch('server/data.json');
    if (res.ok) {
      const db = await res.json();
      allMembers = db.members.map(m => {
        const task = (db.tasks && db.tasks.find(t => t.memberId === m.id)) || null;
        const pod = (db.pods && db.pods.find(p => p.id === m.podId)) || null;
        return { ...m, task, pod };
      });
      renderPeopleGrid();
      return;
    }
  } catch (err) {
    console.error('Could not load server/data.json', err);
  }
}

function filterAndShowPeople(filterType, filterValue) {
  // 1. Switch to Tab 4
  showTab('tab-people');

  // 2. Set filters
  if (filterType === 'all') {
    currentFilter.status = 'all';
    currentFilter.podId = 'all';
  } else if (filterType === 'active') {
    currentFilter.status = 'active';
  } else if (filterType === 'break') {
    currentFilter.status = 'break';
  } else if (filterType === 'blocked') {
    currentFilter.status = 'blocked';
  } else if (filterType === 'complete') {
    currentFilter.status = 'complete';
  } else if (filterType === 'pod') {
    currentFilter.podId = filterValue;
    const podSelect = document.getElementById('peoplePodSelect');
    if (podSelect) podSelect.value = filterValue;
  }

  // 3. Update pill UI
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-status') === currentFilter.status) {
      btn.classList.add('active');
    }
  });

  // 4. Re-render
  renderPeopleGrid();

  // 5. Smooth scroll
  const peopleSection = document.getElementById('tab-people');
  if (peopleSection) {
    peopleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  showToast('👥 Directory Filter Applied', `Showing ${getFilteredMembers().length} people for ${filterType.toUpperCase()}: ${filterValue || ''}`, 'info');
}

function getFilteredMembers() {
  return allMembers.filter(m => {
    // Status Filter
    if (currentFilter.status === 'active') {
      if (m.onExamBreak || (m.status && m.status.includes('Blocked'))) return false;
    } else if (currentFilter.status === 'break') {
      if (!m.onExamBreak) return false;
    } else if (currentFilter.status === 'blocked') {
      if (!m.status || !m.status.includes('Blocked')) return false;
    } else if (currentFilter.status === 'complete') {
      if (!m.task || m.task.status !== 'Verified Complete') return false;
    }

    // Pod Filter
    if (currentFilter.podId !== 'all' && m.podId !== currentFilter.podId) {
      return false;
    }

    // Search Query
    if (currentFilter.query && currentFilter.query.trim() !== '') {
      const q = currentFilter.query.toLowerCase().trim();
      const matchName = m.name && m.name.toLowerCase().includes(q);
      const matchReg = m.regNo && m.regNo.toLowerCase().includes(q);
      const matchPod = m.podName && m.podName.toLowerCase().includes(q);
      const matchSkill = m.skills && m.skills.some(s => s.toLowerCase().includes(q));
      const matchDept = m.department && m.department.toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchPod && !matchSkill && !matchDept) {
        return false;
      }
    }

    return true;
  });
}

function renderPeopleGrid() {
  const container = document.getElementById('peopleGrid');
  const countBadge = document.getElementById('filteredPeopleCount');
  if (!container) return;

  const filtered = getFilteredMembers();
  if (countBadge) {
    countBadge.innerText = `${filtered.length} Contributor${filtered.length === 1 ? '' : 's'} Shown`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: var(--surface); border: 2px dashed var(--border); border-radius: var(--radius-lg);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <div style="font-size: 1.15rem; font-weight: 800; color: #1e293b;">No Members Match Your Criteria</div>
        <div style="font-size: 0.85rem; color: #64748b; margin-top: 0.25rem;">Try clearing your search query or selecting "All Members" to see all 48 recruits.</div>
        <button onclick="resetPeopleFilters()" style="margin-top: 1rem; background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer;">
          Reset All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  filtered.forEach(m => {
    const card = document.createElement('div');
    card.className = 'person-card';

    // Status styling
    let statusBadge = '<span class="status-pill status-active">🟢 Active Sprint</span>';
    let cardAccentBorder = '#e2e8f0';

    if (m.onExamBreak) {
      statusBadge = '<span class="status-pill status-pause">🟡 Exam Break</span>';
      cardAccentBorder = '#fde68a';
    } else if (m.status && m.status.includes('Blocked')) {
      statusBadge = '<span class="status-pill status-blocked">🔴 Blocked / At-Risk</span>';
      cardAccentBorder = '#fecaca';
    } else if (m.task && m.task.status === 'Verified Complete') {
      statusBadge = '<span class="status-pill status-complete">⭐ Verified Complete</span>';
      cardAccentBorder = '#bbf7d0';
    }

    // Avatar initials
    const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const avatarGradients = [
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #f59e0b, #b45309)',
      'linear-gradient(135deg, #ec4899, #be185d)'
    ];
    const gradient = avatarGradients[(m.regNo ? parseInt(m.regNo.slice(-2)) : 0) % avatarGradients.length];

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="person-avatar" style="background: ${gradient};">
            ${initials}
            <span class="avatar-dot ${m.onExamBreak ? 'dot-amber' : (m.status && m.status.includes('Blocked') ? 'dot-red' : 'dot-green')}"></span>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 1rem; color: #0f172a; line-height: 1.2;">${m.name}</div>
            <div style="font-size: 0.75rem; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">
              Reg: ${m.regNo} · ${m.department || 'B.Tech CSE'}
            </div>
          </div>
        </div>
        ${statusBadge}
      </div>

      <div class="person-pod-info">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #1e3a8a; font-size: 0.82rem;">🏷️ ${m.podName || 'Design Pod A'}</span>
          <span style="font-size: 0.72rem; color: #64748b; background: white; padding: 2px 8px; border-radius: 10px; border: 1px solid #e2e8f0;">
            Mentor: <b>${m.mentor || 'Vikram Sharma'}</b>
          </span>
        </div>
      </div>

      <div class="person-task-box">
        <div style="font-size: 0.72rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 3px;">
          Current 45-Min Starter Sprint:
        </div>
        <div style="font-size: 0.825rem; font-weight: 700; color: #1e293b; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${m.task ? m.task.title : 'Draft 1 Event Social Caption'}
        </div>
        ${m.task && m.task.issue ? `
          <div style="margin-top: 6px; padding: 4px 8px; background: #fee2e2; border-left: 3px solid #ef4444; border-radius: 4px; font-size: 0.72rem; color: #991b1b; font-weight: 600;">
            ⚠️ Issue: ${m.task.issue}
          </div>
        ` : ''}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid var(--border);">
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <span style="background: #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
            ⏱️ ${m.hoursPerWeek || 2} hrs/wk
          </span>
          ${m.skills && m.skills[0] ? `
            <span style="background: #eff6ff; color: #2563eb; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
              ${m.skills[0]}
            </span>
          ` : ''}
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-mini btn-wa" onclick="sendWhatsAppPing('${m.name}', '${m.mentor}')" title="Message on WhatsApp">
            💬
          </button>
          <button class="btn-mini btn-detail" onclick="openMemberDetailModal('${m.id}')">
            Profile ➔
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ------------------------------------------------------------------------------
// 4. MEMBER DETAIL MODAL
// ------------------------------------------------------------------------------
function openMemberDetailModal(memberId) {
  const member = allMembers.find(m => m.id === memberId);
  if (!member) return;

  selectedMember = member;
  const modal = document.getElementById('memberDetailModal');
  const body = document.getElementById('modalBody');
  if (!modal || !body) return;

  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  body.innerHTML = `
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border);">
      <div class="person-avatar" style="width: 54px; height: 54px; font-size: 1.35rem; background: linear-gradient(135deg, #2563eb, #0d9488);">
        ${initials}
      </div>
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a;">${member.name}</h2>
          ${member.onExamBreak 
            ? '<span class="status-pill status-pause">🟡 Exam Break</span>'
            : (member.status && member.status.includes('Blocked') 
                ? '<span class="status-pill status-blocked">🔴 Blocked</span>' 
                : '<span class="status-pill status-active">🟢 Active Sprint</span>')}
        </div>
        <div style="font-size: 0.8rem; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">
          Reg No: <b>${member.regNo}</b> · ${member.email}
        </div>
        <div style="font-size: 0.78rem; color: #475569; margin-top: 2px;">
          ${member.department || 'B.Tech CSE'} · ${member.year || '1st Year (Session 2026-30)'}
        </div>
      </div>
    </div>

    <!-- Onboarding Journey Bar -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1.25rem;">
      <div style="font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 8px;">
        72-Hour Onboarding Milestone Progress:
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; position: relative;">
        <div style="text-align: center; flex: 1;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin: 0 auto 4px;">✓</div>
          <div style="font-size: 0.7rem; font-weight: 700; color: #1e293b;">1. Registered</div>
        </div>
        <div style="flex: 1; height: 2px; background: #10b981;"></div>
        <div style="text-align: center; flex: 1;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin: 0 auto 4px;">✓</div>
          <div style="font-size: 0.7rem; font-weight: 700; color: #1e293b;">2. Pod Assigned</div>
        </div>
        <div style="flex: 1; height: 2px; background: #10b981;"></div>
        <div style="text-align: center; flex: 1;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin: 0 auto 4px;">✓</div>
          <div style="font-size: 0.7rem; font-weight: 700; color: #1e293b;">3. Mentor Met</div>
        </div>
        <div style="flex: 1; height: 2px; background: ${member.task && member.task.status === 'Verified Complete' ? '#10b981' : '#cbd5e1'};"></div>
        <div style="text-align: center; flex: 1;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: ${member.task && member.task.status === 'Verified Complete' ? '#10b981' : '#3b82f6'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; margin: 0 auto 4px;">
            ${member.task && member.task.status === 'Verified Complete' ? '✓' : '4'}
          </div>
          <div style="font-size: 0.7rem; font-weight: 700; color: #1e293b;">4. 45-Min Sprint</div>
        </div>
      </div>
    </div>

    <!-- Pod & Mentor Assignment -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 0.85rem;">
        <div style="font-size: 0.72rem; font-weight: 800; color: #1d4ed8; text-transform: uppercase;">Assigned Functional Pod</div>
        <div style="font-size: 0.95rem; font-weight: 800; color: #1e3a8a; margin-top: 2px;">${member.podName || 'Design Pod A'}</div>
        <div style="font-size: 0.75rem; color: #3b82f6; margin-top: 2px;">5-Member Peer Cohort</div>
      </div>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 0.85rem;">
        <div style="font-size: 0.72rem; font-weight: 800; color: #15803d; text-transform: uppercase;">Designated Senior Mentor</div>
        <div style="font-size: 0.95rem; font-weight: 800; color: #14532d; margin-top: 2px;">${member.mentor || 'Vikram Sharma'}</div>
        <div style="font-size: 0.75rem; color: #16a34a; margin-top: 2px;">Direct 1-on-1 Guidance</div>
      </div>
    </div>

    <!-- Sprint Task Details -->
    <div style="background: white; border: 1px solid var(--border); border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 0.72rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Micro-Delegation Task</span>
        <span style="font-size: 0.75rem; font-weight: 700; color: #0d9488; background: #ccfbf1; padding: 2px 8px; border-radius: 6px;">
          ⏱️ ${member.task ? member.task.estimatedMinutes : 45} Minutes
        </span>
      </div>
      <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">
        ${member.task ? member.task.title : 'Draft 1 Event Social Caption'}
      </div>
      <div style="font-size: 0.8rem; color: #475569; margin-top: 4px; line-height: 1.4;">
        ${member.task ? member.task.description : 'Open club template, adapt copy, and share preview with mentor.'}
      </div>

      ${member.task && member.task.issue ? `
        <div style="margin-top: 10px; padding: 8px 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.72rem; font-weight: 800; color: #b91c1c; text-transform: uppercase;">Active Blocker Alert:</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #991b1b; margin-top: 2px;">${member.task.issue}</div>
          </div>
          <button onclick="resolveBlocker('${member.id}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
            Resolve Blocker
          </button>
        </div>
      ` : ''}
    </div>

    <!-- Skills & Commitment -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; background: #f8fafc; padding: 0.85rem; border-radius: 8px;">
      <div>
        <div style="font-size: 0.72rem; font-weight: 700; color: #64748b;">Weekly Hours Budget</div>
        <div style="font-size: 1rem; font-weight: 800; color: #2563eb; font-family: 'JetBrains Mono', monospace;">
          ${member.hoursPerWeek || 2} Hours / Week
        </div>
      </div>
      <div>
        <div style="font-size: 0.72rem; font-weight: 700; color: #64748b; margin-bottom: 4px;">Skill Endorsements</div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${(member.skills || ['UI/UX Design']).map(s => `
            <span style="background: white; border: 1px solid #cbd5e1; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; color: #334155;">
              ${s}
            </span>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Modal Actions -->
    <div style="display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 1rem;">
      <button onclick="sendWhatsAppPing('${member.name}', '${member.mentor}')" style="background: #25d366; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
        💬 Ping via WhatsApp
      </button>
      <button onclick="toggleMemberExamBreak('${member.id}')" style="background: ${member.onExamBreak ? '#0d9488' : '#f59e0b'}; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer;">
        ${member.onExamBreak ? 'Reactivate Sprint' : 'Grant 2-Week Exam Break'}
      </button>
      <button onclick="closeMemberModal()" style="background: #e2e8f0; color: #334155; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer;">
        Close
      </button>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeMemberModal() {
  const modal = document.getElementById('memberDetailModal');
  if (modal) modal.style.display = 'none';
}

function resolveBlocker(memberId) {
  const m = allMembers.find(mem => mem.id === memberId);
  if (m) {
    if (m.task) m.task.issue = null;
    m.status = 'Active Sprint';
    appStats.atRiskPods = Math.max(0, (appStats.atRiskPods || 4) - 1);
    appStats.blocked = Math.max(0, (appStats.blocked || 4) - 1);
    appStats.activeSprints = (appStats.activeSprints || 36) + 1;
    updateDashboardUI();
    renderPeopleGrid();
    openMemberDetailModal(memberId);
    showToast('✅ Blocker Resolved!', `${m.name}'s task access has been unblocked. Moved to Active Sprint.`, 'success');
  }
}

async function toggleMemberExamBreak(memberId) {
  const m = allMembers.find(mem => mem.id === memberId);
  if (!m) return;

  m.onExamBreak = !m.onExamBreak;
  if (m.onExamBreak) {
    m.status = 'Exam Break';
    appStats.onBreak = (appStats.onBreak || 8) + 1;
    appStats.activeSprints = Math.max(0, (appStats.activeSprints || 36) - 1);
    showToast('⏸️ Exam Break Granted', `${m.name} has been paused for 2 weeks with zero stigma or roster deletion.`, 'warning');
  } else {
    m.status = 'Active Sprint';
    appStats.onBreak = Math.max(0, (appStats.onBreak || 8) - 1);
    appStats.activeSprints = (appStats.activeSprints || 36) + 1;
    showToast('🟢 Sprint Reactivated', `${m.name} has resumed active club duties.`, 'success');
  }

  // Backend sync if available
  if (API_BASE) {
    togglePauseAPI(memberId);
  }

  updateDashboardUI();
  renderPeopleGrid();
  openMemberDetailModal(memberId);
}

function sendWhatsAppPing(memberName, mentorName) {
  showToast('💬 WhatsApp Direct Connect', `Opening WhatsApp chat with ${memberName} (CC Senior Mentor ${mentorName || 'Vikram'}).`, 'info');
}

function resetPeopleFilters() {
  currentFilter = { status: 'all', podId: 'all', query: '' };
  const searchInput = document.getElementById('peopleSearchInput');
  const podSelect = document.getElementById('peoplePodSelect');
  if (searchInput) searchInput.value = '';
  if (podSelect) podSelect.value = 'all';

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-status') === 'all') btn.classList.add('active');
  });

  renderPeopleGrid();
}

// ------------------------------------------------------------------------------
// 5. TOAST NOTIFICATION ENGINE
// ------------------------------------------------------------------------------
function showToast(title, message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const iconMap = {
    success: '✅',
    warning: '⏸️',
    info: 'ℹ️',
    error: '⚠️'
  };

  toast.innerHTML = `
    <div style="font-size: 1.25rem;">${iconMap[type] || '✨'}</div>
    <div style="flex: 1;">
      <div style="font-weight: 800; font-size: 0.85rem; color: #0f172a;">${title}</div>
      <div style="font-size: 0.78rem; color: #475569; margin-top: 2px;">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background: transparent; border: none; font-size: 1rem; color: #94a3b8; cursor: pointer;">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s forwards ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ------------------------------------------------------------------------------
// 6. BACKEND API WRAPPERS
// ------------------------------------------------------------------------------
async function submitEnrollmentAPI(formData) {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}/api/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Enrollment API error:', e);
  }
  return null;
}

async function submitTaskAPI(taskId, submissionUrl) {
  if (!API_BASE || !taskId) return null;
  try {
    const res = await fetch(`${API_BASE}/api/tasks/${taskId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionUrl })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Task API error:', e);
  }
  return null;
}

async function togglePauseAPI(memberId) {
  if (!API_BASE || !memberId) return null;
  try {
    const res = await fetch(`${API_BASE}/api/members/${memberId}/toggle-pause`, {
      method: 'PATCH'
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('Pause API error:', e);
  }
  return null;
}
