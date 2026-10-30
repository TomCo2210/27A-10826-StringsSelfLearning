/* יחידה 03 — מעבר על מחרוזת */
(function () {
  'use strict';
  const L = window.Lomda;
  const SIZE = 10;

  /* מצב התאים: עד i — done, i — cur */
  const stOf = (n, extra) => { const s = {}; for (let k = 0; k < n; k++) s[k] = 'done'; return Object.assign(s, extra || {}); };

  function framesPrint(w) {
    const code = [
      'char s[10] = "' + L.cstr(w) + '";',
      'int i;',
      '',
      "for (i = 0; s[i] != '\\0'; i++)",
      '    printf("%c-", s[i]);',
      'printf("\\n");'
    ];
    const bytes = L.bytesOf(w, SIZE, 0);
    const F = []; let out = '';
    F.push({ line: 0, stage: L.mem(bytes, { label: 'char s[10]' }), note: 'המערך בגודל 10. אחרי התווים יש <code>\'\\0\'</code>, ושאר התאים מאופסים.' });
    for (let i = 0; i <= w.length; i++) {
      const end = bytes[i] === '\0';
      F.push({ line: 3, out, stage: L.mem(bytes, { cur: i, marks: { [i]: 'i=' + i }, state: stOf(i) }),
        note: end ? 'הבדיקה: <code>s[' + i + ']</code> הוא <code>\'\\0\'</code>. התנאי שקרי, <b>הלולאה נגמרת</b>. התאים שאחריו לא נבדקים בכלל.'
                  : 'הבדיקה: <code>s[' + i + ']</code> הוא <b>\'' + L.esc(w[i]) + '\'</b>, לא <code>\'\\0\'</code>. נכנסים לגוף הלולאה.' });
      if (end) break;
      out += w[i] + '-';
      F.push({ line: 4, out, stage: L.mem(bytes, { cur: i, marks: { [i]: 'i=' + i }, state: stOf(i, { [i]: 'hit' }) }),
        note: 'מדפיסים את <code>s[' + i + ']</code> ואחריו מקף.' });
    }
    out += '\n';
    F.push({ line: 5, out, stage: L.mem(bytes, { state: stOf(w.length) }), note: 'הודפסו ' + w.length + ' תווים. התו <code>\'\\0\'</code> עצמו אף פעם לא מודפס.' });
    return { code, frames: F };
  }

  function framesCount(w, ch) {
    const code = [
      'char s[10] = "' + L.cstr(w) + '";',
      'int i, count = 0;',
      '',
      "for (i = 0; s[i] != '\\0'; i++)",
      "    if (s[i] == " + L.clit(ch) + ')',
      '        count++;',
      'printf("%d\\n", count);'
    ];
    const bytes = L.bytesOf(w, SIZE, 0);
    const F = []; let count = 0;
    const vars = (c, ch2) => '<div class="vars">' + L.intVar('count', c, ch2) + '</div>';
    F.push({ line: 1, stage: L.mem(bytes, { label: 'char s[10]' }) + vars(0), note: 'מאתחלים את <code>count</code> ל-0. בלי האיתחול היה בו זבל.' });
    for (let i = 0; i <= w.length; i++) {
      const end = bytes[i] === '\0';
      F.push({ line: 3, stage: L.mem(bytes, { cur: i, marks: { [i]: 'i=' + i }, state: stOf(i) }) + vars(count),
        note: end ? '<code>s[' + i + ']</code> הוא <code>\'\\0\'</code>: סוף המחרוזת, יוצאים מהלולאה.' : '<code>s[' + i + ']</code> הוא \'' + L.esc(w[i]) + '\'. ממשיכים.' });
      if (end) break;
      const hit = w[i] === ch;
      F.push({ line: 4, stage: L.mem(bytes, { cur: i, marks: { [i]: 'i=' + i }, state: stOf(i, { [i]: hit ? 'hit' : '' }) }) + vars(count),
        note: hit ? '<b>שווה</b> ל-' + L.esc(L.clit(ch)) + '.' : 'לא שווה ל-' + L.esc(L.clit(ch)) + '.' });
      if (hit) { count++; F.push({ line: 5, stage: L.mem(bytes, { cur: i, marks: { [i]: 'i=' + i }, state: stOf(i, { [i]: 'hit' }) }) + vars(count, true), note: '<code>count</code> גדל ל-' + count + '.' }); }
    }
    F.push({ line: 6, out: count + '\n', stage: L.mem(bytes, { state: stOf(w.length) }) + vars(count), note: 'התו ' + L.esc(L.clit(ch)) + ' מופיע ' + count + ' פעמים.' });
    return { code, frames: F };
  }

  function framesLen(w) {
    const code = [
      'char s[10] = "' + L.cstr(w) + '";',
      'int len = 0;',
      '',
      "while (s[len] != '\\0')",
      '    len++;',
      'printf("%d\\n", len);'
    ];
    const bytes = L.bytesOf(w, SIZE, 0);
    const F = [];
    const vars = (v, c) => '<div class="vars">' + L.intVar('len', v, c) + '</div>';
    F.push({ line: 1, stage: L.mem(bytes, { label: 'char s[10]' }) + vars(0), note: 'המשתנה <code>len</code> משמש גם כאינדקס וגם כמונה.' });
    for (let i = 0; i <= w.length; i++) {
      const end = bytes[i] === '\0';
      F.push({ line: 3, stage: L.mem(bytes, { cur: i, marks: { [i]: 'len=' + i }, state: stOf(i) }) + vars(i),
        note: end ? '<code>s[' + i + ']</code> הוא <code>\'\\0\'</code>. הלולאה נעצרת, ו-<code>len</code> שווה בדיוק למספר התווים שלפניו.' : '<code>s[' + i + ']</code> אינו <code>\'\\0\'</code>.' });
      if (end) break;
      F.push({ line: 4, stage: L.mem(bytes, { cur: i + 1, marks: { [i + 1]: 'len=' + (i + 1) }, state: stOf(i + 1) }) + vars(i + 1, true), note: '<code>len++</code>' });
    }
    F.push({ line: 5, out: w.length + '\n', stage: L.mem(bytes, { state: stOf(w.length) }) + vars(w.length), note: 'זה בדיוק מה ש-<code>strlen</code> עושה. ' + L.ref('string-h', 'ב') + ' נשתמש בה במקום לכתוב את הלולאה.' });
    return { code, frames: F };
  }

  L.unit({
    id: 'traverse',
    title: 'מעבר על מחרוזת',
    blurb: 'לולאה שרצה עד <code>\'\\0\'</code>, ולא עד גודל המערך',
    minutes: 14,
    lede: 'כמעט כל עבודה עם מחרוזת היא לולאה שעוברת על התווים אחד אחד ועוצרת ב-<code>\'\\0\'</code>. הלולאה לא צריכה לדעת מראש את האורך.',
    goals: [
      'לכתוב את תבנית הלולאה הבסיסית',
      'להבין למה עוצרים ב-<code>\'\\0\'</code> ולא בגודל המערך',
      'לספור, לחפש ולמדוד אורך בלולאה אחת',
      'לכתוב את הלולאה בתוך פונקציה שמקבלת מחרוזת'
    ],

    build(host) {
      host.innerHTML = `
      <p>זו התבנית שתכתבו שוב ושוב. שימו לב לתנאי: הוא לא משווה את <code>i</code> לשום מספר.</p>
      ${L.code([
        'int i;',
        "for (i = 0; s[i] != '\\0'; i++)",
        '{',
        '    /* s[i] is the current character */',
        '}'
      ])}
      <div class="lab">
        <p class="lab-t">צעד אחר צעד</p>
        <div class="fields">
          <label class="fld" for="t-word">המחרוזת (עד 9 תווים)
            <input type="text" id="t-word" value="hello" maxlength="9" spellcheck="false" autocomplete="off">
          </label>
          <label class="fld" for="t-ch">התו לספירה
            <input type="text" id="t-ch" value="l" maxlength="1" spellcheck="false" autocomplete="off" style="width:4em;text-align:center">
          </label>
        </div>
        <div id="t-tabs"></div>
      </div>

      ${L.note('info', 'כתיב מקוצר שתראו בקוד של אחרים', 'בשפת C כל ערך שאינו 0 הוא "אמת". לכן <code>for (i = 0; s[i]; i++)</code> שקול בדיוק ל-<code>s[i] != \'\\0\'</code>. בקורס עדיף לכתוב את הצורה המפורשת, שקל יותר לקרוא.')}

      <h3>למה לא לרוץ עד גודל המערך?</h3>
      <p>נניח שקלטנו מילה לתוך מערך שלא אותחל. התאים שאחרי <code>'\\0'</code> מכילים זבל, ערכים שנשארו בזיכרון ממה שרץ קודם:</p>
      <div class="lab" id="t-bad"></div>

      <h3>הלולאה בתוך פונקציה</h3>
      <p>פונקציה שמקבלת מחרוזת לא צריכה לקבל את האורך שלה. ה-<code>'\\0'</code> מספיק:</p>
      ${L.code([
        'int countChar(const char s[], char ch)',
        '{',
        '    int i, count = 0;',
        "    for (i = 0; s[i] != '\\0'; i++)",
        '        if (s[i] == ch)',
        '            count++;',
        '    return count;',
        '}',
        '',
        '/* in main: */',
        'printf("%d\\n", countChar("banana", \'a\'));   /* 3 */'
      ])}
      <p>המילה <code>const</code> אומרת שהפונקציה מתחייבת לא לשנות את המחרוזת. נרחיב עליה ${L.ref('functions', 'ב')}.</p>
      ${L.note('warn', 'לא בתנאי של הלולאה', '<code>for (i = 0; i &lt; strlen(s); i++)</code> עובד, אבל <code>strlen</code> רצה על כל המחרוזת <b>בכל סיבוב</b> כדי לחשב את האורך מחדש. במחרוזת של 1,000 תווים זה מיליון בדיקות במקום אלף. אם צריך את האורך, חשבו אותו פעם אחת לפני הלולאה: <code>int len = strlen(s);</code>')}
      `;

      const inp = host.querySelector('#t-word'), chIn = host.querySelector('#t-ch');
      const W = () => (inp.value || 'a').slice(0, 9);
      const CH = () => (chIn.value || 'l')[0];
      let cur = 0;
      const tabs = L.tabs(host.querySelector('#t-tabs'), [
        { label: 'הדפסה תו אחר תו', render: el => L.player(el, framesPrint(W())) },
        { label: 'ספירת מופעים של תו', render: el => L.player(el, framesCount(W(), CH())) },
        { label: 'חישוב האורך', render: el => L.player(el, framesLen(W())) }
      ], { onChange: i => { cur = i; } });
      const rerender = L.debounce(() => tabs.select(cur), 200);
      inp.addEventListener('input', rerender);
      chIn.addEventListener('input', rerender);

      /* ── הדוגמה השגויה ── */
      const bad = host.querySelector('#t-bad');
      const junk = ['ü', '@', '\u00a7', 'k', '\u00b6'];
      function renderBad() {
        const w = W().slice(0, 5);
        const bytes = w.split('').concat(['\0']);
        while (bytes.length < SIZE) bytes.push(null);
        const state = {}; for (let k = w.length + 1; k < SIZE; k++) state[k] = 'bad';
        let shown = '';
        for (let k = w.length + 1; k < SIZE; k++) shown += junk[k % junk.length];
        bad.innerHTML = '<p class="lab-t">לולאה עד הגודל, במקום עד \'\\0\'</p>' +
          L.code(['char s[10];', 'scanf("%9s", s);          /* user typed: ' + w + ' */', '', 'for (i = 0; i < 10; i++)   /* wrong condition */', '    printf("%c", s[i]);'], { bad: 3 }) +
          '<div class="mem-wrap">' + L.mem(bytes, { label: 'char s[10]  (not initialized)', state }) + '</div>' +
          L.legend(['ch', 'nul', 'garbage']) +
          '<div class="out">' + L.esc(w) + '<span class="err">' + L.esc(shown) + '</span></div>' +
          '<p style="margin-top:12px">הלולאה מדפיסה גם את <code>\'\\0\'</code> (שלא נראה על המסך) וגם את ' + (SIZE - w.length - 1) + ' תאי הזבל שאחריו. הפלט משתנה מהרצה להרצה. בתנאי <code>s[i] != \'\\0\'</code> זה לא יכול לקרות.</p>';
      }
      inp.addEventListener('input', renderBad);
      renderBad();
    },

    check: [
      { q: 'מה ערכו של <code>n</code> בסוף?', code: ['char s[] = "abcabc";', 'int i, n = 0;', "for (i = 0; s[i] != '\\0'; i++)", "    if (s[i] == 'b')", '        n++;'],
        opts: ['1', '2', '6', '7'], a: 1, why: "התו <code>'b'</code> מופיע פעמיים, באינדקסים 1 ו-4." },
      { q: 'מה ערכו של <code>i</code> אחרי הלולאה?', code: ['char s[20] = "C lang";', 'int i;', "for (i = 0; s[i] != '\\0'; i++)", '    ;'],
        opts: ['5', '6', '7', '20'], a: 1,
        why: 'הלולאה נעצרת כש-<code>i</code> מצביע על <code>\'\\0\'</code>, כלומר על אינדקס 6. ב-<code>"C lang"</code> יש 6 תווים (גם הרווח הוא תו), ולכן <code>i</code> שווה לאורך המחרוזת.' },
      { q: 'מערך <code>char s[50]</code> נקלט עם <code>scanf</code>. מה הבעיה בלולאה <code>for (i = 0; i &lt; 50; i++)</code> שסופרת רווחים?',
        opts: ['אין בעיה', 'היא קוראת גם את תאי הזבל שאחרי \'\\0\' ועלולה לספור רווחים שלא הוקלדו', 'היא לא מגיעה לתו האחרון', 'שגיאת קומפילציה'], a: 1,
        why: 'התאים שאחרי <code>\'\\0\'</code> לא אותחלו, ואם יש ביניהם בית שערכו 32, הוא ייספר כרווח. הלולאה צריכה לעצור ב-<code>\'\\0\'</code>.' }
    ]
  });
})();
