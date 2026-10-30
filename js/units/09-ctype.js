/* יחידה 09 — הספרייה ctype.h */
(function () {
  'use strict';
  const L = window.Lomda;

  const FN = [
    ['isalpha', c => /[A-Za-z]/.test(c), 'אות'],
    ['isdigit', c => /[0-9]/.test(c), 'ספרה'],
    ['isalnum', c => /[A-Za-z0-9]/.test(c), 'אות או ספרה'],
    ['isupper', c => /[A-Z]/.test(c), 'אות גדולה'],
    ['islower', c => /[a-z]/.test(c), 'אות קטנה'],
    ['isspace', c => /[ \t\n\r\f\v]/.test(c), 'רווח, טאב, מעבר שורה'],
    ['ispunct', c => /[!-\/:-@\[-`{-~]/.test(c), 'סימן פיסוק'],
    ['isxdigit', c => /[0-9A-Fa-f]/.test(c), 'ספרה הקסדצימלית'],
    ['isprint', c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127, 'ניתן להדפסה']
  ];

  L.unit({
    id: 'ctype',
    title: 'הספרייה <code>ctype.h</code>',
    short: '<code>ctype.h</code>',
    blurb: 'בדיקות והמרות של תו בודד',
    minutes: 10,
    lede: 'הספרייה <code>ctype.h</code> עוסקת ב<b>תו בודד</b>: האם הוא אות, ספרה, רווח, ואיך להמיר בין אות קטנה לגדולה. היא משלימה את <code>string.h</code>: את המחרוזת עוברים בלולאה, ועל כל תו מפעילים את הבדיקה.',
    goals: [
      'להשתמש בפונקציות הבדיקה <code>is…</code> בתנאי',
      'להמיר אותיות עם <code>toupper</code> ו-<code>tolower</code>, ולשמור את התוצאה',
      'לעבור על מחרוזת ולסווג את התווים שלה'
    ],

    build(host) {
      host.innerHTML = `
      ${L.code(['#include <ctype.h>'])}
      <p>כל פונקציות ה-<code>is…</code> מחזירות <b>ערך שאינו 0</b> כשהתשובה "כן", ו-0 כשהתשובה "לא". התקן לא מבטיח שהערך יהיה דווקא 1, ולכן כותבים <code>if (isdigit(c))</code> ולא <code>if (isdigit(c) == 1)</code>.</p>
      <div class="lab">
        <p class="lab-t">בדיקת תו</p>
        <div class="fields">
          <label class="fld" for="ct-in">תו<input type="text" id="ct-in" value="G" maxlength="1" spellcheck="false" autocomplete="off" style="width:4em;text-align:center"></label>
          <div class="chips" id="ct-q" style="margin:0">${['a', 'Z', '5', ' ', '?', 'f'].map(c => '<button type="button" class="btn ghost small mono" data-c="' + c + '">' + (c === ' ' ? 'רווח' : L.esc(L.clit(c))) + '</button>').join('')}<button type="button" class="btn ghost small mono" data-c="\n">'\\n'</button></div>
        </div>
        <div id="ct-view"></div>
      </div>

      <h3>שמרו את מה ש-<code>toupper</code> מחזירה</h3>
      <p><code>toupper</code> ו-<code>tolower</code> לא משנות את המשתנה שקיבלו. הן <b>מחזירות</b> את התו המומר, ותו שאינו אות מוחזר כמו שהוא:</p>
      ${L.code([
        'toupper(c);                   /* does nothing: the result is thrown away */',
        'c = toupper(c);               /* this changes c */',
        '',
        '/* the whole string, in place */',
        "for (i = 0; s[i] != '\\0'; i++)",
        '    s[i] = toupper(s[i]);'
      ], { bad: 0 })}

      <h3>סיווג התווים במשפט</h3>
      <div class="lab">
        <p class="lab-t">ספירה לפי סוג</p>
        <div class="fields"><label class="fld" for="cs-in">המשפט<input type="text" id="cs-in" value="Room 3.14, Building B!" maxlength="60" spellcheck="false" autocomplete="off" style="width:320px"></label></div>
        ${L.code([
          'int i, letters = 0, digits = 0, spaces = 0, other = 0;',
          "for (i = 0; s[i] != '\\0'; i++)",
          '{',
          '    if (isalpha(s[i]))       letters++;',
          '    else if (isdigit(s[i]))  digits++;',
          '    else if (isspace(s[i]))  spaces++;',
          '    else                     other++;',
          '}'
        ])}
        <div id="cs-view"></div>
      </div>

      ${L.reveal('להעמקה: למה לפעמים כותבים <code>(unsigned char)</code>', `
        <p>הפונקציות של <code>ctype.h</code> מוגדרות רק לערכים 0 עד 255 ול-<code>EOF</code>. בהרבה קומפיילרים <code>char</code> הוא טיפוס עם סימן, כך שבית שערכו מעל 127 (למשל אות בעברית בקובץ ישן) נקרא כמספר שלילי. קריאה כמו <code>isalpha(c)</code> עם ערך כזה היא התנהגות בלתי מוגדרת.</p>
        <p>ההמרה <code>isalpha((unsigned char)c)</code> לא משנה את הבית, רק את הפירוש שלו: הוא נקרא כמספר בין 0 ל-255. בקורס הקלט הוא ASCII, ואין צורך בזה. בקוד שמקבל קלט כלשהו, כדאי.</p>`, 'deep')}
      `;

      const inp = host.querySelector('#ct-in');
      let ch = 'G';
      function render() {
        const n = ch.charCodeAt(0);
        host.querySelector('#ct-view').innerHTML =
          '<div class="mem-wrap">' + L.mem([ch], { idx: 'ascii', size: 'lg' }) + '</div>' +
          '<div class="chips">' + FN.map(([name, f, d]) => {
            const v = n < 128 && f(ch);
            return '<span class="chip ' + (v ? 'yes' : 'no') + '" title="' + d + '"><span class="mono">' + name + '</span> ' + (v ? '≠ 0' : '0') + '</span>';
          }).join('') + '</div>' +
          L.table(['קריאה', 'מחזירה'], [
            [L.ic('toupper(' + L.clit(ch) + ')'), '<span class="mono">' + L.esc(L.clit(ch.toUpperCase())) + '</span>'],
            [L.ic('tolower(' + L.clit(ch) + ')'), '<span class="mono">' + L.esc(L.clit(ch.toLowerCase())) + '</span>']
          ]);
      }
      inp.addEventListener('input', () => { if (inp.value) { ch = inp.value[0]; render(); } });
      host.querySelector('#ct-q').addEventListener('click', e => {
        const b = e.target.closest('[data-c]'); if (!b) return;
        ch = b.dataset.c; inp.value = ch === '\n' ? '' : ch; render();
      });
      render();

      const si = host.querySelector('#cs-in');
      function renderCount() {
        const s = si.value;
        const c = { letters: 0, digits: 0, spaces: 0, other: 0 }; const state = {};
        s.split('').forEach((x, k) => {
          if (/[A-Za-z]/.test(x)) { c.letters++; }
          else if (/[0-9]/.test(x)) { c.digits++; state[k] = 'hit'; }
          else if (/\s/.test(x)) { c.spaces++; }
          else { c.other++; state[k] = 'bad'; }
        });
        host.querySelector('#cs-view').innerHTML =
          '<div class="mem-wrap">' + L.mem(L.bytesOf(s), { size: 'sm', state }) + '</div>' +
          '<div class="vars">' + Object.keys(c).map(k => L.intVar(k, c[k])).join('') + '</div>' +
          '<p class="muted" style="font-size:var(--fs-sm)">ספרות בטורקיז, תווים "אחרים" באדום. ה-<code>\'\\0\'</code> לא נספר, כי הלולאה נעצרת לפניו.</p>';
      }
      si.addEventListener('input', renderCount);
      renderCount();
    },

    check: [
      { q: 'מה יודפס?', code: ["char c = 'a';", 'toupper(c);', 'printf("%c", c);'],
        opts: ['A', 'a', '65', 'שגיאת קומפילציה'], a: 1, why: 'הערך ש-<code>toupper</code> החזירה לא נשמר. צריך <code>c = toupper(c);</code>.' },
      { q: 'מה מחזירה <code>isspace(\'\\n\')</code>?',
        opts: ['0', 'ערך שאינו 0', '-1', '10'], a: 1, why: 'מעבר שורה הוא תו רווח לבן, כמו רווח וטאב.' },
      { q: 'מה מחזירה <code>toupper(\'7\')</code>?',
        opts: ["'7'", '0', '-1', 'שגיאה'], a: 0, why: 'תו שאינו אות קטנה מוחזר בלי שינוי. לכן אפשר להפעיל את <code>toupper</code> על כל תו במחרוזת בלי לבדוק קודם.' }
    ]
  });
})();
