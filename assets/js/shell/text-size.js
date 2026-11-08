/**
 * Control de tamaño de letra (A− / A+).
 * Escala la tipografía de todo el sitio mediante la variable CSS --scale.
 */
(function (UW) {
  'use strict';

  const root = document.documentElement;
  const SCALES = UW.config.textScales;
  const STORAGE_KEY = UW.config.storageKeys.scale;
  const DEFAULT_INDEX = SCALES.indexOf(1);

  let index = DEFAULT_INDEX;
  let decreaseBtn;
  let increaseBtn;
  let output;

  function render() {
    root.style.setProperty('--scale', SCALES[index]);
    output.textContent = `${Math.round(SCALES[index] * 100)} %`;
    decreaseBtn.disabled = index === 0;
    increaseBtn.disabled = index === SCALES.length - 1;
  }

  function step(delta) {
    const next = index + delta;
    if (next < 0 || next >= SCALES.length) return;
    index = next;
    render();
    UW.storage.set(STORAGE_KEY, SCALES[index]);
  }

  function init() {
    decreaseBtn = document.getElementById('dec');
    increaseBtn = document.getElementById('inc');
    output = document.getElementById('scale-out');
    if (!decreaseBtn || !increaseBtn || !output) return;

    const saved = SCALES.indexOf(parseFloat(UW.storage.get(STORAGE_KEY)));
    index = saved > -1 ? saved : DEFAULT_INDEX;

    decreaseBtn.addEventListener('click', () => step(-1));
    increaseBtn.addEventListener('click', () => step(1));
    render();
  }

  UW.textSize = Object.freeze({ init });
})(window.UW);
