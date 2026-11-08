/**
 * Toast — aviso breve y no intrusivo (región role="status").
 * API: UW.toast.show(mensaje)
 */
(function (UW) {
  'use strict';

  const DURATION_MS = 2400;
  let element = null;
  let timer;

  function show(message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(() => element.classList.remove('is-visible'), DURATION_MS);
  }

  function init() {
    element = document.getElementById('toast');
  }

  UW.toast = Object.freeze({ init, show });
})(window.UW);
