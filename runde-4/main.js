(() => {
  'use strict';
  document.documentElement.classList.add('has-js');

  /* Menü (Handy) */
  const menu = document.querySelector('.menue-knopf');
  const navigation = document.querySelector('#navigation');
  if (menu && navigation) {
    const schliessen = () => {
      menu.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('ist-offen');
    };
    menu.addEventListener('click', () => {
      const offen = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(offen));
      navigation.classList.toggle('ist-offen', offen);
    });
    navigation.addEventListener('click', e => { if (e.target.closest('a')) schliessen(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { schliessen(); menu.focus(); }
    });
  }

  /* Marker im h1 werden einmal aufgezogen (nur CSS-Übergang, bei reduzierter Bewegung sofort fertig) */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('marker-an')));

  /* Kopfzeile: ab ca. 8 px Scrollweg feiner Schatten (CSS-Klasse), passiv gelauscht */
  const kopf = document.querySelector('.kopf');
  if (kopf) {
    let wartet = false;
    const pruefe = () => { wartet = false; kopf.classList.toggle('ist-gescrollt', window.scrollY > 8); };
    window.addEventListener('scroll', () => { if (!wartet) { wartet = true; requestAnimationFrame(pruefe); } }, { passive: true });
    pruefe();
  }

  /* Marker unter den Abschnittsüberschriften: jede zeichnet einmal, wenn sie ins Bild kommt */
  const ueberschriften = document.querySelectorAll('h2[data-marker]');
  if ('IntersectionObserver' in window) {
    const beobachter = new IntersectionObserver((eintraege) => {
      eintraege.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('ist-gezeichnet'); beobachter.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.4 });
    ueberschriften.forEach(h => beobachter.observe(h));
  } else {
    ueberschriften.forEach(h => h.classList.add('ist-gezeichnet'));
  }

  /* Zertifikate: alle Gruppen auf einmal öffnen */
  const zahl = document.querySelector('.zert-zahl');
  const gruppen = document.querySelectorAll('.note-mehr');
  if (zahl && gruppen.length) {
    const knopf = document.querySelector('[data-alle]');
    if (!knopf) return;
    knopf.hidden = false;
    knopf.addEventListener('click', () => {
      const auf = knopf.textContent === 'Alle ansehen';
      gruppen.forEach(d => { d.open = auf; });
      knopf.textContent = auf ? 'Alle einklappen' : 'Alle ansehen';
    });
  }
})();
