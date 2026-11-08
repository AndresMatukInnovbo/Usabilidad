/**
 * Tiempo de lectura estimado.
 * Recalcula los minutos de cada [data-section] (salvo [data-noreadtime]) y el total
 * de la portada. Los valores escritos en el HTML quedan como respaldo sin JavaScript.
 */
(function (UW) {
  'use strict';

  const WORDS_PER_MINUTE = 200;

  function minutesFor(element) {
    const words = element.textContent.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  }

  function init() {
    let total = 0;

    UW.utils.$$('[data-section]').forEach((section) => {
      if (section.hasAttribute('data-noreadtime')) return;
      const minutes = minutesFor(section);
      total += minutes;
      const label = section.querySelector('[data-reading-time]');
      if (label) label.textContent = `Lectura: ${minutes} min`;
    });

    const totalEl = document.getElementById('rt-total');
    if (totalEl && total) totalEl.textContent = String(total);
  }

  UW.readingTime = Object.freeze({ init });
})(window.UW);
