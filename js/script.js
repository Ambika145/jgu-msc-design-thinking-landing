/* ============================================================
   script.js — combined script
   Merged from: benefits-slider.js + faculty-slider.js + script.js + npf-init.js
   Each block is a self-contained IIFE.
   ============================================================ */

/* ===== [1] BENEFITS SLIDER ===== */
(function () {
  'use strict';

  var SLIDE_MS = 400;
  var SWIPE_THRESHOLD = 48;
  var CARD_RATIO = 905 / 789;
  var MAX_CARD_HEIGHT = 580;

  function getTargetCardSize() {
    var w = window.innerWidth;
    if (w <= 480) return { width: 316, height: 364 };
    if (w <= 767) return { width: 340, height: 392 };
    if (w <= 1024) return { width: 368, height: 422 };
    if (w <= 1279) return { width: 400, height: 460 };
    return { width: 470, height: 538 };
  }

  function getCardsPerView() {
    if (window.innerWidth <= 767) return 1;
    if (window.innerWidth <= 1024) return 2;
    /* 1920×1080 @125% ≈ 1536px — 3 cards clip; show 2 full cards instead */
    if (window.innerWidth < 1680) return 2;
    return 3;
  }

  function isStaticLayout() {
    return false;
  }

  function BenefitsSlider(root) {
    this.root = root;
    this.viewport = root.querySelector('.benefits-slider__viewport');
    this.track = root.querySelector('.benefits-slider__track');
    this.prevBtn = root.querySelector('.benefits-slider__arrow--prev');
    this.nextBtn = root.querySelector('.benefits-slider__arrow--next');
    this.originalCards = Array.prototype.slice.call(
      this.track.querySelectorAll('.benefit-card:not([data-clone])')
    );
    this.totalCards = this.originalCards.length;
    this.cardsPerView = getCardsPerView();
    this.gap = 24;
    this.cardWidth = 0;
    this.pageIndex = 0;
    this.slideOffsets = [];
    this.isAnimating = false;
    this.pendingReset = null;
    this.touchStartX = 0;
    this.touchDeltaX = 0;
    this.sliderBound = false;

    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPrev = this.onPrev.bind(this);
    this.onNext = this.onNext.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.init();
  }

  BenefitsSlider.prototype.init = function () {
    if (!this.totalCards) return;
    window.addEventListener('resize', this.onResize);
    this.setupMode();
  };

  BenefitsSlider.prototype.bindSliderEvents = function () {
    if (this.sliderBound) return;

    this.track.addEventListener('transitionend', this.onTransitionEnd);
    this.prevBtn.addEventListener('click', this.onPrev);
    this.nextBtn.addEventListener('click', this.onNext);
    this.viewport.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.viewport.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.viewport.addEventListener('touchend', this.onTouchEnd);
    this.sliderBound = true;
  };

  BenefitsSlider.prototype.enableStatic = function () {
    this.root.classList.add('benefits-slider--static');
    this.clearClones();
    this.track.style.transition = 'none';
    this.track.style.transform = 'none';
    this.isAnimating = false;
    this.pendingReset = null;
  };

  BenefitsSlider.prototype.enableSlider = function () {
    this.root.classList.remove('benefits-slider--static');
    this.bindSliderEvents();
    this.rebuild();
  };

  BenefitsSlider.prototype.setupMode = function () {
    if (isStaticLayout()) {
      this.enableStatic();
      return;
    }
    this.enableSlider();
  };

  BenefitsSlider.prototype.getSlideOffsets = function () {
    var offsets = [];
    var i = 0;

    while (i < this.totalCards) {
      offsets.push(i);
      i += this.cardsPerView;
    }

    return offsets;
  };

  BenefitsSlider.prototype.getPageCards = function (startIndex) {
    var cards = [];
    var i;

    for (i = 0; i < this.cardsPerView; i += 1) {
      cards.push(this.originalCards[(startIndex + i) % this.totalCards]);
    }

    return cards;
  };

  BenefitsSlider.prototype.clearClones = function () {
    Array.prototype.slice
      .call(this.track.querySelectorAll('[data-clone]'))
      .forEach(function (node) {
        node.parentNode.removeChild(node);
      });
  };

  BenefitsSlider.prototype.appendClonedCards = function (cards) {
    var self = this;

    cards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('data-clone', 'suffix');
      clone.setAttribute('aria-hidden', 'true');
      self.track.appendChild(clone);
    });
  };

  BenefitsSlider.prototype.prependClonedCards = function (cards) {
    for (var i = cards.length - 1; i >= 0; i -= 1) {
      var clone = cards[i].cloneNode(true);
      clone.setAttribute('data-clone', 'prefix');
      clone.setAttribute('aria-hidden', 'true');
      this.track.insertBefore(clone, this.track.firstChild);
    }
  };

  BenefitsSlider.prototype.rebuild = function () {
    if (isStaticLayout()) {
      this.enableStatic();
      return;
    }

    this.cardsPerView = getCardsPerView();
    this.slideOffsets = this.getSlideOffsets();
    this.pageIndex = Math.min(this.pageIndex, this.slideOffsets.length - 1);

    this.clearClones();

    var firstPageCards = this.getPageCards(0);
    var lastOffset = this.slideOffsets[this.slideOffsets.length - 1];
    var lastPageCards = this.getPageCards(lastOffset);

    this.prependClonedCards(lastPageCards);
    this.appendClonedCards(firstPageCards);

    this.updateDimensions();
    this.goToPage(this.pageIndex, false);
  };

  BenefitsSlider.prototype.getAvailableWidth = function () {
    var rootStyles = window.getComputedStyle(this.root);
    var sliderGap = parseFloat(rootStyles.gap) || 16;
    return (
      this.root.offsetWidth -
      this.prevBtn.offsetWidth -
      this.nextBtn.offsetWidth -
      sliderGap * 2
    );
  };

  BenefitsSlider.prototype.updateDimensions = function () {
    var styles = window.getComputedStyle(this.track);
    this.gap = parseFloat(styles.gap) || 24;

    var available = this.getAvailableWidth();
    var fitWidth =
      (available - (this.cardsPerView - 1) * this.gap) / this.cardsPerView;

    this.cardWidth = fitWidth;
    var cardHeight = Math.round(this.cardWidth * CARD_RATIO);

    if (cardHeight > MAX_CARD_HEIGHT) {
      cardHeight = MAX_CARD_HEIGHT;
      this.cardWidth = Math.round(cardHeight / CARD_RATIO);
    }

    var visibleWidth =
      this.cardWidth * this.cardsPerView + (this.cardsPerView - 1) * this.gap;

    this.viewport.style.width = visibleWidth + 'px';
    this.viewport.style.maxWidth = visibleWidth + 'px';
    this.viewport.style.flex = '0 0 ' + visibleWidth + 'px';

    this.root.style.setProperty('--benefit-card-width', this.cardWidth + 'px');
    this.root.style.setProperty('--benefit-card-height', cardHeight + 'px');
    this.root.style.setProperty('--benefit-gap', this.gap + 'px');
  };

  BenefitsSlider.prototype.getTrackIndexForPage = function (pageIndex) {
    return this.cardsPerView + this.slideOffsets[pageIndex];
  };

  BenefitsSlider.prototype.setTranslate = function (trackIndex, animate) {
    var offset = trackIndex * (this.cardWidth + this.gap);
    this.track.style.transition = animate
      ? 'transform ' + SLIDE_MS + 'ms ease'
      : 'none';
    this.track.style.transform = 'translate3d(-' + offset + 'px, 0, 0)';
  };

  BenefitsSlider.prototype.goToPage = function (pageIndex, animate) {
    this.pageIndex = pageIndex;
    this.setTranslate(this.getTrackIndexForPage(pageIndex), animate);
  };

  BenefitsSlider.prototype.onPrev = function () {
    if (isStaticLayout() || this.isAnimating) return;
    this.isAnimating = true;

    if (this.pageIndex === 0) {
      this.pendingReset = this.slideOffsets.length - 1;
      this.setTranslate(0, true);
      return;
    }

    this.goToPage(this.pageIndex - 1, true);
  };

  BenefitsSlider.prototype.onNext = function () {
    if (isStaticLayout() || this.isAnimating) return;
    this.isAnimating = true;

    var lastPage = this.slideOffsets.length - 1;

    if (this.pageIndex === lastPage) {
      this.pendingReset = 0;
      this.setTranslate(this.cardsPerView + this.totalCards, true);
      return;
    }

    this.goToPage(this.pageIndex + 1, true);
  };

  BenefitsSlider.prototype.onTransitionEnd = function (event) {
    if (event.propertyName !== 'transform') return;

    this.isAnimating = false;

    if (this.pendingReset !== null) {
      this.goToPage(this.pendingReset, false);
      this.pendingReset = null;
    }
  };

  BenefitsSlider.prototype.onResize = function () {
    if (isStaticLayout()) {
      this.enableStatic();
      return;
    }

    var nextCardsPerView = getCardsPerView();

    if (!this.root.classList.contains('benefits-slider--static')) {
      if (nextCardsPerView !== this.cardsPerView) {
        this.rebuild();
        return;
      }

      this.updateDimensions();
      this.goToPage(this.pageIndex, false);
      return;
    }

    this.enableSlider();
  };

  BenefitsSlider.prototype.onTouchStart = function (event) {
    if (!event.touches.length) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchDeltaX = 0;
  };

  BenefitsSlider.prototype.onTouchMove = function (event) {
    if (!event.touches.length) return;
    this.touchDeltaX = event.touches[0].clientX - this.touchStartX;

    if (Math.abs(this.touchDeltaX) > 10) {
      event.preventDefault();
    }
  };

  BenefitsSlider.prototype.onTouchEnd = function () {
    if (Math.abs(this.touchDeltaX) < SWIPE_THRESHOLD) return;

    if (this.touchDeltaX < 0) {
      this.onNext();
    } else {
      this.onPrev();
    }

    this.touchDeltaX = 0;
  };

  document.addEventListener('DOMContentLoaded', function () {
    var slider = document.querySelector('[data-benefits-slider]');
    if (slider) {
      new BenefitsSlider(slider);
    }
  });
})();

/* ===== [2] FACULTY SLIDER ===== */
(function () {
  'use strict';

  var SLIDE_MS = 400;
  var SWIPE_THRESHOLD = 48;
  var STATIC_MIN_WIDTH = 1680;

  function getCardsPerView() {
    if (window.innerWidth <= 767) return 1;
    return 3;
  }

  function FacultySlider(root) {
    this.root = root;
    this.viewport = root.querySelector('.faculty-slider__viewport');
    this.track = root.querySelector('.faculty-slider__track');
    this.prevBtn = root.querySelector('.faculty-slider__arrow--prev');
    this.nextBtn = root.querySelector('.faculty-slider__arrow--next');
    this.dotsEl = root.querySelector('.faculty-slider__dots');
    this.cards = Array.prototype.slice.call(
      this.track.querySelectorAll('.faculty-card')
    );
    this.totalCards = this.cards.length;
    this.cardsPerView = getCardsPerView();
    this.gap = 20;
    this.cardWidth = 0;
    this.pageIndex = 0;
    this.pageCount = 0;
    this.isAnimating = false;
    this.sliderBound = false;
    this.touchStartX = 0;
    this.touchDeltaX = 0;

    this.onTransitionEnd = this.onTransitionEnd.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPrev = this.onPrev.bind(this);
    this.onNext = this.onNext.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.init();
  }

  FacultySlider.prototype.init = function () {
    if (!this.totalCards) return;
    window.addEventListener('resize', this.onResize);
    this.setupMode();
  };

  FacultySlider.prototype.isStaticLayout = function () {
    return window.innerWidth >= STATIC_MIN_WIDTH;
  };

  FacultySlider.prototype.bindSliderEvents = function () {
    if (this.sliderBound) return;

    this.track.addEventListener('transitionend', this.onTransitionEnd);
    this.prevBtn.addEventListener('click', this.onPrev);
    this.nextBtn.addEventListener('click', this.onNext);
    this.viewport.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.viewport.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.viewport.addEventListener('touchend', this.onTouchEnd);
    this.sliderBound = true;
  };

  FacultySlider.prototype.unbindSliderEvents = function () {
    if (!this.sliderBound) return;

    this.track.removeEventListener('transitionend', this.onTransitionEnd);
    this.prevBtn.removeEventListener('click', this.onPrev);
    this.nextBtn.removeEventListener('click', this.onNext);
    this.viewport.removeEventListener('touchstart', this.onTouchStart);
    this.viewport.removeEventListener('touchmove', this.onTouchMove);
    this.viewport.removeEventListener('touchend', this.onTouchEnd);
    this.sliderBound = false;
  };

  FacultySlider.prototype.getAvailableWidth = function () {
    var rootStyles = window.getComputedStyle(this.root);
    var sliderGap = parseFloat(rootStyles.gap) || 12;
    return (
      this.root.offsetWidth -
      this.prevBtn.offsetWidth -
      this.nextBtn.offsetWidth -
      sliderGap * 2
    );
  };

  FacultySlider.prototype.getPageCount = function () {
    return Math.max(1, Math.ceil(this.totalCards / this.cardsPerView));
  };

  FacultySlider.prototype.enableStatic = function () {
    this.root.classList.add('faculty-slider--static');
    this.unbindSliderEvents();
    this.track.style.transition = 'none';
    this.track.style.transform = 'none';
    this.viewport.style.width = '';
    this.viewport.style.maxWidth = '';
    this.viewport.style.flex = '';
    this.root.style.removeProperty('--faculty-card-width');
    this.isAnimating = false;
    this.dotsEl.innerHTML = '';
    this.dotsEl.setAttribute('aria-hidden', 'true');
  };

  FacultySlider.prototype.buildDots = function () {
    var self = this;
    this.dotsEl.innerHTML = '';
    this.dotsEl.removeAttribute('aria-hidden');
    this.pageCount = this.getPageCount();

    for (var i = 0; i < this.pageCount; i += 1) {
      (function (index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'faculty-slider__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Faculty page ' + (index + 1));
        dot.setAttribute('aria-selected', index === self.pageIndex ? 'true' : 'false');
        if (index === self.pageIndex) {
          dot.classList.add('faculty-slider__dot--active');
        }
        dot.addEventListener('click', function () {
          if (self.isAnimating || self.pageIndex === index) return;
          self.goToPage(index, true);
        });
        self.dotsEl.appendChild(dot);
      })(i);
    }
  };

  FacultySlider.prototype.updateDots = function () {
    var dots = this.dotsEl.querySelectorAll('.faculty-slider__dot');
    for (var i = 0; i < dots.length; i += 1) {
      var active = i === this.pageIndex;
      dots[i].classList.toggle('faculty-slider__dot--active', active);
      dots[i].setAttribute('aria-selected', active ? 'true' : 'false');
    }
  };

  FacultySlider.prototype.updateDimensions = function () {
    var styles = window.getComputedStyle(this.track);
    this.gap = parseFloat(styles.gap) || 20;
    this.cardsPerView = getCardsPerView();

    var available = this.getAvailableWidth();
    var fitWidth =
      (available - (this.cardsPerView - 1) * this.gap) / this.cardsPerView;

    this.cardWidth = fitWidth;

    var visibleWidth =
      this.cardWidth * this.cardsPerView + (this.cardsPerView - 1) * this.gap;

    this.viewport.style.width = visibleWidth + 'px';
    this.viewport.style.maxWidth = visibleWidth + 'px';
    this.viewport.style.flex = '0 0 ' + visibleWidth + 'px';
    this.root.style.setProperty('--faculty-card-width', this.cardWidth + 'px');
  };

  FacultySlider.prototype.setTranslate = function (pageIndex, animate) {
    var offset = pageIndex * this.cardsPerView * (this.cardWidth + this.gap);
    this.track.style.transition = animate
      ? 'transform ' + SLIDE_MS + 'ms ease'
      : 'none';
    this.track.style.transform = 'translate3d(-' + offset + 'px, 0, 0)';
  };

  FacultySlider.prototype.goToPage = function (pageIndex, animate) {
    this.pageIndex = Math.max(0, Math.min(pageIndex, this.pageCount - 1));
    this.setTranslate(this.pageIndex, animate);
    this.updateDots();
  };

  FacultySlider.prototype.enableSlider = function () {
    this.root.classList.remove('faculty-slider--static');
    this.bindSliderEvents();
    this.updateDimensions();
    this.pageCount = this.getPageCount();
    this.pageIndex = Math.min(this.pageIndex, this.pageCount - 1);
    this.buildDots();
    this.goToPage(this.pageIndex, false);
  };

  FacultySlider.prototype.setupMode = function () {
    if (this.isStaticLayout()) {
      this.enableStatic();
      return;
    }
    this.enableSlider();
  };

  FacultySlider.prototype.onPrev = function () {
    if (this.isStaticLayout() || this.isAnimating) return;
    if (this.pageIndex === 0) return;
    this.isAnimating = true;
    this.goToPage(this.pageIndex - 1, true);
  };

  FacultySlider.prototype.onNext = function () {
    if (this.isStaticLayout() || this.isAnimating) return;
    if (this.pageIndex >= this.pageCount - 1) return;
    this.isAnimating = true;
    this.goToPage(this.pageIndex + 1, true);
  };

  FacultySlider.prototype.onTransitionEnd = function (event) {
    if (event.propertyName !== 'transform') return;
    this.isAnimating = false;
  };

  FacultySlider.prototype.onResize = function () {
    var wasStatic = this.root.classList.contains('faculty-slider--static');
    var shouldBeStatic = this.isStaticLayout();

    if (wasStatic !== shouldBeStatic) {
      this.setupMode();
      return;
    }

    if (shouldBeStatic) return;

    var nextCardsPerView = getCardsPerView();
    if (nextCardsPerView !== this.cardsPerView) {
      this.enableSlider();
      return;
    }

    this.updateDimensions();
    this.goToPage(this.pageIndex, false);
  };

  FacultySlider.prototype.onTouchStart = function (event) {
    if (!event.touches.length) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchDeltaX = 0;
  };

  FacultySlider.prototype.onTouchMove = function (event) {
    if (!event.touches.length) return;
    this.touchDeltaX = event.touches[0].clientX - this.touchStartX;
    if (Math.abs(this.touchDeltaX) > 10) {
      event.preventDefault();
    }
  };

  FacultySlider.prototype.onTouchEnd = function () {
    if (Math.abs(this.touchDeltaX) < SWIPE_THRESHOLD) return;
    if (this.touchDeltaX < 0) {
      this.onNext();
    } else {
      this.onPrev();
    }
    this.touchDeltaX = 0;
  };

  document.addEventListener('DOMContentLoaded', function () {
    var slider = document.querySelector('[data-faculty-slider]');
    if (slider) {
      new FacultySlider(slider);
    }
  });
})();

/* ===== [3] FAQ ACCORDION (was script.js) ===== */
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

/* ===== [4] NPF INIT ===== */
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
