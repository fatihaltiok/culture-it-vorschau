(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.menu');
  const navigation = document.querySelector('#navigation');
  menu.hidden = false;
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('open', open);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.querySelector('.stage');
  let queued = false;
  const render = () => {
    queued = false;
    const progress = reduced.matches ? 1 : Math.min(1, Math.max(0, window.scrollY / 380));
    stage.style.setProperty('--spread', progress.toFixed(3));
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(render);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  reduced.addEventListener('change', render);
  render();
})();
