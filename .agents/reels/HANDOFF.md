# Session 2 reels, handoff, 2026-09-20

## Where things stand

**All 16 reels are written, councilled, and mechanically green.** They are in `s2_source.txt`
and appended to her Word draft. Reel 1 was already approved and was not touched.

| Reel | Topic | State |
|---|---|---|
| 1 | Postponing the thing that matters most | Approved earlier. Untouched. |
| 2 to 11 | Same kind of relationship, the measuring voice, the head at night, smoking, no energy, knowing the pattern and still running it, age six, what letting go feels like, how soon, does it stay | Written, five seat council applied, all tests green. |
| 12 to 16 | Disappointed again, losing control, whether trance works on me, Zoom, what happens when I reach out | Council applied to the earlier drafts, all tests green. Reel 12 was structurally rebuilt. |

## Files here

- `s2_source.txt` — the source of truth, all 16. `build_s2.py` reads only this.
- `batchAB.txt`, `batchC.txt` — working files for reels 2 to 11 and 12 to 16. Kept so the
  council findings stay traceable to the text they changed.
- `tests_s2.py` — **new.** Mechanical tests 1 to 8 as a script. Run it over all three files at
  once so the cross reel overlap test can see every answer together.
- `callbacks.txt` — repeated roots that are the deliberate structural device of a reel, so
  test 5 stops warning about them.
- `council_seat1.md` to `council_seat5.md` — the five seats, verbatim.
- `COUNCIL_BRIEF.md` — what the seats were given. Reuse it for any future batch.
- `session1_recorded.txt`, `brand_reference.txt`, `copywriting_reference.txt`,
  `session2_raw_reference.txt` — her own documents, extracted to text so the tests and the
  council can read them without opening Word.
- `build_s2.py`, `check_fonts.py` — unchanged.

## Two corrections made to the process this session

1. **The word band in the pipeline doc was wrong.** It said 90 to 105 words. Reel 1, which she
   approved, is 84, and the batch C drafts were 78 to 86. One of the four rejections was a 90 word
   answer running 45 seconds, so the documented band was the length she had already rejected.
   Corrected to 78 to 90 in `reel-pipeline-2026-09-20.md`.
2. **The mechanical tests had never been a script.** The pipeline said "run by script, never by
   eye" but no script existed, which is how four drafts reached her. `tests_s2.py` now implements
   tests 1 to 8 and exits non zero on failure.

## Open judgment calls for Yael

1. **Reel 7, the five and ninety five percent figures are gone.** Four of the five seats wanted
   them removed or hedged. The reel keeps the contrast in words (the small analysing part, the
   big fast part) and keeps the insight. The numbers are still hers to use in long form. If she
   wants them back, seat 4's hedged version is in `council_seat4.md`.
2. **Reel 10 does not name a number of meetings.** Seat 1 asked for one and is right that "a few"
   feels evasive. Only Yael knows her real range, so nothing was invented.
3. **Reel 16 does not state how long the call takes.** Same reason. Seat 1 says a duration would
   do more than any reassurance.
4. **Reel 12 now names the fear underneath the fear** in a fairly direct line. It is the sharpest
   sentence in the set and worth her eye.
5. Reel 5, smoking, is the highest exposure reel. It now keeps the decision explicitly with the
   viewer. Seat 4 would have stopped the set over the earlier version.

## What reel 1 established, and what is spent

- The claim of reel 1: the selectivity of the delay is itself the address.
- `פתאום` is reel 1's payoff and was not reused.
- Reel 1 owns `שייך למישהו אחר` and `וזאת הכתובת`.
- Point of view is locked: she asks as "I", Yael answers to her as "you", Yael speaks of her work
  as "I" or a joint "we".

## Set level notes the council raised, for the recording order

- Reel 13 makes reels 4, 5 and 8 defensible. Publish it early and keep it pinned.
- Reels 12 and 16 are near twins in shape. Space them apart.
- Strongest openings: 7, 13, 5, 8, 6. Every one of them opens with a body doing something.
- Seat 5's on screen hook lines for all 15 first frames are in `council_seat5.md`.
