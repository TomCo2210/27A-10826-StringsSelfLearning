/* יחידה 02 — תווים הם מספרים */
(function () {
  'use strict';
  const L = window.Lomda;

  const RANGES = [
    { name: "'0'..'9'", from: 48, to: 57 },
    { name: "'A'..'Z'", from: 65, to: 90 },
    { name: "'a'..'z'", from: 97, to: 122 }
  ];
  const printable = n => n >= 32 && n <= 126;
  const asChar = n => printable(n) ? (n === 32 ? '␣' : String.fromCharCode(n)) : '—';
  const bin = n => ((n % 256) + 256) % 256 === n ? n.toString(2).padStart(8, '0') : '';

  L.unit({
    id: 'chars',
    title: 'תווים הם מספרים',
    blurb: 'ASCII, ארבעה סוגי אפס, וחשבון עם תווים',
    minutes: 12,
    lede: 'משתנה <code>char</code> הוא מספר שלם קטן, בגודל בית אחד. כשכותבים <code>\'A\'</code> בקוד, הקומפיילר מחליף אותו במספר 65. המיפוי בין תווים למספרים נקרא טבלת ASCII.',
    goals: [
      'שתו מוצג כאות אבל נשמר כמספר',
      'להבחין בין <code>0</code>, <code>\'0\'</code>, <code>\'\\0\'</code> ו-<code>"0"</code>',
      'להמיר ספרה לערך שלה עם <code>c - \'0\'</code>',
      'להמיר אות קטנה לגדולה בחשבון פשוט'
    ],

    build(host) {
      host.innerHTML = `
      ${L.code([
        "char c = 'A';",
        'printf("%c %d\\n", c, c);    /* prints: A 65 */',
        'printf("%c\\n", 66);         /* prints: B    */',
        'printf("%d\\n", \'a\' - \'A\');  /* prints: 32   */'
      ])}
      <p>אותו בית בזיכרון מודפס כאות עם <code>%c</code> וכמספר עם <code>%d</code>. אין "המרה" ביניהם: זה אותו ערך בדיוק, בשני אופני תצוגה.</p>

      <div class="lab" id="c-lab">
        <p class="lab-t">מעבדת תווים</p>
        <div class="fields">
          <label class="fld" for="c-in">תו
            <input type="text" id="c-in" value="g" maxlength="1" spellcheck="false" autocomplete="off" style="width:4em;text-align:center">
          </label>
          <div class="chips" id="c-quick" style="margin:0">
            ${['A', 'z', '7', '0', ' ', '!'].map(c => '<button type="button" class="btn ghost small mono" data-c="' + L.esc(c) + '">' + (c === ' ' ? 'רווח' : L.esc(L.clit(c))) + '</button>').join('')}
          </div>
        </div>
        <div id="c-view"></div>
      </div>

      ${L.note('key', 'אל תשננו מספרים', 'כתבו <code>\'0\'</code> ולא 48, <code>\'A\'</code> ולא 65. הקוד קריא יותר ונכון בכל מקרה. מה שכן חשוב לזכור: <b>הספרות רצופות</b> בטבלה, וגם האותיות הגדולות והקטנות. לכן <code>c - \'0\'</code> נותן תמיד את ערך הספרה, ו-<code>c - \'a\'</code> נותן את מקום האות באלף-בית (a=0, b=1…).')}

      <h3>ארבעה דברים שנקראים "אפס"</h3>
      <p>זו נקודת בלבול קלאסית. בחרו כל אחד וראו מה באמת יושב בזיכרון (בבסיס 2):</p>
      <div class="lab"><div id="z-tabs"></div></div>
      ${L.note('warn', 'מלכודת', '<code>if (s[i] == \'\\0\')</code> ו-<code>if (s[i] == 0)</code> הן אותה בדיקה בדיוק: האם הגענו לסוף המחרוזת. לעומתן <code>if (s[i] == \'0\')</code> בודקת דבר אחר לגמרי: האם התו הוא הספרה אפס.')}
      `;

      /* ── מעבדת תווים ── */
      const inp = host.querySelector('#c-in');
      function render() {
        const ch = inp.value === '' ? ' ' : inp.value[0];
        const n = ch.charCodeAt(0);
        if (n > 127) {
          host.querySelector('#c-view').innerHTML = L.note('warn', 'מחוץ לטבלת ASCII', 'התו שהוקלד אינו חלק מטבלת ASCII (למשל אות עברית). ב-C הוא נשמר בכמה בתים, ולא נעסוק בזה בקורס. נסו אות אנגלית, ספרה או סימן.');
          return;
        }
        const isD = n >= 48 && n <= 57, isL = n >= 97 && n <= 122, isU = n >= 65 && n <= 90;
        const row = (expr, val, extra) => [L.ic(expr), '<span class="mono">' + val + '</span>', '<span class="mono">' + asChar(val) + '</span>', extra || ''];
        const lit = L.clit(ch);
        const rows = [
          row('c', n, 'הערך עצמו'),
          row('c + 1', n + 1, 'התו הבא בטבלה'),
          row('c - \'0\'', n - 48, isD ? '<span class="yes">ערך הספרה: ' + (n - 48) + '</span>' : 'משמעותי רק כש-c הוא ספרה'),
          row('c - \'a\' + \'A\'', n - 32, isL ? '<span class="yes">האות הגדולה המתאימה</span>' : 'משמעותי רק כש-c הוא אות קטנה'),
          row('c - \'A\' + \'a\'', n + 32, isU ? '<span class="yes">האות הקטנה המתאימה</span>' : 'משמעותי רק כש-c הוא אות גדולה')
        ];
        host.querySelector('#c-view').innerHTML =
          L.code(['char c = ' + lit + ';']) +
          '<div class="mem-wrap">' + L.mem([ch], { idx: 'ascii', size: 'lg' }) + '</div>' +
          '<p class="muted" style="font-size:var(--fs-sm)">בבסיס 2: <span class="mono">' + bin(n) + '</span>' + (n === 32 ? ' · הרווח הוא תו לכל דבר, עם קוד 32' : '') + '</p>' +
          '<div class="ruler">' + RANGES.map(r => {
            let cells = '';
            for (let k = r.from; k <= r.to; k++) cells += '<span class="rc' + (k === n ? ' on' : '') + '">' + String.fromCharCode(k) + '<small>' + k + '</small></span>';
            return '<div class="ruler-row"><span class="rn">' + r.name + '</span><div class="ruler-cells">' + cells + '</div></div>';
          }).join('') + '</div>' +
          L.table(['ביטוי', 'כמספר (%d)', 'כתו (%c)', ''], rows) +
          '<p class="muted" style="font-size:var(--fs-sm)">הבדיקה <code>c &gt;= \'a\' &amp;&amp; c &lt;= \'z\'</code> מחזירה כאן <b class="mono">' + (isL ? 1 : 0) + '</b>. ביחידה 09 נראה פונקציות מוכנות לבדיקות כאלה.</p>';
      }
      inp.addEventListener('input', render);
      host.querySelector('#c-quick').addEventListener('click', e => {
        const b = e.target.closest('[data-c]'); if (!b) return;
        inp.value = b.dataset.c; render();
      });
      render();

      /* ── ארבעת האפסים ── */
      const Z = [
        { t: '0', type: 'int', bytes: [0, 0, 0, 0], d: 'המספר השלם אפס. תופס 4 בתים (במחשבים של היום), כולם אפסים.' },
        { t: "'0'", type: 'char', bytes: [48], d: 'התו שמופיע על המקש 0. ערך ASCII שלו הוא <b>48</b>. בית אחד.' },
        { t: "'\\0'", type: 'char', bytes: [0], d: 'התו שערכו <b>0</b>. אין לו צורה על המסך. זה סימן הסוף של כל מחרוזת.' },
        { t: '"0"', type: 'char[2]', bytes: [48, 0], d: 'מחרוזת עם תו אחד: <code>\'0\'</code> ואחריו <code>\'\\0\'</code>. שני בתים. לכן <code>strlen("0")</code> הוא 1 ו-<code>sizeof("0")</code> הוא 2.' }
      ];
      L.tabs(host.querySelector('#z-tabs'), Z.map(z => ({
        label: '<code>' + L.esc(z.t) + '</code>',
        render(el) {
          el.innerHTML =
            '<div class="mem-wrap"><div class="mem-block nomarks"><div class="mem-label">' + z.type + '</div><div class="mem">' +
            z.bytes.map((v, i) => '<div class="b' + (v === 0 && z.type !== 'int' ? ' nul' : '') + '" style="width:92px">' + bin(v) + '<span class="i">' + i + '</span></div>').join('') +
            '</div></div></div>' +
            L.table(['כתיב', 'טיפוס', 'גודל בבתים', 'ערכי הבתים'], [[L.ic(z.t), L.ic(z.type), z.bytes.length, '<span class="mono">' + z.bytes.join(', ') + '</span>']]) +
            '<p>' + z.d + '</p>';
        }
      })), { initial: 2 });
    },

    check: [
      { q: 'מה ערכו של <code>d</code>?', code: ["char c = '7';", "int d = c - '0';"],
        opts: ['7', '55', "'7'", '48'], a: 0,
        why: "ערך ASCII של <code>'7'</code> הוא 55, ושל <code>'0'</code> הוא 48. ההפרש הוא 7, הערך המספרי של הספרה. זו הדרך הסטנדרטית להמיר תו-ספרה למספר." },
      { q: 'מה תדפיס השורה?', code: ['printf("%c", \'a\' + 2);'],
        opts: ['a2', 'c', '99', 'שגיאת קומפילציה'], a: 1,
        why: "<code>'a'</code> הוא 97, ועוד 2 זה 99, שהוא הקוד של <code>'c'</code>. עם <code>%d</code> היה מודפס 99." },
      { q: 'מה בודק התנאי <code>if (s[i] == \'0\')</code>?',
        opts: ['האם הגענו לסוף המחרוזת', 'האם התו הוא הספרה אפס', 'האם התא ריק', 'שני התנאים הראשונים, זה אותו דבר'], a: 1,
        why: "<code>'0'</code> הוא התו 48, הספרה. סוף המחרוזת נבדק מול <code>'\\0'</code> (או 0)." }
    ]
  });
})();
