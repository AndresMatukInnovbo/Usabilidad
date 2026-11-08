/**
 * Calculadora SUS (System Usability Scale, Brooke 1996).
 *
 * Separación de responsabilidades:
 *  - Dominio (funciones puras): computeScore, bandFor. No tocan el DOM y se
 *    pueden probar de forma aislada.
 *  - Vista: genera la escala 1–5 de cada afirmación y pinta el resultado.
 */
(function (UW) {
  'use strict';

  /* ---------- Dominio ---------- */

  const QUESTION_COUNT = 10;
  const SCALE_MAX = 5;
  const MULTIPLIER = 2.5;

  /** Bandas de interpretación (Sauro, 2011), de mayor a menor. */
  const BANDS = Object.freeze([
    { min: 80.3, tone: 'ok', text: 'Excelente: entre el 10 % de puntuaciones más altas' },
    { min: 68, tone: 'ok', text: 'Por encima del promedio de 68' },
    { min: 51, tone: 'warn', text: 'Por debajo del promedio: conviene revisar el diseño' },
    { min: -Infinity, tone: 'bad', text: 'Muy por debajo del promedio: usabilidad percibida deficiente' },
  ]);

  /**
   * @param {(number|null)[]} answers 10 respuestas de 1 a 5; null si falta.
   * @returns {{ missing: number, score: number|null }}
   * Impares (positivas): respuesta − 1. Pares (negativas): 5 − respuesta. Suma × 2,5.
   */
  function computeScore(answers) {
    const missing = answers.filter((a) => a == null).length;
    if (missing) return { missing, score: null };
    const sum = answers.reduce(
      (acc, value, i) => acc + (i % 2 === 0 ? value - 1 : SCALE_MAX - value),
      0
    );
    return { missing: 0, score: sum * MULTIPLIER };
  }

  const bandFor = (score) => BANDS.find((band) => score >= band.min);

  /* ---------- Vista ---------- */

  const EXAMPLE = Object.freeze([4, 2, 4, 1, 4, 2, 5, 2, 4, 2]);
  const ANCHOR_LABELS = Object.freeze({
    1: ' (totalmente en desacuerdo)',
    5: ' (totalmente de acuerdo)',
  });
  const MESSAGES = Object.freeze({
    example: 'Ejemplo cargado: respuestas de un participante ficticio. Cámbialas para probar la calculadora.',
    changed: 'Respuestas modificadas. La puntuación se actualiza al instante.',
    cleared: 'Respuestas borradas. Responde las diez afirmaciones.',
  });

  let form;
  let scoreEl;
  let verdictEl;
  let gaugeEl;
  let noteEl;

  const radioId = (question, value) => `sus${question}-${value}`;

  function buildScales() {
    UW.utils.$$('[data-q]', form).forEach((group) => {
      const question = Number(group.dataset.q);
      for (let value = 1; value <= SCALE_MAX; value += 1) {
        const id = radioId(question, value);
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `sus${question}`;
        radio.id = id;
        radio.value = String(value);

        const label = document.createElement('label');
        label.htmlFor = id;
        label.append(String(value));
        if (ANCHOR_LABELS[value]) {
          const hint = document.createElement('span');
          hint.className = 'sr-only';
          hint.textContent = ANCHOR_LABELS[value];
          label.append(hint);
        }
        group.append(radio, label);
      }
    });
  }

  function readAnswers() {
    return Array.from({ length: QUESTION_COUNT }, (_, i) => {
      const checked = form.querySelector(`input[name="sus${i + 1}"]:checked`);
      return checked ? Number(checked.value) : null;
    });
  }

  function loadAnswers(values) {
    values.forEach((value, i) => {
      const radio = document.getElementById(radioId(i + 1, value));
      if (radio) radio.checked = true;
    });
  }

  function render() {
    const { missing, score } = computeScore(readAnswers());

    if (missing) {
      scoreEl.textContent = '—';
      gaugeEl.style.setProperty('--sus-value', 0);
      verdictEl.dataset.tone = 'pending';
      verdictEl.textContent = missing === 1
        ? 'Falta 1 respuesta para calcular la puntuación'
        : `Faltan ${missing} respuestas para calcular la puntuación`;
      return;
    }

    const band = bandFor(score);
    scoreEl.textContent = String(score).replace('.', ',');
    gaugeEl.style.setProperty('--sus-value', score);
    verdictEl.dataset.tone = band.tone;
    verdictEl.textContent = band.text;
  }

  function init() {
    form = document.getElementById('sus');
    scoreEl = document.getElementById('sus-score');
    verdictEl = document.getElementById('sus-verdict');
    gaugeEl = document.getElementById('sus-gauge');
    noteEl = document.getElementById('sus-note');
    if (!form || !scoreEl || !verdictEl || !gaugeEl || !noteEl) return;

    buildScales();
    loadAnswers(EXAMPLE);

    form.addEventListener('change', () => {
      noteEl.textContent = MESSAGES.changed;
      render();
    });

    document.getElementById('sus-example')?.addEventListener('click', () => {
      loadAnswers(EXAMPLE);
      noteEl.textContent = MESSAGES.example;
      render();
    });

    document.getElementById('sus-clear')?.addEventListener('click', () => {
      form.reset();
      noteEl.textContent = MESSAGES.cleared;
      render();
      document.getElementById(radioId(1, 1))?.focus();
    });

    render();
  }

  UW.susCalculator = Object.freeze({ init, computeScore, bandFor });
})(window.UW);
