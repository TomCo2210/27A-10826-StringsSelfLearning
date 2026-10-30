/* ════════════════════════════════════════════════════════════
   util.js — עזרים כלליים ורישום יחידות
   כל הקבצים חולקים אובייקט גלובלי אחד: window.Lomda (בקיצור L).
   הקבצים נטענים כ-script רגיל (לא module), כדי שהלומדה תעבוד גם
   בפתיחה ישירה מהדיסק (file://) וגם כקובץ במודל.
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = (window.Lomda = window.Lomda || {});

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  L.esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);

  L.$  = (sel, root) => (root || document).querySelector(sel);
  L.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* inline code — <code> מבודד bidi */
  L.ic = s => '<code>' + L.esc(s) + '</code>';

  /* הצגת מחרוזת JS בכתיב של C: מעבר שורה ← \n וכו' */
  L.cstr = s => String(s)
    .replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r').replace(/\0/g, '\\0').replace(/"/g, '\\"');

  /* תו בודד כמילולון C: 'a', '\n', '\0' */
  L.clit = ch => "'" + (ch === '\0' ? '\\0' : ch === '\n' ? '\\n' : ch === '\t' ? '\\t' : ch === "'" ? "\\'" : ch === '\\' ? '\\\\' : ch) + "'";

  L.reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ── ניקוי בעת מעבר יחידה (טיימרים של נגנים וכו') ── */
  const leaveFns = [];
  L.onLeave = fn => leaveFns.push(fn);
  L.runLeave = () => { while (leaveFns.length) { try { leaveFns.pop()(); } catch (e) { /* ignore */ } } };

  /* ── רישום יחידות ──
     L.unit({ id, title, short, minutes, goals:[], prereq, build(host), check:[...] }) */
  L.UNITS = {};
  L.unit = def => { L.UNITS[def.id] = def; };

  /* מאזין input עם השהיה קצרה */
  L.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms || 120); }; };
})();
