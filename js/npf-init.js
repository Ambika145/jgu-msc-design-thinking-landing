(function () {
  'use strict';

  var WIDGET_ID = '0185dd0a8a9025344c251fc96b76a370';
  var EMBED_SRC = 'https://widgets.in8.nopaperforms.com/emwgts.js';
  var POPUP_SRC = 'https://in8cdn.npfs.co/js/widget/npfwpopup.js';

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
  }

  function widgetsHaveIframes() {
    var widgets = document.querySelectorAll('.npf_wgts');
    var i;

    if (!widgets.length) {
      return false;
    }

    for (i = 0; i < widgets.length; i += 1) {
      if (widgets[i].querySelector('iframe')) {
        return true;
      }
    }

    return false;
  }

  function reloadEmbeds() {
    var widgets = document.querySelectorAll('.npf_wgts');
    var embedScript = document.querySelector('script[data-npf-src="' + EMBED_SRC + '"]');
    var i;

    for (i = 0; i < widgets.length; i += 1) {
      widgets[i].innerHTML = '';
    }

    if (embedScript) {
      embedScript.remove();
    }

    loadScript(EMBED_SRC, function () {});
  }

  function verifyWidgets() {
    if (widgetsHaveIframes()) {
      return;
    }

    reloadEmbeds();

    window.setTimeout(function () {
      if (widgetsHaveIframes()) {
        return;
      }

      console.warn(
        '[NoPaperForms] Enquiry form did not load on "' +
          window.location.hostname +
          '". Add this domain in your NoPaperForms / Meritto widget allowed-domains list, then redeploy.'
      );
    }, 3500);
  }

  function boot() {
    loadScript(EMBED_SRC, function () {
      loadScript(POPUP_SRC, function () {
        initPopup();
        window.setTimeout(verifyWidgets, 1500);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
