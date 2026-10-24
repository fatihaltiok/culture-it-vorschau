(function () {
  'use strict';
  const header = document.querySelector('.header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  function closeMenu() {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
  }
  header.classList.add('menu-ready');
  menu.hidden = false;
  menu.addEventListener('click', function () {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  window.matchMedia('(max-width: 700px)').addEventListener('change', closeMenu);

  const grid = document.querySelector('.tile-grid');
  // Seven-by-seven C. Each rectangle occupies one or two grid units.
  // These 26 disjoint rectangles form the C; all six brand colours recur.
  const cells = [
    [1,0,2,1],[3,0,1,1],[4,0,2,1],
    [0,1,1,1],[1,1,1,1],[2,1,1,1],[3,1,2,1],[5,1,2,1],
    [0,2,1,2],[1,2,1,1],[2,2,1,1],[6,2,1,1],
    [1,3,1,1],[0,4,1,1],[1,4,1,1],[2,4,1,1],[6,4,1,1],
    [0,5,1,1],[1,5,1,1],[2,5,1,1],[3,5,2,1],[5,5,2,1],
    [1,6,1,1],[2,6,1,1],[3,6,2,1],[5,6,1,1]
  ];
  const colors = ['#93C66E','#E1D25D','#DA6F81','#82C2E8','#7A9DB1','#CBA86F'];
  grid.replaceChildren();
  const tiles = cells.map(function (cell, index) {
    const tile = document.createElement('span');
    tile.className = 'tile';
    Object.assign(tile.style, {
      left: (cell[0] / 7 * 100) + '%', top: (cell[1] / 7 * 100) + '%',
      width: 'calc(' + (cell[2] / 7 * 100) + '% - 4px)',
      height: 'calc(' + (cell[3] / 7 * 100) + '% - 4px)',
      backgroundColor: colors[index % colors.length]
    });
    grid.appendChild(tile);
    return tile;
  });

  // Missing CDN libraries leave the complete, readable CSS end state intact.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add({
    desktop: '(min-width: 701px)',
    mobile: '(max-width: 700px)',
    motion: '(prefers-reduced-motion: no-preference)'
  }, function (context) {
    if (!context.conditions.motion) return;
    const mobile = context.conditions.mobile;
    let lenis;
    let ticker;
    if (window.Lenis) {
      lenis = new Lenis({ autoRaf: false, smoothWheel: true, anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      ticker = function (time) { lenis.raf(time * 1000); };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
    }
    const stage = document.querySelector('.gecko-stage');
    const panel = document.querySelector('.approach-inner');
    // Match the pin offset and available panel height to the actual header.
    function measureHeader() {
      panel.style.setProperty('--pin-header', header.getBoundingClientRect().height + 'px');
    }
    measureHeader();
    panel.classList.add('approach-animated');
    ScrollTrigger.addEventListener('refreshInit', measureHeader);
    const principles = gsap.utils.toArray('.principle');
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.approach',
        start: function () { return 'top ' + header.getBoundingClientRect().height + 'px'; },
        end: function () { return '+=' + Math.round(window.innerHeight * (mobile ? 1.65 : 2.25)); },
        pin: '.approach-inner', scrub: 0.7, invalidateOnRefresh: true
      }
    });
    gsap.set(grid, { opacity: 1 });
    gsap.set('.gecko', { opacity: 0, scale: 0.94 });
    gsap.set(principles, { opacity: 0, y: 18 });
    tiles.forEach(function (tile, index) {
      // Deterministic scattering keeps every resize and refresh reproducible.
      const angle = index * 2.39996;
      const rotation = (index % 2 ? 1 : -1) * (12 + index % 23);
      function scatter(axis) {
        // Bound the rotated rectangle, not just its unrotated centre.
        const radians = rotation * Math.PI / 180;
        const width = tile.offsetWidth;
        const height = tile.offsetHeight;
        const halfWidth = (Math.abs(Math.cos(radians)) * width
          + Math.abs(Math.sin(radians)) * height) * 0.65 / 2;
        const halfHeight = (Math.abs(Math.sin(radians)) * width
          + Math.abs(Math.cos(radians)) * height) * 0.65 / 2;
        const horizontal = axis === 'x';
        const centre = horizontal ? grid.offsetLeft + tile.offsetLeft + width / 2
          : grid.offsetTop + tile.offsetTop + height / 2;
        const extent = horizontal ? stage.clientWidth : stage.clientHeight;
        const half = horizontal ? halfWidth : halfHeight;
        const spread = horizontal ? Math.cos(angle) * extent * 0.29
          : Math.sin(angle) * extent * 0.27;
        return gsap.utils.clamp(half + 8, extent - half - 8, centre + spread) - centre;
      }
      timeline.fromTo(tile, {
        x: function () { return scatter('x'); },
        y: function () { return scatter('y'); },
        rotation: rotation, scale: 0.65
      }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1.5, ease: 'power2.inOut' }, (index % 5) * 0.035);
    });
    timeline.to(principles[0], { opacity: 1, y: 0, duration: 0.55 }, 0.45)
      .to(principles[1], { opacity: 1, y: 0, duration: 0.55 }, 1.05)
      .to(principles[2], { opacity: 1, y: 0, duration: 0.55 }, 1.65)
      .to(grid, { opacity: 0, duration: 0.8 }, 2.1)
      .to(tiles, { scale: 0.05, duration: 0.8 }, 2.1)
      .to('.gecko', { opacity: 1, scale: 1, duration: 0.8 }, 2.1)
      .to({}, { duration: 0.35 });
    // GSAP's matchMedia context reverts every inline state and pin on changes.
    return function () {
      ScrollTrigger.removeEventListener('refreshInit', measureHeader);
      panel.classList.remove('approach-animated');
      panel.style.removeProperty('--pin-header');
      if (ticker) gsap.ticker.remove(ticker);
      if (lenis) lenis.destroy();
    };
  });
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches) {
    const intro = gsap.from('.hero h1 .hero-line > .serif, .hero h1 .hero-line > .wide', {
      opacity: 0, y: 12, duration: 0.5, stagger: 0.08, ease: 'power1.out', clearProps: 'all'
    });
    reduced.addEventListener('change', function (event) {
      if (event.matches) { intro.progress(1).kill(); }
    });
  }
  if (document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });
}());
