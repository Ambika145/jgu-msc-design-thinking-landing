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
