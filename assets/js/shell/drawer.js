/**
 * Índice lateral como panel desplegable (por debajo del punto de corte).
 *
 * API pública (la usa el buscador):
 *   UW.drawer.open({ focus })        → abre y enfoca `focus` (o el botón cerrar)
 *   UW.drawer.close({ returnFocus }) → cierra; opcionalmente devuelve el foco al botón
 *   UW.drawer.isOpen()  /  UW.drawer.isCompact()
 *
 * Accesibilidad: mientras está abierto, el contenido y el pie quedan `inert`
 * (el foco no escapa del panel) y Esc lo cierra.
 */
(function (UW) {
  'use strict';

  const FOCUS_DELAY_MS = 40;

  let sidebar = null;
  let toggleBtn = null;
  let scrim = null;
  let closeBtn = null;
  let inertTargets = [];
  let compactQuery = null;

  const isOpen = () => Boolean(sidebar && sidebar.classList.contains('is-open'));
  const isCompact = () => Boolean(compactQuery && compactQuery.matches);

  function setBackgroundInert(value) {
    inertTargets.forEach((el) => { el.inert = value; });
  }

  function open({ focus } = {}) {
    if (!sidebar) return;
    sidebar.classList.add('is-open');
    scrim.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('has-open-drawer');
    setBackgroundInert(true);
    const target = focus || closeBtn;
    setTimeout(() => target && target.focus(), FOCUS_DELAY_MS);
  }

  function close({ returnFocus = false } = {}) {
    if (!sidebar) return;
    sidebar.classList.remove('is-open');
    scrim.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('has-open-drawer');
    setBackgroundInert(false);
    if (returnFocus) toggleBtn.focus();
  }

  function init() {
    sidebar = document.getElementById('sidebar');
    toggleBtn = document.getElementById('menu-btn');
    scrim = document.getElementById('scrim');
    if (!sidebar || !toggleBtn || !scrim) return;

    closeBtn = sidebar.querySelector('[data-drawer-close]');
    inertTargets = [
      document.getElementById('contenido'),
      document.getElementById('site-footer'),
    ].filter(Boolean);
    compactQuery = window.matchMedia(UW.config.drawerQuery);

    toggleBtn.addEventListener('click', () => (isOpen() ? close({ returnFocus: true }) : open()));
    if (closeBtn) closeBtn.addEventListener('click', () => close({ returnFocus: true }));
    scrim.addEventListener('click', () => close({ returnFocus: true }));

    /* Al elegir una sección del índice, el panel se cierra para mostrarla */
    UW.utils.$$('[data-toc] a', sidebar).forEach((link) => {
      link.addEventListener('click', () => { if (isCompact() && isOpen()) close(); });
    });

    /* Si la ventana se agranda, el índice vuelve a ser columna fija */
    compactQuery.addEventListener('change', () => { if (!isCompact() && isOpen()) close(); });

    /* preventDefault avisa a otros manejadores de Esc (p. ej. el buscador) de que ya se atendió */
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) {
        event.preventDefault();
        close({ returnFocus: true });
      }
    });
  }

  UW.drawer = Object.freeze({ init, open, close, isOpen, isCompact });
})(window.UW);
