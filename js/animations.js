/* =========================================================
   AMHMAZ BUILDING · animations.js
   Apparition des blocs au défilement et compteurs animés
   des chiffres clés de l'accueil
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var blocks = document.querySelectorAll('.reveal');

  /* ---------- Apparition au défilement ---------- */
  // Sans IntersectionObserver ou si l'utilisateur limite les animations : tout est visible tout de suite
  if (reduceMotion || !('IntersectionObserver' in window)) {
    blocks.forEach(function (el) { el.classList.add('in'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Petit décalage entre les éléments d'une même rangée (pôles, étapes, galerie)
    blocks.forEach(function (el) {
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(':scope > .reveal') : [];
      var index = Array.prototype.indexOf.call(siblings, el);
      if (index > 0) el.style.transitionDelay = Math.min(index * 80, 400) + 'ms';
      observer.observe(el);
    });

    // Sécurité : si un bloc n'est jamais détecté, on l'affiche après 3 secondes
    window.setTimeout(function () {
      blocks.forEach(function (el) { el.classList.add('in'); });
    }, 3000);
  }

  /* ---------- Compteurs des chiffres clés ---------- */
  var counters = document.querySelectorAll('.fact b');
  if (reduceMotion) return;

  counters.forEach(function (el) {
    var target = parseInt(el.textContent, 10);
    if (isNaN(target) || target < 2) return;

    var duration = 1200;
    var start = null;
    el.textContent = '0';

    function step(time) {
      if (start === null) start = time;
      var progress = Math.min((time - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) window.requestAnimationFrame(step);
    }

    // Démarre après l'animation d'entrée du titre
    window.setTimeout(function () { window.requestAnimationFrame(step); }, 350);
  });
})();
