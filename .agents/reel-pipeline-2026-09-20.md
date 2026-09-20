# Reel question pipeline, Session 2

Binding process for every one of the 16 questions. Written 2026-09-20 after four rejected
drafts, each of which a test in this list would have caught before Yael ever saw it.

## Inputs, read before drafting

| Source | Why |
|---|---|
| `Podcasts\Barter Aug 2026\Session 1\Video Session 1.docx` | 12 answers already recorded. Nothing here may be restated as a new reel's claim. It is also the gold standard for her spoken rhythm. |
| `Podcasts\Barter Aug 2026\Session 2\Session 2.docx` | Her raw explanations of the mechanism. Not recorded, being replaced, so it is raw material rather than a constraint. |
| `My Amazing Brand\My Amazing Brand.docx` | Brand discovery, messaging strategy, brand voice, approved landing page verbiage. |
| `Sales and Marketing\Copywriting.docx` and `Marketing.docx` | Her own writing rules, in her words. |
| `Website\Website Verbiage - Hebrew.txt` | Live site copy, her approved phrasing. |

## The four beats of every reel

1. She recognises herself, in one concrete moment from her day.
2. She gets an answer she has not heard before, and it answers the question asked.
3. Yael and her work, what she does with it, and why it differs from what the viewer already tried.
4. The invitation: what becomes possible, and the step toward Yael.

Point of view is locked: the viewer asks as "I", Yael answers to her as "you", Yael speaks of her
own work as "I" or as a joint "we".

## Mechanical tests, run by script, never by eye

Tests 1 to 8 are implemented in `.agents/reels/tests_s2.py`. Run it over every source file at once,
so the cross reel overlap test in item 7 can see all 16 answers together:

    cd .agents/reels && python tests_s2.py s2_source.txt batchAB.txt batchC.txt

It prints one line per reel and exits non zero if any reel fails. Test 9 is `check_fonts.py`,
run against the saved .docx after the build. Lines marked X are failures. Lines marked ~ are
warnings for human judgment, mostly repeated roots, which item 5 allows when a callback is the
structural device.

1. 78 to 90 Hebrew words in the answer. 36 to 40 seconds at roughly 2.2 words per second.
   Corrected 2026-09-20. The band first written here was 90 to 105, which contradicted every
   answer that has actually been approved: reel 1 is 84 words, and the batch C drafts are 78 to 86.
   One of the four rejections was a 90 word answer running 45 seconds, so the original band was
   the very length she rejected.
2. Punctuation limited to comma, period, question mark. No dash, maqaf, ellipsis, colon, semicolon,
   exclamation mark.
3. Zero negation words, and no "it is not X, it is Y" construction.
4. No group of three. Lists are two or four items.
5. No repeated word root inside an answer, unless a callback is the structural device, flagged.
6. Forbidden: היפנוזה, מטפלת, any doctor title, medical or clinical vocabulary, diagnosis, promises,
   superlatives, trauma and anxiety as the subject of the reel.
7. Zero three-word phrase overlap with the recorded Session 1, and zero with the other 15 answers.
8. The question is a real question and ends with a question mark.
9. Inside the saved .docx: her font `Segoe UI Semilight` written explicitly, `w:bidi` per paragraph
   and `w:rtl` per run, and the file built from her own document as the template.

## Council, before she sees anything

Five independent adversarial seats, each with the brand documents and the recorded session:
ideal client, Hebrew direct response copywriter, brand voice guardian, positioning and compliance,
short form video editor. Their fixes are merged, then every mechanical test is re-run.

## Native Hebrew pass

Every answer goes through a native Hebrew editing pass before the tests, so the lines read as spoken
Hebrew rather than written or translated Hebrew. Her own sentences are the source wherever they fit.

## Coverage of the 16

Life areas: postponing what matters, the same kind of relationship, the voice that says it should
have been more, the night the head keeps running, smoking, energy and motivation.
Mechanism: why understanding does not stop the reaction, where it started.
What changes: the word "suddenly", how soon, whether it stays.
Her fears: disappointment, control in trance, whether trance works on her, Zoom.
Next step: what happens when she reaches out.
