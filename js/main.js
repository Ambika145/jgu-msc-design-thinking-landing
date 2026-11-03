/**
 * M.Sc. Design Thinking landing page interactions
 * Kept minimal to avoid conflicts with NPF registration widgets.
 * Does not bind to form inputs / validation.
 */
(function () {
  'use strict';

  function initFeaturesSlider() {
    var viewport = document.getElementById('featuresSlider');
    var prevBtn = document.querySelector('.features-arrow.prev');
    var nextBtn = document.querySelector('.features-arrow.next');
    if (!viewport || !prevBtn || !nextBtn) return;

    var currentIndex = 0;

    function isMobileFeatures() {
      return window.matchMedia('(max-width: 767px)').matches;
    }

    function getItems() {
      if (isMobileFeatures()) {
        return Array.prototype.slice.call(viewport.querySelectorAll('.feature-card'));
      }
      return Array.prototype.slice.call(viewport.querySelectorAll('.features-slide'));
    }

    function updateArrows() {
      var items = getItems();
      prevBtn.disabled = currentIndex <= 0;
      nextBtn.disabled = currentIndex >= items.length - 1;
    }

    function goToSlide(index) {
      var items = getItems();
      if (!items.length) return;
      currentIndex = Math.max(0, Math.min(index, items.length - 1));
      var target = items[currentIndex];
      if (target) {
        viewport.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
      }
      updateArrows();
    }

    function syncIndexFromScroll() {
      var items = getItems();
      if (!items.length) return;
      var scrollLeft = viewport.scrollLeft;
      var closestIndex = 0;
      var smallestDiff = Infinity;
      items.forEach(function (item, index) {
        var diff = Math.abs(item.offsetLeft - scrollLeft);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestIndex = index;
        }
      });
      currentIndex = closestIndex;
      updateArrows();
    }

    prevBtn.addEventListener('click', function () { goToSlide(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { goToSlide(currentIndex + 1); });
    viewport.addEventListener('scroll', syncIndexFromScroll, { passive: true });
    window.addEventListener('resize', function () {
      currentIndex = 0;
      goToSlide(0);
    });
    goToSlide(0);
  }

  function initFacultySlider() {
    var track = document.getElementById('facultyTrack');
    var prevBtn = document.querySelector('.faculty-arrow.prev');
    var nextBtn = document.querySelector('.faculty-arrow.next');
    if (!track || !prevBtn || !nextBtn) return;

    function getScrollAmount() {
      var member = track.querySelector('.faculty-member');
      if (!member) return 256;
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return member.offsetWidth + gap;
    }

    function updateArrows() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      prevBtn.disabled = track.scrollLeft <= 4;
      nextBtn.disabled = track.scrollLeft >= maxScroll - 4 || maxScroll <= 0;
    }

    function scrollFaculty(direction) {
      var amount = getScrollAmount();
      var nextLeft = Math.round(track.scrollLeft / amount) * amount + direction * amount;
      track.scrollTo({ left: Math.max(0, nextLeft), behavior: 'smooth' });
    }

    prevBtn.addEventListener('click', function () { scrollFaculty(-1); });
    nextBtn.addEventListener('click', function () { scrollFaculty(1); });
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  function initSkillsDots() {
    var viewport = document.querySelector('.skills-carousel-viewport');
    var track = document.getElementById('skillsCarouselTrack');
    var dotsContainer = document.getElementById('skillsDots');
    if (!viewport || !track || !dotsContainer) return;

    var slides = Array.prototype.slice.call(track.querySelectorAll('.skills-slide'));
    var dots = dotsContainer.querySelectorAll('.skills-dot');
    var currentIndex = 0;

    function getSlideWidth() {
      return slides[0] ? slides[0].getBoundingClientRect().width : viewport.clientWidth;
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, slides.length - 1));
      track.style.transform = 'translate3d(-' + (currentIndex * getSlideWidth()) + 'px, 0, 0)';
      Array.prototype.forEach.call(dots, function (dot, i) {
        var active = i === currentIndex;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    Array.prototype.forEach.call(dots, function (dot) {
      dot.addEventListener('click', function () {
        goToSlide(parseInt(dot.getAttribute('data-index'), 10));
      });
    });

    window.addEventListener('resize', function () { goToSlide(currentIndex); });
    goToSlide(0);
  }

  function initRecognitionDots() {
    var grid = document.getElementById('recognitionGrid');
    var dotsContainer = document.getElementById('recognitionDots');
    if (!grid || !dotsContainer) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.rec-card'));
    var scrollTimer = null;

    function updateDots(index) {
      var dots = dotsContainer.querySelectorAll('.recognition-dot');
      Array.prototype.forEach.call(dots, function (dot, i) {
        var active = i === index;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function scrollToCard(index) {
      var card = cards[index];
      if (!card) return;
      grid.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
      updateDots(index);
    }

    function getNearestIndex() {
      var left = grid.scrollLeft;
      var nearest = 0;
      var minDist = Infinity;
      cards.forEach(function (card, i) {
        var dist = Math.abs(card.offsetLeft - left);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      });
      return nearest;
    }

    dotsContainer.innerHTML = '';
    cards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'recognition-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to recognition ' + (i + 1));
      dot.addEventListener('click', function () { scrollToCard(i); });
      dotsContainer.appendChild(dot);
    });

    grid.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () { updateDots(getNearestIndex()); }, 60);
    }, { passive: true });
  }

  function initTuitionTabs() {
    var panel = document.getElementById('tuitionPanel');
    var panelBg = document.getElementById('tuitionPanelBg');
    var tabButtons = document.querySelectorAll('.tuition-tab');
    var tabPanels = document.querySelectorAll('.tuition-tab-panel');
    if (!tabButtons.length || !tabPanels.length) return;

    function switchTuitionTab(tabName) {
      var isFees = tabName === 'fees';
      if (panel) {
        panel.classList.toggle('tuition-panel--fees', isFees);
        panel.classList.toggle('tuition-panel--eligibility', !isFees);
      }
      if (panelBg) {
        panelBg.src = isFees ? 'images/bg picture (18).jpg' : 'images/bg picture (19).jpg';
      }
      Array.prototype.forEach.call(tabButtons, function (button) {
        var active = button.getAttribute('data-tab') === tabName;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      Array.prototype.forEach.call(tabPanels, function (tabPanel) {
        var active = tabPanel.id === (isFees ? 'tuitionTabFees' : 'tuitionTabEligibility');
        tabPanel.classList.toggle('active', active);
        tabPanel.hidden = !active;
      });
    }

    Array.prototype.forEach.call(tabButtons, function (button) {
      button.addEventListener('click', function () {
        switchTuitionTab(button.getAttribute('data-tab'));
      });
    });
    switchTuitionTab('fees');
  }

  function initHeroApply() {
    var applyBtn = document.getElementById('heroApplyNowBtn');
    var npfTrigger = document.querySelector('.hero-npf-trigger.npfWidget-0185dd0a8a9025344c251fc96b76a370');
    if (!applyBtn) return;
    applyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (npfTrigger) {
        npfTrigger.click();
        return;
      }
      var fallback = document.querySelector('.npfWidgetButton.npfWidget-0185dd0a8a9025344c251fc96b76a370');
      if (fallback) fallback.click();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFeaturesSlider();
    initFacultySlider();
    initSkillsDots();
    initRecognitionDots();
    initTuitionTabs();
    initHeroApply();
  });
})();
