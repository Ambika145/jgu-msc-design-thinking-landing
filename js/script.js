(function () {
  'use strict';

  /* FAQ Accordion */
  const faqItems = document.querySelectorAll('[data-faq]');

  faqItems.forEach(function (item) {
    const trigger = item.querySelector('.faq-card__trigger');

    trigger.addEventListener('click', function () {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach(function (el) {
        el.classList.remove('is-open');
        el.querySelector('.faq-card__trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

})();
