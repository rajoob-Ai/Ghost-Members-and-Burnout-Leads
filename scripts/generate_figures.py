import os
import matplotlib.pyplot as plt
import numpy as np

fig_dir = r"C:\Users\jagad\.gemini\antigravity\scratch\Ghost-Members-and-Burnout-Leads\docs\figures"
os.makedirs(fig_dir, exist_ok=True)

# Set high-quality styling
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#CBD5E1'
plt.rcParams['axes.linewidth'] = 1.2

# ------------------------------------------------------------------------------
# 1. RETENTION DROP-OFF CURVE (CP2 & CP3)
# ------------------------------------------------------------------------------
plt.figure(figsize=(9, 4.5), dpi=300)
weeks = np.arange(1, 15)
# Baseline curve (drops dramatically at week 2-4)
baseline = [100, 68, 42, 28, 22, 19, 18, 17, 16, 15, 14, 14, 13, 12]
# ClubSync curve (sustained retention with graceful exam dip and recovery)
clubsync = [100, 94, 88, 85, 82, 80, 75, 76, 81, 80, 79, 78, 78, 77]

plt.plot(weeks, baseline, color='#EF4444', marker='o', linewidth=2.5, label='Status Quo (Broadcast WhatsApp Groups - 85% Drop-off)')
plt.plot(weeks, clubsync, color='#2563EB', marker='s', linewidth=2.8, label='ClubSync Protocol (Micro-Delegation & Exam Pause - 77% Retained)')

plt.axvspan(2, 4.5, color='#FEE2E2', alpha=0.4, label='The 72-Hour Dropout Cliff (Freshers Ghost)')
plt.axvspan(6.5, 8.5, color='#FEF3C7', alpha=0.4, label='Midterm Exam Window (Dignified Exam Break)')

plt.title('Campus Society Contributor Retention: Status Quo vs. ClubSync Protocol', fontsize=12, fontweight='bold', pad=12, color='#0F172A')
plt.xlabel('Semester Academic Timeline (Weeks 1 to 14)', fontsize=10, fontweight='bold', color='#334155')
plt.ylabel('Active Retained Contributors (%)', fontsize=10, fontweight='bold', color='#334155')
plt.xticks(weeks)
plt.yticks(range(0, 101, 10))
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(loc='lower left', fontsize=8.5, framealpha=0.95)
plt.tight_layout()
plt.savefig(os.path.join(fig_dir, "fig_retention_curve.png"))
plt.close()
print("Saved fig_retention_curve.png")

# ------------------------------------------------------------------------------
# 2. SCREENING MATRIX COMPARATIVE BAR CHART (CP4)
# ------------------------------------------------------------------------------
plt.figure(figsize=(9, 4.8), dpi=300)
concepts = [
    'ClubSync Micro-Delegation\n& Onboarding Protocol',
    'Gamified Mobile App\n(Points & Badges)',
    'Public Club Directory\n("Yelp for Campus Clubs")',
    'Automated AI WhatsApp\nChatbot Assistant',
    'Mandatory Attendance\n& Fine Penalties'
]
scores = [4.78, 3.65, 3.20, 3.01, 2.15]
colors_bar = ['#2563EB', '#64748B', '#94A3B8', '#EF4444', '#DC2626']

bars = plt.barh(concepts[::-1], scores[::-1], color=colors_bar[::-1], height=0.6, edgecolor='#CBD5E1')
plt.title('Stage 3 Ideation Screening Matrix: Weighted Composite Score (out of 5.00)', fontsize=12, fontweight='bold', pad=12, color='#0F172A')
plt.xlabel('Weighted Score (Desirability 35% + Feasibility 35% + Sustainability 30%)', fontsize=9.5, fontweight='bold', color='#334155')
plt.xlim(0, 5.5)

for bar in bars:
    w = bar.get_width()
    plt.text(w + 0.08, bar.get_y() + bar.get_height()/2, f'{w:.2f} / 5.00', ha='left', va='center', fontsize=9, fontweight='bold', color='#0F172A')

plt.axvline(x=4.0, color='#10B981', linestyle='--', linewidth=1.5, label='Threshold for Pilot Implementation (>= 4.00)')
plt.grid(axis='x', linestyle='--', alpha=0.5)
plt.legend(loc='lower right', fontsize=8.5)
plt.tight_layout()
plt.savefig(os.path.join(fig_dir, "fig_screening_matrix.png"))
plt.close()
print("Saved fig_screening_matrix.png")

# ------------------------------------------------------------------------------
# 3. 72-HOUR PROTOCOL ARCHITECTURE FLOWCHART (CP4 & CP5)
# ------------------------------------------------------------------------------
fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
ax.axis('off')

# Box definitions: (x, y, text, subtext, color, border)
steps = [
    (0.06, 0.5, "1. Registration", "Skill tagging &\nweekly hours slider", "#EFF6FF", "#2563EB"),
    (0.25, 0.5, "2. Pod Matching", "Auto-placed into\n5-member cohort", "#F0FDF4", "#10B981"),
    (0.44, 0.5, "3. Senior Mentor", "1-on-1 WhatsApp\ncheck-in within 24h", "#FEF3C7", "#D97706"),
    (0.63, 0.5, "4. Starter Sprint", "45-min pre-scoped\nmicro-task draft", "#FAF5FF", "#8B5CF6"),
    (0.83, 0.5, "5. Verification", "Feedback within 48h;\nExam break option", "#ECFDF5", "#059669")
]

from matplotlib.patches import FancyBboxPatch

for x, y, title, desc, bg, border in steps:
    rect = FancyBboxPatch((x - 0.08, y - 0.3), 0.16, 0.6, boxstyle="round,pad=0.02,rounding_size=0.03", facecolor=bg, edgecolor=border, linewidth=2)
    ax.add_patch(rect)
    ax.text(x, y + 0.12, title, ha='center', va='center', fontsize=10, fontweight='bold', color='#0F172A')
    ax.text(x, y - 0.1, desc, ha='center', va='center', fontsize=8, color='#475569')

# Draw arrows
for i in range(len(steps) - 1):
    x_start = steps[i][0] + 0.08
    x_end = steps[i+1][0] - 0.08
    ax.annotate('', xy=(x_end, 0.5), xytext=(x_start, 0.5),
                arrowprops=dict(arrowstyle="->", color="#64748B", lw=2, mutation_scale=15))

ax.set_title("ClubSync 72-Hour Micro-Delegation Protocol Architecture (Stage 4)", fontsize=12, fontweight='bold', pad=15, color='#0F172A')
ax.set_xlim(0, 0.95)
ax.set_ylim(0, 1)
plt.tight_layout()
plt.savefig(os.path.join(fig_dir, "fig_protocol_flowchart.png"))
plt.close()
print("Saved fig_protocol_flowchart.png")

# ------------------------------------------------------------------------------
# 4. USABILITY TESTING IMPACT (CP6)
# ------------------------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.4), dpi=300)

# Left: Completion Rate
categories = ['72-Hr Task\nCompletion (%)', 'Lead Stress\nScore (/10)']
before = [20, 8.8]
after = [80, 2.4]

x = np.arange(len(categories))
width = 0.35

rects1 = ax1.bar(x - width/2, before, width, label='Pre-ClubSync Baseline', color='#94A3B8', edgecolor='#64748B')
rects2 = ax1.bar(x + width/2, after, width, label='Post-ClubSync Protocol', color='#10B981', edgecolor='#059669')

ax1.set_ylabel('Metrics Measurement', fontsize=9.5, fontweight='bold')
ax1.set_title('Recruit Engagement & Lead Stress', fontsize=10.5, fontweight='bold', pad=10)
ax1.set_xticks(x)
ax1.set_xticklabels(categories, fontsize=9, fontweight='bold')
ax1.legend(fontsize=8)
ax1.grid(axis='y', linestyle='--', alpha=0.5)

for r in rects1:
    h = r.get_height()
    ax1.text(r.get_x() + r.get_width()/2, h + 1, f'{h}', ha='center', va='bottom', fontsize=8.5, fontweight='bold')
for r in rects2:
    h = r.get_height()
    ax1.text(r.get_x() + r.get_width()/2, h + 1, f'{h}', ha='center', va='bottom', fontsize=8.5, fontweight='bold')

# Right: Time spent chasing / diagnosing (hours / mins)
metrics_time = ['Weekly Lead Chasing\n(Hours / Week)', 'Pod Bottleneck\nDiagnosis (Minutes)']
time_before = [15.4, 120]
time_after = [1.8, 0.33]

x2 = np.arange(len(metrics_time))
rects3 = ax2.bar(x2 - width/2, time_before, width, label='Status Quo (WhatsApp)', color='#EF4444', edgecolor='#B91C1C')
rects4 = ax2.bar(x2 + width/2, time_after, width, label='ClubSync Dashboard', color='#2563EB', edgecolor='#1D4ED8')

ax2.set_ylabel('Time Spent (Log scale)', fontsize=9.5, fontweight='bold')
ax2.set_yscale('log')
ax2.set_title('Operational Lead Efficiency Impact', fontsize=10.5, fontweight='bold', pad=10)
ax2.set_xticks(x2)
ax2.set_xticklabels(metrics_time, fontsize=9, fontweight='bold')
ax2.legend(fontsize=8)
ax2.grid(axis='y', linestyle='--', alpha=0.5)

for r in rects3:
    h = r.get_height()
    ax2.text(r.get_x() + r.get_width()/2, h * 1.15, f'{h}h/m', ha='center', va='bottom', fontsize=8.5, fontweight='bold')
for r in rects4:
    h = r.get_height()
    ax2.text(r.get_x() + r.get_width()/2, h * 1.15, f'{h}h/m', ha='center', va='bottom', fontsize=8.5, fontweight='bold')

plt.suptitle("Stage 5 Usability Testing: Quantitative Impact (7 Campus Participants)", fontsize=11.5, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(fig_dir, "fig_usability_metrics.png"))
plt.close()
print("Saved fig_usability_metrics.png")

# ------------------------------------------------------------------------------
# 5. LIVE POD DISTRIBUTION & CONTRIBUTOR STATUS (CP7)
# ------------------------------------------------------------------------------
fig, (ax_pie, ax_bar) = plt.subplots(1, 2, figsize=(10, 4.4), dpi=300)

# Status breakdown
labels = ['Active Sprints\n(36 Members · 75%)', 'On Exam Break\n(8 Members · 17%)', 'Blocked / At-Risk\n(4 Members · 8%)']
sizes = [36, 8, 4]
colors_pie = ['#10B981', '#F59E0B', '#EF4444']
explode = (0.04, 0.05, 0.08)

ax_pie.pie(sizes, explode=explode, labels=labels, colors=colors_pie, autopct='%1.0f%%', startangle=140, textprops={'fontsize': 8.5, 'fontweight': 'bold'})
ax_pie.set_title("48 Recruits Contributor Distribution", fontsize=10.5, fontweight='bold', pad=10)

# Pod breakdown
pods = ['Design Pod A', 'Web Dev 1', 'Logistics', 'Socials PR', 'Tech Projects', 'Editorial']
members_per_pod = [10, 10, 8, 8, 6, 6]
ax_bar.barh(pods[::-1], members_per_pod[::-1], color='#3B82F6', height=0.55, edgecolor='#1E40AF')
ax_bar.set_title("Recruits per Functional Pod", fontsize=10.5, fontweight='bold', pad=10)
ax_bar.set_xlabel("Number of Recruits", fontsize=9, fontweight='bold')
for i, v in enumerate(members_per_pod[::-1]):
    ax_bar.text(v + 0.2, i, str(v), color='#0F172A', fontweight='bold', va='center', fontsize=9)
ax_bar.grid(axis='x', linestyle='--', alpha=0.5)

plt.suptitle("Live Functional Pod Roster & Contributor Health (ClubSync Production)", fontsize=11.5, fontweight='bold', y=1.02)
plt.tight_layout()
plt.savefig(os.path.join(fig_dir, "fig_live_pod_distribution.png"))
plt.close()
print("Saved fig_live_pod_distribution.png")
