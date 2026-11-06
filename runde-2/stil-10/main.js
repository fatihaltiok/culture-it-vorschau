(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('open', open);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menu.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('open');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      menu.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('open');
      menu.focus();
    }
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const drawing = document.querySelector('.hero-drawing');
  const guides = drawing.querySelector('.guides');
  const dimensions = drawing.querySelector('.dimensions');
  const fills = [...drawing.querySelectorAll('.fill')];
  const clamp = (value) => Math.max(0, Math.min(1, value));
  let scheduled = false;
  function render() {
    scheduled = false;
    if (motion.matches) {
      guides.style.removeProperty('opacity');
      dimensions.style.removeProperty('opacity');
      fills.forEach((fill) => fill.style.removeProperty('opacity'));
      return;
    }
    // Konturen und ein Baustein sind von Anfang an vollständig sichtbar.
    // Scrollen ergänzt die übrigen Farben und die Maßanmerkungen.
    const distance = Math.min(window.innerHeight * .8, 480);
    const progress = clamp(window.scrollY / distance);
    guides.style.opacity = String(.2 + progress * .08);
    dimensions.style.opacity = String(.35 + progress * .65);
    fills.forEach((fill, index) => {
      fill.style.opacity = String(index === 0 ? 1 : clamp(progress * 1.4 - (index - 1) * .12));
    });
  }
  function requestRender() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(render);
    }
  }
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  motion.addEventListener('change', requestRender);
  render();
})();
