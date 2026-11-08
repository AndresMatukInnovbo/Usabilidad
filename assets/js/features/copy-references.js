/**
 * Botón "Copiar" de cada referencia bibliográfica.
 * Un único manejador delegado en la lista (no 38 manejadores sueltos).
 * Si el portapapeles no está disponible (p. ej. al abrir el archivo localmente
 * en algunos navegadores), selecciona el texto para copiarlo con Ctrl+C.
 */
(function (UW) {
  'use strict';

  function selectContents(element) {
    try {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } catch { /* la selección no es crítica */ }
  }

  async function copy(textElement) {
    const text = textElement.textContent.replace(/\s+/g, ' ').trim();
    try {
      await navigator.clipboard.writeText(text);
      UW.toast.show('Referencia copiada');
    } catch {
      selectContents(textElement);
      UW.toast.show('Texto seleccionado: cópialo con Ctrl+C');
    }
  }

  function init() {
    const list = document.getElementById('refs');
    if (!list) return;

    list.addEventListener('click', (event) => {
      const button = event.target.closest('[data-copy-ref]');
      if (!button) return;
      const textElement = button.closest('li')?.querySelector('[data-ref-text]');
      if (textElement) copy(textElement);
    });
  }

  UW.copyReferences = Object.freeze({ init });
})(window.UW);
