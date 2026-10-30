/* יחידה 10 — sprintf ו-sscanf */
(function () {
  'use strict';
  const L = window.Lomda;
  const WS = c => c === ' ' || c === '\t' || c === '\n';

  /* ── מנוע sscanf מוקטן: %d %f %s %c, רוחב, %*, רווחים ותווים מילוליים ── */
  function parseFmt(f) {
    const toks = []; let i = 0;
    while (i < f.length) {
      if (WS(f[i])) { while (i < f.length && WS(f[i])) i++; toks.push({ t: 'ws' }); continue; }
      if (f[i] === '%') {
        const m = f.slice(i).match(/^%(\*?)(\d*)([dfsc%])/);
        if (!m) return { error: 'הפורמט <code>' + L.esc(f.slice(i, i + 3)) + '</code> לא נתמך בסימולטור. נסו %d, %f, %s, %c, עם רוחב או כוכבית.' };
        if (m[3] === '%') toks.push({ t: 'lit', c: '%' });
        else toks.push({ t: 'conv', spec: m[3], sup: !!m[1], width: m[2] ? +m[2] : 0 });
        i += m[0].length; continue;
      }
      toks.push({ t: 'lit', c: f[i] }); i++;
    }
    return { toks };
  }

  function runSscanf(input, toks) {
    let pos = 0, n = 0, convs = 0, fail = null;
    const steps = [], state = {};
    for (const tk of toks) {
      if (tk.t === 'ws') { while (pos < input.length && WS(input[pos])) state[pos++] = 'done'; continue; }
      if (tk.t === 'lit') {
        if (input[pos] === tk.c) { state[pos++] = 'done'; continue; }
        fail = pos >= input.length ? 'הקלט נגמר' : 'בקלט מופיע <code>' + L.esc(input[pos]) + '</code> ובפורמט נדרש <code>' + L.esc(tk.c) + '</code>'; break;
      }
      if (tk.spec !== 'c') while (pos < input.length && WS(input[pos])) state[pos++] = 'done';
      if (pos >= input.length) { fail = 'הקלט נגמר'; if (convs === 0 && n === 0) n = -1; break; }
      const rest = input.slice(pos);
      let m = null;
      if (tk.spec === 'd') m = rest.match(tk.width ? new RegExp('^[+-]?\\d{1,' + tk.width + '}') : /^[+-]?\d+/);
      if (tk.spec === 'f') m = rest.match(/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/);
      if (tk.spec === 's') { let k = 0; while (k < rest.length && !WS(rest[k]) && (!tk.width || k < tk.width)) k++; m = k ? [rest.slice(0, k)] : null; }
      if (tk.spec === 'c') { const k = tk.width || 1; m = rest.length >= k ? [rest.slice(0, k)] : null; }
      if (!m) { fail = 'אין התאמה ל-<code>%' + tk.spec + '</code> בתו <code>' + L.esc(input[pos]) + '</code>'; break; }
      convs++;
      for (let k = 0; k < m[0].length; k++) state[pos + k] = tk.sup ? 'done' : 'hit';
      pos += m[0].length;
      let val = m[0];
      if (tk.spec === 'd') val = String(parseInt(m[0], 10));
      if (tk.spec === 'f') val = parseFloat(m[0]).toFixed(6);
      if (tk.spec === 's') val = '"' + m[0] + '"';
      if (tk.spec === 'c') val = L.clit(m[0][0]);
      steps.push({ spec: tk.spec, sup: tk.sup, text: m[0], val });
      if (!tk.sup) n++;
    }
    return { n, steps, fail, state, pos };
  }

  const PRESETS = [
    { label: 'שם וגיל', input: 'Dana 21', fmt: '%s %d', vars: ['name', 'age'] },
    { label: 'תאריך', input: '30/10/2026', fmt: '%d/%d/%d', vars: ['day', 'month', 'year'] },
    { label: 'דילוג על מילה', input: 'Anna is 2 years old', fmt: '%s %*s %d', vars: ['name', 'age'] },
    { label: 'ציונים', input: '92.5 87 100', fmt: '%f %f %f', vars: ['g1', 'g2', 'g3'] },
    { label: 'קלט לא תקין', input: 'abc 5', fmt: '%d %d', vars: ['a', 'b'] }
  ];
  const TYPE = { d: 'int', f: 'float', s: 'char[20]', c: 'char' };

  L.unit({
    id: 'format',
    title: '<code>sprintf</code> ו-<code>sscanf</code>',
    short: '<code>sprintf</code> · <code>sscanf</code>',
    blurb: 'כתיבה לתוך מחרוזת וקריאה מתוכה',
    minutes: 14,
    lede: 'את <code>printf</code> ו-<code>scanf</code> אתם כבר מכירים. ל-<code>stdio.h</code> יש גרסאות שעובדות מול <b>מחרוזת</b> במקום מול המסך והמקלדת: <code>sprintf</code> כותבת לתוך מחרוזת, ו-<code>sscanf</code> קוראת ממנה. הפורמטים זהים.',
    goals: [
      'לבנות מחרוזת ממספרים ומחרוזות אחרות עם <code>sprintf</code>',
      'לפרק מחרוזת לשדות עם <code>sscanf</code>, ולבדוק את הערך שהיא מחזירה',
      'לדלג על שדה עם <code>%*</code>'
    ],

    build(host) {
      host.innerHTML = `
      <h3><code>sprintf</code>: כמו printf, אבל לתוך מערך</h3>
      <div class="lab">
        <p class="lab-t">בניית מזהה</p>
        <div class="fields">
          <label class="fld" for="sp-d">מחלקה (מחרוזת)<input type="text" id="sp-d" value="EE" maxlength="8" spellcheck="false" autocomplete="off" style="width:110px"></label>
          <label class="fld" for="sp-n">מספר (int)<input type="number" id="sp-n" value="7" min="-999" max="99999" style="width:110px"></label>
        </div>
        <div id="sp-view"></div>
      </div>
      ${L.note('warn', 'גם sprintf לא בודקת מקום', 'בדיוק כמו <code>strcpy</code>, היא כותבת כמה שצריך. כשלא בטוחים באורך, השתמשו ב-<code>snprintf(dest, sizeof(dest), …)</code>, שעוצרת לפני סוף המערך ותמיד מוסיפה <code>\'\\0\'</code>.')}
      <p>שימוש נפוץ: המרה של מספר למחרוזת, למשל כדי לספור את הספרות שלו:</p>
      ${L.code(['char buf[12];', 'sprintf(buf, "%d", 2026);', 'printf("%d digits\\n", (int)strlen(buf));   /* 4 digits */'])}

      <h3><code>sscanf</code>: כמו scanf, אבל מתוך מחרוזת</h3>
      <p><code>sscanf</code> מחזירה <b>כמה משתנים קיבלו ערך</b>. זה הכלי לבדוק שהקלט היה בפורמט הנכון. אם הקלט נגמר לפני ההמרה הראשונה, היא מחזירה <code>EOF</code> (בדרך כלל -1).</p>
      <div class="lab">
        <p class="lab-t">מגרש משחקים</p>
        <div class="chips" id="ss-pre">${PRESETS.map((p, i) => '<button type="button" class="btn ghost small' + (i === 0 ? ' on' : '') + '" data-i="' + i + '">' + p.label + '</button>').join('')}</div>
        <div class="fields">
          <label class="fld" for="ss-in">המחרוזת<input type="text" id="ss-in" maxlength="40" spellcheck="false" autocomplete="off" style="width:240px"></label>
          <label class="fld" for="ss-f">הפורמט<input type="text" id="ss-f" maxlength="30" spellcheck="false" autocomplete="off" style="width:160px"></label>
        </div>
        <div id="ss-view"></div>
      </div>
      ${L.note('info', 'הכוכבית', '<code>%*s</code> אומר: קרא את השדה וזרוק אותו. אין לו משתנה ברשימה, והוא לא נספר בערך המוחזר. בפורמט, רווח מתאים לכל כמות של רווחים בקלט, ותו אחר (כמו <code>/</code>) חייב להופיע בדיוק.')}
      `;

      /* sprintf */
      const dIn = host.querySelector('#sp-d'), nIn = host.querySelector('#sp-n');
      function renderSp() {
        const d = dIn.value, n = parseInt(nIn.value, 10) || 0;
        const num = n < 0 ? '-' + String(-n).padStart(2, '0') : String(n).padStart(3, '0');
        const res = d + '-' + num;
        const SIZE = 10;
        const data = L.bytesOf(res);
        const bytes = data.slice(0, SIZE).concat(data.length < SIZE ? new Array(SIZE - data.length).fill(null) : []);
        const state = {};
        if (data.length > SIZE) { bytes.push('|'); data.slice(SIZE).forEach((x, k) => { bytes.push(x); state[SIZE + k] = 'oob'; }); }
        host.querySelector('#sp-view').innerHTML =
          L.code(['char id[10];', 'sprintf(id, "%s-%03d", "' + L.cstr(d) + '", ' + n + ');', 'printf("%s\\n", id);']) +
          '<div class="mem-wrap">' + L.mem(bytes, { label: 'char id[10]', state }) + '</div>' +
          '<div class="out">' + L.esc(res) + '\n</div>' +
          '<p class="muted" style="font-size:var(--fs-sm);margin-top:8px"><code>%03d</code>: לפחות 3 ספרות, עם אפסים מובילים. ' +
          (data.length > SIZE ? '<b style="color:var(--bad)">נכתבו ' + data.length + ' בתים למערך של 10: גלישה.</b>' : 'נכתבו ' + data.length + ' בתים, כולל <code>\'\\0\'</code>.') + '</p>';
      }
      dIn.addEventListener('input', renderSp); nIn.addEventListener('input', renderSp);
      renderSp();

      /* sscanf */
      const sIn = host.querySelector('#ss-in'), fIn = host.querySelector('#ss-f');
      let preset = PRESETS[0];
      function load(p) { preset = p; sIn.value = p.input; fIn.value = p.fmt; renderSs(); }
      function renderSs() {
        const input = sIn.value, fmt = fIn.value;
        const view = host.querySelector('#ss-view');
        const pf = parseFmt(fmt);
        if (pf.error) { view.innerHTML = L.note('warn', 'פורמט לא נתמך', pf.error); return; }
        const convs = pf.toks.filter(t => t.t === 'conv' && !t.sup);
        const names = convs.map((c, k) => (fmt === preset.fmt && preset.vars[k]) || ('v' + (k + 1)));
        const r = runSscanf(input, pf.toks);
        const args = convs.map((c, k) => (c.spec === 's' ? '' : '&') + names[k]).join(', ');
        const decl = convs.map((c, k) => c.spec === 's' ? 'char ' + names[k] + '[20];' : TYPE[c.spec] + ' ' + names[k] + ';');
        let vi = 0;
        const rows = r.steps.map(s => {
          if (s.sup) return [L.ic('%*' + s.spec), '<span class="mono">' + L.esc(s.text) + '</span>', 'נקרא ונזרק', '—'];
          const nm = names[vi++];
          return [L.ic('%' + s.spec), '<span class="mono">' + L.esc(s.text) + '</span>', '<span class="mono">' + nm + '</span>', '<span class="mono">' + L.esc(s.val) + '</span>'];
        });
        for (let k = vi; k < names.length; k++) rows.push([L.ic('%' + convs[k].spec), '—', '<span class="mono">' + names[k] + '</span>', '<span class="maybe">לא השתנה (זבל)</span>']);
        view.innerHTML =
          L.code(decl.concat(['int n;', '', 'n = sscanf("' + L.cstr(input) + '", "' + L.cstr(fmt) + '"' + (args ? ', ' + args : '') + ');'])) +
          '<div class="mem-wrap">' + L.mem(L.bytesOf(input), { size: input.length > 20 ? 'sm' : undefined, state: r.state, idx: false }) + '</div>' +
          '<p class="muted" style="font-size:var(--fs-sm)">בטורקיז: מה שנכנס למשתנים. בירוק: מה שנקרא ודולג. בלי צבע: מה שלא נקרא.</p>' +
          (rows.length ? L.table(['בפורמט', 'הטקסט שנקרא', 'משתנה', 'ערך'], rows) : '') +
          L.note(r.n === convs.length ? 'ok' : 'warn', '<span class="mono">n = ' + r.n + '</span>',
            r.n === -1 ? 'הקלט נגמר לפני ההמרה הראשונה, ולכן מוחזר <code>EOF</code>.'
            : r.n === convs.length ? 'כל ' + convs.length + ' המשתנים קיבלו ערך. בקוד אמיתי בודקים: <code>if (n == ' + convs.length + ')</code>.'
            : 'רק ' + r.n + ' מתוך ' + convs.length + ' משתנים קיבלו ערך' + (r.fail ? ': ' + r.fail + '.' : '.') + ' משתנה שלא קיבל ערך נשאר עם מה שהיה בו קודם, ולכן חשוב לבדוק את <code>n</code> לפני שמשתמשים בהם.');
      }
      host.querySelector('#ss-pre').addEventListener('click', e => {
        const b = e.target.closest('[data-i]'); if (!b) return;
        L.$$('#ss-pre [data-i]', host).forEach(x => x.classList.toggle('on', x === b));
        load(PRESETS[+b.dataset.i]);
      });
      sIn.addEventListener('input', renderSs); fIn.addEventListener('input', renderSs);
      load(PRESETS[0]);
    },

    check: [
      { q: 'מה יהיו <code>r</code> ו-<code>n</code>?', code: ['int n = 0;', 'int r = sscanf("12 apples", "%d", &n);'],
        opts: ['r = 1, n = 12', 'r = 2, n = 12', 'r = 0, n = 0', 'r = 12, n = 1'], a: 0, why: 'המרה אחת הצליחה. המילה <code>apples</code> פשוט לא נקראה.' },
      { q: 'מה <code>strlen(s)</code>?', code: ['char s[20];', 'sprintf(s, "%d-%d", 3, 14);'],
        opts: ['3', '4', '5', '20'], a: 1, why: 'נכתב <code>"3-14"</code>: ארבעה תווים.' },
      { q: 'מה תחזיר <code>sscanf("5 x", "%d %d", &a, &b)</code>?',
        opts: ['2', '1', '0', '-1'], a: 1, why: '<code>a</code> קיבל 5. ב-<code>x</code> אין מספר, ההמרה השנייה נכשלת, ו-<code>b</code> לא השתנה.' }
    ]
  });
})();
