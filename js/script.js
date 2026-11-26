/* ==========================================================================
   Jomanah Alshammary — portfolio scripts (Assignment 3)
   1. State (remembered in localStorage)
   2. Theme toggle
   3. Mobile navigation
   4. Projects: filter + sort + search, notes popup
   5. In-class exercises: show/hide section
   6. Live weather and local time (Open-Meteo)
   7. Contact form: topic-aware, multi-step validation, saved draft
   8. Scroll reveal
   9. Footer year
   10. Project image viewer (lightbox)
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;

  /* ------------------------------------------------------------------
     1. State
     Everything the page remembers between visits lives in one object
     and one localStorage key. Reading and writing go through these two
     helpers so the rest of the code never touches storage directly.
     (The theme keeps its own key because the inline <head> script reads
     it before this file loads; the form draft has its own key too.)
     ------------------------------------------------------------------ */
  var STATE_KEY = 'portfolio-state';
  var defaults = { filter: 'All', sort: 'course', logOpen: false };
  var state = loadState();

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
      return Object.assign({}, defaults, saved);
    } catch (error) {
      return Object.assign({}, defaults);
    }
  }

  function setState(patch) {
    Object.assign(state, patch);
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (error) {
      /* Storage can be unavailable (private mode, quota). The page still
         works; it just won't remember choices. */
    }
  }

  /* Small cache for API responses so a reload doesn't refetch immediately */
  function cacheGet(key) {
    try {
      var entry = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (entry && Date.now() - entry.time < CONFIG.cacheMinutes * 60 * 1000) {
        return entry.data;
      }
    } catch (error) { /* ignore */ }
    return null;
  }

  function cacheSet(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), data: data }));
    } catch (error) { /* ignore */ }
  }

  /* fetch() with a timeout so a hanging request can't leave "Loading…"
     on screen forever */
  function fetchJson(url, timeoutMs) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs || 8000);
    return fetch(url, { signal: controller.signal })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      })
      .finally(function () { clearTimeout(timer); });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------
     2. Theme toggle
     ------------------------------------------------------------------ */
  var themeToggle = document.getElementById('theme-toggle');

  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit) {
      return explicit;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  themeToggle.addEventListener('click', function () {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
  themeToggle.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');

  /* ------------------------------------------------------------------
     3. Navigation
     ------------------------------------------------------------------ */
  var menuToggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');
  var navLinks = nav.querySelectorAll('a[href^="#"]');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  menuToggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      setMenu(false);
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  // Highlight the nav link for the section currently in view
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          var current = link.getAttribute('href') === '#' + id;
          link.classList.toggle('is-current', current);
          if (current) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) {
        sectionObserver.observe(section);
      }
    });
  }

  /* ------------------------------------------------------------------
     4. Projects
     Filter (chip) → search (text) → sort (select), in that order.
     Filter and sort are remembered in state; the search box is not,
     because a remembered search is confusing on the next visit.
     ------------------------------------------------------------------ */
  var projectList = document.getElementById('project-list');
  var filterBar = document.getElementById('project-filters');
  var sortSelect = document.getElementById('project-sort');
  var searchInput = document.getElementById('project-search');
  var emptyState = document.getElementById('project-empty');
  var resultCount = document.getElementById('project-count');
  var clearButton = document.getElementById('project-clear');
  var query = '';
  var visible = []; // the projects currently shown, in display order

  // Guard against a remembered filter/sort that no longer exists in data
  if (['All'].concat(PROJECT_FILTERS).indexOf(state.filter) === -1) {
    setState({ filter: 'All' });
  }
  if (!PROJECT_SORTS.some(function (s) { return s.id === state.sort; })) {
    setState({ sort: 'course' });
  }

  ['All'].concat(PROJECT_FILTERS).forEach(function (name) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = name;
    chip.dataset.filter = name;
    filterBar.appendChild(chip);
  });

  PROJECT_SORTS.forEach(function (sort) {
    var option = document.createElement('option');
    option.value = sort.id;
    option.textContent = sort.label;
    sortSelect.appendChild(option);
  });

  function syncControls() {
    Array.prototype.forEach.call(filterBar.children, function (chip) {
      var active = chip.dataset.filter === state.filter;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    sortSelect.value = state.sort;
  }

  function projectTemplate(project) {
    var tags = project.tags.map(function (tag) { return '<li>' + escapeHtml(tag) + '</li>'; }).join('');
    return (
      '<article class="card project-card" data-id="' + project.id + '">' +
        '<button type="button" class="project-media" data-open="' + project.id + '" aria-label="Open case study: ' + escapeHtml(project.title) + '">' +
          '<img src="' + project.image + '" alt="" width="1200" height="750" loading="lazy" decoding="async">' +
        '</button>' +
        '<div class="project-body">' +
          '<span class="badge' + (project.kind === 'Project' ? ' badge-accent' : '') + '">' + escapeHtml(project.kind) + '</span>' +
          '<h3><button type="button" class="title-button" data-open="' + project.id + '">' + escapeHtml(project.title) + '</button></h3>' +
          '<p class="project-summary">' + escapeHtml(project.summary) + '</p>' +
          '<ul class="tags">' + tags + '</ul>' +
          '<button type="button" class="details-toggle" data-open="' + project.id + '">' +
            '<span>View case study</span>' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
          '</button>' +
        '</div>' +
      '</article>'
    );
  }

  function visibleProjects() {
    var sort = PROJECT_SORTS.filter(function (s) { return s.id === state.sort; })[0];

    return PROJECTS
      .filter(function (project) {
        // Step 1: chip filter
        if (state.filter !== 'All' && project.tags.indexOf(state.filter) === -1) {
          return false;
        }
        // Step 2: free-text search across the visible fields
        if (!query) {
          return true;
        }
        var haystack = [project.title, project.summary, project.kind].concat(project.tags).join(' ').toLowerCase();
        return haystack.indexOf(query) !== -1;
      })
      .slice() // copy before sorting so PROJECTS itself keeps course order
      .sort(sort.compare); // Step 3: order the survivors
  }

  function renderProjects() {
    visible = visibleProjects();
    projectList.innerHTML = visible.map(projectTemplate).join('');

    var narrowed = query || state.filter !== 'All';
    emptyState.hidden = visible.length !== 0;
    clearButton.hidden = !narrowed;
    resultCount.textContent = narrowed
      ? 'Showing ' + visible.length + ' of ' + PROJECTS.length
      : PROJECTS.length + ' pieces of work';

    Array.prototype.forEach.call(projectList.children, function (item, index) {
      item.style.animationDelay = (index * 60) + 'ms';
    });
  }

  filterBar.addEventListener('click', function (event) {
    var chip = event.target.closest('.chip');
    if (chip) {
      setState({ filter: chip.dataset.filter });
      syncControls();
      renderProjects();
    }
  });

  sortSelect.addEventListener('change', function () {
    setState({ sort: sortSelect.value });
    renderProjects();
  });

  searchInput.addEventListener('input', function () {
    query = searchInput.value.trim().toLowerCase();
    renderProjects();
  });

  function resetProjectControls() {
    query = '';
    searchInput.value = '';
    setState({ filter: 'All' });
    syncControls();
    renderProjects();
  }
  clearButton.addEventListener('click', resetProjectControls);
  document.getElementById('project-empty-reset').addEventListener('click', resetProjectControls);

  syncControls();
  renderProjects();

  /* ------------------------------------------------------------------
     5. Case-study viewer
     A native <dialog>: showModal() gives us focus trapping, Escape to
     close and a backdrop. We add: content filling, previous/next within
     the current list order (buttons and arrow keys), returning focus to
     the element that opened it, and a #work/<id> hash so a case study
     can be linked to directly.
     ------------------------------------------------------------------ */
  var dialog = document.getElementById('case-dialog');
  var caseMedia = document.getElementById('case-media');
  var casePrev = document.getElementById('case-prev');
  var caseNext = document.getElementById('case-next');
  var openedFrom = null;
  var currentId = null;

  function projectById(id) {
    return PROJECTS.filter(function (p) { return p.id === id; })[0] || null;
  }

  // Every picture in the case study sits in a button, so it can be opened
  // full size in the image viewer (section 11) by mouse or keyboard.
  function mediaButton(src, alt, className, width, height) {
    return (
      '<button type="button" class="case-media-button" aria-label="View ' + alt + ' full size">' +
        '<img class="' + className + '" src="' + src + '" alt="' + alt + '" width="' + width + '" height="' + height + '" loading="lazy" decoding="async">' +
      '</button>'
    );
  }

  function fillCase(project) {
    currentId = project.id;

    // Media: a tall poster, or a gallery of slides
    if (project.poster) {
      caseMedia.innerHTML = mediaButton(project.poster, 'Process poster for ' + escapeHtml(project.title), 'case-poster', 1000, 1414);
    } else if (project.gallery) {
      caseMedia.innerHTML = '<div class="case-gallery">' + project.gallery.map(function (src, index) {
        return mediaButton(src, 'Slide ' + (index + 1) + ' from ' + escapeHtml(project.title), 'case-slide', 1200, 675);
      }).join('') + '</div>';
    } else {
      caseMedia.innerHTML = mediaButton(project.image, 'Cover image for ' + escapeHtml(project.title), 'case-cover', 1200, 750);
    }

    document.getElementById('case-meta').textContent = project.kind + ' · ' + project.year;
    document.getElementById('case-title').textContent = project.title;
    document.getElementById('case-summary').textContent = project.summary;
    document.getElementById('case-process').textContent = project.process;
    document.getElementById('case-learning').textContent = project.learning;
    document.getElementById('case-details').innerHTML = (project.details || []).map(function (row) {
      return '<div><dt>' + escapeHtml(row[0]) + '</dt><dd>' + escapeHtml(row[1]) + '</dd></div>';
    }).join('');
    document.getElementById('case-tags').innerHTML = project.tags.map(function (tag) {
      return '<li>' + escapeHtml(tag) + '</li>';
    }).join('');

    // Previous / next follow whatever order and filter the list is showing
    var list = visible.length ? visible : PROJECTS;
    var index = list.indexOf(project);
    casePrev.disabled = index <= 0;
    caseNext.disabled = index === -1 || index >= list.length - 1;
    document.getElementById('case-position').textContent = index === -1 ? '' : (index + 1) + ' of ' + list.length;

    dialog.querySelector('.case-inner').scrollTop = 0;
  }

  function openCase(id, trigger) {
    var project = projectById(id);
    if (!project) {
      return;
    }
    openedFrom = trigger || null;
    fillCase(project);
    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add('has-dialog');
    }
    history.replaceState(null, '', '#work/' + id);
  }

  function stepCase(direction) {
    var list = visible.length ? visible : PROJECTS;
    var index = list.indexOf(projectById(currentId));
    var next = list[index + direction];
    if (next) {
      openCase(next.id, openedFrom);
    }
  }

  projectList.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-open]');
    if (trigger) {
      openCase(trigger.dataset.open, trigger);
    }
  });

  document.getElementById('case-close').addEventListener('click', function () { dialog.close(); });
  casePrev.addEventListener('click', function () { stepCase(-1); });
  caseNext.addEventListener('click', function () { stepCase(1); });

  // Click on the backdrop (outside .case-inner) closes
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight') { stepCase(1); }
    if (event.key === 'ArrowLeft') { stepCase(-1); }
  });

  dialog.addEventListener('close', function () {
    document.body.classList.remove('has-dialog');
    currentId = null;
    history.replaceState(null, '', location.pathname + location.search + '#projects');
    if (openedFrom && document.body.contains(openedFrom)) {
      openedFrom.focus();
    } else {
      // The trigger may have been re-rendered; fall back to the same project's card
      var card = projectList.querySelector('.title-button');
      if (card) { card.focus(); }
    }
  });

  // Deep link: /#work/hidden-gate opens that case study on load, and the
  // hash is watched afterwards so back/forward and pasted links keep working.
  // (openCase/close use replaceState, which doesn't fire hashchange, so this
  // only reacts to changes made from outside.)
  function openFromHash() {
    var match = /^#work\/([\w-]+)$/.exec(location.hash);
    if (match && projectById(match[1])) {
      if (match[1] !== currentId) {
        openCase(match[1], null);
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();

  /* ------------------------------------------------------------------
     6. In-class exercises
     ------------------------------------------------------------------ */
  var logToggle = document.getElementById('log-toggle');
  var logList = document.getElementById('log-list');

  logList.innerHTML = EXERCISES.map(function (exercise, index) {
    var images = exercise.images.map(function (src) {
      return '<img src="' + src + '" alt="" width="1200" height="800" loading="lazy" decoding="async">';
    }).join('');
    return (
      '<details class="log-item">' +
        '<summary>' +
          '<span class="log-index">' + String(index + 1).padStart(2, '0') + '</span>' +
          '<span class="log-title">' + escapeHtml(exercise.title) + '</span>' +
          '<span class="log-tools">' + exercise.tools.map(escapeHtml).join(' · ') + '</span>' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
        '</summary>' +
        '<div class="log-body">' +
          '<p class="log-objective"><strong>Objective:</strong> ' + escapeHtml(exercise.objective) + '</p>' +
          '<p>' + escapeHtml(exercise.brief) + '</p>' +
          '<p class="log-learning"><strong>Took away:</strong> ' + escapeHtml(exercise.learning) + '</p>' +
          (images ? '<div class="log-gallery log-gallery-' + exercise.images.length + '">' + images + '</div>' : '') +
        '</div>' +
      '</details>'
    );
  }).join('');

  function renderLog() {
    logList.hidden = !state.logOpen;
    logToggle.setAttribute('aria-expanded', String(state.logOpen));
    logToggle.querySelector('span').textContent = state.logOpen
      ? 'Hide the practice log'
      : 'Show all ' + EXERCISES.length + ' exercises';
  }

  logToggle.addEventListener('click', function () {
    setState({ logOpen: !state.logOpen });
    renderLog();
  });
  renderLog();

  /* ------------------------------------------------------------------
     7. Live weather and local time
     ------------------------------------------------------------------ */
  var nowLine = document.getElementById('now-line');
  var loc = CONFIG.location;

  // WMO weather interpretation codes → short descriptions
  function describeWeather(code, isDay) {
    if (code === 0) { return isDay ? 'clear skies' : 'a clear night'; }
    if (code === 1) { return 'mostly clear'; }
    if (code === 2) { return 'partly cloudy'; }
    if (code === 3) { return 'overcast'; }
    if (code === 45 || code === 48) { return 'foggy'; }
    if (code >= 51 && code <= 57) { return 'drizzle'; }
    if (code >= 61 && code <= 67) { return 'rain'; }
    if (code >= 71 && code <= 77) { return 'snow'; }
    if (code >= 80 && code <= 82) { return 'showers'; }
    if (code >= 95) { return 'thunderstorms'; }
    return 'changeable weather';
  }

  function localTime() {
    return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone: loc.timezone }).format(new Date());
  }

  var weatherText = null; // null = not loaded yet, '' = failed

  function renderNow() {
    var text = 'It’s ' + localTime() + ' in ' + loc.name;
    if (weatherText === null) {
      text += ' — checking the weather…';
    } else if (weatherText) {
      text += ', ' + weatherText + '.';
    } else {
      text += '. (Weather is unavailable right now.)';
    }
    nowLine.textContent = text;
  }

  function loadWeather() {
    var cached = cacheGet('weather');
    if (cached) {
      weatherText = cached;
      renderNow();
      return;
    }
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + loc.latitude + '&longitude=' + loc.longitude +
      '&current=temperature_2m,weather_code,is_day&timezone=' + encodeURIComponent(loc.timezone);

    fetchJson(url)
      .then(function (data) {
        var c = data.current;
        weatherText = Math.round(c.temperature_2m) + '° and ' + describeWeather(c.weather_code, c.is_day === 1);
        cacheSet('weather', weatherText);
      })
      .catch(function () {
        weatherText = '';
      })
      .then(renderNow);
  }

  renderNow();
  loadWeather();
  setInterval(renderNow, 60 * 1000);


  /* ------------------------------------------------------------------
     8. Contact
     ------------------------------------------------------------------ */

  // Copy email with a short confirmation on the button itself
  var copyButton = document.getElementById('copy-email');
  copyButton.addEventListener('click', function () {
    var value = copyButton.dataset.copy;
    var done = function (ok) {
      copyButton.textContent = ok ? 'Copied' : 'Press Ctrl+C';
      copyButton.classList.toggle('is-done', ok);
      setTimeout(function () {
        copyButton.textContent = 'Copy';
        copyButton.classList.remove('is-done');
      }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
    } else {
      // Older browsers: select the address so the visitor can copy it
      var range = document.createRange();
      range.selectNodeContents(document.getElementById('email-link'));
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      done(false);
    }
  });

  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var draftNote = document.getElementById('form-draft');
  var messageHint = document.getElementById('message-hint');
  var DRAFT_KEY = 'contact-draft';
  var fields = ['name', 'email', 'topic', 'message'];

  var TOPICS = {
    collaboration: {
      hint: 'Tell me a little about the project and what kind of help you’re after.',
      reply: 'I’d love to hear more about the collaboration.'
    },
    internship: {
      hint: 'A sentence about the role and the timeframe is plenty to start.',
      reply: 'I’ll get back to you about the opportunity.'
    },
    feedback: {
      hint: 'Mention which piece of work you’re responding to.',
      reply: 'Thank you for taking the time to share feedback.'
    },
    other: {
      hint: 'Anything goes.',
      reply: 'I’ll reply as soon as I can.'
    }
  };

  function updateTopicHint() {
    var topic = TOPICS[form.elements.topic.value];
    messageHint.textContent = topic ? topic.hint : 'Pick a topic above and I’ll suggest what to include.';
  }
  form.elements.topic.addEventListener('change', updateTopicHint);

  function setFieldError(name, message) {
    var input = form.elements[name];
    var error = document.getElementById(name + '-error');
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    input.closest('.field').classList.toggle('has-error', Boolean(message));
    error.textContent = message;
  }

  var REQUIRED_MESSAGES = {
    name: 'Please tell me your name.',
    email: 'Please add your email so I can reply.',
    topic: 'Please choose what this is about.',
    message: 'Please write a short message.'
  };

  function validateField(name) {
    var value = form.elements[name].value.trim();

    // Step 1: presence
    if (!value) {
      setFieldError(name, REQUIRED_MESSAGES[name]);
      return false;
    }
    // Step 2: shape
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldError(name, 'That doesn’t look like a complete email address.');
      return false;
    }
    if (name === 'message' && value.length < 10) {
      setFieldError(name, 'A little more detail helps — at least 10 characters.');
      return false;
    }
    setFieldError(name, '');
    return true;
  }

  fields.forEach(function (name) {
    form.elements[name].addEventListener('blur', function () {
      if (form.elements[name].value.trim()) {
        validateField(name);
      }
    });
  });

  function saveDraft() {
    var draft = {};
    fields.forEach(function (name) { draft[name] = form.elements[name].value; });
    var hasContent = fields.some(function (name) { return draft[name].trim(); });
    try {
      if (hasContent) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        draftNote.textContent = 'Draft saved on this device.';
      } else {
        localStorage.removeItem(DRAFT_KEY);
        draftNote.textContent = '';
      }
    } catch (error) {
      draftNote.textContent = 'Couldn’t save a draft in this browser.';
    }
  }

  function restoreDraft() {
    try {
      var saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (!saved) {
        return;
      }
      fields.forEach(function (name) { form.elements[name].value = saved[name] || ''; });
      draftNote.textContent = 'Restored your unsent draft.';
    } catch (error) {
      localStorage.removeItem(DRAFT_KEY);
    }
  }

  var draftTimer;
  form.addEventListener('input', function () {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 400);
  });

  restoreDraft();
  updateTopicHint();

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var allValid = fields.map(validateField).every(Boolean);
    status.className = 'form-status';

    if (!allValid) {
      status.textContent = 'Please fix the highlighted fields and try again.';
      status.classList.add('is-error', 'is-shown');
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    var name = form.elements.name.value.trim();
    var topic = TOPICS[form.elements.topic.value];

    status.textContent = 'Thanks, ' + name + '. ' + topic.reply + ' Your message has been noted.';
    status.classList.add('is-success', 'is-shown');

    form.reset();
    fields.forEach(function (field) { setFieldError(field, ''); });
    localStorage.removeItem(DRAFT_KEY);
    draftNote.textContent = '';
    updateTopicHint();
  });

  /* ------------------------------------------------------------------
     9. Scroll reveal and footer year
     ------------------------------------------------------------------ */
  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) { observer.observe(item); });

    // Safety net for jumps (anchor links, restored scroll position): anything
    // already above the fold is shown without waiting for the observer
    window.addEventListener('scroll', function () {
      revealItems.forEach(function (item) {
        if (!item.classList.contains('is-visible') && item.getBoundingClientRect().top < window.innerHeight) {
          item.classList.add('is-visible');
        }
      });
    }, { passive: true });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     Typing effect for the hero title
     ------------------------------------------------------------------ */
  var heroTitle = document.getElementById('hero-title');
  if (heroTitle && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var fullText = heroTitle.textContent.trim();
    var typed = 0;
    heroTitle.setAttribute('aria-label', fullText);
    heroTitle.textContent = '';
    heroTitle.classList.add('is-typing');
    setTimeout(function typeNext() {
      typed += 1;
      heroTitle.textContent = fullText.slice(0, typed);
      if (typed < fullText.length) {
        setTimeout(typeNext, 80);
      }
    }, 400);
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     10. Image viewer
     Clicking a picture inside the case study opens it full size in a
     second <dialog>, stacked on top of the first one. Nested modals are
     allowed: the top layer keeps them in order, so Escape closes only
     the viewer and the case study stays where it was. Previous / next
     walk the pictures of the case study that is currently open.
     ------------------------------------------------------------------ */
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-image');
  var lightboxTitle = document.getElementById('lightbox-title');
  var lightboxPosition = document.getElementById('lightbox-position');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var shots = [];
  var shotIndex = 0;
  var lightboxOpener = null;

  function showShot(index) {
    if (!shots.length) {
      return;
    }
    // Wrap around, so the arrows never dead-end
    shotIndex = (index + shots.length) % shots.length;

    var button = shots[shotIndex];
    var image = button.querySelector('img');

    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxTitle.textContent = image.alt;
    lightboxPosition.textContent = (shotIndex + 1) + ' of ' + shots.length;

    // One picture on its own needs no navigation
    var single = shots.length < 2;
    lightboxPrev.hidden = single;
    lightboxNext.hidden = single;
  }

  function openLightbox(button) {
    shots = Array.prototype.slice.call(caseMedia.querySelectorAll('.case-media-button'));
    var index = shots.indexOf(button);
    if (index === -1) {
      return;
    }
    lightboxOpener = button;
    showShot(index);
    if (!lightbox.open) {
      lightbox.showModal();
    }
  }

  caseMedia.addEventListener('click', function (event) {
    var button = event.target.closest('.case-media-button');
    if (button) {
      openLightbox(button);
    }
  });

  document.getElementById('lightbox-close').addEventListener('click', function () {
    lightbox.close();
  });
  lightboxPrev.addEventListener('click', function () { showShot(shotIndex - 1); });
  lightboxNext.addEventListener('click', function () { showShot(shotIndex + 1); });

  // Anything outside the picture itself is backdrop, so a click there closes
  lightbox.addEventListener('click', function (event) {
    var target = event.target;
    if (
      target === lightbox ||
      target.classList.contains('lightbox-inner') ||
      target.classList.contains('lightbox-figure')
    ) {
      lightbox.close();
    }
  });

  lightbox.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      showShot(shotIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      showShot(shotIndex + 1);
    }
  });

  lightbox.addEventListener('close', function () {
    // The case study may have moved to another project while the viewer
    // was open, so only return focus if the button is still on the page
    if (lightboxOpener && document.body.contains(lightboxOpener)) {
      lightboxOpener.focus();
    }
    lightboxOpener = null;
  });

  // Stepping to another case study underneath would leave a stale picture
  dialog.addEventListener('close', function () {
    if (lightbox.open) {
      lightbox.close();
    }
  });
})();
