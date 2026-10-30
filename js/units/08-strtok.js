/* יחידה 08 — פירוק מחרוזת עם strtok */
(function () {
  'use strict';
  const L = window.Lomda;

  function build(S, D) {
    const delim = new Set(D.split(''));
    const orig = L.bytesOf(S);
    const b = orig.slice();
    const code = [
      'char line[] = "' + L.cstr(S) + '";',
      'char *word;',
      '',
      'word = strtok(line, "' + L.cstr(D) + '");',
      'while (word != NULL)',
      '{',
      '    printf("[%s]\\n", word);',
      '    word = strtok(NULL, "' + L.cstr(D) + '");',
      '}',
      'printf("line is now [%s]\\n", line);'
    ];
    const cut = {};
    const sz = S.length > 22 ? 'sm' : undefined;
    const view = (o) => L.mem(b, Object.assign({ label: 'char line[' + orig.length + ']', size: sz }, o));
    const F = [];
    let out = '', p = 0, first = true, words = [];
    F.push({ line: 0, stage: view({}), note: 'המחרוזת לפני הפירוק. תווי ההפרדה: ' + D.split('').map(c => '<code>' + L.esc(L.clit(c)) + '</code>').join(' ') + '.' });

    for (let guard = 0; guard < 40; guard++) {
      const ln = first ? 3 : 7;
      const s0 = p;
      while (b[p] !== '\0' && delim.has(b[p])) p++;
      if (b[p] === '\0') {
        F.push({ line: ln, out, stage: view({ state: Object.assign({}, cut), cur: p }), note: (p > s0 ? 'דילגנו על ' + (p - s0) + ' תווי הפרדה ו' : '') + 'הגענו ל-<code>\'\\0\'</code>. אין עוד מילים: <code>strtok</code> מחזירה <b><code>NULL</code></b>.' });
        F.push({ line: 4, out, stage: view({ state: Object.assign({}, cut) }), note: '<code>word</code> הוא <code>NULL</code>, הלולאה נגמרת.' });
        break;
      }
      const start = p;
      while (b[p] !== '\0' && !delim.has(b[p])) p++;
      const w = b.slice(start, p).join('');
      const st = Object.assign({}, cut); for (let k = start; k < p; k++) st[k] = 'hit';
      F.push({ line: ln, out, stage: view({ state: st, marks: { [start]: 'word' } }),
        note: (first ? 'קריאה ראשונה: מעבירים את <code>line</code>. ' : 'מעבירים <code>NULL</code>: "תמשיכי מאיפה שעצרת". ') +
          (start > s0 ? 'דילוג על ' + (start - s0) + ' תווי הפרדה, ו' : '') + 'המילה מתחילה בתא ' + start + '.' });
      if (b[p] !== '\0') {
        b[p] = '\0'; cut[p] = 'bad';
        const st2 = Object.assign({}, cut); for (let k = start; k < p; k++) st2[k] = 'hit';
        F.push({ line: ln, out, stage: view({ state: st2, marks: { [start]: 'word', [p]: '\\0!' } }),
          note: '<b>כאן הפירוק קורה:</b> תו ההפרדה בתא ' + p + ' <b>נדרס</b> ב-<code>\'\\0\'</code>. עכשיו יש בתוך <code>line</code> מחרוזת קטנה שמתחילה בתא ' + start + '. <code>strtok</code> זוכרת לעצמה להמשיך מתא ' + (p + 1) + '.' });
        p++;
      }
      words.push(w);
      out += '[' + w + ']\n';
      F.push({ line: 6, out, stage: view({ state: st, marks: { [start]: 'word' } }), note: 'מדפיסים את המילה: מתחילים בתא ' + start + ' ועוצרים ב-<code>\'\\0\'</code> הבא.' });
      first = false;
    }
    const firstWord = b.slice(0, b.indexOf('\0')).join('');
    out += 'line is now [' + firstWord + ']\n';
    F.push({ line: 9, out,
      stage: L.mem(orig, { label: 'before', idx: false, size: sz }) + L.mem(b, { label: 'after', idx: false, size: sz, state: cut }),
      note: 'נמצאו ' + words.length + ' מילים. <b>המחרוזת המקורית השתנתה:</b> הדפסה של <code>line</code> נעצרת ב-<code>\'\\0\'</code> הראשון' + (firstWord ? ', אחרי <code>' + L.esc(firstWord) + '</code>' : '') + '.' });
    return { code, frames: F };
  }

  L.unit({
    id: 'strtok',
    title: 'פירוק מחרוזת עם <code>strtok</code>',
    short: 'פירוק עם <code>strtok</code>',
    blurb: 'פירוק למילים, ולמה המקור נהרס',
    minutes: 12,
    lede: '<code>strtok</code> מפרקת מחרוזת למילים לפי תווי הפרדה שבוחרים. היא שונה מכל פונקציה אחרת שראינו: היא <b>משנה</b> את המחרוזת שקיבלה, והיא <b>זוכרת</b> איפה עצרה בין קריאה לקריאה.',
    goals: [
      'לכתוב לולאת פירוק עם <code>strtok</code>',
      'להבין למה בקריאות הבאות מעבירים <code>NULL</code>',
      'לדעת שהמחרוזת המקורית נהרסת, ומתי צריך עותק'
    ],

    build(host) {
      host.innerHTML = `
      ${L.code(['char *strtok(char *str, const char *delimiters);'], { label: 'החתימה (מ-string.h)' })}
      <p>הפונקציה מחזירה את <b>המקום</b> של המילה הבאה בתוך המחרוזת, או <code>NULL</code> כשאין עוד מילים. את המקום שומרים במשתנה מסוג <code>char *</code>, כמו ב-<code>strchr</code>, ומדפיסים אותו עם <code>%s</code> כמו כל מחרוזת.</p>
      <div class="lab">
        <p class="lab-t">הסימולטור</p>
        <div class="fields">
          <label class="fld" for="tk-s">המחרוזת<input type="text" id="tk-s" value="  Dana Levi,21,,EE" maxlength="34" spellcheck="false" autocomplete="off" style="width:280px"></label>
          <label class="fld" for="tk-d">תווי הפרדה<input type="text" id="tk-d" value=" ," maxlength="5" spellcheck="false" autocomplete="off" style="width:90px"></label>
        </div>
        <div class="pl"></div>
      </div>

      ${L.note('key', 'שלושה דברים לזכור', '<ol style="margin:0"><li><b>המקור נהרס.</b> אם תצטרכו את המחרוזת המלאה אחר כך, העתיקו אותה (<code>strcpy</code>) <b>לפני</b> הפירוק, ופרקו את העותק.</li><li><b>תווי הפרדה רצופים נחשבים לאחד.</b> ב-<code>"21,,EE"</code> אין "שדה ריק" בין שני הפסיקים. לקובץ CSV שבו שדה יכול להיות ריק, <code>strtok</code> לא מתאימה.</li><li><b>מחרוזת אחת בכל פעם.</b> <code>strtok</code> זוכרת מקום אחד בלבד. אי אפשר לפרק שתי מחרוזות לסירוגין.</li></ol>')}
      ${L.note('warn', 'רק על מערך', 'אפשר להעביר ל-<code>strtok</code> רק מערך שאפשר לכתוב בו, כמו <code>char line[] = "…"</code>. ביחידה 12 נראה צורת הגדרה אחרת שבה המחרוזת לקריאה בלבד, ושם <code>strtok</code> תקריס את התוכנית.')}
      `;
      const s = host.querySelector('#tk-s'), d = host.querySelector('#tk-d');
      const run = () => {
        const p = host.querySelector('.pl'); L.runLocalLeave(p); p.innerHTML = '';
        L.player(p, build((s.value || ' ').slice(0, 34), d.value || ' '));
      };
      s.addEventListener('input', L.debounce(run, 300));
      d.addEventListener('input', L.debounce(run, 300));
      run();
    },

    check: [
      { q: 'מה יודפס בשורה האחרונה?', code: ['char s[] = "a,b,c";', 'char *w = strtok(s, ",");', 'while (w != NULL)', '    w = strtok(NULL, ",");', 'printf("%s", s);'],
        opts: [L.ic('a,b,c'), L.ic('a'), L.ic('c'), L.ic('abc')], a: 1, why: 'שני הפסיקים נדרסו ב-<code>\'\\0\'</code>. ההדפסה של <code>s</code> נעצרת אחרי <code>a</code>.' },
      { q: 'כמה מילים תחזיר הלולאה עבור <code>"  one   two  "</code> עם המפריד <code>" "</code>?',
        opts: ['2', '4', '5', '7'], a: 0, why: 'רווחים בהתחלה, בסוף, ורווחים רצופים, כולם מדולגים. נשארות שתי מילים.' },
      { q: 'למה בקריאות שאחרי הראשונה מעבירים <code>NULL</code>?',
        opts: ['כדי לסיים את הפירוק', 'כדי לומר לפונקציה להמשיך מהמקום שבו עצרה', 'כי המחרוזת כבר נמחקה', 'זו שגיאה, צריך להעביר שוב את המחרוזת'], a: 1,
        why: 'אם מעבירים שוב את המחרוזת, <code>strtok</code> מתחילה מחדש מתחילתה ותחזיר את המילה הראשונה שוב ושוב.' }
    ]
  });
})();
