/* יחידה 04 — הדפסת מחרוזת */
(function () {
  'use strict';
  const L = window.Lomda;

  const CASES = [
    { name: 'a', label: 'מחרוזת רגילה', decl: 'char a[] = "C is fun";', bytes: L.bytesOf('C is fun'), size: 9,
      note: L.note('ok', 'המקרה הרגיל', 'הקומפיילר הוסיף <code>\'\\0\'</code>, וההדפסה עוצרת בו.') },
    { name: 'b', label: 'בלי \'\\0\'', decl: "char b[] = {'H', 'i'};", bytes: ['H', 'i', '|', '!', '7', '\0'], size: 2, oobFrom: 2,
      note: L.note('warn', 'התנהגות בלתי מוגדרת', 'אין <code>\'\\0\'</code> במערך. <code>printf</code> ממשיכה לקרוא בתים שלא שייכים ל-<code>b</code> עד שהיא נתקלת במקרה באפס. כאן נדפסו עוד שני תווים; בהרצה אחרת יכול להיות משהו אחר, או קריסה.') },
    { name: 'c', label: '\'\\0\' באמצע', decl: 'char c[] = "ab\\0cd";', bytes: ['a', 'b', '\0', 'c', 'd', '\0'], size: 6,
      note: L.note('info', 'המחרוזת נגמרת ב-\'\\0\' הראשון', 'הקומפיילר הקצה 6 בתים, ו-<code>sizeof(c)</code> הוא 6. אבל לכל פונקציה של מחרוזות המחרוזת היא <code>"ab"</code>, באורך 2. התווים <code>cd</code> קיימים בזיכרון, ושום פונקציית מחרוזת לא תגיע אליהם.') },
    { name: 'd', label: 'מערך גדול', decl: 'char d[8] = "hi";', bytes: L.bytesOf('hi', 8, 0), size: 8,
      note: L.note('ok', 'התאים המאופסים לא מודפסים', 'ההדפסה עוצרת ב-<code>\'\\0\'</code> שבתא 2, והתאים המאופסים שאחריו לא משפיעים על הפלט. הם מקום פנוי.') }
  ];

  function build(c) {
    const code = ['#include <stdio.h>', '', 'int main()', '{', '    ' + c.decl, '    printf("[%s]\\n", ' + c.name + ');', '    return 0;', '}'];
    const state0 = {};
    if (c.oobFrom !== undefined) for (let k = c.oobFrom; k < c.bytes.length - 1; k++) state0[k] = 'oob';
    const label = 'char ' + c.name + '[' + c.size + ']';
    const F = [];
    const out = [];   /* {ch, err} */
    const show = tail => '[' + out.map(o => o.err ? '<span class="err">' + L.esc(o.ch) + '</span>' : L.esc(o.ch)).join('') + (tail || '');
    F.push({ line: 4, stage: L.mem(c.bytes, { label, state: state0 }), note: 'המערך בזיכרון. גודלו ' + c.size + ' בתים.' });
    F.push({ line: 5, outHtml: show(), stage: L.mem(c.bytes, { label, state: state0 }), note: '<code>printf</code> מקבלת את מקום ההתחלה של המערך, ולא את האורך שלו. קודם היא מדפיסה <code>[</code>.' });
    const flat = c.bytes.filter(x => x !== '|');
    for (let i = 0; i < flat.length; i++) {
      const st = Object.assign({}, state0); for (let k = 0; k < i; k++) if (!st[k]) st[k] = 'done';
      if (flat[i] === '\0') {
        F.push({ line: 5, outHtml: show(']\n'), stage: L.mem(c.bytes, { label, state: st, cur: i, marks: { [i]: 'stop' } }),
          note: 'הבית בתא ' + i + ' הוא 0. כאן <code>%s</code> נעצר, ו-<code>printf</code> ממשיכה לשאר הפורמט: <code>]</code> ומעבר שורה.' });
        break;
      }
      const isOob = c.oobFrom !== undefined && i >= c.oobFrom;
      out.push({ ch: flat[i], err: isOob });
      F.push({ line: 5, outHtml: show(), stage: L.mem(c.bytes, { label, state: st, cur: i }),
        note: isOob ? '<b>קוראים בית שמחוץ למערך.</b> מה שיודפס הוא מה שהיה במקרה בזיכרון.' : 'מדפיסים את <b>\'' + L.esc(flat[i]) + '\'</b> מתא ' + i + '.' });
    }
    return { code, frames: F };
  }

  /* ── מגרש משחקים לפורמט ── */
  const FMTS = ['%s', '|%s|', '|%10s|', '|%-10s|', '|%.3s|', '|%8.3s|'];
  function fmt(f, s) {
    return f.replace(/%(-?)(\d*)(?:\.(\d+))?s/, (_, minus, w, p) => {
      let t = p !== undefined ? s.slice(0, +p) : s;
      const width = w ? +w : 0;
      if (t.length < width) t = minus ? t + ' '.repeat(width - t.length) : ' '.repeat(width - t.length) + t;
      return t;
    });
  }

  L.unit({
    id: 'print',
    title: 'הדפסת מחרוזת',
    blurb: '<code>printf</code> עם <code>%s</code>, <code>puts</code>, ומה קורה בלי <code>\'\\0\'</code>',
    minutes: 10,
    lede: 'הפקודה <code>printf("%s", s)</code> לא יודעת כמה תווים יש ב-<code>s</code>. היא מקבלת את מקום ההתחלה של המערך, ומדפיסה בית אחרי בית עד שהיא פוגשת 0.',
    goals: [
      'לחזות מה יודפס בכל אחד מארבעה מקרים נפוצים',
      'להבין למה מערך בלי <code>\'\\0\'</code> מדפיס זבל',
      'להשתמש ב-<code>puts</code>, ברוחב וברמת דיוק של <code>%s</code>'
    ],

    build(host) {
      host.innerHTML = `
      <div class="lab"><p class="lab-t">ארבע הגדרות, ארבעה פלטים</p><div id="p-tabs"></div></div>
      ${L.legend(['ch', 'nul', 'zero', 'oob'])}

      <h3>דרכים להדפיס מחרוזת</h3>
      ${L.table(['הקוד', 'מה מודפס', 'הערה'], [
        [L.ic('printf("%s\\n", s);'), 'המחרוזת ומעבר שורה', 'הצורה הנפוצה'],
        [L.ic('puts(s);'), 'המחרוזת ומעבר שורה', '<code>puts</code> <b>תמיד</b> מוסיפה <code>\'\\n\'</code> בעצמה'],
        [L.ic('printf("%c", s[i]);'), 'תו אחד', 'בתוך לולאה, כשרוצים לטפל בכל תו בנפרד'],
        [L.ic('printf("%.3s", s);'), '3 התווים הראשונים לכל היותר', 'עוצר ב-3 או ב-<code>\'\\0\'</code>, המוקדם מביניהם'],
        [L.ic('printf("%10s", s);'), 'מיושר לימין בשדה של 10', 'שימושי להדפסת טבלאות']
      ])}
      <div class="lab">
        <p class="lab-t">רוחב ודיוק</p>
        <div class="fields">
          <label class="fld" for="f-in">המחרוזת<input type="text" id="f-in" value="Afeka" maxlength="14" spellcheck="false" autocomplete="off"></label>
        </div>
        <div class="chips" id="f-fmts">${FMTS.map((f, i) => '<button type="button" class="btn ghost small mono' + (i === 2 ? ' on' : '') + '" data-f="' + L.esc(f) + '">' + L.esc(f) + '</button>').join('')}</div>
        <div id="f-out"></div>
      </div>
      ${L.note('info', 'איך לקרוא את הפורמט', '<code>%10s</code>: לפחות 10 תווים, ריפוד ברווחים משמאל. <code>%-10s</code>: אותו דבר עם ריפוד מימין. <code>%.3s</code>: לכל היותר 3 תווים. <code>%8.3s</code>: לכל היותר 3 תווים, בתוך שדה של 8. בדוגמאות שמתי <code>|</code> בצדדים כדי שהרווחים יהיו גלויים.')}
      `;

      L.tabs(host.querySelector('#p-tabs'), CASES.map(c => ({
        label: '<code>' + c.name + '</code> · ' + c.label,
        render(el) { el.innerHTML = '<div class="pl"></div>' + c.note; L.player(el.querySelector('.pl'), build(c)); }
      })));

      let curFmt = FMTS[2];
      const inp = host.querySelector('#f-in');
      function renderFmt() {
        const s = inp.value;
        host.querySelector('#f-out').innerHTML =
          L.code(['printf("' + curFmt + '\\n", "' + L.cstr(s) + '");']) +
          '<div class="out">' + L.esc(fmt(curFmt, s)).replace(/ /g, '<span class="dim">·</span>') + '</div>' +
          '<p class="muted" style="font-size:var(--fs-sm);margin-top:6px">כל נקודה אפורה היא רווח.</p>';
      }
      host.querySelector('#f-fmts').addEventListener('click', e => {
        const b = e.target.closest('[data-f]'); if (!b) return;
        curFmt = b.dataset.f;
        L.$$('[data-f]', host).forEach(x => x.classList.toggle('on', x === b));
        renderFmt();
      });
      inp.addEventListener('input', renderFmt);
      renderFmt();
    },

    check: [
      { q: 'מה יודפס?', code: ['puts("Hi");', 'puts("there");'],
        opts: ['Hithere', 'Hi ואחריו there בשורה חדשה', 'Hi there', 'שום דבר, חסר \\n'], a: 1,
        why: '<code>puts</code> מוסיפה מעבר שורה אחרי כל מחרוזת, ולכן כל מילה מודפסת בשורה משלה.' },
      { q: 'מה יודפס?', code: ['printf("|%.2s|", "hello");'],
        opts: ['|hello|', '|he|', '|lo|', '|  hello|'], a: 1, why: 'הדיוק <code>.2</code> מגביל את ההדפסה לשני התווים הראשונים.' },
      { q: 'מה יודפס?', code: ['char s[] = "abc\\0def";', 'printf("%s %d", s, (int)sizeof(s));'],
        opts: ['abcdef 7', 'abc 8', 'abc 4', 'abcdef 8'], a: 1,
        why: 'ההדפסה עוצרת ב-<code>\'\\0\'</code> הראשון, ולכן רק <code>abc</code>. הקומפיילר הקצה 6 תווים, ועוד <code>\'\\0\'</code> שהוא מוסיף תמיד בסוף מחרוזת ספרותית: 8 בתים.' }
    ]
  });
})();
