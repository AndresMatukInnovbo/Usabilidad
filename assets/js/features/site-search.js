/**
 * Buscador interno (sin servidor).
 *
 * Al iniciar, indexa el texto de cada [data-section] (excepto [data-noindex]).
 * La búsqueda ignora tildes y mayúsculas, exige que aparezcan todos los términos
 * y ordena por número de coincidencias, con prioridad para los encabezados.
 *
 * Atajos: "/" enfoca el buscador; Esc lo vacía.
 *
 * Para saltar a una fila oculta por un filtro, emite el evento `uw:reveal`
 * sobre el elemento; el componente que la ocultó decide cómo mostrarla.
 * Así el buscador no depende de ningún filtro concreto.
 */
(function (UW) {
  'use strict';

  const { $$, normalize, scrollBehavior } = UW.utils;

  const INDEXABLE = 'h3, p, li, dt, dd, tbody tr, figcaption';
  const MIN_TEXT_LENGTH = 3;
  const MIN_QUERY_LENGTH = 2;
  const MAX_RESULTS = 8;
  const HEADING_BOOST = 6;
  const DEBOUNCE_MS = 120;
  const SNIPPET_BEFORE = 45;
  const SNIPPET_AFTER = 75;
  const HIGHLIGHT_MS = 2400;
  const DRAWER_TRANSITION_MS = 260;
  const SUGGESTIONS = ['heurística', 'WCAG', 'SUS', 'personas', 'Mayhew', 'card sorting'];

  let input;
  let results;
  let index = [];
  let debounceTimer;

  /* ---------- Índice ---------- */

  function buildIndex() {
    return $$('[data-section]').flatMap((section) =>
      $$(INDEXABLE, section)
        .filter((el) => !el.closest('[data-noindex]') && !el.querySelector('p, li, dd, dt'))
        .map((el) => {
          const text = el.textContent.replace(/\s+/g, ' ').trim();
          return {
            el,
            text,
            normalized: normalize(text),
            sectionLabel: section.dataset.label,
            sectionId: section.id,
            isHeading: el.tagName === 'H3',
          };
        })
        .filter((entry) => entry.text.length >= MIN_TEXT_LENGTH)
    );
  }

  function search(query) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const hits = index
      .filter((entry) => terms.every((term) => entry.normalized.includes(term)))
      .map((entry) => ({
        entry,
        score: terms.reduce(
          (sum, term) => sum + entry.normalized.split(term).length - 1,
          entry.isHeading ? HEADING_BOOST : 0
        ),
      }))
      .sort((a, b) => b.score - a.score);
    return { terms, hits };
  }

  /* ---------- Navegación al resultado ---------- */

  function highlight(el) {
    el.classList.remove('is-highlighted');
    void el.offsetWidth; // reinicia la animación si ya estaba aplicada
    el.classList.add('is-highlighted');
    setTimeout(() => el.classList.remove('is-highlighted'), HIGHLIGHT_MS);
  }

  function goTo(el) {
    const wasCompact = UW.drawer.isCompact();
    if (wasCompact && UW.drawer.isOpen()) UW.drawer.close();
    if (el.hidden || el.closest('[hidden]')) {
      el.dispatchEvent(new CustomEvent('uw:reveal', { bubbles: true }));
    }
    setTimeout(() => {
      el.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      highlight(el);
    }, wasCompact ? DRAWER_TRANSITION_MS : 0);
  }

  /* ---------- Presentación ---------- */

  function createStatus(text) {
    const p = document.createElement('p');
    p.className = 'r-status';
    p.textContent = text;
    return p;
  }

  function createSnippet(text, normalized, term) {
    const span = document.createElement('span');
    span.className = 'r-snip';
    const pos = Math.max(0, normalized.indexOf(term));
    let start = Math.max(0, pos - SNIPPET_BEFORE);
    const end = Math.min(text.length, pos + term.length + SNIPPET_AFTER);
    if (start > 0) {
      const space = text.indexOf(' ', start);
      if (space > -1 && space < pos) start = space + 1;
    }
    const mark = document.createElement('mark');
    mark.textContent = text.slice(pos, pos + term.length);
    span.append(
      (start > 0 ? '…' : '') + text.slice(start, pos),
      mark,
      text.slice(pos + term.length, end) + (end < text.length ? '…' : '')
    );
    return span;
  }

  function createResult({ entry }, term) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${entry.sectionId}`;
    link.className = 'r-item';
    const section = document.createElement('span');
    section.className = 'r-sec';
    section.textContent = entry.sectionLabel;
    link.append(section, createSnippet(entry.text, entry.normalized, term));
    link.addEventListener('click', (event) => {
      event.preventDefault();
      goTo(entry.el);
    });
    li.append(link);
    return li;
  }

  function renderNoResults(query) {
    const suggestions = document.createElement('p');
    suggestions.className = 'r-sug';
    suggestions.append('Prueba con:');
    SUGGESTIONS.forEach((word) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = word;
      chip.addEventListener('click', () => {
        input.value = word;
        run();
        input.focus();
      });
      suggestions.append(chip);
    });
    results.append(createStatus(`No hay resultados para «${query}».`), suggestions);
  }

  function renderHits(hits, term) {
    const count = `${hits.length} ${hits.length === 1 ? 'resultado' : 'resultados'}`;
    const more = hits.length > MAX_RESULTS ? ` · se muestran los ${MAX_RESULTS} más relevantes` : '';
    const list = document.createElement('ul');
    list.className = 'r-list';
    hits.slice(0, MAX_RESULTS).forEach((hit) => list.append(createResult(hit, term)));
    results.append(createStatus(count + more), list);
  }

  function run() {
    const query = input.value.trim();
    results.replaceChildren();
    results.hidden = !query;
    if (!query) return;

    if (query.length < MIN_QUERY_LENGTH) {
      results.append(createStatus(`Escribe al menos ${MIN_QUERY_LENGTH} letras.`));
      return;
    }

    const { terms, hits } = search(query);
    if (hits.length) renderHits(hits, terms[0]);
    else renderNoResults(query);
  }

  /* ---------- Entrada ---------- */

  function focusSearch() {
    if (UW.drawer.isCompact()) {
      UW.drawer.open({ focus: input });
    } else {
      input.focus();
      input.select();
    }
  }

  function isTypingTarget(target) {
    return Boolean(target) &&
      (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
  }

  function onKeydown(event) {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      focusSearch();
    } else if (event.key === 'Escape' && !event.defaultPrevented) {
      if (document.activeElement === input && input.value) {
        input.value = '';
        run();
      }
    }
  }

  function init() {
    input = document.getElementById('q');
    results = document.getElementById('results');
    if (!input || !results) return;

    index = buildIndex();

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(run, DEBOUNCE_MS);
    });

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', focusSearch);

    document.addEventListener('keydown', onKeydown);
  }

  UW.siteSearch = Object.freeze({ init });
})(window.UW);
