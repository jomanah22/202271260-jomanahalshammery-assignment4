# Jomanah Alshammary – Portfolio Website (Assignment 4)

The final version of my personal portfolio for SWE 363 (Web Engineering) at KFUPM. It brings
the earlier versions together into one polished, responsive web application: my projects with
full case studies, a live weather line, saved preferences, a validated contact form, light and
dark mode, and a print-friendly layout. Plain HTML, CSS and JavaScript, no frameworks.

Live site: https://202271260-jomanahalshammery-assignment-4.vercel.app

## Features

**Content**

- Hero with a typed tagline, a short bio, *View Portfolio* and *Download CV* buttons, and links
  to my GitHub, LinkedIn, WhatsApp and email.
- Projects: Hidden Gate Game, UniDine, The Hero Journey, Taif Rose Perfume Branding,
  3D Hotel – Letter H Concept and Tarout Palm Island, with filter buttons, four sort orders and
  live search. Filter and sort are remembered between visits.
- Case-study viewer: click a cover, a title or *View case study* to open a dialog with the
  project's images, details, process and what I learned. Move between projects with the
  buttons or the arrow keys; press Escape to close. Every case study has its own link, for
  example `…/#work/hidden-gate`. Clicking an image inside opens it full size.
- In-class exercises from my design journal in collapsible entries; the open/closed state is
  remembered.
- Skills, Background (degree and volunteering) and Certificates from my CV.
- Contact with email (and a *Copy* button), phone, WhatsApp, LinkedIn, GitHub, a CV download,
  and a live line with the local time and weather in Khobar.

**Contact form**: name, email, topic and message. Two-step validation with a message under
each field, focus on the first problem, a hint and a confirmation that change with the topic,
and a draft that survives a refresh.

**Quality**

- Light and dark mode chosen before the first paint; follows the system setting until you pick.
- Responsive from small phones to wide screens; mobile menu; no horizontal scrolling.
- Accessibility: skip link, landmarks, `aria-pressed`, `aria-expanded`, `aria-current` on the
  active nav link, live regions for status text, focus return from dialogs, visible focus
  styles, reduced-motion support.
- Performance: deferred scripts, one stylesheet, resized lazy-loaded images, a locally served
  font, a cached API response, no dependencies.
- Print stylesheet that lays the page out as a one-column résumé.

## Project structure

```
assignment-4/
├── README.md
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js               location for the weather line, cache time
│   ├── data.js                 projects (with galleries), filters, sort orders, exercises
│   └── script.js               behaviour, ten numbered parts
├── assets/
│   ├── Jomanah_Alshammary_CV.docx
│   ├── fonts/
│   └── images/                 covers, galleries, journal pages, exercise screenshots
├── docs/
│   ├── ai-usage-report.md
│   └── technical-documentation.md   architecture and user guide
├── presentation/
│   ├── slides.pdf
│   ├── demo-video.mp4
└── .gitignore
```

## Running the site locally

No build step or dependencies.

```bash
# inside the assignment-4 folder, pick one
npx serve .
python -m http.server 8000
```

Then open `http://localhost:3000` or `http://localhost:8000`. Opening `index.html` directly
also works, including the weather request.

## Deploying

Any static host works.

GitHub Pages: push the repository, open *Settings → Pages*, choose the `main` branch and the
folder containing `index.html`, save. The site appears at
`https://<username>.github.io/<repository>/` within a minute.

Netlify: drag the folder onto app.netlify.com/drop, or connect the repository and set the
publish directory to the folder with `index.html`. No build command.

## User guide

| I want to…             | Do this                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| Switch theme           | Click the sun / moon button in the header                                         |
| Find a project         | Use the filter buttons, the sort menu or the search box; *Clear filters* resets   |
| Read a case study      | Click a cover or title; use the buttons or ← → to move on; Escape closes          |
| See an image full size | Click the image inside the case study, or a cover on the page                     |
| Share a case study     | Copy the address bar while it is open                                             |
| See the exercises      | Click *Show all 6 exercises*, then an entry                                       |
| Contact me             | Fill in the form (a draft is saved as you type) or click *Copy* next to the email |
| Print or save as PDF   | Use the browser's print command; the page reflows into a résumé layout            |

## AI use

I used Claude as an assistant across this project: for first drafts of tricky parts such as
the case-study dialog, for accessibility reviews, for explanations of browser APIs I had not
used, and for tidying my notes into documentation. Every suggestion was tested at three screen
widths in both themes and edited before it stayed. The detailed log is in
[docs/ai-usage-report.md](docs/ai-usage-report.md).
