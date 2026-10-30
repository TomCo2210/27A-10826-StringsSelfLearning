/* יחידה 05 — קליטת מחרוזת
   המרכז של היחידה הוא סימולטור של תור הקלט (stdin): רואים מה כל פקודת קלט
   לוקחת מהתור, מה היא משאירה בו, ומה נכתב למערך. */
(function () {
  'use strict';
  const L = window.Lomda;
  const WS = c => c === ' ' || c === '\n' || c === '\t';

  /* ── מנוע הסימולציה ───────────────────────────────────── */
  function simulate(sc, input) {
    const buf = input;
    let pos = 0, out = '';
    const arr = {}, ints = {};
    (sc.decls || []).forEach(d => { if (d.size) arr[d.name] = { size: d.size, data: new Array(d.size).fill(null) }; else ints[d.name] = null; });
    const F = [];

    const stdinView = (from, to) => {
      if (buf.length === 0) return '<div class="stdin"><div class="mem-label">stdin</div><span class="empty">(ריק)</span></div>';
      let h = '<div class="stdin"><div class="mem-label">stdin — input buffer</div><div class="mem noidx">';
      for (let k = 0; k < buf.length; k++) {
        const cls = k < from ? 'used' : k < to ? 'taking' : 'left';
        h += '<div class="b ' + cls + ' ' + L.byteCls(buf[k]) + '">' + L.glyph(buf[k]) + '</div>';
      }
      return h + '</div></div>';
    };
    const memView = (hit) => {
      let h = '';
      Object.keys(arr).forEach(name => {
        const a = arr[name];
        const bytes = a.data.slice(0, a.size);
        const state = {};
        if (a.data.length > a.size) { bytes.push('|'); a.data.slice(a.size).forEach((x, k) => { bytes.push(x); state[a.size + k] = 'oob'; }); }
        (hit && hit[name] || []).forEach(k => { if (!state[k]) state[k] = 'hit'; });
        h += L.mem(bytes, { label: 'char ' + name + '[' + a.size + ']', state, size: a.size > 16 ? 'sm' : undefined });
      });
      const iv = Object.keys(ints);
      if (iv.length) h += '<div class="vars">' + iv.map(n => L.intVar(n, ints[n], hit && hit['#' + n])).join('') + '</div>';
      return h;
    };
    const write = (name, str) => {
      const a = arr[name]; const ks = [];
      const chars = str.split('').concat(['\0']);
      chars.forEach((c, k) => { a.data[k] = c; ks.push(k); });
      return { [name]: ks };
    };
    const frame = (line, from, to, hit, note) => F.push({ line, stage: stdinView(from, to) + '<div class="mem-wrap">' + memView(hit) + '</div>', note, out });

    frame(sc.first || 0, 0, 0, null, 'בתור יש את מה שהמשתמש הקליד, כולל <code>\'\\n\'</code> מכל לחיצה על Enter. המערכים לא אותחלו, ולכן יש בהם זבל.');

    sc.ops.forEach(op => {
      const start = pos;
      if (op.t === 'scanf_s') {
        while (pos < buf.length && WS(buf[pos])) pos++;
        const skipped = pos - start;
        if (pos >= buf.length) { frame(op.line, start, pos, null, 'התור ריק. בתוכנית אמיתית <code>scanf</code> הייתה <b>ממתינה</b> שהמשתמש יקליד עוד. כאן הסימולציה נעצרת.'); return; }
        let w = '';
        while (pos < buf.length && !WS(buf[pos]) && (!op.width || w.length < op.width)) w += buf[pos++];
        const hit = write(op.arr, w);
        const a = arr[op.arr], over = w.length + 1 > a.size;
        let note = (skipped ? 'קודם דילגה על ' + skipped + ' תווי רווח. ' : '') + '<code>scanf</code> קראה את <b>' + L.esc(w) + '</b>';
        note += op.width ? ' (לכל היותר ' + op.width + ' תווים) ' : ' ';
        note += 'ועצרה ' + (pos < buf.length ? (WS(buf[pos]) ? 'ברווח, שנשאר בתור.' : 'כי הגיעה למגבלה. שאר המילה מחכה בתור.') : 'בסוף הקלט.') + ' אחרי התווים היא כתבה <code>\'\\0\'</code>.';
        if (over) note += ' <b style="color:var(--bad)">גלישה:</b> נכתבו ' + (w.length + 1) + ' בתים למערך של ' + a.size + '. הבתים שמעבר לקו דרסו זיכרון של משהו אחר.';
        frame(op.line, start, pos, hit, note);
      } else if (op.t === 'scanf_d') {
        while (pos < buf.length && WS(buf[pos])) pos++;
        const m = buf.slice(pos).match(/^[+-]?\d+/);
        if (!m) { frame(op.line, start, pos, null, 'אין מספר בתחילת התור. <code>scanf</code> מחזירה 0, לא נוגעת במשתנה, ולא צורכת את התווים.'); return; }
        pos += m[0].length; ints[op.v] = +m[0];
        frame(op.line, start, pos, { ['#' + op.v]: true }, '<code>scanf("%d")</code> קראה את <b>' + m[0] + '</b> ועצרה בתו הראשון שאינו ספרה: ' + (buf[pos] === '\n' ? '<b><code>\'\\n\'</code></b>, שנשאר בתור.' : 'הוא נשאר בתור.'));
      } else if (op.t === 'fgets') {
        const a = arr[op.arr]; const n = op.n || a.size;
        if (pos >= buf.length) { frame(op.line, start, pos, null, 'התור ריק. בתוכנית אמיתית <code>fgets</code> הייתה ממתינה לשורה חדשה (או מחזירה <code>NULL</code> בסוף קלט).'); return; }
        let s = '';
        while (pos < buf.length && s.length < n - 1) { s += buf[pos++]; if (s[s.length - 1] === '\n') break; }
        const hit = write(op.arr, s);
        const gotNl = s[s.length - 1] === '\n';
        let note;
        if (s === '\n') note = '<code>fgets</code> מצאה בתור שורה <b>ריקה</b>: רק <code>\'\\n\'</code> שנשאר מהקלט הקודם. היא לקחה אותו ו<b>חזרה מיד</b>, בלי לחכות למשתמש. זה הבאג.';
        else if (gotNl) note = '<code>fgets</code> קראה את כל השורה, <b>כולל הרווחים וכולל <code>\'\\n\'</code></b> שבסופה, והוסיפה <code>\'\\0\'</code>. ה-<code>\'\\n\'</code> הוא עכשיו חלק מהמחרוזת.';
        else note = 'השורה ארוכה מדי. <code>fgets</code> קראה רק ' + (n - 1) + ' תווים (גודל פחות 1), הוסיפה <code>\'\\0\'</code>, ו<b>לא גלשה</b>. שאר השורה, כולל <code>\'\\n\'</code>, נשאר בתור לקריאה הבאה.';
        frame(op.line, start, pos, hit, note);
      } else if (op.t === 'flush') {
        while (pos < buf.length && buf[pos] !== '\n') pos++;
        if (pos < buf.length) pos++;
        if (op.v) ints[op.v] = pos > start ? 10 : null;
        frame(op.line, start, pos, op.v ? { ['#' + op.v]: true } : null, pos - start ? 'הלולאה קראה וזרקה ' + (pos - start) + ' תווים, עד <code>\'\\n\'</code> וכולל אותו (ולכן <code>ch</code> הוא 10, הקוד של <code>\'\\n\'</code>). התור נקי, והקריאה הבאה תתחיל בשורה חדשה.' : 'לא היה מה לנקות.');
      } else if (op.t === 'trim') {
        const a = arr[op.arr];
        let len = 0; while (a.data[len] !== '\0' && a.data[len] != null && len < a.data.length) len++;
        if (len > 0 && a.data[len - 1] === '\n') { a.data[len - 1] = '\0'; frame(op.line, start, start, { [op.arr]: [len - 1] }, 'התו האחרון היה <code>\'\\n\'</code>, ובמקומו נכתב <code>\'\\0\'</code>. המחרוזת התקצרה בתו אחד.'); }
        else frame(op.line, start, start, null, 'התו האחרון אינו <code>\'\\n\'</code> (השורה נחתכה, או שלא היה Enter), ולכן לא שינינו כלום. זו הסיבה לבדיקה ב-<code>if</code>.');
      } else if (op.t === 'printf') {
        const str = name => { const d = arr[name].data; let s = ''; for (let k = 0; k < d.length && d[k] !== '\0' && d[k] !== null; k++) s += d[k]; return s; };
        let k = 0;
        out += op.fmt.replace(/%s|%d/g, sp => { const a = op.args[k++]; return sp === '%s' ? str(a) : String(ints[a]); });
        frame(op.line, start, start, null, op.note || 'מדפיסים. ה-<code>|</code> בצדדים מראים בדיוק איפה המחרוזת מתחילה ונגמרת.');
      }
    });
    return F;
  }

  /* ── התרחישים ─────────────────────────────────────────── */
  const SC = [
    { label: '<code>scanf("%s")</code> · מילים', input: 'Dana Levi',
      decls: [{ name: 'first', size: 10 }, { name: 'last', size: 10 }],
      code: ['char first[10], last[10];', '', 'scanf("%s", first);   /* no & : first is already an address */', 'scanf("%s", last);', 'printf("|%s| |%s|\\n", first, last);'],
      ops: [{ t: 'scanf_s', arr: 'first', line: 2 }, { t: 'scanf_s', arr: 'last', line: 3 }, { t: 'printf', fmt: '|%s| |%s|\n', args: ['first', 'last'], line: 4 }],
      after: L.note('info', 'מה למדנו', '<code>%s</code> מדלג על רווחים בהתחלה, קורא עד הרווח הבא, ומוסיף <code>\'\\0\'</code>. לכן שם מלא נקלט בשתי קריאות. ה-<code>\'\\n\'</code> נשאר בתור; זה יהיה חשוב בתרחיש 5.') },
    { label: 'גלישה', input: 'Jerusalem',
      decls: [{ name: 'city', size: 6 }],
      code: ['char city[6];', '', 'scanf("%s", city);    /* no limit! */'],
      ops: [{ t: 'scanf_s', arr: 'city', line: 2 }],
      after: L.note('bad', 'הבאג המסוכן ביותר עם מחרוזות', '<code>scanf("%s")</code> לא יודעת מה גודל המערך. היא כותבת כמה שהמשתמש הקליד. הקוד יכול "לעבוד" בבדיקות עם מילים קצרות, ולהשחית משתנה אחר בשקט כשמישהו יקליד מילה ארוכה.') },
    { label: 'הגבלת רוחב <code>%5s</code>', input: 'Jerusalem',
      decls: [{ name: 'city', size: 6 }],
      code: ['char city[6];', '', 'scanf("%5s", city);   /* at most 5 chars + \'\\0\' */'],
      ops: [{ t: 'scanf_s', arr: 'city', width: 5, line: 2 }],
      after: L.note('key', 'המספר הוא גודל המערך פחות 1', 'המספר בפורמט הוא כמה <b>תווים</b> לקרוא, ו-<code>scanf</code> מוסיפה אחריהם <code>\'\\0\'</code>. למערך בגודל N כותבים <code>%(N-1)s</code>: ל-<code>char city[6]</code> כותבים <code>%5s</code>. שימו לב ששארית המילה נשארה בתור.') },
    { label: '<code>fgets</code> · שורה שלמה', input: 'Dana Levi',
      decls: [{ name: 'line', size: 20 }],
      code: ['char line[20];', 'int len;', '', 'fgets(line, sizeof(line), stdin);', 'printf("|%s|\\n", line);', '', '/* remove the \'\\n\' at the end, if there is one */', 'len = strlen(line);', "if (len > 0 && line[len - 1] == '\\n')", "    line[len - 1] = '\\0';", 'printf("|%s|\\n", line);'],
      ops: [{ t: 'fgets', arr: 'line', line: 3 }, { t: 'printf', fmt: '|%s|\n', args: ['line'], line: 4, note: 'שימו לב לפלט: ה-<code>|</code> הסוגר ירד לשורה הבאה, כי <code>\'\\n\'</code> הוא חלק מהמחרוזת.' },
        { t: 'trim', arr: 'line', line: 9 }, { t: 'printf', fmt: '|%s|\n', args: ['line'], line: 10, note: 'עכשיו המחרוזת נקייה.' }],
      after: L.note('info', 'נסו שורה ארוכה', 'הקלידו בתיבת הקלט שורה של יותר מ-19 תווים. <code>fgets</code> תחתוך אותה ולא תגלוש, וה-<code>\'\\n\'</code> לא ייכנס למערך.') },
    { label: 'המלכודת: <code>%d</code> ואז <code>fgets</code>', input: '21\nDana Levi',
      decls: [{ name: 'age' }, { name: 'name', size: 20 }],
      code: ['int age;', 'char name[20];', '', 'scanf("%d", &age);', 'fgets(name, sizeof(name), stdin);', 'printf("age=%d name=|%s|\\n", age, name);'],
      ops: [{ t: 'scanf_d', v: 'age', line: 3 }, { t: 'fgets', arr: 'name', line: 4 }, { t: 'printf', fmt: 'age=%d name=|%s|\n', args: ['age', 'name'], line: 5, note: 'השם ריק, והמשתמש אפילו לא הספיק להקליד אותו.' }],
      after: L.note('warn', 'למה זה קורה', '<code>scanf("%d")</code> עוצרת לפני ה-<code>\'\\n\'</code> ומשאירה אותו בתור. <code>fgets</code> קוראת עד <code>\'\\n\'</code>, ומוצאת אותו מיד. זה הבאג הנפוץ ביותר כשמערבבים <code>scanf</code> ו-<code>fgets</code>.') },
    { label: 'התיקון', input: '21\nDana Levi',
      decls: [{ name: 'age' }, { name: 'ch' }, { name: 'name', size: 20 }],
      code: ['int age, ch;', 'char name[20];', '', 'scanf("%d", &age);', "while ((ch = getchar()) != '\\n' && ch != EOF)", '    ;                              /* throw away the rest of the line */', 'fgets(name, sizeof(name), stdin);', 'printf("age=%d name=|%s|\\n", age, name);'],
      ops: [{ t: 'scanf_d', v: 'age', line: 3 }, { t: 'flush', v: 'ch', line: 4 }, { t: 'fgets', arr: 'name', line: 6 }, { t: 'printf', fmt: 'age=%d name=|%s|\n', args: ['age', 'name'], line: 7 }],
      after: L.note('ok', 'לולאה, לא getchar אחד', 'אם המשתמש הקליד <code>21 years</code>, יש בתור יותר מתו אחד לפני ה-<code>\'\\n\'</code>. הלולאה זורקת הכול עד סוף השורה. <code>ch</code> הוא <code>int</code> ולא <code>char</code>, כי <code>getchar</code> מחזירה <code>int</code> כדי שיהיה מקום גם ל-<code>EOF</code>. (נשאר <code>\'\\n\'</code> בסוף השם; מנקים אותו כמו בתרחיש 4.)') }
  ];

  L.unit({
    id: 'input',
    title: 'קליטת מחרוזת',
    blurb: '<code>scanf</code>, <code>fgets</code>, ותו השורה שנשאר בתור',
    minutes: 20,
    lede: 'כל מה שהמשתמש מקליד נכנס ל<b>תור קלט</b> (buffer). כל פקודת קלט לוקחת מתחילת התור כמה שהיא צריכה, ומה שנשאר מחכה לפקודה הבאה. רוב הבאגים בקליטת מחרוזות נובעים ממה ש<b>נשאר</b> בתור.',
    goals: [
      'מה <code>scanf("%s")</code> קוראת ואיפה היא עוצרת',
      'איך להגביל את <code>scanf</code> כדי שלא תגלוש',
      'מה <code>fgets</code> עושה עם <code>\'\\n\'</code>, ואיך מנקים אותו',
      'למה <code>fgets</code> אחרי <code>scanf("%d")</code> מחזירה שורה ריקה, ואיך מתקנים'
    ],

    build(host) {
      host.innerHTML = `
      <div class="lab">
        <p class="lab-t">סימולטור תור הקלט</p>
        <p style="font-size:var(--fs-sm);color:var(--ink-2)">בכל תרחיש: למעלה התור, כשהתווים שכבר נקראו מחוקים והתווים שנקראים בצעד הנוכחי צבועים. למטה המערכים. אפשר לשנות את מה שהמשתמש מקליד.</p>
        <div id="in-tabs"></div>
      </div>

      <h3>בקיצור: <code>scanf</code> או <code>fgets</code>?</h3>
      ${L.table(['', L.ic('scanf("%9s", s)'), L.ic('fgets(s, sizeof(s), stdin)')], [
        ['מה נקרא', 'מילה אחת, עד רווח', 'שורה שלמה, כולל רווחים'],
        ['רווחים בהתחלה', 'מדלגת עליהם', 'שומרת אותם'],
        [L.ic("'\\n'"), 'נשאר בתור', 'נכנס למחרוזת (אם היה מקום)'],
        ['הגנה מגלישה', 'רק עם מספר בפורמט', 'תמיד: קוראת לכל היותר גודל פחות 1'],
        ['מתי להשתמש', 'קלט של מילה בודדת', 'שם מלא, משפט, כל שורה עם רווחים']
      ])}
      ${L.note('info', 'למה אין & ב-scanf של מחרוזת', 'ל-<code>scanf</code> צריך לתת את <b>מקום</b> המשתנה בזיכרון. עבור <code>int</code> כותבים <code>&amp;age</code> כדי לקבל את המקום. שם של מערך הוא כבר המקום של התא הראשון, ולכן כותבים <code>scanf("%9s", name)</code> בלי <code>&amp;</code>.')}

      <h3><code>gets</code>: החתול של שרודינגר</h3>
      <p>בקוד ישן, ובהרבה אתרים, תראו את <code>gets(s)</code>. היא קוראת שורה שלמה כמו <code>fgets</code>, אבל <b>לא מקבלת את גודל המערך</b>. אין שום דרך להשתמש בה בלי סכנת גלישה, גם כשהמתכנת זהיר: מי שקובע כמה תווים ייכתבו הוא המשתמש.</p>
      <p>לכן היא נמצאת במצב כפול, כמו החתול בקופסה של שרודינגר, שחי ומת בו זמנית:</p>
      ${L.table(['', 'מצב', 'למה'], [
        ['<b>בתקן של השפה</b>', '<span class="no">מתה</span>', 'הוצאה מהשפה בתקן C11 (2011), מטעמי אבטחה. כבר לא מוצהרת ב-<code>stdio.h</code>.'],
        ['<b>בספרייה המהודרת</b>', '<span class="yes">חיה</span>', 'הקוד שלה נשאר בספרייה של רוב המערכות, כדי שתוכניות ישנות שנבנו איתה ימשיכו לרוץ (תמיכה לאחור).']
      ])}
      <p>וזה מה שקורה כשמקמפלים אותה בפועל (gcc 13 על Linux):</p>
      ${L.code(['#include <stdio.h>', '', 'int main(void)', '{', '    char s[10];', '    gets(s);', '    printf("[%s]\\n", s);', '    return 0;', '}'], { hi: 5 })}
      <div class="out plain">$ gcc g.c
g.c:6:5: <span class="err">warning: implicit declaration of function 'gets'; did you mean 'fgets'?</span>
g.c:(.text+0x28): <span class="err">warning: the \`gets' function is dangerous and should not be used.</span>
$ ./a.out
Dana
[Dana]</div>
      <p style="margin-top:12px">שתי אזהרות, ובכל זאת התוכנית נבנתה ועובדת:</p>
      <ol>
        <li><b>האזהרה הראשונה באה מהקומפיילר.</b> <span class="mono">implicit declaration</span> פירושה "אני לא מכיר את הפונקציה הזו": אין עליה הצהרה ב-<code>stdio.h</code>, כי מבחינת התקן היא כבר לא קיימת. הקומפיילר מנחש איך היא נראית וממשיך.</li>
        <li><b>האזהרה השנייה באה מהמקשר (linker),</b> השלב שמחבר את התוכנית לספרייה. הוא <b>כן</b> מצא את הקוד של <code>gets</code>, חיבר אותו, ומזהיר שהיא מסוכנת.</li>
      </ol>
      <p>כל עוד הקלט קצר, הכול נראה תקין. עכשיו אותה תוכנית עם שורה ארוכה מ-9 תווים:</p>
      <div class="out plain">$ ./a.out
Jerusalem of Gold
<span class="err">*** stack smashing detected ***: terminated
Aborted (core dumped)</span></div>
      <p style="margin-top:12px">כאן היה מזל: מנגנון הגנה שהקומפיילר מוסיף זיהה שהזיכרון נדרס ועצר את התוכנית. בלי ההגנה הזו, התוכנית הייתה ממשיכה לרוץ עם משתנים דרוסים.</p>
      <p>ואם החתול חי או מת, זה תלוי מי פותח את הקופסה:</p>
      ${L.table(['הסביבה', 'מה קורה עם gets'], [
        ['gcc 13 ומטה', 'אזהרה, והתוכנית נבנית ורצה (כמו בדוגמה)'],
        ['gcc 14 ומעלה', 'הצהרה מרומזת של פונקציה היא <b>שגיאה</b> כברירת מחדל, והקומפילציה נכשלת'],
        ['Visual Studio 2015 ומעלה', 'הפונקציה הוסרה גם מהספרייה: אזהרה בקומפילציה (<span class="mono">C4013</span>), ואז שגיאה בקישור (<span class="mono">unresolved external symbol</span>)']
      ])}
      ${L.note('key', 'המסקנה', 'אזהרה היא לא "בסדר". כשהקומפיילר אומר שהוא לא מכיר פונקציה, הוא ממשיך על סמך ניחוש, והעובדה שהתוכנית רצה לא אומרת שהיא נכונה. אותה אזהרה בדיוק תופיע כששוכחים <code>#include &lt;string.h&gt;</code> ומשתמשים ב-<code>strlen</code>: התוכנית עשויה לעבוד, אבל במקרה. בקורס: לעולם לא <code>gets</code>. תמיד <code>fgets(s, sizeof(s), stdin)</code>.')}

      ${!L.on('SPRINTF_SSCANF') ? '' : L.reveal('להעמקה: המספר בפורמט כש-<code>MAX</code> מוגדר ב-<code>#define</code>', `
        <p>אי אפשר לכתוב <code>scanf("%MAXs", s)</code>: הפרה-פרוססור לא מחליף שמות בתוך מחרוזות, ו-<code>scanf</code> תנסה להתאים לקלט את האותיות <code>MAXs</code>. אפשר לבנות את מחרוזת הפורמט בזמן ריצה עם <code>sprintf</code> (${L.ref('format')}):</p>
        ${L.code(['#define MAX 20', 'char name[MAX + 1];', 'char fmt[10];', '', 'sprintf(fmt, "%%%ds", MAX);   /* fmt is now "%20s" */', 'scanf(fmt, name);'])}
        <p><code>%%</code> כותב את התו <code>%</code> עצמו, <code>%d</code> כותב את המספר, ואחריהם <code>s</code>.</p>`, 'deep')}
      `;

      L.tabs(host.querySelector('#in-tabs'), SC.map((sc, i) => ({
        label: (i + 1) + ' · ' + sc.label,
        render(el) {
          const id = 'in-ta-' + i;
          el.innerHTML = '<div class="fields"><label class="fld" for="' + id + '">מה המשתמש מקליד (כל שורה מסתיימת ב-Enter)' +
            '<textarea id="' + id + '" rows="2" spellcheck="false" style="width:300px">' + L.esc(sc.input) + '</textarea></label></div>' +
            '<div class="pl"></div><div class="after">' + (sc.after || '') + '</div>';
          const ta = el.querySelector('textarea');
          const run = () => {
            let txt = ta.value.replace(/\r/g, '');
            if (!txt.endsWith('\n')) txt += '\n';
            const host2 = el.querySelector('.pl');
            L.runLocalLeave(host2);
            host2.innerHTML = '';
            L.player(host2, { code: sc.code, frames: simulate(sc, txt), speed: 1100 });
          };
          ta.addEventListener('input', L.debounce(run, 300));
          run();
        }
      })));
    },

    check: [
      { q: 'המשתמש מקליד שני רווחים ואחריהם <code>New York</code>. מה יהיה ב-<code>city</code>?', code: ['char city[20];', 'scanf("%19s", city);'],
        opts: [L.ic('"  New York"'), L.ic('"New York"'), L.ic('"New"'), L.ic('"  New"')], a: 2,
        why: '<code>%s</code> מדלג על הרווחים שבהתחלה, וקורא עד הרווח הבא. <code>" York\\n"</code> נשאר בתור.' },
      { q: 'המשתמש מקליד <code>hi</code> ולוחץ Enter. מה <code>strlen(s)</code>?', code: ['char s[10];', 'fgets(s, sizeof(s), stdin);'],
        opts: ['2', '3', '10', '9'], a: 1,
        why: 'ב-<code>s</code> יש <code>\'h\'</code>, <code>\'i\'</code>, <code>\'\\n\'</code> ואחריהם <code>\'\\0\'</code>. ה-<code>\'\\n\'</code> נספר.' },
      { q: 'מה הכתיבה הנכונה למערך <code>char code[8]</code>?',
        opts: [L.ic('scanf("%8s", code);'), L.ic('scanf("%7s", code);'), L.ic('scanf("%s", &code);'), L.ic('scanf("%7s", &code[8]);')], a: 1,
        why: '7 תווים לכל היותר, ועוד <code>\'\\0\'</code> שהפונקציה מוסיפה: 8 בתים בדיוק. עם <code>%8s</code> ייתכן שייכתבו 9 בתים.' },
      { q: 'הקומפיילר כותב <span class="mono">warning: implicit declaration of function \'gets\'</span>, והתוכנית בכל זאת רצה. מה זה אומר?',
        opts: ['הכול תקין: אזהרה אינה שגיאה', 'הקומפיילר לא מצא הצהרה על הפונקציה, ניחש איך היא נראית והמשיך. היא עובדת כי הקוד שלה עדיין קיים בספרייה', 'הפונקציה לא קיימת, וזו תקלה בהרצה', 'צריך להוסיף <code>#include &lt;string.h&gt;</code>'], a: 1,
        why: '<code>gets</code> הוצאה מהתקן ולכן אין לה הצהרה, אבל הקוד שלה נשאר בספרייה לטובת תוכניות ישנות. זה שהתוכנית רצה לא הופך אותה לבטוחה: מספיקה שורה ארוכה מהמערך כדי לדרוס זיכרון.' }
    ]
  });
})();
