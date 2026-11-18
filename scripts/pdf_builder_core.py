import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether, Image, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

# Paths
base_dir = r"C:\Users\jagad\.gemini\antigravity\scratch\Ghost-Members-and-Burnout-Leads"
output_dir = os.path.join(base_dir, "docs", "checkpoints")
fig_dir = os.path.join(base_dir, "docs", "figures")
os.makedirs(output_dir, exist_ok=True)

# ------------------------------------------------------------------------------
# NUMBERED CANVAS WITH UNIVERSITY RUNNING HEADERS & FOOTERS
# ------------------------------------------------------------------------------
class UniversityNumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top banner line (Navy)
        self.setStrokeColor(colors.HexColor("#1E3A8A"))
        self.setLineWidth(2.5)
        self.line(40, 755, 572, 755)

        # Header watermark / text
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#1E3A8A"))
        self.drawString(40, 760, "LOVELY PROFESSIONAL UNIVERSITY")
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawRightString(572, 760, "INT335 DESIGN THINKING · SESSION 2026–27")

        # Bottom footer line
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.8)
        self.line(40, 42, 572, 42)

        # Footer text
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#94A3B8"))
        self.drawString(40, 30, "Project P18 · Ghost Members & Burnout Leads | Full-Stack Campus Club Onboarding")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 30, page_str)
        self.restoreState()

# Helper styling
styles = getSampleStyleSheet()
c_primary = colors.HexColor("#1E3A8A")   # Navy
c_secondary = colors.HexColor("#0D9488") # Teal
c_dark = colors.HexColor("#0F172A")      # Slate 900
c_body = colors.HexColor("#334155")      # Slate 700
c_light_bg = colors.HexColor("#F8FAFC")  # Slate 50
c_border = colors.HexColor("#CBD5E1")    # Slate 300

title_style = ParagraphStyle('T', fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=c_primary)
tag_style = ParagraphStyle('Tag', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor("#0D9488"))
h1_style = ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=11, leading=15, textColor=c_primary, spaceBefore=8, spaceAfter=4)
h2_style = ParagraphStyle('H2', fontName='Helvetica-Bold', fontSize=9.5, leading=13.5, textColor=c_secondary, spaceBefore=6, spaceAfter=2)
body_style = ParagraphStyle('B', fontName='Helvetica', fontSize=8.5, leading=12.5, textColor=c_body, spaceAfter=4)
bullet_style = ParagraphStyle('Bul', fontName='Helvetica', fontSize=8.5, leading=12.5, textColor=c_body, leftIndent=12, spaceAfter=2)
quote_style = ParagraphStyle('Q', fontName='Helvetica-Oblique', fontSize=8.5, leading=12.5, textColor=colors.HexColor("#1E293B"))
callout_style = ParagraphStyle('Call', fontName='Helvetica', fontSize=8.5, leading=12.5, textColor=colors.HexColor("#1E40AF"))
cell_style = ParagraphStyle('Cell', fontName='Helvetica', fontSize=8, leading=11, textColor=c_body)
cell_bold = ParagraphStyle('CellB', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=c_dark)
cell_header = ParagraphStyle('CellH', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=colors.white)

def create_table(data_rows, col_widths=None):
    table_data = []
    for r_idx, row in enumerate(data_rows):
        row_cells = []
        for c in row:
            if r_idx == 0:
                row_cells.append(Paragraph(str(c), cell_header))
            else:
                row_cells.append(Paragraph(str(c), cell_style))
        table_data.append(row_cells)

    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light_bg]),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
    ]))
    return t

def create_callout(text, bg_hex="#EFF6FF", border_hex="#3B82F6", text_color="#1E40AF"):
    p_style = ParagraphStyle('Callout', fontName='Helvetica', fontSize=8.5, leading=12.5, textColor=colors.HexColor(text_color))
    p = Paragraph(text, p_style)
    t = Table([[p]], colWidths=[532])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(bg_hex)),
        ('LINEBEFORE', (0, 0), (0, -1), 4, colors.HexColor(border_hex)),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor(border_hex)),
    ]))
    return t

def create_header_banner(title, cp_label):
    header_table_data = [
        [
            Paragraph(f"<b>{cp_label.upper()}</b>", tag_style),
            Paragraph(f"<b>TARGET RUBRIC: 100/100</b>", ParagraphStyle('R', fontName='Helvetica-Bold', fontSize=8, leading=10, textColor=colors.HexColor("#10B981"), alignment=2))
        ],
        [
            Paragraph(f"<b>{title}</b>", title_style),
            ""
        ],
        [
            Paragraph("Course: INT335 Design Thinking · Lovely Professional University · Problem P18", ParagraphStyle('Sub', fontName='Helvetica', fontSize=8.5, leading=11, textColor=colors.HexColor("#64748B"))),
            ""
        ]
    ]
    ht = Table(header_table_data, colWidths=[380, 152])
    ht.setStyle(TableStyle([
        ('SPAN', (0, 1), (1, 1)),
        ('SPAN', (0, 2), (1, 2)),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    return ht

print("PDF Helper initialized.")
