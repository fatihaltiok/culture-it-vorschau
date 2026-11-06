(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const button = document.querySelector('.menu');
  const navigation = document.querySelector('#navigation');
  const closeMenu = () => {
    button.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('open', open);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      button.focus();
    }
  });

  const field = document.querySelector('.pixel-transition');
  const pixels = [...field.children];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#7A9DB1', '#82C2E8', '#8FC46C'];
  let scheduled = false;
  let previous = [];
  const render = () => {
    scheduled = false;
    if (reducedMotion.matches) return;
    const rect = field.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
    pixels.forEach((pixel, i) => {
      const diagonal = ((i % 40) + Math.floor(i / 40) * 3) / 55;
      const phase = Math.max(0, Math.min(2, Math.floor(progress * 5 - diagonal * 2)));
      if (previous[i] !== phase) {
        pixel.style.backgroundColor = colors[phase];
        previous[i] = phase;
      }
    });
  };
  const update = () => {
    if (scheduled || reducedMotion.matches) return;
    scheduled = true;
    requestAnimationFrame(render);
  };
  const configure = () => {
    if (reducedMotion.matches) {
      pixels.forEach(pixel => pixel.style.removeProperty('background-color'));
      previous = [];
    } else update();
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  reducedMotion.addEventListener('change', configure);
  configure();
})();
