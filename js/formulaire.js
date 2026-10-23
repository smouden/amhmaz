/* =========================================================
   AMHMAZ BUILDING · formulaire.js
   Vérification du formulaire de devis puis envoi via FormSubmit.
   FormSubmit transforme la demande en e-mail récapitulatif :
   aucun serveur ni base de données n'est nécessaire.
   ========================================================= */

/* ---------------------------------------------------------
   ⚙️  RÉGLAGE : adresse qui reçoit les demandes de devis
   Pour la mise en production, remplacer par l'adresse du client,
   par exemple 'contact@amhmazbuilding.com'.
   À chaque nouvelle adresse, FormSubmit envoie un e-mail
   « Activate Form » à cette adresse : il faut cliquer dessus une fois.
   --------------------------------------------------------- */
var EMAIL_DESTINATION = 'saadmouden02@gmail.com';

(function () {
  'use strict';

  var form = document.getElementById('quoteForm');
  if (!form) return;

  var ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL_DESTINATION;
  var msg = document.getElementById('formMsg');
  var button = document.getElementById('f-submit');
  var buttonLabel = button.querySelector('.label');
  var buttonText = buttonLabel.textContent;

  /* ---------- Règles de validation ---------- */
  var rules = {
    'f-name': function (v) {
      return v.length >= 2 ? '' : 'Indiquez votre nom.';
    },
    'f-phone': function (v) {
      // Accepte 06…, 07…, 05…, +212…, 00212…, avec espaces, points ou tirets
      var digits = v.replace(/[\s.\-()]/g, '');
      return /^(\+|00)?\d{9,14}$/.test(digits) ? '' : 'Indiquez un numéro de téléphone valide.';
    },
    'f-email': function (v) {
      if (!v) return ''; // facultatif
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Cette adresse e-mail ne semble pas valide.';
    },
    'f-msg': function (v) {
      return v.length >= 10 ? '' : 'Décrivez votre projet en quelques mots (10 caractères minimum).';
    }
  };

  function checkField(id) {
    var input = document.getElementById(id);
    var field = input.closest('.field');
    var error = rules[id](input.value.trim());
    var slot = field.querySelector('.err');
    field.classList.toggle('invalid', !!error);
    input.setAttribute('aria-invalid', error ? 'true' : 'false');
    if (slot) slot.textContent = error;
    return !error;
  }

  // Re-vérifier un champ dès que l'utilisateur le corrige
  Object.keys(rules).forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener('blur', function () { if (input.value) checkField(id); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('invalid')) checkField(id);
    });
  });

  /* ---------- Messages ---------- */
  function showMessage(text, type) {
    msg.textContent = text;
    msg.className = 'form-msg ' + type;
    msg.hidden = false;
  }

  function setLoading(loading) {
    button.disabled = loading;
    buttonLabel.textContent = loading ? 'Envoi en cours…' : buttonText;
    var spinner = button.querySelector('.spinner');
    if (loading && !spinner) {
      spinner = document.createElement('span');
      spinner.className = 'spinner';
      spinner.setAttribute('aria-hidden', 'true');
      button.insertBefore(spinner, buttonLabel);
    } else if (!loading && spinner) {
      spinner.remove();
    }
  }

  /* ---------- Envoi ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.hidden = true;

    var ok = Object.keys(rules).map(checkField).every(Boolean);
    if (!ok) {
      var firstError = form.querySelector('.field.invalid input, .field.invalid textarea');
      if (firstError) firstError.focus();
      showMessage('Certains champs sont à compléter avant l\'envoi.', 'error');
      return;
    }

    // FormSubmit refuse les envois depuis un fichier ouvert en double-clic (file://)
    if (window.location.protocol === 'file:') {
      showMessage('Test impossible en ouvrant le fichier directement : mettez le site en ligne (Vercel, GitHub Pages) ou lancez-le avec Live Server dans VS Code.', 'error');
      return;
    }

    // Robot détecté (champ caché rempli) : on fait semblant que tout va bien
    if (form._honey.value) {
      form.reset();
      showMessage('Merci, votre demande est bien envoyée.', 'ok');
      return;
    }

    // Construction des données envoyées dans l'e-mail
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (key !== '_honey') data[key] = value;
    });
    var name = data.Nom;
    data.Date = new Date().toLocaleString('fr-FR');

    // « Répondre » dans la boîte mail écrira directement au client s'il a laissé son e-mail
    if (data.email) data._replyto = data.email;

    setLoading(true);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        // FormSubmit renvoie success: "true" (texte) ou true
        if (json.success === true || json.success === 'true') {
          form.reset();
          showMessage('Merci ' + name + ', votre demande est bien envoyée. Nous vous rappelons très vite.', 'ok');
        } else if (/activat/i.test(json.message || '')) {
          // Premier envoi vers une nouvelle adresse : FormSubmit attend la confirmation
          showMessage('Formulaire pas encore activé : un e-mail « Activate Form » vient d\'être envoyé à ' + EMAIL_DESTINATION + '. Cliquez sur le lien puis renvoyez la demande.', 'error');
        } else {
          throw new Error(json.message || 'Erreur FormSubmit');
        }
      })
      .catch(function () {
        showMessage('L\'envoi n\'a pas abouti. Vérifiez votre connexion et réessayez, ou contactez-nous sur WhatsApp au +212 651-184320.', 'error');
      })
      .then(function () { setLoading(false); });
  });
})();
