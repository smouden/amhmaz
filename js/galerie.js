/* =========================================================
   AMHMAZ BUILDING · galerie.js
   Visionneuse plein écran pour les photos des réalisations :
   clic ou Entrée pour ouvrir, flèches et Échap au clavier,
   glisser du doigt sur mobile
   ========================================================= */
(function () {
  'use strict';

  // Chaque galerie de la page a sa propre série de photos
  var galleries = Array.prototype.slice.call(document.querySelectorAll('.gallery'));
  if (!galleries.length) return;
  var items = [];

  var current = 0;
  var lastFocus = null;
  var touchX = null;

  var icon = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'
  };

  /* ---------- Construction de la visionneuse ---------- */
  var box = document.createElement('div');
  box.className = 'lightbox';
  box.hidden = true;
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo de réalisation');
  box.innerHTML =
    '<button class="lb-btn lb-close" type="button" aria-label="Fermer">' + icon.close + '</button>' +
    '<button class="lb-btn lb-prev" type="button" aria-label="Photo précédente">' + icon.prev + '</button>' +
    '<figure><img alt=""><figcaption><div><span></span><br><b></b></div><small class="lb-count"></small></figcaption></figure>' +
    '<button class="lb-btn lb-next" type="button" aria-label="Photo suivante">' + icon.next + '</button>';
  document.body.appendChild(box);

  var img = box.querySelector('img');
  var label = box.querySelector('figcaption span');
  var title = box.querySelector('figcaption b');
  var count = box.querySelector('.lb-count');
  var btnClose = box.querySelector('.lb-close');

  /* ---------- Affichage ---------- */
  function show(index) {
    current = (index + items.length) % items.length;
    var item = items[current];
    var source = item.querySelector('img');
    var cat = item.querySelector('figcaption span');
    var name = item.querySelector('figcaption b');

    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    label.textContent = cat ? cat.textContent : '';
    title.textContent = name ? name.textContent : '';
    count.textContent = (current + 1) + ' / ' + items.length;
  }

  function open(index) {
    lastFocus = document.activeElement;
    show(index);
    box.hidden = false;
    document.body.classList.add('no-scroll');
    btnClose.focus();
  }

  function close() {
    box.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }

  /* ---------- Événements ---------- */
  galleries.forEach(function (gallery) {
    var group = Array.prototype.slice.call(gallery.querySelectorAll('.work'));
    group.forEach(function (item, i) {
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Agrandir : ' + (item.querySelector('figcaption b') || {}).textContent);
      item.addEventListener('click', function () { items = group; open(i); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          items = group;
          open(i);
        }
      });
    });
  });

  btnClose.addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });

  // Clic sur le fond sombre pour fermer
  box.addEventListener('click', function (e) {
    if (e.target === box) close();
  });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);

    // Garder le focus dans la visionneuse
    if (e.key === 'Tab') {
      var focusables = box.querySelectorAll('button');
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Glisser à gauche / à droite sur mobile
  box.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
})();
