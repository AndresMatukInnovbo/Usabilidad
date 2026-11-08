/**
 * Boot — se ejecuta de forma síncrona en <head>, antes del primer pintado.
 *
 * Responsabilidades:
 *  1. Marcar que JavaScript está disponible (.no-js → .js) para la mejora progresiva.
 *  2. Aplicar las preferencias guardadas (tema y tamaño de letra) antes de pintar,
 *     para evitar el destello de tema o tamaño incorrecto.
 *  3. Exponer la configuración compartida y un acceso seguro a localStorage
 *     en el espacio de nombres global `UW` (Usabilidad Web).
 *
 * Debe mantenerse pequeño: bloquea el renderizado mientras se ejecuta.
 */
(function (root, UW) {
  'use strict';

  UW.config = Object.freeze({
    storageKeys: Object.freeze({ theme: 'uw-theme', scale: 'uw-scale' }),
    textScales: Object.freeze([0.875, 1, 1.125, 1.25, 1.375]),
    /* Sincronizado con el punto de corte de components/sidebar.css */
    drawerQuery: '(max-width: 68rem)',
  });

  /* localStorage puede fallar (modo privado, almacenamiento bloqueado): nunca rompe la página. */
  UW.storage = Object.freeze({
    get(key) {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, String(value)); } catch { /* sin persistencia */ }
    },
  });

  root.classList.replace('no-js', 'js');

  const theme = UW.storage.get(UW.config.storageKeys.theme);
  if (theme === 'dark' || theme === 'light') root.dataset.theme = theme;

  const scale = parseFloat(UW.storage.get(UW.config.storageKeys.scale));
  if (UW.config.textScales.includes(scale)) root.style.setProperty('--scale', scale);
})(document.documentElement, (window.UW = window.UW || {}));
