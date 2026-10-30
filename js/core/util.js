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

  /* ── פרקים אופציונליים (config.include) ──
     L.on('CTYPE')     האם הנושא כלול
     L.has('ctype')    האם היחידה כלולה
     L.order()         מזהי היחידות הכלולות, לפי הסדר
     L.num('format')   מספר היחידה כפי שהוא מוצג ('10'), או null אם אינה כלולה
     L.ref('format')   קישור "יחידה 10" ליחידה, או '' אם אינה כלולה
     הסדר נקבע רק לפי config, כך שאפשר לקרוא לפונקציות האלה גם בזמן טעינת קובץ יחידה. */
  const cfg = () => L.config || {};
  L.on = flag => {
    const inc = cfg().include || {};
    return !(flag in inc) || inc[flag] !== false;
  };
  L.has = id => {
    const fu = cfg().flagUnits || {};
    return Object.keys(fu).every(flag => L.on(flag) || fu[flag].indexOf(id) < 0);
  };
  L.order = () => {
    const out = [];
    (cfg().parts || []).forEach(p => p.units.forEach(id => { if (L.has(id)) out.push(id); }));
    return out;
  };
  L.num = id => { const i = L.order().indexOf(id); return i < 0 ? null : String(i + 1).padStart(2, '0'); };
  L.ref = (id, before) => {
    const n = L.num(id);
    return n === null ? '' : (before || '') + '<a href="#' + id + '">יחידה ' + n + '</a>';
  };
  /* מסנן פריטים (שאלות, באגים, תרגילים) שמסומנים ב-topic של נושא שהוסתר */
  /* כל פריט שומר את המקום המקורי שלו (_k), כדי שתשובות שמורות יישארו צמודות לשאלה הנכונה גם כשחלק מהשאלות מוסתרות */
  L.keep = list => list.map((x, i) => { if (x._k === undefined) x._k = i; return x; }).filter(x => !x.topic || L.on(x.topic));

  /* מאזין input עם השהיה קצרה */
  L.debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms || 120); }; };
})();
