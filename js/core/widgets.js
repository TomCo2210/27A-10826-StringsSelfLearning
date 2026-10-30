/* ════════════════════════════════════════════════════════════
   widgets.js — אבני בניין של תוכן: הערות, מעבדה, לשוניות, טבלאות, חשיפה
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = window.Lomda;

  /* הערה צבעונית. kind: info | key | warn | ok | bad */
  L.note = (kind, title, body) =>
    '<aside class="note ' + (kind || 'info') + '">' + (title ? '<b class="note-t">' + title + '</b>' : '') + body + '</aside>';

  /* מסגרת לרכיב אינטראקטיבי */
  L.lab = (title, body, id) =>
    '<div class="lab"' + (id ? ' id="' + id + '"' : '') + '>' + (title ? '<p class="lab-t">' + title + '</p>' : '') + (body || '') + '</div>';

  /* חשיפה בלחיצה. kind: '' | 'solution' | 'deep' */
  L.reveal = (summary, body, kind, tag) =>
    '<details class="reveal' + (kind ? ' ' + kind : '') + '"><summary>' + summary +
    (tag ? '<span class="tag">' + tag + '</span>' : '') + '</summary><div class="rv-body">' + body + '</div></details>';

  /* טבלה. head: מערך כותרות. rows: מערך שורות של תאים (HTML).
     opts.mono: אינדקסים של עמודות בגופן קוד */
  L.table = (head, rows, opts) => {
    opts = opts || {};
    const mono = new Set(opts.mono || []);
    let h = '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      head.map((x, i) => '<th' + (mono.has(i) ? ' class="mono"' : '') + '>' + x + '</th>').join('') + '</tr></thead><tbody>';
    rows.forEach(r => {
      h += '<tr>' + r.map((x, i) => '<td' + (mono.has(i) ? ' class="mono"' : '') + '>' + x + '</td>').join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  };

  /* לשוניות. items: [{ label, render(el) }]. מחזיר { select(i) } */
  let tabSeq = 0;
  L.tabs = function (host, items, opts) {
    opts = opts || {};
    const id = 'tb' + (++tabSeq);
    host.innerHTML =
      '<div class="tabs" role="tablist">' +
      items.map((it, i) => '<button type="button" role="tab" id="' + id + '-' + i + '" aria-controls="' + id + '-p" aria-selected="false" data-i="' + i + '">' + it.label + '</button>').join('') +
      '</div><div class="tab-body" role="tabpanel" id="' + id + '-p"></div>';
    const body = host.querySelector('.tab-body');
    const btns = L.$$('[role=tab]', host);
    function select(i) {
      btns.forEach((b, k) => b.setAttribute('aria-selected', k === i ? 'true' : 'false'));
      body.setAttribute('aria-labelledby', id + '-' + i);
      L.runLocalLeave(body);
      body.innerHTML = '';
      items[i].render(body);
      if (opts.onChange) opts.onChange(i);
    }
    host.querySelector('.tabs').addEventListener('click', e => {
      const b = e.target.closest('[role=tab]'); if (b) select(+b.dataset.i);
    });
    host.querySelector('.tabs').addEventListener('keydown', e => {
      const cur = btns.indexOf(document.activeElement); if (cur < 0) return;
      /* RTL: חץ שמאלה = הבא */
      let nx = null;
      if (e.key === 'ArrowLeft') nx = (cur + 1) % btns.length;
      if (e.key === 'ArrowRight') nx = (cur - 1 + btns.length) % btns.length;
      if (nx !== null) { e.preventDefault(); btns[nx].focus(); select(nx); }
    });
    select(opts.initial || 0);
    return { select };
  };

  /* נגנים בתוך לשונית צריכים לעצור כשהלשונית מתחלפת */
  L.runLocalLeave = el => { (el._leave || []).forEach(fn => { try { fn(); } catch (e) { /* */ } }); el._leave = []; };
  L.localLeave = (el, fn) => {
    const host = el.closest('.tab-body') || null;
    if (host) (host._leave = host._leave || []).push(fn);
    L.onLeave(fn);
  };

  /* מתג תוצאה במסוף: הופך \n לסימן גלוי וטקסט אדום לשגיאה */
  L.outText = (s, opts) => {
    opts = opts || {};
    return L.esc(s).replace(/\n/g, opts.showNl ? '<span class="nl">↵</span>\n' : '\n');
  };
})();
