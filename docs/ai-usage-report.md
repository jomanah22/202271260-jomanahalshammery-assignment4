# AI Usage Report – Assignment 4

## Signed Declaration

> **Declaration of AI Usage:**  
> I declare that the work presented in this assignment is my own, except where explicitly acknowledged through AI usage documentation or references. I understand all the code submitted, have reviewed and critically modified all AI-assisted outputs, and can explain every implementation decision and algorithm without assistance.
> 
> In accordance with KFUPM academic integrity regulations and course guidelines for SWE 363, every use of generative AI tools has been transparently documented below.

- **Student Name:** Jomanah Alshammary
- **Student ID:** 202271260
- **Course:** SWE 363 – Web Engineering
- **Repository Link:** [https://github.com/jomanah22/202271260-jomanahalshammery-assignment4](https://github.com/jomanah22/202271260-jomanahalshammery-assignment4)
  
  

## 1. High-Level AI Usage Log

| Tool       | Date       | Purpose                                                   | Files Affected                                                            | What You Changed                                                                                                                                                                           |
|:---------- |:---------- |:--------------------------------------------------------- |:------------------------------------------------------------------------- |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Claude** | 2026-11-23 | Head metadata, favicon and a skip link                    | `index.html`, `css/styles.css`                                            | Added `theme-color` per colour scheme, Open Graph tags and an inline SVG favicon; wrote the description text; skip link that appears only on focus, `id="main"` on the landmark.           |
| **Claude** | 2026-11-24 | Current-section highlight in the navigation               | `js/script.js`, `css/styles.css`                                          | `IntersectionObserver` with a narrow root margin sets `is-current` and `aria-current`; tuned the margin and reused the existing underline style.                                           |
| **Claude** | 2026-11-25 | Case-study data model                                     | `js/data.js`                                                              | `poster` or `gallery` plus a `details` list of label/value pairs per project; wrote every value from my posters and journal pages.                                                         |
| **Claude** | 2026-11-25 | Case-study viewer dialog, keyboard navigation, deep links | `index.html`, `js/script.js`, `css/styles.css`                            | Native `<dialog>` with `fillCase` / `openCase` / `stepCase`, `#work/<id>` via `replaceState`, `hashchange` listener; fixed two bugs found in testing; two-column layout; stacked lightbox. |
| **Claude** | 2026-11-26 | Copy-email button and print stylesheet                    | `index.html`, `js/script.js`, `css/styles.css`                            | Clipboard API with a text-selection fallback and a short confirmation; print-only colour variables, hidden chrome and forms, `break-inside: avoid`.                                        |
| **Claude** | 2026-11-26 | Review pass: unused code and consistency                  | `js/script.js`, `css/styles.css`, `js/config.js`, `js/data.js`            | Removed `localTime()`, `applyTheme()` and `body.has-lightbox`; `labelThemeButton()`; renamed the reveal observer; moved `REQUIRED_MESSAGES`; updated the headers.                          |
| **Claude** | 2026-11-27 | Structure of the documentation                            | `docs/ai-usage-report.md`, `docs/technical-documentation.md`, `README.md` | Used the section outline and the user-guide table idea; wrote all reflections and checked every claim against the code.                                                                    |

---

## 2. Commit-by-Commit AI Assistance Details

Below is the complete audit of each commit for Assignment 4, documenting whether AI assisted, what the AI provided, what human changes were made, and the corresponding entries in the AI evidence log.

### Commit 1: `commit-1-start-from-assignment-3`

- **Commit Message:** Start from the Assignment 3 portfolio
- **Commit Description:** Assignment 3 site copied in unchanged as the starting point
- **AI Assisted:** No (Manual Implementation)
- **Details:** Copied the Assignment 3 repository files into the Assignment 4 workspace to establish the clean baseline.

### Commit 2: `commit-2-head-metadata-and-skip-link`

- **Commit Message:** Add head metadata, a favicon and a skip link
- **Commit Description:** theme-color per colour scheme, Open Graph tags, inline SVG favicon, skip to content link with id on main
- **AI Assisted:** Yes (Claude)
- **What AI Suggested:** Two `theme-color` meta tags keyed to `prefers-color-scheme`, the three Open Graph tags, a favicon as an SVG data URI so no extra file is requested, and the skip-link pattern (positioned off-screen until it receives focus).
- **What I Changed:** Wrote the Open Graph description from my own project text, chose the colours and the initial for the icon, added `id="main"` so the link has a target, and styled the link with the existing design tokens.

### Commit 3: `commit-3-current-nav-link`

- **Commit Message:** Highlight the current section in the navigation
- **Commit Description:** IntersectionObserver sets is-current and aria-current on the nav link
- **AI Assisted:** Yes (Claude)
- **What AI Suggested:** A second `IntersectionObserver` with a `rootMargin` that leaves only a thin band in the middle of the viewport, so exactly one section counts as current, and `aria-current="true"` on its link.
- **What I Changed:** Tuned the margin to `-45% 0px -50% 0px` after testing at three widths, removed `aria-current` from the other links on every change, and reused the existing hover underline (`::after`) for the current state instead of a new style.

### Commit 4: `commit-4-cv-download`

- **Commit Message:** Add the CV download
- **Commit Description:** CV docx in assets, Download CV hero button, CV row in the contact details
- **AI Assisted:** No (Manual Implementation)
- **Details:** Added my CV to `assets/`, replaced the second hero button with a *Download CV* link using the `download` attribute, and added a CV row to the contact details list.

### Commit 5: `commit-5-case-study-data`

- **Commit Message:** Add case-study media and details to the data
- **Commit Description:** poster or gallery and a details list per project, new poster, journal page and gallery images
- **AI Assisted:** Yes (Claude)
- **What AI Suggested:** Extending each project with either a `poster` (one tall journal page) or a `gallery` (several slides), and a `details` array of `[label, value]` pairs that can be rendered as a definition list without changing the schema again.
- **What I Changed:** Wrote all the details (tools, deliverables, team, course, source) from my posters and journal, picked which projects get a poster and which get a gallery, and prepared and resized the eleven new images.

### Commit 6: `commit-6-case-study-viewer`

- **Commit Message:** Add the case-study viewer
- **Commit Description:** Notes popup replaced by a case-study dialog filled from data, previous and next in list order, arrow keys, shareable #work/id links, image viewer opens case-study pictures
- **AI Assisted:** Yes (Claude)
- **What AI Suggested:** A first draft of the viewer on top of the native `<dialog>` element: `fillCase()` for the media column and the text, `openCase()` and `stepCase()` that follow the order the list is currently showing, `history.replaceState` for a `#work/<id>` hash, and opening the image viewer as a second dialog stacked on the first.
- **What I Changed:** Testing found two gaps that I fixed: focus could land on a card that had been re-rendered (now falls back to the first title button), and pasting a link into an already open page did nothing because only the load-time check existed (a `hashchange` listener handles that now). I wrote the two-column layout with `100dvh`, the phone layout, the disabled state of the previous and next buttons, removed the old notes popup markup, styles and script, and made Escape close only the picture when both dialogs are open.

### Commit 7: `commit-7-copy-email-and-print`

- **Commit Message:** Add a copy-email button and a print stylesheet
- **Commit Description:** Clipboard API with a text-selection fallback, print layout as a one-column résumé, accessibility mentioned in the skills card
- **AI Assisted:** Yes (Claude)
- **What AI Suggested:** `navigator.clipboard.writeText` with a fallback that selects the address for browsers without the Clipboard API, and a print stylesheet that hides the page chrome and the forms.
- **What I Changed:** Wrote the button states ("Copied", "Press Ctrl+C") and the 1.8-second reset, decided which sections a printed résumé should keep, and added a print-only set of colour variables because the first draft still printed the dark theme colours.

### Commit 8: `commit-8-tidy-scripts-and-headers`

- **Commit Message:** Tidy the scripts and update the file headers
- **Commit Description:** Theme toggle simplified, unused helpers and rules removed, comments trimmed, Assignment 4 headers
- **AI Assisted:** Yes (Claude)
- **What AI Suggested:** A review pass that listed helpers and rules no longer referenced (`localTime()`, `applyTheme()`, `body.has-lightbox`), a shorter `currentTheme()`, and renaming the reveal observer so the two observers are easy to tell apart.
- **What I Changed:** Replaced `applyTheme()` with `labelThemeButton()`, moved `REQUIRED_MESSAGES` next to the other form data, deleted the unused code, ran my own check that compares every selector in the stylesheet with the markup and scripts, and updated the headers of `styles.css`, `config.js`, `data.js` and `script.js`.

### Commit 9: `commit-9-ai-usage-report`

- **Commit Message:** Update the AI usage report
- **Commit Description:** docs/ai-usage-report.md rewritten for Assignment 4
- **AI Assisted:** Yes (Claude)
- **What AI Suggested:** The section outline required by the assignment guidelines (declaration, usage log, commit audit, reflection, learning outcomes).
- **What I Changed:** Wrote all reflections, challenges and code adaptations in my own words and matched every entry to the evidence log.

### Commit 10: `commit-10-docs-and-readme`

- **Commit Message:** Update the technical documentation and the README
- **Commit Description:** docs/technical-documentation.md and README.md rewritten for Assignment 4: architecture, user guide, deploying
- **AI Assisted:** Yes (Claude)
- **What AI Suggested:** Numbering the technical documentation sections, a table for the storage keys and for the dialog's concerns, and a user-guide table in the README.
- **What I Changed:** Verified every claim against the code (image counts, sizes, storage keys, behaviour by part), wrote the deploying steps for GitHub Pages and Netlify from my own deployment, and wrote the user guide in plain words.

---

## 3. Reflection: Benefits and Challenges

### Benefits

- **Faster iteration on interaction details:** The polish of this assignment is in small behaviours (focus return, arrow keys, the hash). I could describe the behaviour I wanted and be testing it within minutes.
- **A second reader for consistency:** Naming, comment style and section numbering were checked by something that reads the whole file at once.
- **Platform features explained:** `<dialog>` and `::backdrop`, `history.replaceState`, `aria-current` and the Clipboard API were new to me and were explained well enough to read the MDN pages and use them.

### Challenges & Overcoming Them

- **Decorative suggestions:** Suggested "creative" features leaned decorative. Deciding what not to build was the main design work of this assignment; I kept the case-study viewer and the print view because they help a visitor.
- **Confident code with edge-case bugs:** The two dialog problems above only appeared under testing, so I learned to test flows (open, filter, re-open, paste a link) and not just features.
- **Keeping documentation honest:** It is tempting to describe the ideal system; every claim in the documentation and the README was checked against the code before it stayed.

---

## 4. Learning Outcomes

1. **Accessible modals with the native `<dialog>`:** What it gives for free (focus trap, Escape, backdrop) and what still has to be written (focus return, body scroll, keyboard shortcuts, stacked dialogs).
2. **The URL as application state:** Using the hash for a shareable view without polluting history (`replaceState`) and reacting to `hashchange`.
3. **Print stylesheets as a real feature:** Colour variables, `break-inside`, and hiding the interactive parts.
4. **A testing routine:** Scripted browser checks after each change, screenshots at three widths, both themes.
5. **Presenting technical work:** Separating what was resolved, what was not, and what comes next.
6. **Responsible AI co-development:** Drafted code was reviewed line by line, tested including the failure cases, and edited to match the codebase before it stayed; several suggestions were rejected or simplified.
