(() => {
  'use strict';
  document.documentElement.classList.add('has-js');
  const menu = document.querySelector('.menu-button');
  const navigation = document.querySelector('#navigation');
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('words-visible');
      observer.unobserve(el);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('[data-words]').forEach(el => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    const words = text.split(' ');
    const fragment = document.createDocumentFragment();
    words.forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      // Every sentence finishes within 900 ms, regardless of word count.
      span.style.setProperty('--delay', `${index * Math.min(30, 420 / words.length)}ms`);
      fragment.append(span);
      if (index < words.length - 1) fragment.append(document.createTextNode(' '));
    });
    el.replaceChildren(fragment);
    el.classList.add('words-pending');
    observer.observe(el);
  });
  // Observe unclipped parents: a fully closed clip-path has no intersection area.
  const curtainObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.curtain-pending').forEach(el => {
        el.classList.add('curtain-visible');
      });
      curtainObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.curtain').forEach(el => {
    el.classList.add('curtain-pending');
    curtainObserver.observe(el.parentElement);
  });
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    curtainObserver.disconnect();
    document.querySelectorAll('.words-pending, .curtain-pending').forEach(el => {
      el.classList.remove('words-pending', 'curtain-pending', 'words-visible', 'curtain-visible');
    });
  });
})();
