(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.menu');
  const navigation = document.querySelector('#navigation');
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  }
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    navigation.classList.toggle('open', !expanded);
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
  const links = [...document.querySelectorAll('.chapter-nav a')];
  const sections = [...document.querySelectorAll('main > section')];
  const stage = document.querySelector('.stage');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function update() {
    queued = false;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= innerHeight * 0.45) current = section;
    }
    for (const link of links) {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    if (!motion.matches) {
      const progress = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.65)));
      stage.style.transform = `scale(${1 - progress * 0.075})`;
    } else stage.style.removeProperty('transform');
  }
  function configureMotion() {
    document.documentElement.classList.toggle('motion-ready', !motion.matches);
    update();
  }
  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', configureMotion);
  motion.addEventListener('change', configureMotion);
  configureMotion();
})();
