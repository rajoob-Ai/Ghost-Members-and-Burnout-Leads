const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Initialize database if not present
const defaultDatabase = {
  clubs: [
    { id: 'dev-soc', name: 'Developer Student Society', category: 'Technical', leads: ['Aarav Sharma'] },
    { id: 'design-hub', name: 'UI/UX Creative Collective', category: 'Design', leads: ['Vikram Sharma'] },
    { id: 'robotics', name: 'Robotics & Automation Club', category: 'Technical', leads: ['Sahil Mehta'] }
  ],
  pods: [
    { id: 'pod-1', name: 'Design Pod A', clubId: 'dev-soc', mentor: 'Vikram Sharma', status: 'Optimal', issues: 'None' },
    { id: 'pod-2', name: 'Web Dev Pod 1', clubId: 'dev-soc', mentor: 'Sahil Mehta', status: 'Optimal', issues: 'None' },
    { id: 'pod-3', name: 'Event Logistics Pod', clubId: 'dev-soc', mentor: 'Tanya Roy', status: 'Stalled', issues: 'Verify Block 34 room access' },
    { id: 'pod-4', name: 'Social Media PR Pod', clubId: 'dev-soc', mentor: 'Priya Kumari', status: 'Critical Block', issues: 'Freshers need Canva team credentials' }
  ],
  members: [
    {
      id: 'mem-1',
      name: 'Rohan Verma',
      regNo: '12204592',
      email: 'rohan.12204592@lpu.in',
      podId: 'pod-1',
      skills: ['UI/UX Design', 'Social Media PR'],
      hoursPerWeek: 2,
      onExamBreak: false,
      enrolledAt: '2026-10-12T10:30:00.000Z'
    },
    {
      id: 'mem-2',
      name: 'Sneha Patel',
      regNo: '12215894',
      email: 'sneha.12215894@lpu.in',
      podId: 'pod-1',
      skills: ['UI/UX Design'],
      hoursPerWeek: 3,
      onExamBreak: false,
      enrolledAt: '2026-10-12T11:00:00.000Z'
    },
    {
      id: 'mem-3',
      name: 'Amit Kumar',
      regNo: '12109843',
      email: 'amit.12109843@lpu.in',
      podId: 'pod-3',
      skills: ['Event Logistics'],
      hoursPerWeek: 4,
      onExamBreak: true,
      enrolledAt: '2026-10-14T09:15:00.000Z'
    }
  ],
  tasks: [
    {
      id: 'task-1',
      memberId: 'mem-1',
      podId: 'pod-1',
      title: 'Draft 1 Instagram Event Story (Canva)',
      description: 'Open club Canva template, modify headline to "Friday Hack Workshop · Block 34-201", and download preview PNG.',
      estimatedMinutes: 35,
      status: 'Verified Complete',
      submissionUrl: 'https://canva.com/design/sample-draft-v1',
      submittedAt: '2026-10-13T14:20:00.000Z'
    },
    {
      id: 'task-2',
      memberId: 'mem-2',
      podId: 'pod-1',
      title: 'Design 1 LinkedIn Event Banner',
      description: 'Use the official typography pack to create a 1200x628px banner for upcoming hackathon.',
      estimatedMinutes: 45,
      status: 'In Progress',
      submissionUrl: '',
      submittedAt: null
    },
    {
      id: 'task-3',
      memberId: 'mem-3',
      podId: 'pod-3',
      title: 'Caretaker Sound System Verification',
      description: 'Visit Block 34 caretaker office, confirm wireless mic battery availability for Friday 4 PM.',
      estimatedMinutes: 20,
      status: 'In Progress',
      submissionUrl: '',
      submittedAt: null
    }
  ]
};

function readDb() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDatabase, null, 2));
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Database read error, restoring defaults:', err);
    return defaultDatabase;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Database write error:', err);
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// MIME types dictionary for static server
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // ----------------------------------------------------------------
  // REST API ENDPOINTS
  // ----------------------------------------------------------------

  // GET /api/health
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { status: 'healthy', app: 'ClubSync Full Stack MVP', session: 'INT335-2026' });
  }

  // GET /api/stats (Executive Dashboard Counters)
  if (pathname === '/api/stats' && req.method === 'GET') {
    const db = readDb();
    const totalRecruits = db.members.length;
    const onBreak = db.members.filter(m => m.onExamBreak).length;
    const activeSprints = totalRecruits - onBreak;
    const atRiskPods = db.pods.filter(p => p.status === 'Critical Block' || p.status === 'Stalled').length;
    const tasksCompleted = db.tasks.filter(t => t.status === 'Verified Complete').length;

    return sendJson(res, 200, {
      totalRecruits,
      activeSprints,
      onBreak,
      atRiskPods,
      totalTasks: db.tasks.length,
      tasksCompleted,
      activationRate: totalRecruits > 0 ? Math.round((tasksCompleted / totalRecruits) * 100) : 0
    });
  }

  // GET /api/pods (Functional Pods with Calculated Metrics)
  if (pathname === '/api/pods' && req.method === 'GET') {
    const db = readDb();
    const podsWithMetrics = db.pods.map(pod => {
      const podMembers = db.members.filter(m => m.podId === pod.id);
      const podTasks = db.tasks.filter(t => t.podId === pod.id);
      const completedTasks = podTasks.filter(t => t.status === 'Verified Complete').length;

      return {
        ...pod,
        memberCount: podMembers.length,
        totalTasks: podTasks.length,
        completedTasks,
        completionRate: podTasks.length > 0 ? Math.round((completedTasks / podTasks.length) * 100) : 0,
        members: podMembers
      };
    });
    return sendJson(res, 200, podsWithMetrics);
  }

  // GET /api/members
  if (pathname === '/api/members' && req.method === 'GET') {
    const db = readDb();
    return sendJson(res, 200, db.members);
  }

  // POST /api/enroll (Onboarding Enrollment Form)
  if (pathname === '/api/enroll' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      if (!body.name || !body.regNo) {
        return sendJson(res, 400, { error: 'Name and Registration Number are required.' });
      }

      const db = readDb();
      const memberId = 'mem-' + (db.members.length + 1) + '-' + Date.now().toString().slice(-4);
      
      // Auto-assign to Pod based on first skill or default
      const primarySkill = (body.skills && body.skills[0]) || 'General';
      let targetPod = db.pods.find(p => p.name.toLowerCase().includes(primarySkill.toLowerCase().slice(0, 4))) || db.pods[0];

      const newMember = {
        id: memberId,
        name: body.name,
        regNo: body.regNo,
        email: body.email || `${body.regNo.toLowerCase()}@lpu.in`,
        podId: targetPod.id,
        skills: body.skills || ['UI/UX Design'],
        hoursPerWeek: parseInt(body.hoursPerWeek) || 2,
        onExamBreak: false,
        enrolledAt: new Date().toISOString()
      };

      // Auto-generate starter task
      const newTaskId = 'task-' + (db.tasks.length + 1) + '-' + Date.now().toString().slice(-4);
      const newTask = {
        id: newTaskId,
        memberId: memberId,
        podId: targetPod.id,
        title: primarySkill.includes('Web') ? 'Clone Club GitHub Repo & Setup Readme' :
               primarySkill.includes('Logistics') ? 'Verify Room Projector in Block 34-201' :
               primarySkill.includes('PR') ? 'Draft 1 Event Social Caption (100 words)' :
               'Draft 1 Instagram Event Story (Canva)',
        description: 'Time-boxed 45-minute starter sprint. Guided by your assigned pod mentor.',
        estimatedMinutes: 35,
        status: 'In Progress',
        submissionUrl: '',
        submittedAt: null
      };

      db.members.push(newMember);
      db.tasks.push(newTask);
      writeDb(db);

      return sendJson(res, 201, {
        message: 'Member successfully onboarded and assigned to pod!',
        member: newMember,
        pod: targetPod,
        starterTask: newTask
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to process enrollment: ' + err.message });
    }
  }

  // POST /api/tasks/:id/submit (Submit Task Draft)
  if (pathname.startsWith('/api/tasks/') && pathname.endsWith('/submit') && req.method === 'POST') {
    const parts = pathname.split('/');
    const taskId = parts[3];

    try {
      const body = await parseJsonBody(req);
      const db = readDb();
      const taskIndex = db.tasks.findIndex(t => t.id === taskId);

      if (taskIndex === -1) {
        return sendJson(res, 404, { error: 'Task not found' });
      }

      db.tasks[taskIndex].submissionUrl = body.submissionUrl || 'https://canva.com/design/draft';
      db.tasks[taskIndex].status = 'Verified Complete';
      db.tasks[taskIndex].submittedAt = new Date().toISOString();

      // Check if pod status should update to Optimal
      const podId = db.tasks[taskIndex].podId;
      const podIndex = db.pods.findIndex(p => p.id === podId);
      if (podIndex !== -1 && db.pods[podIndex].status === 'Critical Block') {
        db.pods[podIndex].status = 'Optimal';
        db.pods[podIndex].issues = 'None';
      }

      writeDb(db);
      return sendJson(res, 200, { message: 'Task submitted and verified!', task: db.tasks[taskIndex] });
    } catch (err) {
      return sendJson(res, 500, { error: 'Task submission failed: ' + err.message });
    }
  }

  // PATCH /api/members/:id/toggle-pause (Graceful Pause / Exam Break Toggle)
  if (pathname.startsWith('/api/members/') && pathname.endsWith('/toggle-pause') && req.method === 'PATCH') {
    const parts = pathname.split('/');
    const memberId = parts[3];

    const db = readDb();
    const memIndex = db.members.findIndex(m => m.id === memberId);

    if (memIndex === -1) {
      return sendJson(res, 404, { error: 'Member not found' });
    }

    db.members[memIndex].onExamBreak = !db.members[memIndex].onExamBreak;
    writeDb(db);

    return sendJson(res, 200, {
      message: db.members[memIndex].onExamBreak ? 'Exam Break Activated' : 'Active Contributor Restored',
      member: db.members[memIndex]
    });
  }

  // ----------------------------------------------------------------
  // STATIC ASSETS FILE SERVER
  // ----------------------------------------------------------------
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security check to avoid directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  // Check if file exists in public/
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback check root index.html if root requested
      const rootIndex = path.join(__dirname, '..', 'index.html');
      if (pathname === '/' && fs.existsSync(rootIndex)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(rootIndex).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ClubSync Full-Stack MVP Server is LIVE!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 REST API: http://localhost:${PORT}/api/stats`);
  console.log(`🎓 INT335 Design Thinking Project P18 · LPU 2026-27`);
  console.log(`====================================================`);
});
