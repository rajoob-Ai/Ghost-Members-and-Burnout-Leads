import json
from datetime import datetime, timezone

clubs = [
    {
        "id": "dev-soc",
        "name": "Developer Student Society",
        "category": "Technical",
        "leads": ["Aarav Sharma (President)", "Vikram Sharma (Vice Lead)"]
    },
    {
        "id": "design-hub",
        "name": "UI/UX Creative Collective",
        "category": "Design",
        "leads": ["Vikram Sharma", "Kavya Deshmukh"]
    },
    {
        "id": "robotics",
        "name": "Robotics & Automation Society",
        "category": "Technical",
        "leads": ["Sahil Mehta", "Aman Deep"]
    }
]

pods = [
    {
        "id": "pod-1",
        "name": "Design Pod A",
        "clubId": "dev-soc",
        "mentor": "Vikram Sharma",
        "status": "Optimal",
        "issues": "None (All sprints moving forward smoothly)"
    },
    {
        "id": "pod-2",
        "name": "Web Dev Pod 1",
        "clubId": "dev-soc",
        "mentor": "Sahil Mehta",
        "status": "Stalled",
        "issues": "Freshers awaiting GitHub organization repository access"
    },
    {
        "id": "pod-3",
        "name": "Event Logistics Pod",
        "clubId": "dev-soc",
        "mentor": "Tanya Roy",
        "status": "Stalled",
        "issues": "Pending Dean approval for Block 34 auditorium key"
    },
    {
        "id": "pod-4",
        "name": "Social Media PR Pod",
        "clubId": "dev-soc",
        "mentor": "Priya Kumari",
        "status": "Critical Block",
        "issues": "Canva Enterprise team seats full; 2 freshers blocked"
    },
    {
        "id": "pod-5",
        "name": "Technical Projects Pod",
        "clubId": "dev-soc",
        "mentor": "Aman Deep",
        "status": "Optimal",
        "issues": "None (Starter repos initialized)"
    },
    {
        "id": "pod-6",
        "name": "Editorial & Content Pod",
        "clubId": "dev-soc",
        "mentor": "Meera Nair",
        "status": "Optimal",
        "issues": "None (Topic outlines verified)"
    }
]

# We will generate exactly 48 recruits:
# 36 Active Sprints
# 8 On Exam Break
# 4 Blocked / At-Risk
# Total = 48

raw_people = [
    # Pod 1 - Design Pod A (10 members) - Mentor: Vikram Sharma
    ("Rohan Verma", "12204592", "pod-1", ["UI/UX Design", "Figma"], 2, False, "Verified Complete", "Draft 1 Instagram Event Story (Canva)", 35, None),
    ("Sneha Patel", "12215894", "pod-1", ["Graphic Design", "Photoshop"], 3, False, "Active Sprint", "Design 1 LinkedIn Event Banner", 45, None),
    ("Aryan Malhotra", "12209412", "pod-1", ["UI/UX Design"], 2, False, "Active Sprint", "Create 3 Event Sticker Icons", 40, None),
    ("Ananya Gupta", "12218734", "pod-1", ["Typography", "Canva"], 2, False, "Verified Complete", "Format Club Speaker Introduction Card", 30, None),
    ("Varun Kapoor", "12203115", "pod-1", ["Illustration", "Figma"], 3, False, "Active Sprint", "Draw Mascot Avatar for Hackathon", 45, None),
    ("Tanvi Shah", "12214902", "pod-1", ["UI/UX Design"], 2, False, "Active Sprint", "Design Registration Form Wireframe", 40, None),
    ("Kunal Bhatia", "12207651", "pod-1", ["Graphic Design"], 3, False, "Active Sprint", "Clean Badge Mockups in Canva", 35, None),
    ("Riya Sen", "12219082", "pod-1", ["UI/UX Design"], 2, False, "Active Sprint", "Mobile Nav Component Prototype", 45, None),
    ("Aditya Kashyap", "12205541", "pod-1", ["Color Theory", "Figma"], 2, False, "Active Sprint", "Build Color Palette Tokens", 30, None),
    ("Mehak Gill", "12213290", "pod-1", ["Canva Design"], 3, False, "Active Sprint", "Create 1 Event WhatsApp Display Picture", 25, None),

    # Pod 2 - Web Dev Pod 1 (10 members) - Mentor: Sahil Mehta
    ("Siddharth Nair", "12201984", "pod-2", ["HTML/CSS", "JavaScript"], 3, False, "Active Sprint", "Build Event Countdown Timer Component", 45, None),
    ("Ishaan Reddy", "12216503", "pod-2", ["React", "CSS Grid"], 4, False, "Active Sprint", "Responsive Navbar Component", 40, None),
    ("Pooja Rao", "12208129", "pod-2", ["Frontend", "Tailwind"], 3, False, "Blocked / At-Risk", "Clone Hackathon Landing Template", 45, "Awaiting GitHub repo invite from lead"),
    ("Gaurav Mishra", "12212340", "pod-2", ["JavaScript", "DOM"], 2, True, "Exam Break", "Paused for Midterms (B.Tech CSE)", 0, "Resumes on Nov 26"),
    ("Kavita Joshi", "12206771", "pod-2", ["HTML/CSS", "Git"], 2, False, "Active Sprint", "Fix Footer Links & Responsive Margins", 35, None),
    ("Harsh Vardhan", "12214589", "pod-2", ["Node.js", "REST"], 3, False, "Active Sprint", "Setup Mock JSON Endpoint for Registrations", 45, None),
    ("Bhavna Sethi", "12209012", "pod-2", ["Web Dev"], 2, True, "Exam Break", "Paused for Midterms (B.Tech IT)", 0, "Resumes on Nov 27"),
    ("Nikhil Chauhan", "12217823", "pod-2", ["CSS Flexbox", "HTML5"], 3, False, "Active Sprint", "Style Speaker Card Carousel", 40, None),
    ("Deepak Soni", "12204190", "pod-2", ["Frontend"], 2, False, "Active Sprint", "Add Favicon & Meta Tags for SEO", 20, None),
    ("Simran Sandhu", "12211904", "pod-2", ["JavaScript"], 3, False, "Active Sprint", "Form Validation Logic for Email", 35, None),

    # Pod 3 - Event Logistics Pod (8 members) - Mentor: Tanya Roy
    ("Amit Kumar", "12109843", "pod-3", ["Event Logistics", "Coordination"], 4, True, "Exam Break", "Midterm exams (Section K22)", 0, "Resumes on Nov 25"),
    ("Rahul Mehra", "12219981", "pod-3", ["Vendor Mgmt", "Logistics"], 3, False, "Active Sprint", "Confirm Audi Mic Battery Stock with Caretaker", 25, None),
    ("Shreya Sharma", "12203456", "pod-3", ["Hospitality", "Planning"], 3, False, "Blocked / At-Risk", "Book Block 34 Caretaker Room Key", 40, "Awaiting Dean signature on requisition"),
    ("Manish Tiwari", "12215672", "pod-3", ["Stage Mgmt"], 2, True, "Exam Break", "Midterm exams (Mechanical Engg)", 0, "Resumes on Nov 28"),
    ("Neha Saxena", "12207890", "pod-3", ["Logistics", "Budgeting"], 3, False, "Active Sprint", "Draft Refreshment Token Budget Sheet", 35, None),
    ("Karan Oberoi", "12212901", "pod-3", ["Crowd Flow"], 2, False, "Active Sprint", "Sketch Entry/Exit Flow Chart for Block 34", 30, None),
    ("Pankaj Rana", "12206123", "pod-3", ["Venue Setup"], 3, True, "Exam Break", "Midterm exams (Civil Engg)", 0, "Resumes on Nov 29"),
    ("Divya Aggarwal", "12218450", "pod-3", ["Volunteer Mgmt"], 2, False, "Active Sprint", "Create Volunteer Duty Roaster in Sheets", 40, None),

    # Pod 4 - Social Media PR Pod (8 members) - Mentor: Priya Kumari
    ("Kavya Singh", "12209988", "pod-4", ["Content Writing", "Instagram"], 2, False, "Active Sprint", "Draft 1 Event Social Caption (100 words)", 35, None),
    ("Abhishek Pandey", "12217765", "pod-4", ["Reels Editing", "CapCut"], 3, False, "Blocked / At-Risk", "Edit 15s Speaker Announcement Teaser", 45, "Canva Pro seat full; waiting for team invite"),
    ("Zoya Akhtar", "12202319", "pod-4", ["PR & Outreach"], 2, False, "Active Sprint", "Draft Broadcast Message for WhatsApp", 25, None),
    ("Mayank Goyal", "12214309", "pod-4", ["LinkedIn PR"], 3, False, "Blocked / At-Risk", "Write Speaker Spotlight Post", 40, "Instagram / LinkedIn credentials not shared"),
    ("Swati Deshmukh", "12208871", "pod-4", ["Social Media"], 2, True, "Exam Break", "Midterm exams (B.Com / CSE dual)", 0, "Resumes on Nov 26"),
    ("Rajat Singhal", "12213452", "pod-4", ["Photography"], 3, False, "Active Sprint", "Curate Photo Drive for Friday Session", 30, None),
    ("Alok Verma", "12205612", "pod-4", ["Analytics", "Instagram"], 2, False, "Active Sprint", "Track Past Event Engagement Reach", 35, None),
    ("Pallavi Rao", "12219803", "pod-4", ["Content Creation"], 3, False, "Active Sprint", "Design 3 Story Poll Questions", 20, None),

    # Pod 5 - Technical Projects Pod (6 members) - Mentor: Aman Deep
    ("Pranav Jain", "12201124", "pod-5", ["Python", "FastAPI"], 3, False, "Active Sprint", "Dockerize Microservice Skeleton", 45, None),
    ("Kriti Varma", "12216781", "pod-5", ["Data Science", "Pandas"], 2, False, "Active Sprint", "Clean Member Survey CSV Dataset", 40, None),
    ("Akash Solanki", "12209823", "pod-5", ["IoT", "Arduino"], 3, False, "Active Sprint", "Test ESP32 Wi-Fi Sensor Beacon", 45, None),
    ("Sonia Gill", "12213904", "pod-5", ["Machine Learning"], 3, False, "Active Sprint", "Evaluate Attendance Prediction Model", 45, None),
    ("Vikas Yadav", "12207198", "pod-5", ["Cloud", "GCP"], 2, True, "Exam Break", "Midterms & Certification (B.Tech CSE)", 0, "Resumes on Nov 27"),
    ("Naveen Khatri", "12218012", "pod-5", ["Git", "DevOps"], 3, False, "Active Sprint", "Setup GitHub Actions Linting Workflow", 35, None),

    # Pod 6 - Editorial & Content Pod (6 members) - Mentor: Meera Nair
    ("Tarun Ahuja", "12203948", "pod-6", ["Copywriting"], 2, False, "Active Sprint", "Write 200-Word Event Synopsis for Gazette", 35, None),
    ("Geetika Sen", "12214490", "pod-6", ["Proofreading"], 2, False, "Active Sprint", "Proofread Club Newsletter Issue #4", 40, None),
    ("Rakesh Mallick", "12208234", "pod-6", ["Technical Writing"], 3, False, "Active Sprint", "Document API Setup for New Freshers", 45, None),
    ("Monika Sharma", "12216120", "pod-6", ["Blog Writing"], 2, True, "Exam Break", "Midterm exams (B.A. Journalism & Tech)", 0, "Resumes on Nov 25"),
    ("Suraj Pillai", "12205091", "pod-6", ["Interviewing"], 3, False, "Active Sprint", "Draft 5 Questions for Faculty Advisor Q&A", 30, None),
    ("Ankita Roy", "12217349", "pod-6", ["Creative Writing"], 2, False, "Active Sprint", "Craft Event Theme Taglines & Slogans", 25, None)
]

members = []
tasks = []

depts = ["B.Tech CSE", "B.Tech IT", "B.Tech ECE", "B.Tech AI/ML", "B.Des Multimedia", "BCA", "B.Tech CSE"]

for idx, p in enumerate(raw_people):
    m_id = f"mem-{idx+1}"
    t_id = f"task-{idx+1}"
    name, reg, pod_id, skills, hours, on_break, status, task_title, task_mins, issue = p
    
    dept = depts[idx % len(depts)]
    
    # Pod lookup
    pod_obj = next(item for item in pods if item["id"] == pod_id)
    
    member = {
        "id": m_id,
        "name": name,
        "regNo": reg,
        "email": f"{reg.lower()}@lpu.in",
        "department": dept,
        "year": "1st Year (Session 2026-30)",
        "podId": pod_id,
        "podName": pod_obj["name"],
        "mentor": pod_obj["mentor"],
        "skills": skills,
        "hoursPerWeek": hours,
        "onExamBreak": on_break,
        "status": status,
        "enrolledAt": f"2026-10-12T{10 + (idx % 8):02d}:{(idx * 7) % 60:02d}:00.000Z"
    }
    members.append(member)
    
    task_status = "Verified Complete" if status == "Verified Complete" else ("Paused" if on_break else ("Blocked" if "Blocked" in status else "In Progress"))
    
    task = {
        "id": t_id,
        "memberId": m_id,
        "podId": pod_id,
        "title": task_title,
        "description": f"Micro-delegation sprint for {pod_obj['name']}. Guided by senior mentor {pod_obj['mentor']}.",
        "estimatedMinutes": task_mins,
        "status": task_status,
        "issue": issue,
        "submissionUrl": "https://canva.com/design/sample-draft-v1" if status == "Verified Complete" else "",
        "submittedAt": "2026-10-13T14:20:00.000Z" if status == "Verified Complete" else None
    }
    tasks.append(task)

db = {
    "clubs": clubs,
    "pods": pods,
    "members": members,
    "tasks": tasks
}

with open("server/data.json", "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2)

print(f"Generated {len(members)} members, {len(pods)} pods, and {len(tasks)} tasks.")
on_break_cnt = sum(1 for m in members if m["onExamBreak"])
blocked_cnt = sum(1 for m in members if "Blocked" in m["status"])
active_cnt = len(members) - on_break_cnt - blocked_cnt
print(f"Stats check: Total={len(members)}, Active={active_cnt}, OnBreak={on_break_cnt}, Blocked={blocked_cnt}")
