/* יחידה 11 — מערך של מחרוזות (מטריצת תווים) */
(function () {
  'use strict';
  const L = window.Lomda;
  const N = 5, LEN = 12;
  const DEFAULT = ['Yossi', 'Dana', 'Avi', 'Noa', 'Michal'];

  function grid(rows, o) {
    o = o || {};
    let h = '<div class="mem-wrap"><div class="matrix">';
    h += '<div class="mrow"><span class="rl"></span>' + Array.from({ length: LEN }, (_, j) => '<span class="mc head">' + j + '</span>').join('') + '</div>';
    rows.forEach((r, i) => {
      const b = L.bytesOf(r, LEN, 0);
      const rc = (o.rowCls && o.rowCls[i]) || '';
      h += '<div class="mrow ' + rc + '"><span class="rl">names[' + i + ']</span>';
      for (let j = 0; j < LEN; j++) {
        const ch = b[j];
        const hl = o.cell && o.cell[0] === i && o.cell[1] === j ? ' hl' : '';
        h += '<span class="mc ' + L.byteCls(ch) + hl + '">' + L.glyph(ch) + '</span>';
      }
      h += '<span class="rr">' + (o.right ? o.right(i, r) : '') + '</span></div>';
    });
    return h + '</div></div>';
  }

  function sortFrames(names) {
    const a = names.slice();
    const code = [
      'char temp[LEN];',
      'int i, j;',
      '',
      'for (i = 0; i < N - 1; i++)',
      '    for (j = 0; j < N - 1 - i; j++)',
      '        if (strcmp(names[j], names[j + 1]) > 0)',
      '        {',
      '            strcpy(temp, names[j]);',
      '            strcpy(names[j], names[j + 1]);',
      '            strcpy(names[j + 1], temp);',
      '        }'
    ];
    const F = [];
    const sorted = new Set();
    const cls = (extra) => { const c = {}; sorted.forEach(k => c[k] = 'sorted'); return Object.assign(c, extra || {}); };
    F.push({ line: 0, stage: grid(a), note: 'חמש שורות, כל אחת מחרוזת עצמאית עם <code>\'\\0\'</code> משלה. נמיין אותן לפי סדר מילוני (Bubble Sort).' });
    for (let i = 0; i < N - 1; i++) {
      for (let j = 0; j < N - 1 - i; j++) {
        const r = a[j] < a[j + 1] ? -1 : a[j] > a[j + 1] ? 1 : 0;
        F.push({ line: 5, stage: grid(a, { rowCls: cls({ [j]: 'cmp', [j + 1]: 'cmp' }) }),
          note: '<code>strcmp(names[' + j + '], names[' + (j + 1) + '])</code>: <code>"' + L.esc(a[j]) + '"</code> מול <code>"' + L.esc(a[j + 1]) + '"</code>. ' + (r > 0 ? 'התוצאה <b>חיובית</b>, הסדר הפוך: מחליפים.' : 'התוצאה לא חיובית, הסדר תקין.') });
        if (r > 0) {
          const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
          F.push({ line: [7, 8, 9], stage: grid(a, { rowCls: cls({ [j]: 'swap', [j + 1]: 'swap' }) }),
            note: 'שלוש העתקות דרך <code>temp</code>. אי אפשר לכתוב <code>names[j] = names[j + 1]</code>: זו השמה למערך, והקומפיילר לא יאפשר אותה.' });
        }
      }
      sorted.add(N - 1 - i);
    }
    sorted.add(0);
    F.push({ line: 3, stage: grid(a, { rowCls: cls() }), note: 'השמות ממוינים. <code>strcmp</code> משווה לפי ASCII, ולכן שם שמתחיל באות קטנה יבוא אחרי כל השמות שמתחילים באות גדולה.' });
    return { code, frames: F };
  }

  L.unit({
    id: 'matrix',
    title: 'מערך של מחרוזות',
    blurb: 'מטריצת תווים, <code>names[i]</code> מול <code>names[i][j]</code>, ומיון שמות',
    minutes: 15,
    lede: 'רשימה של שמות היא מטריצה של תווים: <code>char names[5][12]</code>. כל שורה היא מערך של 12 תווים, ולכן כל שורה יכולה להחזיק מחרוזת אחת באורך של עד 11 תווים.',
    goals: [
      'להבחין בין <code>names[i]</code> (מחרוזת) לבין <code>names[i][j]</code> (תו)',
      'לקלוט, להדפיס ולחפש ברשימת מחרוזות',
      'למיין שמות עם <code>strcmp</code> ו-<code>strcpy</code>'
    ],

    build(host) {
      host.innerHTML = `
      ${L.code(['#define N   5      /* number of names */', '#define LEN 12     /* up to 11 chars + \'\\0\' */', '', 'char names[N][LEN] = { "Yossi", "Dana", "Avi", "Noa", "Michal" };'])}
      ${L.table(['הביטוי', 'הטיפוס', 'מה זה'], [
        [L.ic('names[i][j]'), L.ic('char'), 'תו אחד: התו ה-<code>j</code> בשורה <code>i</code>'],
        [L.ic('names[i]'), 'מערך של <code>char</code>', '<b>מחרוזת שלמה</b>: שורה <code>i</code>. זה מה שמעבירים ל-<code>printf("%s")</code>, ל-<code>strlen</code>, ל-<code>fgets</code>'],
        [L.ic('names'), 'מערך של מערכים', 'כל המטריצה']
      ])}
      <div class="lab"><p class="lab-t">המטריצה בזיכרון</p><div id="mx-tabs"></div></div>

      <h3>קליטה והדפסה בלולאה</h3>
      ${L.code([
        'for (i = 0; i < N; i++)',
        '{',
        '    printf("Name %d: ", i + 1);',
        '    scanf("%11s", names[i]);        /* names[i] is a string: no & */',
        '}',
        '',
        'for (i = 0; i < N; i++)',
        '    printf("%d. %s (%d letters)\\n", i + 1, names[i], (int)strlen(names[i]));'
      ])}
      ${L.note('info', 'מקום שלא בשימוש', 'כל שורה תופסת 12 בתים, גם כשיש בה שם של 3 אותיות. זה המחיר של מטריצה בגודל קבוע. כשנלמד הקצאה דינמית (מפגש 10) נראה איך להקצות לכל מחרוזת בדיוק את המקום שהיא צריכה.')}
      `;

      let names = DEFAULT.slice();
      L.tabs(host.querySelector('#mx-tabs'), [
        { label: 'מבט על הזיכרון', render(el) {
          el.innerHTML = '<div class="mx-wrap"><div class="fields">' + names.map((n, i) =>
            '<label class="fld" for="mx-r' + i + '">names[' + i + ']<input type="text" id="mx-r' + i + '" data-r="' + i + '" value="' + L.esc(n) + '" maxlength="11" spellcheck="false" autocomplete="off" style="width:120px"></label>').join('') + '</div>' +
            '<div class="fields"><label class="fld" for="mx-i">i<input type="number" id="mx-i" value="1" min="0" max="4" style="width:70px"></label>' +
            '<label class="fld" for="mx-j">j<input type="number" id="mx-j" value="2" min="0" max="11" style="width:70px"></label></div>' +
            '<div class="mx-view"></div></div>';
          const render = () => {
            const i = Math.max(0, Math.min(4, +el.querySelector('#mx-i').value || 0));
            const j = Math.max(0, Math.min(11, +el.querySelector('#mx-j').value || 0));
            const b = L.bytesOf(names[i], LEN, 0);
            const used = names.reduce((s, n) => s + n.length + 1, 0);
            el.querySelector('.mx-view').innerHTML =
              grid(names, { cell: [i, j], rowCls: { [i]: 'cmp' }, right: (k, r) => 'strlen = ' + r.length }) +
              L.table(['ביטוי', 'ערך'], [
                [L.ic('names[' + i + ']'), L.ic('"' + names[i] + '"')],
                [L.ic('names[' + i + '][' + j + ']'), '<span class="mono">' + L.esc(L.clit(b[j] === 0 ? '\0' : b[j])) + '</span>' + (b[j] === 0 ? ' (תא מאופס, אחרי סוף המחרוזת)' : b[j] === '\0' ? ' (סוף המחרוזת)' : '')]
              ]) +
              '<p class="muted" style="font-size:var(--fs-sm)"><code>sizeof(names)</code> = ' + (N * LEN) + ' בתים. בפועל בשימוש: ' + used + ' (התווים ו-<code>\'\\0\'</code> של כל שורה).</p>';
          };
          el.querySelector('.mx-wrap').addEventListener('input', e => {
            const r = e.target.dataset && e.target.dataset.r;
            if (r !== undefined) names[+r] = e.target.value.replace(/\s/g, '').slice(0, 11) || 'x';
            render();
          });
          render();
        } },
        { label: 'מיון לפי א-ב', render(el) { L.player(el, sortFrames(names)); } }
      ]);
    },

    check: [
      { q: 'מה הטיפוס של <code>names[2]</code> בהגדרה <code>char names[5][12]</code>?',
        opts: ['<code>char</code>', 'מחרוזת (מערך של 12 תווים)', '<code>int</code>', 'מטריצה'], a: 1, why: 'אינדקס אחד בוחר שורה, ושורה היא מערך של תווים.' },
      { q: 'מה יודפס?', code: ['char w[3][6] = { "red", "green", "blue" };', 'printf("%c%c", w[1][0], w[2][3]);'],
        opts: [L.ic('ge'), L.ic('gb'), L.ic('re'), L.ic('ee')], a: 0, why: '<code>w[1][0]</code> הוא האות הראשונה של <code>"green"</code>, ו-<code>w[2][3]</code> הוא התו הרביעי של <code>"blue"</code>.' },
      { q: 'איך מחליפים בין שתי שורות במטריצה?',
        opts: [L.ic('names[0] = names[1];'), 'שלוש קריאות ל-<code>strcpy</code> דרך מערך עזר', L.ic('swap(names[0], names[1]);'), 'אי אפשר'], a: 1,
        why: 'שורה היא מערך, ולמערך אין השמה. מעתיקים את התוכן עם <code>strcpy</code>, דרך <code>temp</code>.' }
    ]
  });
})();
