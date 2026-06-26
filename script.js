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
