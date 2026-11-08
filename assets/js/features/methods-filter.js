/**
 * Filtro por familia del catálogo de métodos de evaluación (sección 5.2).
 * Los chips declaran data-filter; las filas, data-family.
 * Escucha `uw:reveal` para mostrar todas las filas si el buscador salta a una oculta.
 */
(function (UW) {
  'use strict';

  const ALL = 'todos';

  let rows = [];
  let chips = [];
  let counter = null;

  function apply(filter) {
    let shown = 0;
    rows.forEach((row) => {
      const visible = filter === ALL || row.dataset.family === filter;
      row.hidden = !visible;
      if (visible) shown += 1;
    });
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter)));
    if (counter) counter.textContent = `Mostrando ${shown} de ${rows.length} métodos`;
  }

  function init() {
    const table = document.getElementById('methods');
    const toolbar = document.getElementById('methods-filters');
    if (!table || !toolbar) return;

    rows = UW.utils.$$('tbody tr', table);
    chips = UW.utils.$$('[data-filter]', toolbar);
    counter = document.getElementById('methods-count');

    chips.forEach((chip) => chip.addEventListener('click', () => apply(chip.dataset.filter)));
    table.addEventListener('uw:reveal', () => apply(ALL));
  }

  UW.methodsFilter = Object.freeze({ init, apply });
})(window.UW);
