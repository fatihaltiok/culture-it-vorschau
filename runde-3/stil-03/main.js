/* Entwurf 03 · Skizzenbuch / Flipchart
   1. Menü auf dem Handy
   2. Der Moment: Tinte zeichnet sich beim Scrollen (stroke-dashoffset), Marker wischen hinter die Wörter.
      Ohne JS und bei reduzierter Bewegung bleibt alles fertig gezeichnet (CSS-Grundzustand). */
(function () {
  "use strict";

  var html = document.documentElement;
  html.classList.add("js");

  /* ---------- Menü ---------- */
  var knopf = document.querySelector(".menu-knopf");
  var nav = document.getElementById("hauptnav");
  if (knopf && nav) {
    knopf.addEventListener("click", function () {
      var offen = nav.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("offen");
        knopf.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Der Moment ---------- */
  var reduziert = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduziert.matches) return;

  var vh = window.innerHeight;
  var pfade = [];   // { el, len, start: y im Dokument, ende }
  var marker = [];  // { el, start, ende }

  function docTop(el) {
    return el.getBoundingClientRect().top + window.pageYOffset;
  }

  function sammeln() {
    pfade = [];
    marker = [];
    var svgs = document.querySelectorAll("svg.sk");
    for (var i = 0; i < svgs.length; i++) {
      var svg = svgs[i];
      if (!svg.offsetParent && svg.getClientRects().length === 0) continue;
      var top = docTop(svg);
      var ps = svg.querySelectorAll("path");
      for (var j = 0; j < ps.length; j++) {
        var len;
        try { len = ps[j].getTotalLength(); } catch (err) { continue; }
        if (!len) continue;
        ps[j].style.strokeDasharray = len + " " + len;
        pfade.push({ el: ps[j], len: len, top: top, folge: j, anzahl: ps.length });
      }
    }
    var mks = document.querySelectorAll(".mk");
    for (var k = 0; k < mks.length; k++) {
      marker.push({ el: mks[k], top: docTop(mks[k]) });
    }
  }

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  // Fortschritt 0..1: beginnt, wenn das Element 15 % über der unteren Kante auftaucht,
  // und ist nach gut einem Drittel Bildschirmhöhe Scrollweg fertig.
  function fortschritt(top, y) {
    var beginn = top - vh * 0.88;
    var weg = vh * 0.38;
    return clamp((y - beginn) / weg);
  }

  // Pfade in einem SVG zeichnen sich nacheinander: Pfad j bekommt sein Fenster im Gesamtfortschritt.
  function teil(p, j, n) {
    var a = j / n, b = (j + 1) / n;
    return clamp((p - a) / (b - a));
  }

  var ticking = false;
  function zeichnen() {
    ticking = false;
    var y = window.pageYOffset;
    for (var i = 0; i < pfade.length; i++) {
      var pf = pfade[i];
      if (pf.geladen) continue;
      var p = teil(fortschritt(pf.top, y), pf.folge, pf.anzahl);
      pf.el.style.strokeDashoffset = (pf.len * (1 - p)).toFixed(2);
    }
    for (var k = 0; k < marker.length; k++) {
      var mk = marker[k];
      if (mk.geladen) continue;
      mk.el.style.setProperty("--mk", clamp(fortschritt(mk.top, y) * 1.15).toFixed(3));
    }
  }

  function anfordern() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(zeichnen);
    }
  }

  // Erster Bildschirm: nicht an den Scroll gekoppelt, sondern einmal beim Laden gezeichnet.
  // Dafür bekommen diese Elemente einen virtuellen Scrollweg, der per Zeit durchlaufen wird.
  var ladeStart = null;
  var ladeDauer = 1500;
  function ladeAnimation(t) {
    if (ladeStart === null) ladeStart = t;
    var p = clamp((t - ladeStart) / ladeDauer);
    var eased = 1 - Math.pow(1 - p, 3);
    for (var i = 0; i < pfade.length; i++) {
      var pf = pfade[i];
      if (pf.top > vh * 0.9) continue;
      pf.geladen = true;
      var q = teil(eased, pf.folge, pf.anzahl);
      pf.el.style.strokeDashoffset = (pf.len * (1 - q)).toFixed(2);
    }
    for (var k = 0; k < marker.length; k++) {
      var mk = marker[k];
      if (mk.top > vh * 0.9) continue;
      mk.geladen = true;
      mk.el.style.setProperty("--mk", clamp(eased * 1.15).toFixed(3));
    }
    if (p < 1) {
      window.requestAnimationFrame(ladeAnimation);
    } else {
      window.addEventListener("scroll", anfordern, { passive: true });
      zeichnen();
    }
  }

  function start() {
    vh = window.innerHeight;
    sammeln();
    // Startzustand setzen (alles unsichtbar), dann Ladeanimation für den ersten Bildschirm
    for (var i = 0; i < pfade.length; i++) pfade[i].el.style.strokeDashoffset = pfade[i].len;
    for (var k = 0; k < marker.length; k++) marker[k].el.style.setProperty("--mk", "0");
    ladeStart = null;
    window.requestAnimationFrame(ladeAnimation);
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      vh = window.innerHeight;
      sammeln();
      for (var i = 0; i < pfade.length; i++) if (pfade[i].top < vh * 0.9) pfade[i].geladen = true;
      for (var k = 0; k < marker.length; k++) if (marker[k].top < vh * 0.9) marker[k].geladen = true;
      zeichnen();
    }, 150);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start, start);
  } else {
    start();
  }
})();
