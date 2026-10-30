/* ════════════════════════════════════════════════════════════
   memory.js — ציור הזיכרון
   L.mem(bytes, opts) מחזיר HTML של פס בתים.

   bytes: מערך שכל איבר בו הוא אחד מאלה:
     'a'    תו רגיל          '\0'  תו הסיום
     0      תא מאופס (יש איתחול, הערך 0 ואינו חלק מהמחרוזת)
     null   תא לא מאותחל (זבל)
     '|'    גבול: קו בין סוף המערך לזיכרון שאינו שלו

   opts:
     label   כותרת מעל הפס (טקסט, מוצג LTR)
     marks   { index: 'i=2' }      תווית מעל תא
     state   { index: 'hit' | 'done' | 'oob' | 'bad' }
     cur     אינדקס התא הנוכחי (מוגבה)
     idx     'index' (ברירת מחדל: [0] [1]…) | 'addr' (כתובות) | 'ascii' | false
     base    כתובת התחלה כש-idx='addr' (ברירת מחדל 1000)
     size    'sm' | 'lg'
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = window.Lomda;

  L.glyph = ch => {
    if (ch === '\0') return '\\0';
    if (ch === '\n') return '\\n';
    if (ch === '\r') return '\\r';
    if (ch === '\t') return '\\t';
    if (ch === ' ') return '␣';
    if (ch === 0) return '0';
    if (ch === null || ch === undefined) return '?';
    return L.esc(ch);
  };
  L.byteCls = ch => {
    if (ch === '\0') return 'nul';
    if (ch === 0) return 'zero';
    if (ch === null || ch === undefined) return 'garbage';
    if (ch === ' ') return 'space';
    if (typeof ch === 'string' && ch.charCodeAt(0) < 32) return 'ctrl';
    return '';
  };
  const code = ch => (ch === '\0' || ch === 0) ? 0 : (typeof ch === 'string' ? ch.charCodeAt(0) : '');

  L.mem = function (bytes, o) {
    o = o || {};
    const marks = o.marks || {}, state = o.state || {};
    const idx = o.idx === undefined ? 'index' : o.idx;
    const base = o.base === undefined ? 1000 : o.base;
    const hasMarks = Object.keys(marks).length > 0 || o.cur !== undefined;
    let h = '<div class="mem-block' + (hasMarks ? '' : ' nomarks') + '">';
    if (o.label) h += '<div class="mem-label">' + o.label + '</div>';
    h += '<div class="mem' + (o.size ? ' ' + o.size : '') + (idx ? '' : ' noidx') + '">';
    let k = 0;   /* אינדקס לוגי — לא סופר את סימני הגבול */
    bytes.forEach(ch => {
      if (ch === '|') { h += '<span class="bound" title="סוף המערך"></span>'; return; }
      const i = k++;
      const cls = ['b', L.byteCls(ch), state[i] || '', o.cur === i ? 'cur' : ''].filter(Boolean).join(' ');
      h += '<div class="' + cls + '">' + L.glyph(ch);
      if (marks[i] !== undefined && marks[i] !== '') h += '<span class="m">' + L.esc(marks[i]) + '</span>';
      if (idx === 'index') h += '<span class="i">' + i + '</span>';
      else if (idx === 'addr') h += '<span class="i">' + (base + i) + '</span>';
      else if (idx === 'ascii') h += '<span class="i">' + code(ch) + '</span>';
      h += '</div>';
    });
    h += '</div></div>';
    return h;
  };

  /* מקרא קבוע לפס הזיכרון */
  L.legend = function (which) {
    const all = {
      ch:      '<span><span class="b">a</span> תו</span>',
      nul:     '<span><span class="b nul">\\0</span> תו הסיום</span>',
      zero:    '<span><span class="b zero">0</span> תא מאופס</span>',
      garbage: '<span><span class="b garbage">?</span> זבל (לא אותחל)</span>',
      oob:     '<span><span class="b oob">?</span> מחוץ למערך</span>',
      space:   '<span><span class="b space">␣</span> רווח</span>'
    };
    return '<div class="legend">' + (which || ['ch', 'nul', 'zero', 'garbage', 'oob']).map(k => all[k]).join('') + '</div>';
  };

  /* הופך מחרוזת JS למערך בתים כולל '\0', ומרפד עד size בערך fill */
  L.bytesOf = function (str, size, fill) {
    const b = String(str).split('');
    b.push('\0');
    if (size !== undefined) while (b.length < size) b.push(fill === undefined ? 0 : fill);
    return b;
  };

  /* משתנה int */
  L.intVar = (name, val, changed) =>
    '<span class="var"><span class="vb' + (changed ? ' changed' : '') + '">' + (val === null || val === undefined ? '?' : L.esc(val)) +
    '</span><span class="vn">' + L.esc(name) + '</span></span>';
})();
