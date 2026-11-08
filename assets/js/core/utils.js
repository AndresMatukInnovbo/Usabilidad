/**
 * Utilidades compartidas, sin estado y sin efectos sobre el DOM.
 */
(function (UW) {
  'use strict';

  /** querySelectorAll como array. */
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  /** Se evalúa en cada llamada: el usuario puede cambiar la preferencia en vivo. */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

  /**
   * Minúsculas y sin tildes, para comparar sin importar acentos.
   * Conserva la longitud del texto en español (á → a, ñ → n), lo que permite
   * usar las posiciones del texto normalizado sobre el original.
   */
  const normalize = (text) =>
    text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  UW.utils = Object.freeze({ $$, prefersReducedMotion, scrollBehavior, normalize });
})(window.UW);
