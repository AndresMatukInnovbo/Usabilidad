/**
 * Tema claro / oscuro.
 * Sin elección del usuario se sigue el sistema; al pulsar el botón se fija
 * data-theme en <html> y se guarda (boot.js lo restaura en la próxima visita).
 */
(function (UW) {
  'use strict';

  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  let button = null;

  function isDark() {
    const forced = root.dataset.theme;
    if (forced === 'dark') return true;
    if (forced === 'light') return false;
    return systemDark.matches;
  }

  function syncButton() {
    button.setAttribute('aria-pressed', String(isDark()));
  }

  function toggle() {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    UW.storage.set(UW.config.storageKeys.theme, next);
    syncButton();
    UW.toast.show(next === 'dark' ? 'Tema oscuro activado' : 'Tema claro activado');
  }

  function init() {
    button = document.getElementById('theme-btn');
    if (!button) return;
    button.addEventListener('click', toggle);
    systemDark.addEventListener('change', syncButton);
    syncButton();
  }

  UW.themeToggle = Object.freeze({ init });
})(window.UW);
