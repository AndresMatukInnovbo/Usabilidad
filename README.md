# Usabilidad para profesionales de la información

Sitio académico de una sola página (curso *Arquitectura de Información y Usabilidad*, parte 1).
Es un sitio estático: HTML, CSS y JavaScript sin dependencias ni paso de compilación.

## Cómo verlo

- **Directo:** abre `index.html` en el navegador (doble clic). Todo funciona con `file://`.
- **Con servidor local** (recomendado para probar el portapapeles y Lighthouse):

  ```bash
  npx serve .        # o: python -m http.server 8000
  ```

## Estructura

```
.
├── index.html                  Contenido y estructura (sin estilos ni scripts en línea)
├── assets/
│   ├── css/
│   │   ├── main.css            Punto de entrada: declara las capas e importa todo
│   │   ├── base/               reset.css · elements.css · typography.css
│   │   ├── settings/           tokens.css (colores, fuentes, medidas, temas)
│   │   ├── layout/             page.css (rejilla) · chapter.css (ritmo vertical)
│   │   ├── components/         Un archivo por componente de interfaz
│   │   └── utilities/          helpers.css (.sr-only, resaltado, mejora progresiva)
│   └── js/
│       ├── core/               boot.js (síncrono, antes de pintar) · utils.js
│       ├── shell/              Interfaz común: toast, tema, tamaño de letra, drawer, progreso
│       ├── features/           Contenido interactivo: buscador, filtro, SUS, referencias…
│       └── main.js             Punto de composición: arranca los módulos en orden
└── Usabilidad para profesionales de la información.html   Versión original (monolítica)
```

## Decisiones de arquitectura

### CSS

| Decisión | Por qué |
|---|---|
| **Capas de cascada** (`@layer reset, settings, base, layout, components, utilities`) | El orden de las capas decide qué regla gana, no la especificidad. Se eliminaron 24 de los 27 `!important`; solo quedan los del reset de accesibilidad (`[hidden]` y movimiento reducido). |
| **Design tokens** en `settings/tokens.css` | Una sola fuente de verdad para colores, tipografía, radios, áreas seguras y objetivos táctiles. Los componentes no usan valores sueltos. |
| **Un componente por archivo** | Cada archivo se entiende, se revisa y se borra por separado. |
| **`box-sizing: border-box` universal** | Antes solo lo tenía `:root` (y no se hereda). Ahora los anchos incluyen relleno y borde; por ejemplo, el panel lateral ya no puede pasar del 88 % de la pantalla. |
| **Patrón compartido `.index-card`** | La ficha catalográfica y las fichas de ideas clave repetían el mismo diseño. Ahora comparten una base y difieren con variables (`--hole-size`). |
| **Estados como clases `is-*`/`has-*` o atributos ARIA/data** | `.is-open`, `.is-visible`, `.is-highlighted`, `aria-pressed`, `aria-current`, `data-tone`. El estado se lee en el HTML. |
| **Valores dinámicos como propiedades CSS** | El JS pasa `--sus-value` al medidor SUS; la presentación sigue en CSS y el HTML no lleva `style="…"`. |

> Los `@import` se descargan en paralelo. Para producción, se pueden unir en un solo archivo sin tocar el código:
> `npx lightningcss-cli --bundle --minify assets/css/main.css -o dist/site.css`

### JavaScript

| Decisión | Por qué |
|---|---|
| **Módulos con espacio de nombres `UW`** y `init()` | Cada archivo tiene una responsabilidad y una API pequeña. No se usan módulos ES (`type="module"`) porque el navegador los bloquea al abrir el archivo con doble clic (`file://`). |
| **Punto de composición** (`main.js`) | Un solo lugar decide qué se arranca y en qué orden. Cada `init` se aísla con `try/catch`: si un módulo falla, el resto sigue funcionando. |
| **`boot.js` síncrono en `<head>`** | Aplica el tema y el tamaño de letra guardados antes del primer pintado, sin destello del tema equivocado. |
| **Ganchos `data-*` para el JS** | `data-toc`, `data-drawer-close`, `data-copy-ref`, `data-reading-time`… Las clases son para el estilo y los atributos `data-*` para el comportamiento: renombrar una clase no rompe el JS. |
| **Desacople por eventos** | El buscador emite `uw:reveal` al saltar a una fila filtrada, y el filtro decide cómo mostrarla. El buscador no conoce el filtro. |
| **Lógica de dominio pura** | El cálculo SUS (`computeScore`, `bandFor`) no toca el DOM y se puede probar por separado. |
| **Delegación de eventos** | Un único manejador para los 38 botones «Copiar». |

### HTML y accesibilidad

- `<html lang="es">`, `<title>` y metadatos dentro de `<head>`. Antes estaban en `<body>`, dentro de un `<div lang="es">`.
- La portada pasa de `<div>` a `<section aria-labelledby="titulo">`.
- **Mejora progresiva:** `<html class="no-js">` cambia a `js` al arrancar. Los controles que necesitan JS (`data-requires-js`) se ocultan si este no se ejecuta, y la calculadora SUS muestra un aviso en `<noscript>`.
- Los chips del filtro declaran `aria-controls="methods"`.

## Convenciones para seguir creciendo

- **Nuevo componente visual:** crea `assets/css/components/<nombre>.css` e impórtalo en `main.css` dentro de `layer(components)`.
- **Nuevo comportamiento:** crea `assets/js/features/<nombre>.js` con el patrón `(function (UW) { … UW.miModulo = Object.freeze({ init }); })(window.UW);`, añade su `<script defer>` en `index.html` antes de `main.js` y su nombre en la lista `MODULES` de `main.js`.
- **Colores y medidas:** solo desde los tokens. Si falta uno, se agrega en `tokens.css` (en los dos bloques del tema oscuro).
- **Puntos de corte:** `68rem` (índice como panel desplegable; sincronizado con `UW.config.drawerQuery`) y `44rem` (cabecera compacta). Los componentes de contenido usan *container queries* sobre `main`.
