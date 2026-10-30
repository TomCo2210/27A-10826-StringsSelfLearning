/* ════════════════════════════════════════════════════════════
   highlight.js — צביעת קוד C ובלוק קוד עם מספרי שורות
   מנתח לקסיקלי פשוט (לא regex מקונן): הערות, מחרוזות, תווים,
   פרה-פרוססור, מילים שמורות, פונקציות ספרייה ומספרים.
   התו '\0' מקבל צבע משלו — אותו צבע שלו בפס הזיכרון.
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = window.Lomda;

  const KW = new Set(('auto break case char const continue default do double else enum extern float for ' +
    'goto if int long register return short signed sizeof static struct switch typedef union unsigned void ' +
    'volatile while size_t NULL EOF').split(' '));
  const FN = new Set(('printf scanf puts gets fgets getchar putchar strlen strcpy strncpy strcat strncat strcmp ' +
    'strncmp strchr strrchr strstr strtok sprintf snprintf sscanf isalpha isdigit isalnum isspace isupper islower ' +
    'ispunct isxdigit iscntrl isprint isgraph toupper tolower main malloc free').split(' '));

  function hlLine(line, st) {
    let out = '', i = 0;
    const n = line.length;
    const push = (cls, txt) => { out += cls ? '<span class="tk-' + cls + '">' + L.esc(txt) + '</span>' : L.esc(txt); };

    if (st.inComment) {
      const end = line.indexOf('*/');
      if (end < 0) { push('com', line); return out; }
      push('com', line.slice(0, end + 2)); i = end + 2; st.inComment = false;
    }
    const pp = i === 0 && line.match(/^(\s*#\s*\w+)/);
    if (pp) {
      push('pp', pp[1]); i = pp[1].length;
      const inc = line.slice(i).match(/^(\s*)(<[^>]*>)/);
      if (inc) { push('', inc[1]); push('str', inc[2]); i += inc[0].length; }
    }
    while (i < n) {
      const c = line[i];
      if (c === '/' && line[i + 1] === '/') { push('com', line.slice(i)); break; }
      if (c === '/' && line[i + 1] === '*') {
        const end = line.indexOf('*/', i + 2);
        if (end < 0) { push('com', line.slice(i)); st.inComment = true; break; }
        push('com', line.slice(i, end + 2)); i = end + 2; continue;
      }
      if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < n && line[j] !== c) { if (line[j] === '\\') j++; j++; }
        j = Math.min(j + 1, n);
        const tok = line.slice(i, j);
        push(tok === "'\\0'" ? 'term' : (c === "'" ? 'chr' : 'str'), tok);
        i = j; continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        let j = i; while (j < n && /\w/.test(line[j])) j++;
        const w = line.slice(i, j);
        push(KW.has(w) ? 'kw' : FN.has(w) ? 'fn' : '', w);
        i = j; continue;
      }
      if (/\d/.test(c)) {
        let j = i; while (j < n && /[\w.]/.test(line[j])) j++;
        push('num', line.slice(i, j)); i = j; continue;
      }
      push('', c); i++;
    }
    return out;
  }

  L.hl = line => hlLine(line, {});

  /* L.code(lines, { hi, bad, label, nonum, cls })
     lines: מערך שורות או מחרוזת עם \n.  hi/bad: אינדקס או מערך אינדקסים (מ-0). */
  L.code = function (lines, o) {
    o = o || {};
    if (typeof lines === 'string') lines = lines.replace(/\n$/, '').split('\n');
    const asSet = v => new Set(v == null ? [] : (Array.isArray(v) ? v : [v]));
    const hi = asSet(o.hi), bad = asSet(o.bad);
    const st = {};
    let h = '<figure class="code' + (o.nonum ? ' nonum' : '') + (o.cls ? ' ' + o.cls : '') + '">';
    if (o.label) h += '<figcaption>' + o.label + '</figcaption>';
    h += '<pre><code class="c-src">';
    lines.forEach((ln, i) => {
      const cls = 'ln' + (hi.has(i) ? ' hi' : '') + (bad.has(i) ? ' bad' : '');
      h += '<span class="' + cls + '" data-ln="' + i + '"><span class="n">' + (i + 1) + '</span>' + (hlLine(ln, st) || ' ') + '</span>';
    });
    return h + '</code></pre></figure>';
  };
})();
