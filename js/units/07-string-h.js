/* יחידה 07 — הספרייה string.h */
(function () {
  'use strict';
  const L = window.Lomda;

  /* עזר: מצב מערך יעד שיכול לגלוש. data ארוך מ-size => הבתים העודפים מחוץ לגבול */
  function destStrip(name, size, data, extra) {
    const bytes = data.slice(0, size), state = {};
    if (data.length > size) { bytes.push('|'); data.slice(size).forEach((x, k) => { bytes.push(x); state[size + k] = 'oob'; }); }
    Object.keys(extra && extra.state || {}).forEach(k => { if (!state[k]) state[k] = extra.state[k]; });
    return L.mem(bytes, Object.assign({}, extra || {}, { state, label: 'char ' + name + '[' + size + ']' }));
  }
  const doneTo = n => { const s = {}; for (let k = 0; k < n; k++) s[k] = 'done'; return s; };

  function fStrcpy(D) {
    const src = 'hello', sb = L.bytesOf(src);
    const code = ['char src[] = "hello";', 'char dest[' + D + '];', '', 'strcpy(dest, src);', 'printf("|%s|\\n", dest);'];
    const data = new Array(D).fill(null);
    const F = [];
    const st = (i, cur) => L.mem(sb, { label: 'char src[6]', cur, state: doneTo(i) }) + destStrip('dest', D, data, { cur, state: doneTo(i) });
    F.push({ line: 1, stage: st(0), note: '<code>dest</code> בגודל ' + D + ', לא מאותחל.' + (D < 6 ? ' שימו לב: <code>"hello"</code> צריכה 6 בתים.' : '') });
    for (let i = 0; i < sb.length; i++) {
      data[i] = sb[i];
      F.push({ line: 3, stage: st(i, i),
        note: i >= D ? '<b style="color:var(--bad)">כותבים מחוץ ל-dest</b> (תא ' + i + '). <code>strcpy</code> לא קיבלה את הגודל של <code>dest</code>, ואין לה דרך לדעת שהמקום נגמר.'
          : sb[i] === '\0' ? 'מעתיקים גם את <code>\'\\0\'</code>. בלעדיו <code>dest</code> לא הייתה מחרוזת.' : 'מעתיקים \'' + sb[i] + '\' לתא ' + i + '.' });
    }
    F.push({ line: 4, outHtml: D < 6 ? '|hello|<span class="err">  ???</span>\n' : '|hello|\n',
      stage: st(sb.length), note: D < 6 ? '<b>התנהגות בלתי מוגדרת.</b> לפעמים התוכנית "עובדת", לפעמים קורסת, ולפעמים משתנה אחר משתנה בשקט. לכן בודקים <b>לפני</b> ההעתקה שיש מקום.' : 'הועתקו 6 בתים: 5 תווים ו-<code>\'\\0\'</code>.' });
    return { code, frames: F };
  }

  function fStrcat() {
    const a = 'Hi', s = ' there', D = 12;
    const sb = L.bytesOf(s);
    const data = L.bytesOf(a, D, 0);
    const code = ['char dest[12] = "Hi";', 'char src[] = " there";', '', 'strcat(dest, src);', 'printf("|%s|\\n", dest);'];
    const F = [];
    const st = (dcur, scur, done) => L.mem(sb, { label: 'char src[7]', cur: scur }) + destStrip('dest', D, data, { cur: dcur, state: done || {} });
    F.push({ line: 0, stage: st(), note: 'ב-<code>dest</code> יש <code>"Hi"</code>, ואחריו מקום פנוי.' });
    for (let i = 0; i <= a.length; i++) {
      F.push({ line: 3, stage: st(i), note: i < a.length ? '<b>שלב א\': מחפשים את הסוף.</b> תא ' + i + ' הוא \'' + a[i] + '\'.' : '<b>נמצא <code>\'\\0\'</code> בתא ' + i + '.</b> כאן יתחיל השרשור, והתו הזה יידרס.' });
    }
    for (let j = 0; j < sb.length; j++) {
      data[a.length + j] = sb[j];
      F.push({ line: 3, stage: st(a.length + j, j, doneTo(a.length + j)), note: sb[j] === '\0' ? 'מעתיקים את <code>\'\\0\'</code> החדש.' : '<b>שלב ב\':</b> מעתיקים \'' + L.glyph(sb[j]) + '\' לתא ' + (a.length + j) + '.' });
    }
    F.push({ line: 4, out: '|Hi there|\n', stage: st(undefined, undefined, doneTo(8)), note: 'הרווח הגיע מ-<code>src</code>. <code>strcat</code> לא מוסיפה רווחים בעצמה.' });
    return { code, frames: F };
  }

  function cmpFrames(x, y) {
    const xb = L.bytesOf(x), yb = L.bytesOf(y);
    const code = ['int r = strcmp(a, b);', '', 'if (r < 0)       printf("a comes first\\n");', 'else if (r > 0)  printf("b comes first\\n");', 'else             printf("equal\\n");'];
    const F = [];
    const st = (i, hit) => {
      const s = doneTo(i); if (hit !== undefined) s[i] = hit;
      return L.mem(xb, { label: 'a', state: s, cur: i, marks: { [i]: String(xb[i] === '\0' ? 0 : xb[i].charCodeAt(0)) } }) +
             L.mem(yb, { label: 'b', state: s, cur: i, marks: { [i]: String(yb[i] === '\0' ? 0 : yb[i].charCodeAt(0)) } });
    };
    let i = 0;
    while (true) {
      const ca = xb[i], cb = yb[i];
      const va = ca === '\0' ? 0 : ca.charCodeAt(0), vb = cb === '\0' ? 0 : cb.charCodeAt(0);
      if (va === vb && va !== 0) { F.push({ line: 0, stage: st(i, 'done'), note: 'תא ' + i + ': שני התווים \'' + L.glyph(ca) + '\'. שווים, ממשיכים.' }); i++; continue; }
      if (va === vb) {
        F.push({ line: 0, stage: st(i, 'hit'), note: 'שתי המחרוזות הגיעו ל-<code>\'\\0\'</code> באותו מקום, בלי הבדל בדרך. <code>strcmp</code> מחזירה <b>0</b>.' });
        F.push({ line: 4, out: 'equal\n', stage: st(i, 'hit'), note: 'המחרוזות זהות.' });
      } else {
        const neg = va < vb;
        F.push({ line: 0, stage: st(i, 'bad'), note: 'תא ' + i + ': ' + (ca === '\0' ? '<code>\'\\0\'</code> (0)' : '\'' + L.glyph(ca) + '\' (' + va + ')') + ' מול ' + (cb === '\0' ? '<code>\'\\0\'</code> (0)' : '\'' + L.glyph(cb) + '\' (' + vb + ')') + '. ההשוואה נעצרת בהבדל הראשון. ' +
          (neg ? 'הערך ב-<code>a</code> קטן יותר, ולכן התוצאה <b>שלילית</b>.' : 'הערך ב-<code>a</code> גדול יותר, ולכן התוצאה <b>חיובית</b>.') +
          (ca === '\0' || cb === '\0' ? ' מחרוזת שהיא תחילית של השנייה קטנה ממנה.' : '') });
        F.push({ line: neg ? 2 : 3, out: (neg ? 'a comes first' : 'b comes first') + '\n', stage: st(i, 'bad'), note: neg ? '<code>a</code> קודמת לפי סדר ASCII.' : '<code>b</code> קודמת לפי סדר ASCII.' });
      }
      break;
    }
    return { code, frames: F };
  }

  L.unit({
    id: 'string-h',
    title: 'הספרייה <code>string.h</code>',
    short: '<code>string.h</code>',
    blurb: '<code>strlen</code>, <code>strcpy</code>, <code>strcat</code>, <code>strcmp</code> ועוד',
    minutes: 22,
    lede: 'הספרייה <code>string.h</code> נותנת את הפעולות הנפוצות על מחרוזות. כולן עובדות באותה שיטה: רצות עד <code>\'\\0\'</code>. ואף אחת מהן לא יודעת כמה מקום יש במערך היעד.',
    goals: [
      'להעתיק, לשרשר ולהשוות מחרוזות עם פונקציות הספרייה',
      'לבדוק <b>לפני</b> העתקה ושרשור שיש מספיק מקום',
      'לפרש את הערך ש-<code>strcmp</code> מחזירה',
      'לחפש תו ותת-מחרוזת עם <code>strchr</code> ו-<code>strstr</code>'
    ],

    build(host) {
      host.innerHTML = `
      ${L.code(['#include <string.h>'])}
      ${L.table(['הפונקציה', 'מה היא עושה', 'מה מחזירה', 'בודקת מקום ביעד?'], [
        [L.ic('strlen(s)'), 'סופרת תווים עד <code>\'\\0\'</code>', 'מספר מטיפוס <code>size_t</code>', '—'],
        [L.ic('strcpy(dest, src)'), 'מעתיקה את <code>src</code> לתוך <code>dest</code>, כולל <code>\'\\0\'</code>', '<code>dest</code>', '<span class="no">לא</span>'],
        [L.ic('strncpy(dest, src, n)'), 'מעתיקה לכל היותר <code>n</code> תווים', '<code>dest</code>', '<span class="maybe">חלקית</span>'],
        [L.ic('strcat(dest, src)'), 'מוסיפה את <code>src</code> לסוף <code>dest</code>', '<code>dest</code>', '<span class="no">לא</span>'],
        [L.ic('strcmp(a, b)'), 'משווה לפי סדר מילוני (ASCII)', 'שלילי / 0 / חיובי', '—'],
        [L.ic('strchr(s, ch)'), 'מחפשת תו', 'מקום התו, או <code>NULL</code>', '—'],
        [L.ic('strstr(s, sub)'), 'מחפשת תת-מחרוזת', 'מקום ההתחלה, או <code>NULL</code>', '—']
      ])}
      <div class="lab"><p class="lab-t">הפונקציות בפעולה</p><div id="sh-tabs"></div></div>
      ${L.legend(['ch', 'nul', 'zero', 'garbage', 'oob'])}

      <h3>לבדוק לפני שכותבים</h3>
      <p>מכיוון ש-<code>strcpy</code> ו-<code>strcat</code> לא בודקות, הבדיקה היא באחריותכם. בתוך הפונקציה שבה המערך הוגדר, <code>sizeof</code> נותן את הגודל שלו:</p>
      ${L.code([
        'char full[20];',
        '',
        '/* strcpy: the length plus 1 for \'\\0\' must fit */',
        'if (strlen(first) + 1 <= sizeof(full))',
        '    strcpy(full, first);',
        '',
        '/* strcat: what is already there + what we add + 1 */',
        'if (strlen(full) + strlen(last) + 1 <= sizeof(full))',
        '    strcat(full, last);',
        'else',
        '    printf("name too long\\n");'
      ])}
      ${L.note('warn', 'strlen מחזירה size_t', 'הטיפוס <code>size_t</code> הוא מספר <b>לא שלילי</b>. לכן <code>strlen(a) - strlen(b)</code> לעולם לא קטן מ-0: כש-<code>a</code> קצרה יותר, יוצא מספר חיובי עצום. כדי להשוות אורכים כתבו <code>if (strlen(a) &lt; strlen(b))</code>.')}
      `;

      L.tabs(host.querySelector('#sh-tabs'), [
        { label: '<code>strcpy</code>', render: el => L.player(el, fStrcpy(10)) },
        { label: '<code>strcpy</code> · גלישה', render: el => L.player(el, fStrcpy(4)) },
        { label: '<code>strcat</code>', render: el => L.player(el, fStrcat()) },
        { label: '<code>strncpy</code>', render: el => {
          el.innerHTML =
            '<p><code>strncpy</code> מעתיקה לכל היותר <code>n</code> תווים, ולכן לא גולשת. אבל כשהמקור ארוך מדי, היא <b>לא מוסיפה <code>\'\\0\'</code></b>:</p>' +
            L.code(['char d[4];', 'strncpy(d, "hello", 4);']) +
            '<div class="mem-wrap">' + L.mem(['h', 'e', 'l', 'l'], { label: 'char d[4]' }) + '</div>' +
            L.note('warn', 'd אינו מחרוזת', 'ארבעה תווים, ואין <code>\'\\0\'</code>. הדפסה של <code>d</code> תמשיך אל מחוץ למערך.') +
            '<p>התבנית הבטוחה: מעתיקים עד גודל פחות 1, ואז כותבים <code>\'\\0\'</code> בעצמנו בתא האחרון:</p>' +
            L.code(['strncpy(d, src, sizeof(d) - 1);', "d[sizeof(d) - 1] = '\\0';"]) +
            '<div class="mem-wrap">' + L.mem(['h', 'e', 'l', '\0'], { label: 'char d[4]', state: { 3: 'hit' } }) + '</div>' +
            '<p>המחרוזת נחתכה ל-<code>"hel"</code>, אבל היא מחרוזת חוקית.</p>';
        } },
        { label: '<code>strcmp</code>', render: el => {
          el.innerHTML = '<div class="fields">' +
            '<label class="fld" for="cmp-a">a<input type="text" id="cmp-a" value="apple" maxlength="10" spellcheck="false" autocomplete="off"></label>' +
            '<label class="fld" for="cmp-b">b<input type="text" id="cmp-b" value="apricot" maxlength="10" spellcheck="false" autocomplete="off"></label>' +
            '<span class="chips" style="margin:0">' + [['apple', 'apricot'], ['cat', 'cat'], ['car', 'cart'], ['Zoo', 'apple']].map(p => '<button type="button" class="btn ghost small mono" data-p="' + p.join(',') + '">' + p.join(' / ') + '</button>').join('') + '</span>' +
            '</div><div class="pl"></div>' +
            L.note('info', 'שימו לב לאותיות גדולות', 'ההשוואה היא לפי קודי ASCII, וכל האותיות הגדולות (65–90) באות לפני הקטנות (97–122). לכן <code>"Zoo"</code> קודמת ל-<code>"apple"</code>. אין הבטחה שהתוצאה תהיה דווקא <code>-1</code> או <code>1</code>: בודקים <code>&lt; 0</code>, <code>&gt; 0</code> או <code>== 0</code>.');
          const ia = el.querySelector('#cmp-a'), ib = el.querySelector('#cmp-b');
          const run = () => { const p = el.querySelector('.pl'); L.runLocalLeave(p); p.innerHTML = ''; L.player(p, cmpFrames(ia.value, ib.value)); };
          ia.addEventListener('input', L.debounce(run, 250)); ib.addEventListener('input', L.debounce(run, 250));
          el.querySelector('.chips').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; const [x, y] = b.dataset.p.split(','); ia.value = x; ib.value = y; run(); });
          run();
        } },
        { label: '<code>strchr</code> · <code>strstr</code>', render: el => {
          const s = 'user@afeka.ac.il';
          const at = s.indexOf('@'), dot = s.indexOf('.ac');
          const hitAt = { [at]: 'hit' }, hitSub = {}; for (let k = dot; k < dot + 3; k++) hitSub[k] = 'hit';
          el.innerHTML =
            '<p>שתי הפונקציות מחזירות <b>את המקום</b> של מה שנמצא, ולא אינדקס. ביחידה 12 נבין מה זה בדיוק. בינתיים זו התבנית: שומרים את התוצאה, בודקים שאינה <code>NULL</code>, ומחסרים ממנה את שם המחרוזת כדי לקבל אינדקס.</p>' +
            L.code(['char email[] = "' + s + '";', "char *p = strchr(email, '@');", '', 'if (p != NULL)', '    printf("@ at index %d\\n", (int)(p - email));', 'else', '    printf("no @\\n");']) +
            '<div class="mem-wrap">' + L.mem(L.bytesOf(s), { size: 'sm', state: hitAt, marks: { [at]: 'p' } }) + '</div>' +
            '<div class="out">@ at index ' + at + '\n</div>' +
            L.code(['char *q = strstr(email, ".ac");', 'if (q != NULL)', '    printf(".ac at index %d\\n", (int)(q - email));']) +
            '<div class="mem-wrap">' + L.mem(L.bytesOf(s), { size: 'sm', state: hitSub, marks: { [dot]: 'q' } }) + '</div>' +
            '<div class="out">.ac at index ' + dot + '\n</div>' +
            L.note('warn', 'תמיד לבדוק NULL', 'אם התו או תת-המחרוזת לא נמצאים, מוחזר <code>NULL</code>. שימוש בתוצאה בלי לבדוק יקריס את התוכנית.');
        } }
      ]);
    },

    check: [
      { q: 'מה יהיה ב-<code>d</code>?', code: ['char d[20] = "ab";', 'strcat(d, "cd");', 'strcat(d, "ab");'],
        opts: [L.ic('"abcd"'), L.ic('"abcdab"'), L.ic('"ab"'), L.ic('"cdab"')], a: 1, why: 'כל <code>strcat</code> מוסיפה לסוף מה שכבר יש.' },
      { q: 'מה מחזירה <code>strcmp("car", "cart")</code>?',
        opts: ['0', 'מספר שלילי', 'מספר חיובי', '4'], a: 1,
        why: 'שלושת התווים הראשונים שווים. בתא 3 יש <code>\'\\0\'</code> (0) מול <code>\'t\'</code> (116). 0 קטן יותר, ולכן <code>"car"</code> קודמת.' },
      { q: 'מה הבעיה בקוד?', code: ['char name[5];', 'strcpy(name, "Moshe");'],
        opts: ['אין בעיה, יש בדיוק 5 אותיות', 'צריך 6 בתים: 5 אותיות ו-\'\\0\'', 'strcpy לא עובדת עם מערכים', 'צריך לכתוב &name'], a: 1,
        why: '<code>strcpy</code> כותבת 6 בתים, והאחרון נופל מחוץ למערך.' },
      { q: 'מה התנאי הנכון לפני <code>strcat(dest, src)</code>, כש-<code>dest</code> הוא מערך של 30?',
        opts: [L.ic('strlen(src) < 30'), L.ic('strlen(dest) + strlen(src) < 30'), L.ic('strlen(dest) + strlen(src) <= 30'), L.ic('sizeof(src) < 30')], a: 1,
        why: 'אחרי השרשור יהיו <code>strlen(dest) + strlen(src)</code> תווים ועוד <code>\'\\0\'</code>. כדי שזה ייכנס ב-30 בתים, סכום התווים חייב להיות לכל היותר 29, כלומר קטן מ-30.' }
    ]
  });
})();
