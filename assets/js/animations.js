// Scroll-triggered animations using IntersectionObserver
(function () {
  'use strict';

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  function init() {
    var elements = document.querySelectorAll('[data-animate]');
    elements.forEach(function (el) {
      observer.observe(el);
    });

    // Observe SVG chart containers to trigger their CSS animations
    var charts = document.querySelectorAll('.svg-chart-wrap');
    charts.forEach(function (chart) {
      observer.observe(chart);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Terminal scramble text animation
(function () {
  'use strict';

  var phrases = [
    'systems programmer',
    'game architect',
    'NLP researcher',
    'relentless builder'
  ];
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?<>/';
  var el = document.getElementById('scramble-text');
  if (!el) return;

  var currentIndex = 0;
  var holdTime = 2500;
  var scrambleFrames = 14;
  var frameInterval = 35;

  function scrambleTo(target, callback) {
    var maxLen = target.length;
    var frame = 0;

    var interval = setInterval(function () {
      var display = '';
      for (var i = 0; i < maxLen; i++) {
        if (frame >= scrambleFrames - (scrambleFrames - i * (scrambleFrames / maxLen))) {
          display += target[i];
        } else {
          display += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.textContent = display;
      frame++;

      if (frame > scrambleFrames + maxLen) {
        clearInterval(interval);
        el.textContent = target;
        if (callback) callback();
      }
    }, frameInterval);
  }

  function cycle() {
    scrambleTo(phrases[currentIndex], function () {
      currentIndex = (currentIndex + 1) % phrases.length;
      setTimeout(cycle, holdTime);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cycle);
  } else {
    cycle();
  }
})();
