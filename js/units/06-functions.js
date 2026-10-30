/* יחידה 06 — מחרוזות ופונקציות */
(function () {
  'use strict';
  const L = window.Lomda;

  function framesUpper() {
    const word = 'Hi, C!';
    const code = [
      'void toUpperStr(char s[])',
      '{',
      '    int i;',
      "    for (i = 0; s[i] != '\\0'; i++)",
      "        if (s[i] >= 'a' && s[i] <= 'z')",
      "            s[i] = s[i] - 'a' + 'A';",
      '}',
      '',
      'int main()',
      '{',
      '    char word[] = "' + word + '";',
      '    toUpperStr(word);',
      '    printf("%s\\n", word);',
      '    return 0;',
      '}'
    ];
    const b = L.bytesOf(word);
    const F = [];
    const mainLbl = 'word  (in main)';
    const fnLbl = 'word in main  =  s in toUpperStr  (same cells)';
    F.push({ line: 10, stage: L.mem(b, { label: mainLbl }), note: 'ב-<code>main</code> יש מערך של 7 בתים.' });
    F.push({ line: 11, stage: L.mem(b, { label: fnLbl }), note: 'בקריאה לפונקציה <b>לא נוצר עותק</b> של המערך. הפרמטר <code>s</code> מקבל את המקום של <code>word</code> בזיכרון, ולכן <code>s[0]</code> הוא בדיוק התא <code>word[0]</code>.' });
    for (let i = 0; i <= word.length; i++) {
      const st = {}; for (let k = 0; k < i; k++) st[k] = 'done';
      if (b[i] === '\0') { F.push({ line: 3, stage: L.mem(b, { label: fnLbl, state: st, cur: i, marks: { [i]: 'i' } }), note: 'הגענו ל-<code>\'\\0\'</code>. הפונקציה מסתיימת, והיא לא צריכה להחזיר כלום.' }); break; }
      const c = b[i], low = c >= 'a' && c <= 'z';
      F.push({ line: 4, stage: L.mem(b, { label: fnLbl, state: st, cur: i, marks: { [i]: 'i' } }), note: '<code>s[' + i + ']</code> הוא \'' + L.esc(c) + '\': ' + (low ? '<b>אות קטנה</b>.' : 'לא אות קטנה, לא משנים.') });
      if (low) {
        b[i] = String.fromCharCode(c.charCodeAt(0) - 32);
        F.push({ line: 5, stage: L.mem(b, { label: fnLbl, state: Object.assign(st, { [i]: 'hit' }), cur: i, marks: { [i]: 'i' } }), note: 'נכתב \'' + b[i] + '\' לתוך התא. זה התא של <code>word</code>.' });
      }
    }
    F.push({ line: 12, out: b.slice(0, -1).join('') + '\n', stage: L.mem(b, { label: mainLbl }), note: 'חזרנו ל-<code>main</code>, והשינויים נמצאים ב-<code>word</code>. הפונקציה שינתה את המערך של מי שקרא לה.' });
    return { code, frames: F };
  }

  const TRAPS = [
    { t: 'השמה של מחרוזת', code: ['char a[10] = "cat", b[10];', '', 'b = a;        /* copy? */', 'b = "dog";    /* assign? */'], bad: [2, 3],
      why: '<b>שגיאת קומפילציה</b> בשתי השורות: <span class="mono">assignment to expression with array type</span>. אי אפשר להציב לתוך מערך שלם. הסימן <code>=</code> עם מחרוזת מותר רק <b>בשורת ההגדרה</b>, כאיתחול. כדי להעתיק משתמשים ב-<code>strcpy</code> (' + L.ref('string-h') + ') או בלולאה.',
      fix: ['strcpy(b, a);', 'strcpy(b, "dog");'] },
    { t: 'השוואה של מחרוזות', code: ['char a[] = "cat", b[] = "cat";', '', 'if (a == b)', '    printf("same\\n");'], bad: [2],
      why: 'הקוד מתקמפל, אבל <code>==</code> בין שני מערכים משווה את <b>המקומות שלהם בזיכרון</b>, לא את התוכן. שני מערכים שונים נמצאים תמיד במקומות שונים, ולכן התנאי שקרי גם כשהתוכן זהה. משווים עם <code>strcmp</code>, שמחזירה 0 כשהמחרוזות שוות.',
      fix: ['if (strcmp(a, b) == 0)', '    printf("same\\n");'] },
    { t: '"להחזיר" מחרוזת מפונקציה', code: ['char[] makeInitials(char first[], char last[])   /* ? */'], bad: [0],
      why: 'פונקציה ב-C לא יכולה להחזיר מערך. הדרך המקובלת: <b>מי שקורא לפונקציה מקצה את המערך</b>, ומעביר אותו כפרמטר. הפונקציה כותבת לתוכו, וכמו שראיתם למעלה, השינוי נשאר.',
      fix: ['void makeInitials(char dest[], const char first[], const char last[])', '{', '    dest[0] = first[0];', "    dest[1] = '.';", '    dest[2] = last[0];', "    dest[3] = '.';", "    dest[4] = '\\0';           /* without it, dest is not a string */", '}', '', '/* in main: */', 'char init[5];', 'makeInitials(init, "Dana", "Levi");', 'printf("%s\\n", init);       /* D.L. */'] },
    { t: '<code>sizeof</code> בתוך הפונקציה', code: ['void show(char s[])', '{', '    printf("%d\\n", (int)sizeof(s));', '}', '', '/* in main: */', 'char name[20] = "Dana";', 'show(name);'], bad: [2],
      why: 'יודפס 8 (או 4), ולא 20 ולא 4 התווים. בתוך הפונקציה <code>s</code> מחזיק את <b>המקום</b> של המערך, ו-<code>sizeof</code> מחזיר את הגודל של המקום הזה, לא של המערך. לתוכן משתמשים ב-<code>strlen</code>. כשהפונקציה צריכה לדעת כמה <b>מקום</b> יש (למשל כדי לקלוט לתוכו), מעבירים את הגודל כפרמטר נוסף:',
      fix: ['void readName(char s[], int size)', '{', '    fgets(s, size, stdin);', '}', '', '/* in main, where sizeof still works: */', 'readName(name, sizeof(name));'] }
  ];

  L.unit({
    id: 'functions',
    title: 'מחרוזות ופונקציות',
    blurb: 'העברה לפונקציה, <code>const</code>, ומה לא עובד',
    minutes: 14,
    lede: 'מעבירים מחרוזת לפונקציה כמו כל מערך: <code>char s[]</code> בחתימה, ושם המערך בקריאה. אין צורך להעביר את האורך, כי <code>\'\\0\'</code> מסמן אותו.',
    goals: [
      'שפונקציה שמשנה את המחרוזת משנה את המערך של מי שקרא לה',
      'למה <code>=</code> ו-<code>==</code> לא עובדים על מחרוזות',
      'איך פונקציה "מחזירה" מחרוזת',
      'מתי לסמן פרמטר כ-<code>const</code>'
    ],

    build(host) {
      host.innerHTML = `
      <div class="lab"><p class="lab-t">פונקציה שמשנה מחרוזת</p><div id="fn-pl"></div></div>

      <h3>ארבעה דברים שלא עובדים</h3>
      <p>לכל אחד מהקטעים: חשבו מה יקרה, ורק אז פתחו את ההסבר.</p>
      <div id="fn-traps"></div>

      <h3>פרמטר <code>const</code></h3>
      <p>כשפונקציה רק <b>קוראת</b> מחרוזת ולא משנה אותה, מסמנים את הפרמטר כ-<code>const</code>. יש לזה שתי מטרות: מי שקורא את החתימה יודע שהמחרוזת שלו בטוחה, והקומפיילר עוצר אתכם אם בטעות כתבתם לתוכה.</p>
      ${L.code([
        'int countVowels(const char s[])',
        '{',
        '    int i, n = 0;',
        "    for (i = 0; s[i] != '\\0'; i++)",
        "        if (s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u')",
        '            n++;',
        "    s[0] = 'X';     /* error: assignment of read-only location */",
        '    return n;',
        '}'
      ], { bad: 6 })}
      ${L.table(['הפונקציה', 'משנה את המחרוזת?', 'החתימה'], [
        ['ספירת תנועות', '<span class="no">לא</span>', L.ic('int countVowels(const char s[])')],
        ['המרה לאותיות גדולות', '<span class="yes">כן</span>', L.ic('void toUpperStr(char s[])')],
        ['העתקה ממחרוזת למחרוזת', 'רק את היעד', L.ic('void copy(char dest[], const char src[])')]
      ])}
      `;

      L.player(host.querySelector('#fn-pl'), framesUpper());
      host.querySelector('#fn-traps').innerHTML = TRAPS.map((t, i) =>
        '<div class="lab"><p class="lab-t">' + (i + 1) + ' · ' + t.t + '</p>' + L.code(t.code) +
        L.reveal('מה יקרה?', '<p>' + t.why + '</p>' + L.code(t.fix, { label: 'הדרך הנכונה' }), '', 'לחצו לחשיפה') + '</div>').join('');
      /* אחרי החשיפה מסמנים את השורות הבעייתיות */
      L.$$('#fn-traps details', host).forEach((d, i) => d.addEventListener('toggle', () => {
        L.$$('.ln', d.closest('.lab').querySelector('.code')).forEach(l => l.classList.toggle('bad', d.open && TRAPS[i].bad.indexOf(+l.dataset.ln) >= 0));
      }));
    },

    check: [
      { q: 'מה יודפס?', code: ['void cut(char s[])', '{', "    s[2] = '\\0';", '}', '', '/* in main: */', 'char w[] = "Afeka";', 'cut(w);', 'printf("%s %d", w, (int)strlen(w));'],
        opts: ['Afeka 5', 'Af 2', 'Afe 3', 'Af 5'], a: 1,
        why: 'הפונקציה כתבה <code>\'\\0\'</code> בתא 2 של המערך של <code>main</code>. עכשיו המחרוזת נגמרת שם: <code>"Af"</code>, באורך 2.' },
      { q: 'איך בודקים נכון ששתי מחרוזות זהות?',
        opts: [L.ic('if (a == b)'), L.ic('if (a = b)'), L.ic('if (strcmp(a, b) == 0)'), L.ic('if (strcmp(a, b))')], a: 2,
        why: '<code>strcmp</code> מחזירה 0 כשהמחרוזות זהות. האפשרות האחרונה הפוכה: היא נכנסת לתנאי דווקא כשהמחרוזות <b>שונות</b>.' },
      { q: 'פונקציה מקבלת <code>char s[]</code> ולא משנה אותו. מה עדיף?',
        opts: ['להשאיר כמו שזה', 'לכתוב <code>const char s[]</code>', 'לכתוב <code>char s[100]</code>', 'להעביר גם את <code>strlen(s)</code>'], a: 1,
        why: '<code>const</code> מתעד שהפונקציה לא משנה את הקלט, והקומפיילר אוכף את זה. גודל בסוגריים של פרמטר לא משנה כלום, והקומפיילר מתעלם ממנו.' }
    ]
  });
})();
