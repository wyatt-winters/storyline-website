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

  const orphanSelectors = [
    '.page-main p',
    '.page-main li',
    '.page-main blockquote',
    '.page-main h1',
    '.page-main h2',
    '.page-main h3',
    '.page-main h4',
    '.page-main summary',
    '.page-main cite',
    '.nav-tagline',
    '.footer-bottom span',
    '.eyebrow',
  ].join(',');

  function tieOrphans(el) {
    if (el.dataset.orphansFixed) return;

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

    let lastText = null;
    while (walker.nextNode()) lastText = walker.currentNode;
    if (!lastText) return;

    const text = lastText.textContent;
    const fixed = text.replace(/\s+(\S+)\s+(\S+)\s*$/, '\u00A0$1\u00A0$2');
    if (fixed === text) return;

    lastText.textContent = fixed;
    el.dataset.orphansFixed = '';
  }

  document.querySelectorAll(orphanSelectors).forEach(tieOrphans);

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
