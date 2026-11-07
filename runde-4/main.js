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
