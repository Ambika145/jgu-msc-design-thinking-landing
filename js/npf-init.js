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
      existing.addEventListener('error', onLoad, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.async = false;
    script.setAttribute('data-npf-src', src);
    script.addEventListener(
      'load',
      function () {
        script.setAttribute('data-npf-ready', 'true');
        onLoad();
      },
      { once: true }
    );
    script.addEventListener('error', onLoad, { once: true });
    document.body.appendChild(script);
  }

  function initPopup() {
    if (typeof window.NpfWidgetsInit !== 'function') {
      return;
    }

    window['npfW' + WIDGET_ID] = new window.NpfWidgetsInit({
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
    loadScript(EMBED_SRC, function () {});
    loadScript(POPUP_SRC, initPopup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
