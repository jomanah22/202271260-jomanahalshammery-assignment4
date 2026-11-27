# Technical Documentation – Assignment 4

## 1. Overview

A static single-page web application. No build step and no runtime dependencies; the only
outside service is the Open-Meteo weather API.

```
index.html        markup: header, seven sections, footer, two <dialog> elements
css/styles.css    tokens, base, components, sections, controls, exercises, dialog, print, motion
js/config.js      CONFIG: location for the weather line, cache duration
js/data.js        PROJECTS, PROJECT_FILTERS, PROJECT_SORTS, EXERCISES
js/script.js      behaviour in one function, ten numbered parts
assets/           CV (.docx), Montserrat font, 31 JPEG images (about 4.1 MB)
presentation/     slides (HTML and PDF), demo script
```

Scripts load with `defer` in the order config, data, script.

## 2. Data model

```js
// PROJECTS[n]
{
  id, sequence, title, kind, year, tags: [],
  image,                        // 4:3 cover for the card
  poster | gallery: [],         // a journal page, or several images, for the case study
  summary, process, learning,
  details: [[label, value], …]  // shown as a definition list in the case study
}
// EXERCISES[n]: { title, tools: [], objective, brief, learning, images: [] }
// PROJECT_SORTS[n]: { id, label, compare(a, b) }
```

Adding a piece of work is a data change only. A new tool becomes a filter button when it is
added to `PROJECT_FILTERS`.

## 3. State

| Key (localStorage) | Content | Written by |
| --- | --- | --- |
| `theme` | `'light'` or `'dark'` | the inline head script reads it; the theme button writes it |
| `portfolio-state` | `{ filter, sort, logOpen }` | `setState()` only |
| `contact-draft` | `{ name, email, topic, message }` | debounced form input; cleared on submit |

`sessionStorage` holds the weather response with a timestamp, expiring after
`CONFIG.cacheMinutes`.

The URL hash is also state: `#work/<id>` while a case study is open, `#projects` after it
closes. It is written with `history.replaceState`, so opening and closing case studies does not
add history entries.

## 4. Behaviour by part (script.js)

1. State and helpers: `loadState`, `setState`, `cacheGet` / `cacheSet`, `fetchJson`
   (8-second `AbortController` timeout, throws on non-2xx), `escapeHtml`.
2. Theme: toggles `data-theme` on `<html>`, saves it, updates the button label.
3. Navigation: mobile menu (`is-open`, `aria-expanded`, Escape); an `IntersectionObserver`
   with a narrow root margin marks the section in the middle of the viewport and sets
   `is-current` / `aria-current` on its nav link.
4. Work list: filter buttons and sort options are generated from data; `visibleProjects()`
   runs filter → search → `slice().sort()`; `renderProjects()` writes the cards, the counter and
   the empty state, and keeps `visible` (the current display order) for the dialog.
5. Case-study viewer: see section 5.
6. In-class exercises: `<details>` entries from `EXERCISES`; `state.logOpen` toggles the list.
7. Weather and time: Open-Meteo current conditions mapped from WMO codes; an
   `Intl.DateTimeFormat` clock in `Asia/Riyadh` re-rendered every minute; three text states
   (loading, loaded, failed).
8. Contact: copy-email button (Clipboard API with a text-selection fallback); a topic map that
   drives the hint and the confirmation; two-step validation with `aria-invalid` and focus on
   the first error; draft save and restore.
9. Reveal and year: `reveal` elements become visible on intersection, or immediately if they are
   already above the viewport, with a scroll listener as a safety net.
10. Image viewer: a second `<dialog>` that opens a cover or a case-study image full size, with
    previous / next and arrow keys. It can open on top of the case study; Escape closes only the
    picture.

## 5. Case-study viewer

One `<dialog class="case" aria-labelledby="case-title">` at the end of `<body>` with a close
button, a media column and a text column.

| Concern | Implementation |
| --- | --- |
| Open | Any element with `data-open="<id>"` in the list (cover button, title button, *View case study*). `openCase(id, trigger)` fills the dialog, calls `showModal()`, adds `body.has-dialog` to lock scrolling and sets the hash. |
| Fill | `fillCase()` swaps the media (a journal page or a gallery), the text, the details list and the tags, and works out the position within `visible`. Previous / Next are disabled at the ends. |
| Navigate | Buttons and ← → call `stepCase(±1)`, following the current filter and sort order. |
| Close | Escape, the close button, or a click on the backdrop. The `close` event clears the body class, resets the hash to `#projects` and returns focus to the trigger, or to the first title button if the trigger was re-rendered. |
| Deep link | `openFromHash()` runs on load and on `hashchange`; `#work/<id>` opens that project, any other hash closes an open dialog. |
| Accessibility | `showModal()` traps focus and exposes the dialog as modal; `aria-labelledby` names it; images have descriptive `alt` text; buttons have labels. |

Layout: `.case-inner` is a two-column grid (media / text) that scrolls inside a
`100dvh` box; under 768 px it becomes one column with the media on top.

## 6. CSS structure

1. `@font-face` for the local Montserrat file.
2. Variables on `:root`, `[data-theme="dark"]` and the `prefers-color-scheme` fallback, with
   `color-scheme` per theme so native controls match.
3. Base, typography, `[hidden] { display: none !important }`.
4. Components: buttons, icon buttons, cards, badges, tags.
5. Sections: header and navigation, hero, portfolio, skills, background, certificates, contact,
   footer.
6. Controls: filter buttons, search, sort select, counter, empty state, form feedback, reveal.
7. Exercises list, weather line, case-study dialog, skip link, current nav item, copy button,
   image viewer.
8. Responsive rules at 992 px, 768 px and 480 px.
9. Print: black on white, chrome and forms hidden, `break-inside: avoid` per section.
10. Reduced motion.

## 7. Performance

- 31 images, about 4.1 MB, resized JPEGs with `width` / `height` and `aspect-ratio`;
  everything is `loading="lazy"`; case-study images load only when a case study opens.
- Font served locally (one 38 KB file). No third-party scripts or stylesheets.
- Scripts deferred; the JavaScript is about 35 KB unminified with no dependencies.
- The weather response is cached in `sessionStorage`; the clock updates once a minute.
- The stylesheet was audited against the markup and scripts; duplicate and unused rules were
  removed.

## 8. Browser support

Current Chrome, Edge, Firefox and Safari. Uses `<dialog>`, `aspect-ratio`, `dvh` units and
CSS custom properties, all supported in browsers released since 2023. Without JavaScript the
page still shows the hero, background, skills, certificates and contact details; the list,
exercises, dialogs and weather line need scripts.

## 9. User guide

**Navigation.** The header links jump to each section and the current one is highlighted. On
phones the ☰ button opens the menu; choosing a link or pressing Escape closes it. The sun /
moon button switches theme and the site remembers your choice.

**Projects.** The filter buttons narrow by tool, the menu sorts (Journal order, Title A–Z,
Title Z–A, Projects first) and the search box filters as you type. The counter shows how many
match; *Clear filters* resets the filters and keeps your sort.

**Case studies.** Click a cover, a title or *View case study*. Inside, scroll the images, read
the details, use ← → or the buttons to move to the previous or next project in the current
order, and press Escape or click outside to close. Click an image to see it full size. The
address bar holds a link to the open case study that you can share.

**Exercises.** *Show all 6 exercises* reveals the list; click an entry to open its notes and
screenshots. The list stays open on your next visit if you left it open.

**Contact.** *Copy* puts the email address on your clipboard. In the form, choose a topic to
get a hint about what to include; fields are checked when you leave them and when you submit;
your text is saved as a draft while you type and restored if you reload. The *CV* link
downloads the Word document. Printing the page produces a résumé-style layout.

## 10. Known limitations

- The form acknowledges messages but does not send them (no backend in scope).
- The weather line is for a fixed location from `CONFIG`.
- Case-study media are images from my posters and journal; the original animations are not
  embedded.
