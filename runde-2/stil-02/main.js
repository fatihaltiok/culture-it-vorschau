/* Entwurf 02 · Aufkleber-Wand
   Der Moment: Aufkleber fallen beim Scrollen nacheinander auf die Wand (von oben, gedreht, mit
   Nachfedern). Der Endzustand ist der CSS-Grundzustand; hier werden nur Startzustände gesetzt,
   und nur, wenn Bewegung erwünscht ist und GSAP geladen wurde. */
(function () {
  "use strict";

  /* Menü auf dem Handy */
  var knopf = document.querySelector(".kopf__menue");
  var nav = document.getElementById("navigation");
  if (knopf && nav) {
    knopf.addEventListener("click", function () {
      var offen = nav.classList.toggle("ist-offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
      knopf.textContent = offen ? "Schließen" : "Menü";
    });
    nav.addEventListener("click", function (ev) {
      if (ev.target.tagName === "A" && nav.classList.contains("ist-offen")) {
        nav.classList.remove("ist-offen");
        knopf.setAttribute("aria-expanded", "false");
        knopf.textContent = "Menü";
      }
    });
  }

  var ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (ruhig || typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  var alle = Array.prototype.slice.call(document.querySelectorAll("[data-fall]"));
  if (!alle.length) { return; }

  /* Aufkleber nach Abschnitt bündeln, damit sie je Abschnitt nacheinander fallen */
  var gruppen = [];
  alle.forEach(function (el) {
    var abschnitt = el.closest("section") || document.body;
    var g = gruppen.find(function (x) { return x.abschnitt === abschnitt; });
    if (!g) { g = { abschnitt: abschnitt, teile: [] }; gruppen.push(g); }
    g.teile.push(el);
  });

  gruppen.forEach(function (g) {
    g.teile.forEach(function (el) {
      var tilt = parseFloat(el.getAttribute("data-tilt") || "0");
      el.style.setProperty("--tilt", "0deg");
      gsap.set(el, { y: -160, rotation: tilt - 16, opacity: 0, transformOrigin: "50% 40%" });
      el.dataset.ziel = String(tilt);
    });
    ScrollTrigger.create({
      trigger: g.teile[0],
      start: "top 88%",
      once: true,
      onEnter: function () {
        g.teile.forEach(function (el, i) {
          gsap.to(el, {
            y: 0,
            rotation: parseFloat(el.dataset.ziel),
            opacity: 1,
            duration: 0.85,
            delay: i * 0.13,
            ease: "back.out(1.9)",
            overwrite: "auto"
          });
        });
      }
    });
  });

  /* Wird der Verweis-Anker direkt angesprungen, soll nichts versteckt bleiben */
  ScrollTrigger.refresh();
})();
