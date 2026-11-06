/* Entwurf 04 · Lernkarten
   1. Themen-Würfel: dreht sich beim Scrollen um 90° je Schritt, auf Tipp weiter, Farbpunkte wählen eine Seite.
   2. Workshops als Reiter-Karten: Klick auf den Titel klappt die Karte auf oder zu (ohne JS sind alle offen).
   3. Menü-Knopf auf dem Handy.
   Bei prefers-reduced-motion: reduce bleibt der Würfel stehen; CSS zeigt dann die Ersatzkarten. */
(function () {
  'use strict';

  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Würfel */
  var wuerfel = document.getElementById('wuerfel');
  var welt = document.getElementById('welt');
  var punkte = Array.prototype.slice.call(document.querySelectorAll('.punkt'));
  var SCHRITT = 120;          /* Pixel Scrollweg je Vierteldrehung */
  var scrollSchritt = 0;      /* aus scrollY abgeleitet */
  var tippVersatz = 0;        /* zusätzliche Vierteldrehungen durch Tipp oder Punkt */
  var winkelSchritte = 0;     /* fortlaufend, damit der Würfel nie zurückspringt */

  function seiteVon(schritte) {
    return ((schritte % 4) + 4) % 4;
  }

  function zeigeWuerfel() {
    var ziel = scrollSchritt + tippVersatz;
    if (ziel === winkelSchritte) { return; }
    winkelSchritte = ziel;
    wuerfel.style.setProperty('--ry', (-90 * winkelSchritte) + 'deg');
    var seite = seiteVon(winkelSchritte);
    punkte.forEach(function (p, i) {
      p.setAttribute('aria-pressed', i === seite ? 'true' : 'false');
    });
  }

  function beimScrollen() {
    var neu = Math.floor(window.scrollY / SCHRITT);
    if (neu !== scrollSchritt) {
      scrollSchritt = neu;
      zeigeWuerfel();
    }
  }

  if (wuerfel && welt && !reduziert) {
    var angefordert = false;
    window.addEventListener('scroll', function () {
      if (angefordert) { return; }
      angefordert = true;
      window.requestAnimationFrame(function () {
        angefordert = false;
        beimScrollen();
      });
    }, { passive: true });

    /* Chrome trifft nach einer 3D-Drehung teils die äußere Szene statt der Seite. */
    welt.addEventListener('click', function () {
      tippVersatz += 1;
      zeigeWuerfel();
    });

    punkte.forEach(function (p) {
      p.addEventListener('click', function () {
        var gewuenscht = parseInt(p.getAttribute('data-seite'), 10);
        var aktuell = seiteVon(scrollSchritt + tippVersatz);
        var vor = seiteVon(gewuenscht - aktuell);   /* 0 … 3 Vierteldrehungen vorwärts */
        if (vor === 0) { return; }
        tippVersatz += vor;
        zeigeWuerfel();
      });
    });

    beimScrollen();
  }

  /* 2. Reiter-Karten */
  var reiter = Array.prototype.slice.call(document.querySelectorAll('.reiter'));
  var koepfe = [];

  function setze(kopf, inhalt, offen) {
    kopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
    inhalt.hidden = !offen;
  }

  reiter.forEach(function (r, i) {
    var kopf = r.querySelector('.reiter-kopf');
    var inhalt = r.querySelector('.reiter-inhalt');
    if (!kopf || !inhalt) { return; }
    koepfe.push(kopf);
    setze(kopf, inhalt, i === 0);
    kopf.addEventListener('click', function () {
      setze(kopf, inhalt, kopf.getAttribute('aria-expanded') !== 'true');
    });
    kopf.addEventListener('keydown', function (e) {
      var n = koepfe.indexOf(kopf);
      var ziel = null;
      if (e.key === 'ArrowDown') { ziel = koepfe[(n + 1) % koepfe.length]; }
      if (e.key === 'ArrowUp') { ziel = koepfe[(n - 1 + koepfe.length) % koepfe.length]; }
      if (e.key === 'Home') { ziel = koepfe[0]; }
      if (e.key === 'End') { ziel = koepfe[koepfe.length - 1]; }
      if (ziel) { e.preventDefault(); ziel.focus(); }
    });
  });

  /* Beim Sprung aus dem Menü auf einen Workshop-Anker bleibt alles, wie es ist;
     ein Anker in einer zugeklappten Karte (z. B. aus einer Mail) öffnet sie. */
  function oeffneZiel() {
    var id = window.location.hash.replace('#', '');
    if (!id) { return; }
    var ziel = document.getElementById(id);
    if (!ziel) { return; }
    var karte = ziel.closest ? ziel.closest('.reiter') : null;
    if (karte) {
      setze(karte.querySelector('.reiter-kopf'), karte.querySelector('.reiter-inhalt'), true);
    }
  }
  window.addEventListener('hashchange', oeffneZiel);
  oeffneZiel();

  /* 3. Menü auf dem Handy */
  var leiste = document.querySelector('.leiste');
  var menueKnopf = document.querySelector('.leiste-menue');
  if (leiste && menueKnopf) {
    menueKnopf.addEventListener('click', function () {
      var offen = leiste.classList.toggle('offen');
      menueKnopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
    });
    leiste.querySelectorAll('.leiste-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        leiste.classList.remove('offen');
        menueKnopf.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
