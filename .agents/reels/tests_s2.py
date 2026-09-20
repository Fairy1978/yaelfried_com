# -*- coding: utf-8 -*-
"""The mechanical tests from .agents/reel-pipeline-2026-09-20.md, tests 1 to 8.

Test 9 (fonts and RTL inside the saved .docx) is check_fonts.py, run after the build.

Usage:  python tests_s2.py s2_source.txt batchC.txt ...
Output is English so the verdicts can be read in chat without Hebrew.
"""
import re
import io
import sys
import os
import unicodedata

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
HEB = re.compile(r"[\u0590-\u05FF]")

# --- test 2: the only punctuation allowed is comma, period, question mark
BANNED_PUNCT = {
    "\u2014": "em dash", "\u2013": "en dash", "\u05BE": "maqaf",
    "-": "hyphen", "\u2026": "ellipsis", ":": "colon", ";": "semicolon",
    "!": "exclamation", "\u05F3": "geresh", "\u05F4": "gershayim",
    '"': "quote", "'": "apostrophe", "\u201c": "quote", "\u201d": "quote",
    "(": "paren", ")": "paren",
}

# --- test 3: negation
NEGATION = ["לא", "אין", "אינו", "אינה", "אינם", "אינן", "ללא", "בלי", "בלתי",
            "שום", "כלום", "מעולם", "לעולם", "אף", "טרם"]
# אל is left out on purpose: in this register it is the preposition "to",
# which her own recorded Session 1 uses. The prohibitive אל does not occur here.

# --- test 6: forbidden vocabulary
FORBIDDEN = {
    "היפנוזה": "restricted in Israel", "היפנוזיה": "restricted",
    "הפנוזה": "restricted", "מהפנט": "restricted", "היפנוטי": "restricted",
    "מטפלת": "not her title", "מטפל": "not her title", "טיפול": "clinical",
    "מטופלת": "clinical", "מטופל": "clinical", "דוקטור": "doctor title",
    "ד\"ר": "doctor title", "רופא": "medical", "רופאה": "medical",
    "אבחון": "diagnosis", "אבחנה": "diagnosis", "תסמין": "medical",
    "תסמינים": "medical", "פציינט": "medical", "מרפאה": "clinical",
    "קליני": "clinical", "תרופה": "medical", "טראומה": "dropped positioning",
    "פוסט טראומה": "dropped positioning",
    "מובטח": "promise", "הבטחה": "promise", "תמיד יעבוד": "promise",
    "הכי טוב": "superlative", "הטוב ביותר": "superlative",
    "המהיר ביותר": "superlative", "מהפכני": "superlative",
    "פלא": "superlative", "מדהים": "superlative",
}
# anxiety may appear, but never as the subject of a reel; flagged for judgment
FLAG_ONLY = {"חרדה": "anxiety, fine as an aside, never the reel's subject",
             "חרדות": "anxiety, fine as an aside, never the reel's subject"}

PREFIX = ("ולכש", "וכש", "ושה", "לכש", "מה", "וה", "ול", "וב", "וכ", "ומ", "וש",
          "כש", "לה", "בה", "מה", "שה", "ה", "ו", "ב", "ל", "כ", "מ", "ש")
STOP = set("""
אני את אתה היא הוא אנחנו אתן הן הם שלי שלך שלה שלו שלנו שלהן
זה זאת זו אלה כל מה מי איך למה כי אם אז גם רק עוד כבר
יש אין של אל על עם אצל בין תוך ליד מתוך אותו אותה אותם אותן
שאת שאני שהיא שזה וזה וזאת וגם ואז הזה הזאת הזאתי כך ככה
היה הייתה יהיה תהיה להיות אפשר צריך צריכה יכול יכולה
""".split())

SUFFIX = ("ותיהם", "ותיכם", "יהן", "יהם", "ותיך", "ותיה", "ותינו", "נו", "כם", "כן",
          "הם", "הן", "יך", "ייך", "תי", "תם", "תן", "ות", "ים", "יה", "ך", "ת", "ה", "י")


def strip_marks(s):
    return "".join(c for c in unicodedata.normalize("NFD", s)
                   if not unicodedata.combining(c))


def words(s):
    return [w for w in re.findall(r"[\u0590-\u05FF%0-9]+", strip_marks(s))]


def stem(w):
    for p in PREFIX:
        if w.startswith(p) and len(w) - len(p) >= 3:
            w = w[len(p):]
            break
    for s in SUFFIX:
        if w.endswith(s) and len(w) - len(s) >= 3:
            w = w[: -len(s)]
            break
    return w


def ngrams(s, n=3):
    w = words(s)
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}


def parse(path):
    t = open(path, encoding="utf-8").read()
    out = []
    for n, q, a in re.findall(r"שאלה (\d+):\s*\n(.+?)\nתשובה:\s*\n(.+?)(?=\n\s*\nשאלה|\Z)", t, re.S):
        out.append((int(n), q.strip(), a.strip()))
    return out


def check(n, q, a, others, s1_grams, allow_callback):
    fails, warns = [], []

    # 1 length
    wc = len(words(a))
    secs = wc / 2.2
    if not (78 <= wc <= 90):
        fails.append("T1 length: %d words (%.0fs), need 78 to 90" % (wc, secs))

    # 2 punctuation
    for ch, name in BANNED_PUNCT.items():
        if ch in q + a:
            fails.append("T2 punctuation: %s present" % name)

    # 3 negation
    neg = [w for w in words(a) if w in NEGATION]
    if neg:
        fails.append("T3 negation: %d found (%s)" % (len(neg), ", ".join(sorted(set(neg)))))

    # 4 groups of three
    for sent in re.split(r"[.?]", a):
        items = [x.strip() for x in sent.split(",") if x.strip()]
        if len(items) == 3:
            # a real list of three, rather than three clauses, ends "ו..."
            if items[-1].startswith("ו"):
                fails.append("T4 group of three: a list of exactly 3 items")
            else:
                warns.append("T4: a sentence with 3 comma parts, check it is not a list")

    # 5 repeated roots
    seen = {}
    for w in words(a):
        if len(w) < 3:
            continue
        st = stem(w)
        if len(st) < 3:
            continue
        seen.setdefault(st, []).append(w)
    rep = {k: v for k, v in seen.items()
           if len(v) > 1 and k not in allow_callback
           and not any(w in STOP for w in v)}
    for k, v in rep.items():
        warns.append("T5 repeated root '%s' x%d" % (k, len(v)))

    # 6 forbidden vocabulary
    ws = set(words(a) + words(q))
    for bad, why in FORBIDDEN.items():
        if bad in ws or bad in a or bad in q:
            fails.append("T6 forbidden: '%s' (%s)" % (bad, why))
    for flag, why in FLAG_ONLY.items():
        if flag in ws:
            warns.append("T6 flag: '%s' (%s)" % (flag, why))

    # 7 three word overlap
    g = ngrams(a)
    hit1 = g & s1_grams
    if hit1:
        fails.append("T7 overlap with recorded Session 1: %s" % ", ".join(sorted(hit1)))
    for m, og in others.items():
        hit = g & og
        if hit:
            fails.append("T7 overlap with reel %d: %s" % (m, ", ".join(sorted(hit))))

    # 8 real question
    if not q.endswith("?"):
        fails.append("T8 question does not end with a question mark")
    if len(words(q)) < 3:
        fails.append("T8 question is too short to be a real question")

    return wc, secs, fails, warns


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    s1 = os.path.join(here, "session1_recorded.txt")
    s1_grams = ngrams(open(s1, encoding="utf-8").read()) if os.path.exists(s1) else set()
    if not s1_grams:
        print("WARNING: session1_recorded.txt missing, test 7 cannot check Session 1\n")

    allow = {}
    apath = os.path.join(here, "callbacks.txt")
    if os.path.exists(apath):
        for line in open(apath, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#"):
                k, _, v = line.partition(" ")
                allow.setdefault(int(k), set()).add(stem(v.strip()))

    reels = []
    for p in sys.argv[1:]:
        reels += parse(p)
    reels.sort()
    grams = {n: ngrams(a) for n, q, a in reels}

    nfail = 0
    for n, q, a in reels:
        others = {m: g for m, g in grams.items() if m != n}
        wc, secs, fails, warns = check(n, q, a, others, s1_grams, allow.get(n, set()))
        status = "PASS" if not fails else "FAIL"
        if fails:
            nfail += 1
        print("reel %-2d %s  %d words, %.0fs" % (n, status, wc, secs))
        for f in fails:
            print("        X " + f)
        for w in warns:
            print("        ~ " + w)
    print("\n%d reels, %d failing" % (len(reels), nfail))
    return 1 if nfail else 0


sys.exit(main())
