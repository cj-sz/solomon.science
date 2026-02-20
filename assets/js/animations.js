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
