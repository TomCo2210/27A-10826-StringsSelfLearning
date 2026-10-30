/* יחידה 01 — מהי מחרוזת */
(function () {
  'use strict';
  const L = window.Lomda;

  L.unit({
    id: 'what',
    title: 'מהי מחרוזת',
    blurb: 'מערך של <code>char</code>, ותו הסיום <code>\'\\0\'</code>',
    minutes: 12,
    lede: 'בשפת C אין טיפוס נפרד למחרוזת. מחרוזת היא מערך של <code>char</code>, ומיד אחרי התו האחרון שלה יושב התו <code>\'\\0\'</code>, שערכו המספרי 0.',
    goals: [
      'מה ההבדל בין מערך של תווים לבין מחרוזת',
      'מה הקומפיילר עושה בכל אחת מצורות ההגדרה',
      'כמה מקום להקצות למחרוזת, ולמה תמיד יש <code>+1</code>',
      'מה ההבדל בין <code>sizeof</code> לבין <code>strlen</code>'
    ],

    build(host) {
      host.innerHTML = `
      <p>המערך עצמו לא זוכר כמה תווים יש בו. כש-<code>printf</code> מדפיסה מחרוזת, היא מתחילה בתא 0 וממשיכה תא אחרי תא עד שהיא פוגשת <code>'\\0'</code>. זה הסימן היחיד שאומר לה לעצור. כך עובדות כל הפונקציות של מחרוזות בשפה.</p>
      ${L.note('key', 'ההגדרה', 'מחרוזת = מערך של <code>char</code> שיש בו <code>\'\\0\'</code>. מערך תווים שאין בו <code>\'\\0\'</code> הוא סתם מערך של תווים, ואסור להעביר אותו לפונקציות של מחרוזות.')}

      <h3>שלוש דרכים להגדיר מחרוזת</h3>
      <p>הקלידו מילה ובחרו צורת הגדרה. הפס מראה את המערך בזיכרון: מספר מתחת לכל תא הוא האינדקס שלו.</p>
      <div class="lab" id="w-lab">
        <p class="lab-t">ההגדרה והזיכרון</p>
        <div class="fields">
          <label class="fld" for="w-word">המילה
            <input type="text" id="w-word" value="hello" maxlength="12" spellcheck="false" autocomplete="off">
          </label>
        </div>
        <div id="w-tabs"></div>
      </div>

      <h3>כמה מקום צריך?</h3>
      <p>כדי לשמור מחרוזת של עד <b>N</b> תווים צריך מערך בגודל <b>N+1</b>. התא הנוסף הוא ל-<code>'\\0'</code>. כדאי לכתוב את זה במפורש בקוד, כדי שמי שקורא יבין מאיפה בא המספר:</p>
      ${L.code([
        '#define MAX_NAME 20        /* the longest name we accept */',
        '',
        'char name[MAX_NAME + 1];   /* 20 chars + 1 for \'\\0\' */'
      ])}
      ${L.table(['מה שומרים', 'אורך מקסימלי', 'ההגדרה'], [
        ['מספר טלפון נייד', '10 ספרות', L.ic('char phone[11];')],
        ['תעודת זהות', '9 ספרות', L.ic('char id[10];')],
        ['מספר קורס', '5 ספרות', L.ic('char course[6];')],
        ['מילה באנגלית', '30 אותיות', L.ic('char word[31];')]
      ])}
      ${L.note('info', 'מספר כמחרוזת', 'מספר טלפון ותעודת זהות נשמרים כמחרוזת ולא כ-<code>int</code>: לא עושים בהם חשבון, ויש בהם אפסים מובילים (<code>054…</code>) שמספר שלם היה מוחק.')}

      <h3>שני מספרים שונים: <code>sizeof</code> ו-<code>strlen</code></h3>
      ${L.table(['', L.ic('sizeof(s)'), L.ic('strlen(s)')], [
        ['מה נמדד', 'גודל המערך, בבתים', 'מספר התווים עד <code>\'\\0\'</code>, <b>לא כולל</b> אותו'],
        ['מתי מחושב', 'בזמן קומפילציה', 'בזמן ריצה, במעבר על התווים'],
        ['מאיפה', 'אופרטור של השפה', 'פונקציה מ-<code>string.h</code>'],
        [L.ic('char s[20] = "hi";'), '20', '2'],
        [L.ic('char s[] = "hi";'), '3', '2']
      ])}
      <p>בקיצור: <code>sizeof</code> עונה על "כמה מקום יש", ו-<code>strlen</code> עונה על "כמה תווים יש עכשיו".</p>
      `;

      /* ── הסימולטור ── */
      const inp = host.querySelector('#w-word');
      let N = 10;
      let current = null;

      function view(el, o) {
        el.querySelector('.w-view').innerHTML =
          L.code([o.decl]) +
          '<div class="mem-wrap">' + L.mem(o.bytes, { state: o.state, label: o.label }) + '</div>' +
          L.legend(o.legend) +
          L.table(['ביטוי', 'ערך', 'הסבר'], [
            [L.ic('sizeof(s)'), '<span class="mono">' + o.size + '</span>', 'גודל המערך שהוקצה'],
            [L.ic('strlen(s)'), o.len === null ? '<span class="maybe">לא מוגדר</span>' : '<span class="mono">' + o.len + '</span>',
              o.len === null ? 'אין <code>\'\\0\'</code> במערך. <code>strlen</code> תמשיך לספור בזיכרון שאחרי המערך עד שתיתקל במקרה באפס' : 'התווים עד <code>\'\\0\'</code>'],
            [L.ic('printf("%s", s)'), '<span class="mono">' + o.printed + '</span>',
              o.len === null ? 'אחרי התווים יודפס מה שיושב בזיכרון אחרי המערך: <b>התנהגות בלתי מוגדרת</b>' : 'עוצר ב-<code>\'\\0\'</code>']
          ]) + o.note;
      }
      const W = () => (inp.value || '').slice(0, 12) || 'a';
      const lits = w => w.split('').map(c => L.clit(c)).join(', ');
      const oob = ['?', '?', '?'];

      function tabAuto(el) {
        el.innerHTML = '<div class="w-view"></div>';
        current = () => {
          const w = W();
          view(el, {
            decl: 'char s[] = "' + L.cstr(w) + '";',
            bytes: L.bytesOf(w), size: w.length + 1, len: w.length, printed: L.esc(w),
            label: 'char s[' + (w.length + 1) + ']',
            legend: ['ch', 'nul'],
            note: L.note('ok', 'הקומפיילר סופר בשבילכם', 'בלי מספר בסוגריים, הקומפיילר סופר את התווים ומקצה עוד תא אחד ל-<code>\'\\0\'</code>. זו הדרך הבטוחה ביותר כשהתוכן ידוע מראש.')
          });
        };
        current();
      }

      function tabSized(el) {
        el.innerHTML =
          '<div class="fields"><label class="fld" for="w-n">גודל המערך N = <span class="val" id="w-nv"></span>' +
          '<input type="range" id="w-n" min="1" max="16" value="' + N + '"></label></div><div class="w-view"></div>';
        const rng = el.querySelector('#w-n');
        rng.addEventListener('input', () => { N = +rng.value; current(); });
        current = () => {
          const w = W(), len = w.length;
          el.querySelector('#w-nv').textContent = N;
          const decl = 'char s[' + N + '] = "' + L.cstr(w) + '";';
          if (N > len) {
            const bytes = L.bytesOf(w, N, 0);
            view(el, {
              decl, bytes, size: N, len, printed: L.esc(w), label: 'char s[' + N + ']', legend: ['ch', 'nul', 'zero'],
              note: N === len + 1
                ? L.note('ok', 'בדיוק מספיק', len + ' תווים ועוד <code>\'\\0\'</code> = ' + N + ' תאים. אין מקום להאריך את המחרוזת אפילו בתו אחד.')
                : L.note('ok', 'יש מקום לגדול', 'התווים נכנסים בהתחלה ואחריהם <code>\'\\0\'</code>. שאר ' + (N - len - 1) + ' התאים <b>מתאפסים</b>, בדיוק כמו באיתחול חלקי של מערך מספרים. הם שייכים למערך ואפשר להשתמש בהם בהמשך.')
            });
          } else {
            const keep = w.slice(0, N);
            const bytes = keep.split('').concat(['|'], oob);
            const state = {}; for (let k = N; k < N + oob.length; k++) state[k] = 'oob';
            view(el, {
              decl, bytes, state, size: N, len: null, printed: L.esc(keep) + '<span class="maybe">???</span>',
              label: 'char s[' + N + ']', legend: ['ch', 'oob'],
              note: N === len
                ? L.note('warn', 'אין מקום ל-\'\\0\'', 'המערך מתמלא בתווים ולא נשאר תא ל-<code>\'\\0\'</code>. ב-C זה <b>חוקי</b> והקומפיילר לא חייב להתריע, ולכן זו מלכודת: <code>s</code> אינו מחרוזת. הגדילו את N באחד.')
                : L.note('bad', 'אין מקום אפילו לתווים', 'התקן מחייב את הקומפיילר להתריע (ב-gcc: <span class="mono">initializer-string for array of \'char\' is too long</span>). רק ' + N + ' התווים הראשונים נשמרים, ואין <code>\'\\0\'</code>.')
            });
          }
        };
        current();
      }

      function tabBraces(el) {
        el.innerHTML = '<div class="w-view"></div>';
        current = () => {
          const w = W(), len = w.length;
          const bytes = w.split('').concat(['|'], oob);
          const state = {}; for (let k = len; k < len + oob.length; k++) state[k] = 'oob';
          view(el, {
            decl: 'char s[] = {' + lits(w) + '};',
            bytes, state, size: len, len: null, printed: L.esc(w) + '<span class="maybe">???</span>',
            label: 'char s[' + len + ']', legend: ['ch', 'oob'],
            note: L.note('warn', 'מערך תווים, לא מחרוזת', 'באיתחול תו-תו הקומפיילר מכניס בדיוק את התווים שכתבתם, ולא מוסיף <code>\'\\0\'</code>. כדי שזו תהיה מחרוזת צריך להוסיף אותו בעצמכם:') +
              L.code(['char s[] = {' + lits(w) + ", '\\0'};   /* same as \"" + L.cstr(w) + '" */'])
          });
        };
        current();
      }

      L.tabs(host.querySelector('#w-tabs'), [
        { label: 'מחרוזת, גודל אוטומטי', render: tabAuto },
        { label: 'מחרוזת, גודל N', render: tabSized },
        { label: 'תו-תו, בסוגריים מסולסלים', render: tabBraces }
      ]);
      inp.addEventListener('input', () => current && current());
    },

    check: [
      { q: 'מה הם <code>sizeof(s)</code> ו-<code>strlen(s)</code>?', code: ['char s[10] = "abc";'],
        opts: ['10 ו-3', '4 ו-3', '10 ו-4', '3 ו-3'], a: 0,
        why: '<code>sizeof</code> מחזיר את גודל המערך שהוקצה, 10, ולא משנה מה כתוב בו. <code>strlen</code> סופרת את התווים עד <code>\'\\0\'</code> ולא כוללת אותו, כלומר 3.' },
      { q: 'איזו מההגדרות יוצרת מחרוזת?',
        opts: [L.ic("char a[3] = {'a', 'b', 'c'};"), L.ic('char b[] = "abc";'), L.ic('char c[3] = "abc";'), L.ic("char d[] = {'a', 'b', 'c'};")], a: 1,
        why: 'רק ב-<code>b</code> הקומפיילר מקצה 4 תאים ומוסיף <code>\'\\0\'</code>. ב-<code>c</code> הגודל 3 לא משאיר לו מקום, וב-<code>a</code> וב-<code>d</code> האיתחול תו-תו לא מוסיף אותו.' },
      { q: 'רוצים לשמור שם משפחה באורך של עד 15 אותיות. מה ההגדרה הנכונה?',
        opts: [L.ic('char last[15];'), L.ic('char last[16];'), L.ic('char last[14];'), L.ic('char last[] ;')], a: 1,
        why: '15 אותיות ועוד תא אחד ל-<code>\'\\0\'</code>. אפשרות 4 אינה חוקית בכלל: בלי גודל ובלי איתחול הקומפיילר לא יודע כמה להקצות.' }
    ]
  });
})();
