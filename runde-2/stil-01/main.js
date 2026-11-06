/* Entwurf 01 · Farbblock-Plakat
   1. Menü auf dem Handy
   2. Der Moment: Body-Hintergrund wechselt beim Scrollen weich von Fläche zu Fläche,
      die Überschriftzeilen schieben sich einmalig aus einer Maske nach oben.
   Bei prefers-reduced-motion: reduce bleibt alles im CSS-Grundzustand (keine Tweens, kein Lenis). */

(function () {
  'use strict';

  var kopf = document.querySelector('.kopf');
  var menue = document.querySelector('.kopf__menue');
  var nav = document.querySelector('.kopf__nav');

  if (menue && nav && kopf) {
    menue.addEventListener('click', function () {
      var offen = kopf.classList.toggle('kopf--offen');
      menue.setAttribute('aria-expanded', offen ? 'true' : 'false');
    });
    nav.addEventListener('click', function (ereignis) {
      if (ereignis.target.tagName === 'A') {
        kopf.classList.remove('kopf--offen');
        menue.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var reduziert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduziert || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var farben = {
    gelb: '#E0D25C',
    mint: '#8FC46C',
    blau: '#7A9DB1',
    orange: '#DBA36F'
  };

  var flaechen = Array.prototype.slice.call(document.querySelectorAll('.flaeche[data-farbe]'));
  if (!flaechen.length) {
    return;
  }

  // Ab jetzt trägt der Body die Farbe; die Flächen lassen sie durch (style.css: .js-bewegt).
  document.documentElement.classList.add('js-bewegt');
  gsap.set(document.body, { backgroundColor: farben[flaechen[0].getAttribute('data-farbe')] });

  // Sanftes Scrollen (Lenis), an den GSAP-Ticker gehängt.
  if (window.Lenis) {
    var lenis = new Lenis({ anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (zeit) {
      lenis.raf(zeit * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    document.documentElement.style.scrollBehavior = 'auto';
  }

  // Farbwechsel: Die Fläche, die die Bildschirmmitte berührt, bestimmt die Farbe.
  flaechen.forEach(function (flaeche) {
    var farbe = farben[flaeche.getAttribute('data-farbe')];
    ScrollTrigger.create({
      trigger: flaeche,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: function (selbst) {
        if (selbst.isActive) {
          gsap.to(document.body, {
            backgroundColor: farbe,
            duration: 0.9,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      }
    });
  });

  // Zeilen der Überschriften: Startzustand erst hier setzen, dann einmalig hereinschieben.
  document.querySelectorAll('.plakat').forEach(function (ueberschrift) {
    var zeilen = ueberschrift.querySelectorAll('.zeile > span');
    if (!zeilen.length) {
      return;
    }
    gsap.set(zeilen, { yPercent: 110 });
    gsap.to(zeilen, {
      yPercent: 0,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: ueberschrift,
        start: 'top 85%',
        once: true
      }
    });
  });

  // Nach dem Laden der Schriften und Bilder die Messpunkte neu setzen.
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });
})();
