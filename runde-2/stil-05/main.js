/* Entwurf 05 · Magazin-Cover
   Ohne JavaScript ist alles lesbar: die Cover-Reihe ist eine wischbare Reihe (CSS-Grundzustand).
   Mit JavaScript, breitem Fenster und ohne reduzierte Bewegung wird daraus der angeheftete Abschnitt,
   der beim Scrollen nach unten waagerecht läuft. */
(function () {
  'use strict';

  var html = document.documentElement;
  html.classList.add('has-js');

  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Menü auf dem Handy */
  var masthead = document.querySelector('.masthead');
  var menueKnopf = document.querySelector('.masthead__menu');
  if (masthead && menueKnopf) {
    menueKnopf.addEventListener('click', function () {
      var offen = masthead.classList.toggle('is-open');
      menueKnopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
    });
    masthead.querySelectorAll('.masthead__nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        masthead.classList.remove('is-open');
        menueKnopf.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Zähler der Cover-Reihe im Wisch-Modus (Handy, ohne Anheften) */
  var cover = document.querySelector('.cover');
  var track = document.querySelector('.cover__track');
  var titel = track ? Array.prototype.slice.call(track.querySelectorAll('.titel')) : [];
  var zaehler = document.querySelector('.cover__aktuell');

  function zeigeNummer(i) {
    if (!zaehler) { return; }
    var n = Math.min(titel.length, Math.max(1, i + 1));
    zaehler.textContent = n < 10 ? '0' + n : String(n);
  }

  if (track && titel.length) {
    track.addEventListener('scroll', function () {
      if (cover.classList.contains('is-pinned')) { return; }
      var schritt = titel[0].offsetWidth + (titel[1] ? titel[1].offsetLeft - titel[0].offsetLeft - titel[0].offsetWidth : 0);
      zeigeNummer(Math.round(track.scrollLeft / Math.max(1, schritt)));
    }, { passive: true });
  }

  /* Der Moment: angeheftete, waagerecht laufende Cover-Reihe */
  var hatGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!hatGsap || !track || !titel.length) { return; }

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  var mm = gsap.matchMedia();

  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      html.classList.add('has-lenis');
    }

    cover.classList.add('is-pinned');
    track.scrollLeft = 0;

    function strecke() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    var tween = gsap.to(track, {
      x: function () { return -strecke(); },
      ease: 'none',
      scrollTrigger: {
        trigger: cover,
        start: 'top top+=72',
        end: function () { return '+=' + Math.round(strecke() * 1.5); },
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (st) {
          zeigeNummer(Math.round(st.progress * (titel.length - 1)));
        }
      }
    });

    /* Ankerlinks: Ziel als Zahl übergeben, damit der Anheft-Abstand mitgerechnet wird */
    function springe(e) {
      var ziel = document.querySelector(this.getAttribute('href'));
      if (!ziel || !lenis) { return; }
      e.preventDefault();
      var y = ziel.getBoundingClientRect().top + window.scrollY - 64;
      lenis.scrollTo(Math.max(0, Math.round(y)), { duration: 1.4 });
    }
    var anker = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));
    anker.forEach(function (a) { a.addEventListener('click', springe); });

    return function () {
      anker.forEach(function (a) { a.removeEventListener('click', springe); });
      tween.scrollTrigger && tween.scrollTrigger.kill();
      tween.kill();
      gsap.set(track, { clearProps: 'transform' });
      cover.classList.remove('is-pinned');
      if (lenis) { lenis.destroy(); lenis = null; html.classList.remove('has-lenis'); }
      zeigeNummer(0);
    };
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  reduziert.addEventListener('change', function () { ScrollTrigger.refresh(); });
})();
