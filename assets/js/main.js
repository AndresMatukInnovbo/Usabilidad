/**
 * Punto de composición (composition root).
 *
 * Cada módulo se registra en el espacio de nombres UW y expone init().
 * Aquí, y solo aquí, se decide qué se arranca y en qué orden.
 * Cada init se aísla: si un módulo falla, los demás siguen funcionando.
 *
 * Orden:
 *  1. shell    → piezas de la interfaz de las que dependen otras (toast, drawer…)
 *  2. features → contenido interactivo. reading-time va antes del buscador
 *                para que este indexe los tiempos ya calculados.
 */
(function (UW) {
  'use strict';

  const MODULES = [
    'toast',
    'themeToggle',
    'textSize',
    'drawer',
    'readingTime',
    'readingProgress',
    'siteSearch',
    'methodsFilter',
    'susCalculator',
    'copyReferences',
  ];

  MODULES.forEach((name) => {
    const module = UW[name];
    if (!module || typeof module.init !== 'function') {
      console.warn(`[UW] Módulo no encontrado: ${name}`);
      return;
    }
    try {
      module.init();
    } catch (error) {
      console.error(`[UW] Error al iniciar ${name}:`, error);
    }
  });
})(window.UW);
