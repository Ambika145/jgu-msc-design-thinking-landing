(function () {
  'use strict';

  var WIDGET_ID = '0185dd0a8a9025344c251fc96b76a370';
  var REGISTER_BASE = 'https://widgets.in8.nopaperforms.com/register?';
  var POPUP_SRC = 'https://in8cdn.npfs.co/js/widget/npfwpopup.js';

  /* Required until your Vercel / production domain is whitelisted in Meritto */
  window.npf_m = 'preview';

  var IFRAME_SANDBOX =
    'allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals';

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

  function isNpfIframe(iframe) {
    if (!iframe || iframe.tagName !== 'IFRAME') {
      return false;
    }
    var src = iframe.getAttribute('src') || '';
    return src.indexOf('nopaperforms') !== -1;
  }

  function configureIframe(iframe, height) {
    iframe.width = '100%';
    iframe.height = String(height);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('sandbox', IFRAME_SANDBOX);
    iframe.setAttribute('title', 'Enquiry form');
    iframe.style.pointerEvents = 'auto';
    iframe.style.border = '0';
    iframe.style.display = 'block';
  }

  function createFormIframe(height) {
    var iframe = document.createElement('iframe');
    configureIframe(iframe, height);
    iframe.src = buildRegisterUrl(WIDGET_ID);
    return iframe;
  }

  function fixNpfIframes(root) {
    var scope = root || document;
    var iframes = scope.querySelectorAll('iframe');
    var i;

    for (i = 0; i < iframes.length; i += 1) {
      if (isNpfIframe(iframes[i])) {
        iframes[i].setAttribute('sandbox', IFRAME_SANDBOX);
        iframes[i].style.pointerEvents = 'auto';
      }
    }
  }

  function observeNpfIframes() {
    if (!window.MutationObserver) {
      return;
    }

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) {
            return;
          }

          if (node.tagName === 'IFRAME' && isNpfIframe(node)) {
            node.setAttribute('sandbox', IFRAME_SANDBOX);
            node.style.pointerEvents = 'auto';
            return;
          }

          fixNpfIframes(node);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
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
        configureIframe(iframe, height);
        if (iframe.src !== targetUrl) {
          iframe.src = targetUrl;
        }
      }
    }

    fixNpfIframes(document);
  }

  function openPopup() {
    var popup = document.getElementById('popup-' + WIDGET_ID);
    var messageEl = document.getElementById('popup-message-' + WIDGET_ID);
    var closeBtn = document.getElementById('npfWdgclose-' + WIDGET_ID);

    if (!popup || !messageEl) {
      return;
    }

    messageEl.innerHTML = '';
    messageEl.appendChild(createFormIframe(500));
    popup.style.display = 'block';

    if (closeBtn) {
      closeBtn.onclick = function () {
        popup.style.display = 'none';
        messageEl.innerHTML = '';
      };
    }

    var backdrop = document.getElementById('popup-back-' + WIDGET_ID);
    if (backdrop) {
      backdrop.onclick = function () {
        popup.style.display = 'none';
        messageEl.innerHTML = '';
      };
    }
  }

  function bindPopupButtons() {
    var buttons = document.querySelectorAll('.npfWidget-' + WIDGET_ID);
    var i;

    for (i = 0; i < buttons.length; i += 1) {
      var cleanButton = buttons[i].cloneNode(true);
      buttons[i].parentNode.replaceChild(cleanButton, buttons[i]);
      cleanButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        openPopup();
      });
    }
  }

  function loadScript(src, onLoad) {
    var existing = document.querySelector('script[data-npf-src="' + src + '"]');

    if (existing) {
      if (existing.getAttribute('data-npf-ready') === 'true') {
        onLoad();
        return;
      }
      existing.addEventListener('load', onLoad, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = false;
    script.src = src;
    script.setAttribute('data-npf-src', src);
    script.addEventListener(
      'load',
      function () {
        script.setAttribute('data-npf-ready', 'true');
        onLoad();
      },
      { once: true }
    );
    script.addEventListener(
      'error',
      function () {
        console.error('[NoPaperForms] Failed to load:', src);
        onLoad();
      },
      { once: true }
    );
    document.body.appendChild(script);
  }

  function initPopup() {
    if (typeof window.NpfWidgetsInit !== 'function') {
      console.error('[NoPaperForms] Popup script did not initialize.');
      return;
    }

    new window.NpfWidgetsInit({
      widgetId: WIDGET_ID,
      baseurl: 'widgets.in8.nopaperforms.com',
      formTitle: 'Enquiry Form',
      titleColor: '#FF0033',
      backgroundColor: '#ddd',
      iframeHeight: '500px',
      buttonbgColor: '#1a237e',
      buttonTextColor: '#FFFFFF'
    });

    bindPopupButtons();
  }

  function boot() {
    mountIframes();
    observeNpfIframes();
    loadScript(POPUP_SRC, initPopup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
