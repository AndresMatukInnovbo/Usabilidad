/**
 * Seguimiento del desplazamiento. Un único bucle (requestAnimationFrame) alimenta:
 *  - la barra de progreso de lectura bajo la cabecera,
 *  - el indicador "Estás en" y la sección resaltada del índice (scrollspy),
 *  - la visibilidad del botón "Arriba".
 */
(function (UW) {
  'use strict';

  const SPY_OFFSET_PX = 110;      // distancia bajo la cabecera a la que una sección cuenta como actual
  const TO_TOP_THRESHOLD_PX = 700;
  const BOTTOM_TOLERANCE_PX = 4;

  let header;
  let bar;
  let whereText;
  let toTopBtn;
  let spies = [];
  let tocLinks = [];
  let current = null;
  let ticking = false;

  function setActive(section) {
    const href = `#${section.id}`;
    tocLinks.forEach((link) => {
      if (link.getAttribute('href') === href) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    whereText.textContent = section.dataset.label || 'Inicio';
  }

  function findActiveSection(scrollY, maxScroll) {
    if (maxScroll > 0 && scrollY >= maxScroll - BOTTOM_TOLERANCE_PX) return spies[spies.length - 1];
    const line = header.offsetHeight + SPY_OFFSET_PX;
    let active = spies[0];
    for (const section of spies) {
      if (section.getBoundingClientRect().top - line <= 0) active = section;
    }
    return active;
  }

  function update() {
    ticking = false;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
    bar.style.transform = `scaleX(${progress})`;

    const active = findActiveSection(scrollY, maxScroll);
    if (active !== current) {
      current = active;
      setActive(active);
    }

    toTopBtn.hidden = scrollY < TO_TOP_THRESHOLD_PX;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: UW.utils.scrollBehavior() });
    const title = document.getElementById('titulo');
    if (title) title.focus({ preventScroll: true });
  }

  function init() {
    header = document.getElementById('site-header');
    bar = document.getElementById('progress-bar');
    whereText = document.getElementById('where-text');
    toTopBtn = document.getElementById('to-top');
    spies = UW.utils.$$('[data-spy]');
    tocLinks = UW.utils.$$('[data-toc] a');
    if (!header || !bar || !whereText || !toTopBtn || !spies.length) return;

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    toTopBtn.addEventListener('click', scrollToTop);
    update();
  }

  UW.readingProgress = Object.freeze({ init });
})(window.UW);
