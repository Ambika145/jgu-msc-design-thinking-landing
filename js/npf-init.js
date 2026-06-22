(function () {
  'use strict';

  var WIDGET_ID = '0185dd0a8a9025344c251fc96b76a370';
  var REGISTER_BASE = 'https://widgets.in8.nopaperforms.com/register?';
  var POPUP_SRC = 'https://in8cdn.npfs.co/js/widget/npfwpopup.js';

  /* Required until jgu-msc-design-thinking-landing-ypr.vercel.app is whitelisted in Meritto / NoPaperForms */
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

  function mountIframes() {
    var widgets = document.querySelectorAll('.npf_wgts');
    var i;

    for (i = 0; i < widgets.length; i += 1) {
      var container = widgets[i];
      var widgetId = container.getAttribute('data-w') || WIDGET_ID;
      var height = parseHeight(container.getAttribute('data-height'), 320);
      var iframe = container.querySelector('iframe');

      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = String(height);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute(
          'sandbox',
          'allow-top-navigation allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox'
        );
        iframe.setAttribute('title', 'Enquiry form');
        container.appendChild(iframe);
      }

      iframe.height = String(height);
      iframe.src = buildRegisterUrl(widgetId);
    }
  }

  function loadScript(src, onLoad) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = false;
    script.src = src;
    script.addEventListener('load', onLoad, { once: true });
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

  function boot() {
    mountIframes();
    loadScript(POPUP_SRC, initPopup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
