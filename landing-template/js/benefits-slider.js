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
    if (window.innerWidth < 1500) return 2;
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

  BenefitsSlider.prototype.updateDimensions = function () {
    var styles = window.getComputedStyle(this.track);
    this.gap = parseFloat(styles.gap) || 24;

    var fitWidth =
      (this.viewport.offsetWidth - (this.cardsPerView - 1) * this.gap) / this.cardsPerView;
    var target = getTargetCardSize();
    var neededWidth = target.width * this.cardsPerView + (this.cardsPerView - 1) * this.gap;

    if (neededWidth <= this.viewport.offsetWidth) {
      this.cardWidth = target.width;
      var cardHeight = target.height;
    } else {
      this.cardWidth = fitWidth;
      var cardHeight = Math.round(this.cardWidth * CARD_RATIO);
    }

    if (cardHeight > MAX_CARD_HEIGHT) {
      cardHeight = MAX_CARD_HEIGHT;
      this.cardWidth = Math.round(cardHeight / CARD_RATIO);
    }

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

