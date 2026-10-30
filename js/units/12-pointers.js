/* יחידה 12 — מחרוזות ומצביעים (אחרי מפגש 8) */
(function () {
  'use strict';
  const L = window.Lomda;
  const BASE = 1000;

  function lenFrames(w) {
    const code = [
      'int myLen(const char *s)',
      '{',
      '    const char *p = s;',
      "    while (*p != '\\0')",
      '        p++;',
      '    return p - s;',
      '}'
    ];
    const b = L.bytesOf(w);
    const F = [];
    const view = (i, extra) => L.mem(b, Object.assign({ idx: 'addr', base: BASE, cur: i, marks: i === 0 ? { 0: 's = p' } : { 0: 's', [i]: 'p' } }, extra || {}));
    const ptrs = (i) => '<div class="vars">' + L.intVar('s', BASE) + L.intVar('p', BASE + i, i > 0) + '</div>';
    F.push({ line: 2, stage: view(0) + ptrs(0), note: '<code>s</code> מחזיק את הכתובת ' + BASE + '. גם <code>p</code> מתחיל שם. <code>s</code> לא יזוז, ו-<code>p</code> יטייל.' });
    for (let i = 0; i <= w.length; i++) {
      const st = {}; for (let k = 0; k < i; k++) st[k] = 'done';
      const end = b[i] === '\0';
      F.push({ line: 3, stage: view(i, { state: st }) + ptrs(i), note: '<code>*p</code> הוא התו בכתובת ' + (BASE + i) + ': ' + (end ? '<code>\'\\0\'</code>. הלולאה נגמרת.' : '\'' + L.esc(b[i]) + '\'. ממשיכים.') });
      if (end) break;
      F.push({ line: 4, stage: view(i + 1, { state: Object.assign(st, { [i]: 'done' }) }) + ptrs(i + 1), note: '<code>p++</code>: הכתובת גדלה באחד, ל-' + (BASE + i + 1) + '.' });
    }
    F.push({ line: 5, out: 'myLen returns ' + w.length + '\n', stage: view(w.length) + ptrs(w.length), note: 'הפרש הכתובות: ' + (BASE + w.length) + ' − ' + BASE + ' = <b>' + w.length + '</b>. זה מספר הצעדים, כלומר האורך.' });
    return { code, frames: F };
  }

  function subFrames(s, sub) {
    const code = [
      'int countSub(const char *s, const char *sub)',
      '{',
      '    int n = 0;',
      '    const char *p = strstr(s, sub);',
      '    while (p != NULL)',
      '    {',
      '        n++;',
      '        p = strstr(p + 1, sub);   /* search again, one char later */',
      '    }',
      '    return n;',
      '}'
    ];
    const b = L.bytesOf(s);
    const F = [];
    const view = (at, from, n) => {
      const st = {}; if (at >= 0) for (let k = at; k < at + sub.length; k++) st[k] = 'hit';
      const marks = {}; if (at >= 0) marks[at] = 'p'; if (from !== undefined && from !== at) marks[from] = 'from';
      return L.mem(b, { idx: 'addr', base: BASE, state: st, marks }) + '<div class="vars">' + L.intVar('n', n) + '</div>';
    };
    let n = 0, at = s.indexOf(sub);
    F.push({ line: 3, stage: view(at, 0, 0), note: at >= 0 ? 'החיפוש הראשון מתחיל ב-<code>s</code>. נמצא בכתובת ' + (BASE + at) + '.' : 'לא נמצא. <code>p</code> הוא <code>NULL</code>.' });
    while (at >= 0) {
      n++;
      F.push({ line: 6, stage: view(at, undefined, n), note: 'סופרים: <code>n</code> = ' + n + '.' });
      const from = at + 1, nx = s.indexOf(sub, from);
      F.push({ line: 7, stage: view(nx, from, n), note: 'מחפשים שוב, החל מהכתובת ' + (BASE + from) + '. ' + (nx >= 0 ? 'נמצא ב-' + (BASE + nx) + '.' : 'לא נמצא: <code>NULL</code>.') });
      at = nx;
    }
    F.push({ line: 9, out: 'countSub returns ' + n + '\n', stage: view(-1, undefined, n), note: 'זו הדרך לעבור על <b>כל</b> המופעים: כל חיפוש מתחיל מהכתובת שאחרי המופע הקודם.' });
    return { code, frames: F };
  }

  L.unit({
    id: 'pointers',
    title: 'מחרוזות ומצביעים',
    blurb: 'מצביע מטייל, מחרוזת קבועה, וכתובות מ-<code>strchr</code>',
    minutes: 16,
    prereq: 'היחידה מניחה שלמדתם <b>מצביעים</b> (מפגש 8): מה זו כתובת, <code>*p</code>, <code>p++</code>. אם עוד לא, חזרו אליה אחר כך.',
    lede: 'שם של מערך הוא הכתובת של התא הראשון שלו. לכן כל פונקציה שמקבלת <code>char s[]</code> מקבלת בפועל <code>char *s</code>, ואפשר לעבור על מחרוזת גם עם מצביע שמתקדם תו אחרי תו.',
    goals: [
      'לעבור על מחרוזת עם מצביע מטייל',
      'להבחין בין <code>char s[] = "…"</code> לבין <code>char *p = "…"</code>',
      'להבין מה מחזירות <code>strchr</code>, <code>strstr</code> ו-<code>strtok</code>'
    ],

    build(host) {
      host.innerHTML = `
      ${L.table(['כתיבה עם אינדקס', 'אותו דבר עם מצביע'], [
        [L.ic('s[i]'), L.ic('*(s + i)')],
        [L.ic('&s[i]'), L.ic('s + i')],
        [L.ic('void f(char s[])'), L.ic('void f(char *s)')]
      ])}
      <div class="lab"><p class="lab-t">מצביע מטייל</p>
        <div class="fields"><label class="fld" for="pt-w">המחרוזת<input type="text" id="pt-w" value="Afeka" maxlength="10" spellcheck="false" autocomplete="off"></label></div>
        <div class="pl"></div>
      </div>

      <h3>מערך או מצביע למחרוזת קבועה</h3>
      <p>שתי השורות נראות כמעט אותו דבר, ויוצרות שני דברים שונים:</p>
      ${L.code(['char  arr[] = "Hi";   /* an array: 3 bytes of my own, writable */', 'char *ptr   = "Hi";   /* a pointer to a constant string: read only */'])}
      <div class="two" id="pt-panels"></div>
      <div class="pl-ctrl"><button type="button" class="btn" id="pt-try">ננסה <code style="background:none;border:0;color:inherit">[0] = 'B'</code> בשניהם</button><button type="button" class="btn ghost" id="pt-reset">איפוס</button></div>
      <div id="pt-msg"></div>
      ${L.table(['', L.ic('char arr[] = "Hi";'), L.ic('char *ptr = "Hi";')], [
        ['מה זה', 'מערך של 3 תווים', 'משתנה שמחזיק כתובת'],
        [L.ic('sizeof'), '3', '8 (או 4): גודל של כתובת'],
        [L.ic('strlen'), '2', '2'],
        ['שינוי תו', '<span class="yes">מותר</span>', '<span class="no">התנהגות בלתי מוגדרת, בדרך כלל קריסה</span>'],
        [L.ic('strcpy / strcat / strtok'), '<span class="yes">מותר</span>', '<span class="no">אסור</span>'],
        ['להזיז אותו (<code>++</code>, <code>=</code>)', '<span class="no">אי אפשר</span>', '<span class="yes">אפשר</span>']
      ])}
      ${L.note('key', 'הגנה: const', 'כשמצביע מפנה למחרוזת קבועה, כתבו <code>const char *ptr = "Hi";</code>. כך כל ניסיון לכתוב דרכו ייעצר כבר בקומפילציה, במקום לקרוס בזמן ריצה.')}

      <h3>הפונקציות שמחזירות כתובת</h3>
      <p><code>strchr</code>, <code>strstr</code> ו-<code>strtok</code> מחזירות מצביע לתוך המחרוזת המקורית, לא עותק. לכן אפשר להדפיס מהמקום שנמצא ועד הסוף, לחשב אינדקס בחיסור, ולהמשיך לחפש משם:</p>
      ${L.code(['char s[] = "user@afeka.ac.il";', "char *at = strchr(s, '@');", '', 'if (at != NULL)', '{', '    printf("%s\\n", at + 1);          /* afeka.ac.il */', '    printf("%d\\n", (int)(at - s));   /* 4 */', '}'])}
      <div class="lab"><p class="lab-t">כל המופעים של תת-מחרוזת</p>
        <div class="fields">
          <label class="fld" for="pt-s">המחרוזת<input type="text" id="pt-s" value="banana" maxlength="16" spellcheck="false" autocomplete="off"></label>
          <label class="fld" for="pt-sub">מחפשים<input type="text" id="pt-sub" value="an" maxlength="5" spellcheck="false" autocomplete="off" style="width:80px"></label>
        </div>
        <div class="pl2"></div>
      </div>
      `;

      const w = host.querySelector('#pt-w');
      const run1 = () => { const p = host.querySelector('.pl'); L.runLocalLeave(p); p.innerHTML = ''; L.player(p, lenFrames((w.value || 'a').slice(0, 10))); };
      w.addEventListener('input', L.debounce(run1, 250)); run1();

      const ss = host.querySelector('#pt-s'), sub = host.querySelector('#pt-sub');
      const run2 = () => { const p = host.querySelector('.pl2'); L.runLocalLeave(p); p.innerHTML = ''; L.player(p, subFrames(ss.value || 'a', sub.value || 'a')); };
      ss.addEventListener('input', L.debounce(run2, 250)); sub.addEventListener('input', L.debounce(run2, 250)); run2();

      let arr = ['H', 'i', '\0'];
      function panels(msg) {
        host.querySelector('#pt-panels').innerHTML =
          '<div class="panel"><p class="panel-t"><code>arr</code> · על המחסנית</p><div class="mem-wrap">' + L.mem(arr, { idx: 'addr', base: 2000, label: 'arr', state: arr[0] === 'B' ? { 0: 'hit' } : {} }) + '</div></div>' +
          '<div class="panel"><p class="panel-t"><code>ptr</code> → אזור לקריאה בלבד <span class="badge">read only</span></p><div class="mem-wrap">' +
          '<div class="mem-block"><div class="mem-label">ptr</div><div class="vars" style="margin:0">' + L.intVar('', 9000) + '</div></div>' +
          L.mem(['H', 'i', '\0'], { idx: 'addr', base: 9000, label: 'string literal', state: msg ? { 0: 'bad' } : {} }) + '</div></div>';
        host.querySelector('#pt-msg').innerHTML = msg || '';
      }
      host.querySelector('#pt-try').addEventListener('click', () => {
        arr = ['B', 'i', '\0'];
        panels(L.note('ok', 'arr[0] = \'B\'', 'עבד. המערך שלכם, ומותר לשנות אותו.') +
          L.note('bad', 'ptr[0] = \'B\'', 'התנהגות בלתי מוגדרת. ברוב המערכות התוכנית קורסת מיד (<span class="mono">Segmentation fault</span>), כי המחרוזת יושבת באזור שמסומן לקריאה בלבד. ואם היא לא קורסת, זה גרוע יותר: הקומפיילר רשאי לשתף את <code>"Hi"</code> עם כל מקום אחר בקוד שבו כתוב <code>"Hi"</code>.'));
      });
      host.querySelector('#pt-reset').addEventListener('click', () => { arr = ['H', 'i', '\0']; panels(); });
      panels();
    },

    check: [
      { q: 'מה יודפס?', code: ['char s[] = "hello";', 'char *p = s + 2;', 'printf("%s", p);'],
        opts: [L.ic('hello'), L.ic('llo'), L.ic('l'), L.ic('he')], a: 1, why: '<code>p</code> מצביע על התא 2. ההדפסה מתחילה שם ועוצרת ב-<code>\'\\0\'</code>.' },
      { q: 'מה יקרה?', code: ['char *p = "abc";', "p[0] = 'x';"],
        opts: ['p יהיה "xbc"', 'שגיאת קומפילציה תמיד', 'התנהגות בלתי מוגדרת, בדרך כלל קריסה', 'שום דבר'], a: 2,
        why: 'המחרוזת הקבועה לקריאה בלבד. עם <code>const char *p</code> הקומפיילר היה עוצר את זה מראש.' },
      { q: 'מה <code>sizeof(p)</code> עבור <code>char *p = "Hello, world";</code> במחשב 64 ביט?',
        opts: ['12', '13', '8', '4'], a: 2, why: '<code>p</code> הוא מצביע, ו-<code>sizeof</code> מודד את המצביע עצמו. את אורך המחרוזת נותנת <code>strlen</code>.' }
    ]
  });
})();
