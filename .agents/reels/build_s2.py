"""Build/refresh the Session 2 draft.

Rules:
- Styles and fonts come from Yael's own Session 1 document. Never Arial, never a forced font.
- With --append, only questions not already in the file are added, so her own edits survive.
"""
import os
import re
import sys

import docx
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

FONT = "Segoe UI Semilight"  # exactly what her own Session 1 file uses

SCRATCH = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(SCRATCH, "s2_source.txt")
BASE = os.path.join(os.path.expanduser("~"), "OneDrive", "שולחן העבודה",
                    "The Way Back To Yourself", "Podcasts", "Barter Aug 2026")
TEMPLATE = os.path.join(BASE, "Session 1", "Video Session 1.docx")
OUT = os.path.join(BASE, "Session 2", "Session 2 - טיוטה.docx")


def close_in_word():
    try:
        import win32com.client as wc
        app = wc.GetActiveObject("Word.Application")
        for doc in list(app.Documents):
            if doc.Name.startswith("Session 2 - "):
                doc.Close(False)
    except Exception:
        pass


def rtl(p):
    p._p.get_or_add_pPr().append(OxmlElement("w:bidi"))
    for r in p.runs:
        r._r.get_or_add_rPr().append(OxmlElement("w:rtl"))


def add(d, text, bold=False):
    p = d.add_paragraph()
    r = p.add_run(text.strip())
    r.bold = bold
    r.font.name = FONT
    rf = r._r.get_or_add_rPr().get_or_add_rFonts()
    for attr in ("w:ascii", "w:hAnsi", "w:cs"):
        rf.set(qn(attr), FONT)
    rtl(p)


def pairs():
    t = open(SRC, encoding="utf-8").read()
    return re.findall(r"שאלה (\d+):\n(.+?)\nתשובה:\n(.+?)(?=\n\nשאלה|\Z)", t, re.S)


def main():
    append = "--append" in sys.argv
    close_in_word()
    if append and os.path.exists(OUT):
        d = docx.Document(OUT)
        have = set(re.findall(r"שאלה (\d+):", "\n".join(p.text for p in d.paragraphs)))
    else:
        d = docx.Document(TEMPLATE)
        for p in list(d.paragraphs):
            p._element.getparent().remove(p._element)
        have = set()
    written = []
    for n, q, a in pairs():
        if n in have:
            continue
        add(d, "שאלה " + n + ":", bold=True)
        add(d, q)
        add(d, "תשובה:", bold=True)
        for line in a.strip().split("\n"):
            add(d, line)
        add(d, "")
        written.append((n, q, a))
    d.save(OUT)
    for n, q, a in written:
        w = len(a.split())
        print("q" + n + ": ends with ? " + str(q.strip().endswith("?")) +
              " | " + str(w) + " words ~" + str(round(w / 2.3)) + "s | dashes " +
              str(any(c in q + a for c in "—–־")))
    if not written:
        print("nothing new to add")


main()
