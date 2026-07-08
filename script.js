(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const shell = document.querySelector('.page-shell');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => setNavOpen(!nav.classList.contains('is-open')));

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setNavOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setNavOpen(false);
    });

    window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => {
      if (event.matches) setNavOpen(false);
    });
  }

  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (shell) {
    if (prefersReducedMotion) {
      shell.classList.add('is-ready');
    } else {
      requestAnimationFrame(() => shell.classList.add('is-ready'));
    }
  }

  // Headings are intentionally excluded: they rely on CSS `text-wrap: balance`.
  // Tying/resizing headings can strand a short leading word (e.g. "The" above
  // "Storyline Difference"), so we only adjust body-level text here.
  const orphanSelectors = [
    '.page-main p',
    '.page-main li',
    '.page-main blockquote',
    '.page-main summary',
    '.page-main cite',
    '.nav-tagline',
    '.footer-bottom span',
  ].join(',');

  const MIN_FONT_SCALE = 0.8;
  const FONT_STEP = 0.02;

  function textNodesOf(el) {
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function tieLastWords(el) {
    const nodes = textNodesOf(el);
    const lastText = nodes[nodes.length - 1];
    if (!lastText) return;
    const text = lastText.textContent;
    const fixed = text.replace(/\s+(\S+)\s*$/, '\u00A0$1');
    if (fixed !== text) lastText.textContent = fixed;
  }

  function hasOrphan(el) {
    const range = document.createRange();
    const tops = [];
    textNodesOf(el).forEach((node) => {
      const t = node.textContent;
      const re = /\S+/g;
      let m;
      while ((m = re.exec(t))) {
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const rect = range.getBoundingClientRect();
        if (rect.width || rect.height) tops.push(Math.round(rect.top));
      }
    });
    if (tops.length < 2) return false;
    const lastTop = Math.max.apply(null, tops);
    const wordsOnLastLine = tops.filter((top) => Math.abs(top - lastTop) <= 2).length;
    return wordsOnLastLine < 2;
  }

  function fixElement(el) {
    el.style.fontSize = '';
    tieLastWords(el);
    if (!hasOrphan(el)) return;
    let scale = 1;
    while (scale > MIN_FONT_SCALE && hasOrphan(el)) {
      scale -= FONT_STEP;
      el.style.fontSize = (scale * 100).toFixed(1) + '%';
    }
  }

  function preventOrphans() {
    document.querySelectorAll(orphanSelectors).forEach(fixElement);
  }

  preventOrphans();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(preventOrphans);
  }
  let orphanTimer;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(orphanTimer);
      orphanTimer = setTimeout(preventOrphans, 150);
    },
    { passive: true }
  );

  const staggerGroups = document.querySelectorAll('.reveal-stagger');
  const revealItems = document.querySelectorAll('.reveal');

  function showAll() {
    staggerGroups.forEach((group) => group.classList.add('is-visible'));
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  if (prefersReducedMotion) {
    showAll();
    return;
  }

  if (!('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -24px 0px' }
  );

  function isPartiallyVisible(el) {
    const rect = el.getBoundingClientRect();
    const viewHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom > 24 && rect.top < viewHeight - 24;
  }

  function observeReveal(target) {
    if (isPartiallyVisible(target)) {
      target.classList.add('is-visible');
      return;
    }
    observer.observe(target);
  }

  staggerGroups.forEach((group) => observeReveal(group));
  revealItems.forEach((item) => {
    if (!item.closest('.reveal-stagger')) {
      observeReveal(item);
    }
  });
})();

// Remember where you left off on the FAQ page: when you follow a backlink and
// then return, restore the scroll position and which accordion item was open.
(function () {
  const accordion = document.querySelector('.faq-accordion');
  if (!accordion) return;

  const STORAGE_KEY = 'storyline:faq-state:' + location.pathname;
  const items = Array.from(accordion.querySelectorAll('.faq-details'));
  let restoring = false;

  function readState() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    if (restoring) return;
    try {
      const open = [];
      items.forEach((el, i) => {
        if (el.open) open.push(i);
      });
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ scrollY: window.scrollY, open: open })
      );
    } catch (e) {
      /* storage unavailable */
    }
  }

  function restoreState() {
    const state = readState();
    if (!state) return;

    restoring = true;

    if (Array.isArray(state.open)) {
      items.forEach((el, i) => {
        el.open = state.open.indexOf(i) !== -1;
      });
    }

    const targetY = typeof state.scrollY === 'number' ? state.scrollY : 0;
    // Scroll after layout settles (open panels + web fonts change height).
    requestAnimationFrame(() => {
      window.scrollTo(0, targetY);
      setTimeout(() => {
        window.scrollTo(0, targetY);
        restoring = false;
      }, 160);
    });
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Single-open accordion: opening one item closes any other open item.
  items.forEach((el) => {
    el.addEventListener('toggle', () => {
      if (restoring || !el.open) return;
      items.forEach((other) => {
        if (other !== el) other.open = false;
      });
    });
  });

  // Persist on accordion toggle (capture phase: the toggle event doesn't bubble)
  // and whenever the page is left or a link is followed.
  accordion.addEventListener('toggle', saveState, true);
  document.querySelectorAll('.page-main a[href], .site-footer a[href]').forEach((a) => {
    a.addEventListener('click', saveState);
  });
  window.addEventListener('pagehide', saveState);
  window.addEventListener('beforeunload', saveState);

  restoreState();
})();
