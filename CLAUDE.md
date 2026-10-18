# Hybrid PPL Tracker

Personal offline training app (PWA), hosted on GitHub Pages. The user (Noé) uses it on his phone in a gym with **no Wi-Fi and no mobile signal**, so everything must work fully offline.

This repo is public: never add personal health details, real names of other people, or workout data to any file.

## Hard rules

1. **Never break offline mode.** No runtime network calls, no external APIs, no CDN dependency the app needs to function. Google Fonts are optional (cached by the service worker, system fonts as fallback).
2. **Bump `VERSION` in `sw.js` on every change** to any shipped file, or phones keep the old version. Add any new file to the `SHELL` list in `sw.js`.
3. **Never lose his data.** Data lives in `localStorage` under key `hybrid-ppl-local-v1` as `{state, logs}`. Any change to the data shape must stay backward compatible: read old shapes, add defaults for new fields (`Object.assign(clone(DEFAULT_STATE), saved)` pattern). Never rename the storage key. Keep the Backup export/import working.
4. **Look: "Rings"** (Apple-fitness style): system font, rounded cards, ring-style calendar days, pink accent, pill buttons, dark and light mode via CSS tokens at the top of `index.html`. Keep new UI in that style, no external fonts.
5. **Phone first.** Test at 390px width, light and dark mode. Tap targets at least 40px. No horizontal scroll.
6. Keep it a single `index.html` (vanilla JS, no build step) unless Noé asks otherwise.
7. UI language: English. Units: kg, seconds, km.
8. Training logic below is deliberate. **Don't change program rules or progression logic unless Noé explicitly asks.** Design and UX changes are fine.

## Workflow

- `APP_VERSION` in `index.html` must match `VERSION` in `sw.js` (shown in More so Noé can check which version his phone runs).
- Preview locally with `python3 -m http.server 8000` and check at phone width before pushing.
- Commit, push to `main`; GitHub Pages redeploys. Phone updates the next time the app is opened online.
- End every task with ONE message titled **FINAL REPORT**: what changed, files touched, the new `VERSION`, anything Noé must do on his phone. Noé finds long step-by-step output hard to scan.

## The program (why the app works this way)

**Programs tab (More → Programs)** holds the current 6-day plan (Push A/B, Pull A/B, Legs A/B) as the `PROGRAMS` data object in `index.html`: name, sets, reps, rest, why, [E]/[J] tag per exercise. Display text exactly as written, edit the data, not the markup. "Load into session" prefills a session (names and set counts; skills use the existing skill slots). The rotation Push A → Pull A → Legs A → Push B → Pull B → Legs B is in the general rules; the app's `nextSplit` rotation is still Push → Pull → Legs and does not track A/B. The older single-day `PROGRAM` constant only feeds the exercise picker catalog and old drafts, so leave it. The older notes below describe the original plan and the reasons behind the pull-up, skill, mobility and running logic, which still apply.


Trains ~5 days/week, 1h–1h15, no fixed weekdays. Push → Pull → Legs rotates in order whenever he trains (`state.nextSplit`). Sessions are **free-form**: the session starts empty and Noé adds exercises as he goes from a catalog (categories: Chest, Shoulders, Triceps, Back, Biceps, Legs, Core, Skills & holds; he can add his own). The catalog is built from the old slot options in `PROGRAM` plus a few extras. History is tracked per exercise name, so never rename existing exercises. The warm-up is only a collapsed list of ideas, nothing to tick.

### Pull-up program (K Boges, derived from the USMC Armstrong program)
Every other day, always first in whatever session it lands on. Cycle: max → density → pyramid → max (`state.pu.next`).
- **Max day:** 3 sets max clean reps, 5 min rest.
- **Density day:** 10 sets at `densityTarget`, 1 min rest. Only when all 10 sets hit the target does the target go up by 1. (Not recomputed from half the max; that's his chosen rule.)
- **Pyramid day:** 5 ladders 1→peak→1, 30 s between steps, **same peak on every ladder, never to failure**. Peak goes up by 1 after five clean ladders. Reason: his week 1–3 data showed going to failure on ladder 1 capped every later ladder at 4 and kept total volume flat (~100–110 reps).
- Weeks 1–3 are seeded from his notes (dates approximate). Run 6 weeks, deload week, retest.
- While the program runs, **Pull day has no vertical pulling** (no pulldowns / extra pull-ups); the program covers it.

### Skills
- Planche on Push day, front lever on **Legs** day (spreads elbow/lat load away from the pull-up program), handstand in the daily home routine.
- One **priority** skill (6 holds/session) and the rest in **maintenance** (3 holds). Switch every 6–8 weeks.
- First session per level = baseline max-hold test. Hold target = 70% of baseline; +1 s after a session where every hold hits target. At 10 s target, suggest the next level (tuck → advanced tuck → …) and retest.
- One-arm hangs per side on Pull and Legs days; thick-bar hangs on Push. Records update when beaten.

### Mobility and posture
Priority focus on hip and pelvis mobility, posture (upper back, neck) and shin care. Hence:
- Daily ~15 min home routine: couch stretch, 90/90 hips, pigeon, frog/adductor rock-backs, deep squat hold, dead bug, chest-to-wall handstand.
- Gym warm-up: band pull-aparts, wall angels, chin tucks, scap pull-ups, wrist prep.
- Legs day includes RDL (hinge) and a single-leg exercise; calves + tibialis raises every Legs day.
- Core: anti-extension on Push, leg raises / crunches on Pull, anti-rotation on Legs.

### Running
Irregular, 8–15 km when he runs. Big runs after long gaps are a common shin-splint trigger, so the app suggests ~5–6 km after more than a week off. Keep that logic.

### App structure
Home (calendar rings: pink/green halves for session-or-run and home routine, blue shading for pull-ups, grey shading for rest days; a past day with the routine done and no session counts as a complete rest day, shown with a grey first half; Start session picker incl. Pull-ups and Run; pull-up card), Progress = analytics only (Overview, Pull-ups, Skills, Lifts, Body, all offline SVG charts), More = menu (Measurements, Programs, Records incl. priority skill, Activity log, Backup). Pull-up logging lives on its own screen reached from Home or the session picker.

### Metrics
More tab is a settings-style menu: Measurements (dated weight history, height), Records (skill holds per level with dates, one-arm hang, lift bests with estimated 1RM; a new skill record resets the hold target to 70%), Backup. These replace the old home-screen baseline card.
