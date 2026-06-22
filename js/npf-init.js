(function () {
  'use strict';

  var WIDGET_ID = '0185dd0a8a9025344c251fc96b76a370';
  var REGISTER_BASE = 'https://widgets.in8.nopaperforms.com/register?';
  var POPUP_ID = 'npf-enquiry-popup';

  /* Required until your Vercel / production domain is whitelisted in Meritto */
  window.npf_m = 'preview';

  function buildRegisterUrl(widgetId) {
    return (
      REGISTER_BASE +
      '&r=' +
      encodeURIComponent(document.referrer || '') +
      '&q=' +
      '&w=' +
      encodeURIComponent(widgetId) +
      '&m=preview' +
      '&cu=' +
      encodeURIComponent(location.href)
    );
  }

  function parseHeight(value, fallback) {
    var parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  function createFormIframe(height) {
    var iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = String(height);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'Enquiry form');
    iframe.setAttribute('loading', 'lazy');
    iframe.style.pointerEvents = 'auto';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.style.width = '100%';
    iframe.style.background = 'transparent';
    iframe.src = buildRegisterUrl(WIDGET_ID);
    return iframe;
  }

  function mountIframes() {
    var widgets = document.querySelectorAll('.npf_wgts');
    var i;

    for (i = 0; i < widgets.length; i += 1) {
      var container = widgets[i];
      var widgetId = container.getAttribute('data-w') || WIDGET_ID;
      var height = parseHeight(container.getAttribute('data-height'), 320);
      var iframe = container.querySelector('iframe');
      var targetUrl = buildRegisterUrl(widgetId);

      if (!iframe) {
        iframe = createFormIframe(height);
        container.appendChild(iframe);
      } else {
        iframe.height = String(height);
        iframe.style.pointerEvents = 'auto';
        if (iframe.getAttribute('src') !== targetUrl) {
          iframe.setAttribute('src', targetUrl);
        }
      }
    }
  }

  function ensurePopupMarkup() {
    if (document.getElementById(POPUP_ID)) {
      return document.getElementById(POPUP_ID);
    }

    var popup = document.createElement('div');
    popup.id = POPUP_ID;
    popup.className = 'npf-enquiry-popup';
    popup.hidden = true;
    popup.innerHTML =
      '<div class="npf-enquiry-popup__backdrop" aria-hidden="true"></div>' +
      '<div class="npf-enquiry-popup__dialog" role="dialog" aria-modal="true" aria-labelledby="npf-enquiry-popup-title">' +
      '<div class="npf-enquiry-popup__head">' +
      '<h2 id="npf-enquiry-popup-title">Enquiry Form</h2>' +
      '<button type="button" class="npf-enquiry-popup__close" aria-label="Close enquiry form">&times;</button>' +
      '</div>' +
      '<div class="npf-enquiry-popup__body"></div>' +
      '</div>';

    document.body.appendChild(popup);
    return popup;
  }

  function closePopup() {
    var popup = document.getElementById(POPUP_ID);
    if (!popup) {
      return;
    }

    var body = popup.querySelector('.npf-enquiry-popup__body');
    popup.hidden = true;
    document.body.style.overflow = '';

    if (body) {
      body.innerHTML = '';
    }
  }

  function openPopup() {
    var popup = ensurePopupMarkup();
    var body = popup.querySelector('.npf-enquiry-popup__body');
    var closeBtn = popup.querySelector('.npf-enquiry-popup__close');
    var backdrop = popup.querySelector('.npf-enquiry-popup__backdrop');

    if (!body) {
      return;
    }

    body.innerHTML = '';
    body.appendChild(createFormIframe(500));
    popup.hidden = false;
    document.body.style.overflow = 'hidden';

    if (closeBtn) {
      closeBtn.onclick = closePopup;
    }

    if (backdrop) {
      backdrop.onclick = closePopup;
    }
  }

  function bindPopupButtons() {
    var buttons = document.querySelectorAll('.npfWidget-' + WIDGET_ID);
    var i;

    for (i = 0; i < buttons.length; i += 1) {
      buttons[i].addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        openPopup();
      });
    }
  }

  function boot() {
    mountIframes();
    ensurePopupMarkup();
    bindPopupButtons();

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closePopup();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
