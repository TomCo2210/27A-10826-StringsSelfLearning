/* ════════════════════════════════════════════════════════════
   loader.js — קורא את הדגלים מהשרת, ורק אחר כך מריץ את היחידות

   ב-GitHub Pages, ה-workflow כותב קובץ flags.json לפי ה-Secrets
   (INCLUDE_STRTOK, INCLUDE_CTYPE, INCLUDE_SPRINTF_SSCANF, INCLUDE_PRACTICE).
   הקובץ נקרא בכל טעינה של העמוד בלי מטמון (cache: 'no-store' ופרמטר זמן),
   כך שערך חדש מופיע מיד אחרי שהפריסה מסתיימת, גם אם הדפדפן שמר גרסה ישנה של config.js.

   אם אין flags.json (פתיחה מהדיסק, עותק במודל, תצוגה מקדימה) או שהשרת לא ענה תוך 3 שניות,
   נשארים הערכים שב-config.js.

   היחידות ו-app.js מסומנים ב-index.html כ-type="lomda/deferred", והם רצים כאן לפי הסדר,
   אחרי שהדגלים נקבעו. כך כל מה שיחידה מחשבת בזמן הטעינה (מספרים, זמנים, הפניות) מתאים לדגלים.
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = window.Lomda;
  const inc = (L.config && L.config.include) || {};
  L.flagsSource = 'config.js';

  function apply(f) {
    if (!f || typeof f !== 'object') return;
    let any = false;
    Object.keys(inc).forEach(k => {
      if (typeof f[k] === 'boolean') { inc[k] = f[k]; any = true; }
    });
    if (any) L.flagsSource = 'flags.json';
  }

  /* התגיות של היחידות נמצאות ב-index.html אחרי הקובץ הזה, ולכן מחכים שהדף ייקרא עד הסוף */
  const whenParsed = fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());

  let started = false;
  function runDeferred() {
    if (started) return;
    started = true;
    whenParsed(load);
  }
  function load() {
    document.querySelectorAll('script[type="lomda/deferred"]').forEach(old => {
      const s = document.createElement('script');
      s.src = old.getAttribute('src');
      s.async = false;              /* שומר על סדר ההרצה */
      document.body.appendChild(s);
    });
  }

  if (location.protocol === 'file:' || !window.fetch) { runDeferred(); return; }

  const ctl = window.AbortController ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctl) ctl.abort(); runDeferred(); }, 3000);
  fetch('flags.json?t=' + Date.now(), { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
    .then(r => (r.ok ? r.json() : null))
    .then(apply)
    .catch(() => { /* אין קובץ דגלים: נשארים עם config.js */ })
    .then(() => { clearTimeout(timer); runDeferred(); });
})();
