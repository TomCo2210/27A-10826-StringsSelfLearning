/* ════════════════════════════════════════════════════════════
   app.js — הרכבת הלומדה: תפריט, דף בית, ניווט בין יחידות
   כתובת: #home לדף הבית, #<id> ליחידה (למשל #string-h).
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = window.Lomda;
  const C = L.config;
  const P = L.progress;

  document.documentElement.lang = 'he';
  document.documentElement.dir = 'rtl';

  /* סדר היחידות לפי config, רק יחידות שבאמת נטענו */
  const ORDER = [];
  const PART_OF = {};
  C.parts.forEach((p, pi) => p.units.forEach(id => {
    if (L.UNITS[id]) { ORDER.push(id); PART_OF[id] = pi; }
    else console.warn('יחידה חסרה:', id);
  }));
  const num = id => String(ORDER.indexOf(id) + 1).padStart(2, '0');
  const PART_LETTERS = 'אבגדהוזחט';

  const side = L.$('#side'), main = L.$('#main'), menuBtn = L.$('#menu-btn'), scrim = L.$('#scrim');
  L.$('#brand-course').textContent = C.courseNumber + ' · ' + C.courseName;

  /* ── progress in the top bar: one byte per unit, then '\0' ── */
  function drawTopProgress() {
    const n = P.doneCount(ORDER), all = n === ORDER.length;
    L.$('#top-progress').innerHTML =
      '<span class="tp-bytes" aria-hidden="true">' +
      '<span class="mem sm noidx" style="padding:0;gap:2px">' +
      ORDER.map(id => '<span class="b' + (P.isDone(id) ? ' done' : '') + '" style="width:9px;height:16px;font-size:0"></span>').join('') +
      '<span class="b ' + (all ? 'nul' : 'garbage') + '" style="width:9px;height:16px;font-size:0"></span>' +
      '</span></span>' +
      '<span class="tp-label">' + n + ' / ' + ORDER.length + ' יחידות</span>';
  }

  /* ── sidebar ── */
  function drawSide(cur) {
    let h = '<a class="side-home" href="#home"' + (cur === 'home' ? ' aria-current="page"' : '') + '>דף הבית ותוכן העניינים</a>';
    C.parts.forEach((p, pi) => {
      const ids = p.units.filter(id => L.UNITS[id]);
      h += '<div class="side-part"><p class="side-part-t">חלק ' + PART_LETTERS[pi] + ' · ' + p.title + '</p><ol>';
      ids.forEach(id => {
        const u = L.UNITS[id], done = P.isDone(id);
        h += '<li><a class="side-link' + (done ? ' done' : '') + '" href="#' + id + '"' + (cur === id ? ' aria-current="page"' : '') + '>' +
          '<span class="num">' + num(id) + '</span><span class="t">' + (u.short || u.title) + '</span>' +
          '<span class="tick">' + (done ? '✓' : '') + '</span></a></li>';
      });
      h += '</ol></div>';
    });
    h += '<div class="side-foot">' + C.courseNumber + ' · ' + C.courseName + '<br>' + C.institution + ' · ' + C.year + '</div>';
    side.innerHTML = h;
  }

  /* ── home ── */
  function renderHome() {
    const last = P.last();
    const firstUndone = ORDER.find(id => !P.isDone(id));
    const resume = last && L.UNITS[last] ? last : null;
    const totalMin = ORDER.reduce((a, id) => a + (L.UNITS[id].minutes || 0), 0);

    let h = '<section class="home-hero">' +
      '<p class="eyebrow">' + C.courseNumber + ' · ' + C.courseName + ' · לימוד עצמי</p>' +
      '<h1>מחרוזות בשפת <span class="c">C</span></h1>' +
      '<p class="lede">מחרוזת היא מערך של תווים שמסתיים בתו מיוחד, <code>\'\\0\'</code>. הלומדה מראה מה קורה בזיכרון, בית אחרי בית, בכל פעולה על מחרוזת: הגדרה, קליטה, העתקה, השוואה ופירוק.</p>' +
      '<div class="hero-strip mem-wrap" id="hero-strip"></div>' +
      '<p class="hero-cap" id="hero-cap"></p>' +
      '<div class="home-actions">' +
        (resume ? '<a class="btn accent" href="#' + resume + '">המשך ביחידה ' + num(resume) + ': ' + L.UNITS[resume].title + '</a>' : '') +
        '<a class="btn' + (resume ? ' ghost' : ' accent') + '" href="#' + (firstUndone || ORDER[0]) + '">' +
          (firstUndone && firstUndone !== ORDER[0] ? 'ליחידה הראשונה שלא הושלמה (' + num(firstUndone) + ')' : 'התחלה ביחידה 01') + '</a>' +
      '</div></section>';

    h += '<div class="how">' +
      '<div><p class="h-t">מנסים, לא רק קוראים</p><p>בכל יחידה יש סימולציה: משנים קלט, מריצים צעד אחר צעד, ורואים את הזיכרון משתנה.</p></div>' +
      '<div><p class="h-t">בודקים את עצמכם</p><p>בסוף כל יחידה כמה שאלות קצרות עם הסבר מלא. בסוף הלומדה: מצא את הבאג, חידון מסכם ותרגילי כתיבה.</p></div>' +
      '<div><p class="h-t">לפי הסדר</p><p>יחידות 01–11 דורשות רק מערכים, מטריצות ופונקציות. יחידה 12 מניחה שלמדתם מצביעים (מפגש 8).</p></div>' +
      '</div>';

    C.parts.forEach((p, pi) => {
      const ids = p.units.filter(id => L.UNITS[id]);
      h += '<section class="toc-part"><div class="toc-part-h"><h3>חלק ' + PART_LETTERS[pi] + ' · ' + p.title + '</h3><span class="sub">' + p.sub + '</span></div><ol class="toc-list">';
      ids.forEach(id => {
        const u = L.UNITS[id], done = P.isDone(id);
        h += '<li><a class="toc-card' + (done ? ' done' : '') + '" href="#' + id + '"><span class="num">' + num(id) + '</span>' +
          '<span class="t">' + u.title + '<span class="d">' + (u.blurb || '') + '</span></span>' +
          '<span class="st">' + (done ? '✓ הושלמה' : (u.minutes ? u.minutes + ' דק\'' : '')) + '</span></a></li>';
      });
      h += '</ol></section>';
    });

    h += '<div class="home-foot"><span>זמן משוער לכל הלומדה: כ-' + Math.round(totalMin / 60 * 2) / 2 + ' שעות, אפשר בכמה ישיבות.</span>' +
      '<span>ההתקדמות נשמרת בדפדפן הזה בלבד.</span>' +
      '<span id="reset-zone"><button type="button" class="btn ghost small" id="reset-btn">איפוס ההתקדמות</button></span></div>';

    main.innerHTML = h;
    heroAnim();

    L.$('#reset-btn').addEventListener('click', () => {
      L.$('#reset-zone').innerHTML = 'למחוק את כל ההתקדמות והתשובות? ' +
        '<button type="button" class="btn small" id="reset-yes">כן, לאפס</button> ' +
        '<button type="button" class="btn ghost small" id="reset-no">ביטול</button>';
      L.$('#reset-yes').addEventListener('click', () => { P.reset(); route(); });
      L.$('#reset-no').addEventListener('click', () => route());
    });
  }

  /* hero: המילה נכתבת תו-תו לתוך מערך, ואז מופיע '\0' */
  function heroAnim() {
    const word = 'hello', SIZE = 8;
    const host = L.$('#hero-strip'), cap = L.$('#hero-cap');
    const caps = [
      'char s[8]; — מערך של 8 תווים. עדיין לא אותחל, ולכן יש בו זבל.',
      'התווים נכתבים לתאים 0 עד 4…',
      'ובתא 5 נכתב \'\\0\'. מכאן המחשב יודע שהמחרוזת היא "hello", באורך 5.'
    ];
    let k = -1;
    function paint() {
      const bytes = [];
      for (let i = 0; i < SIZE; i++) {
        if (i < Math.min(k, word.length)) bytes.push(word[i]);
        else if (i === word.length && k > word.length) bytes.push('\0');
        else bytes.push(null);
      }
      const state = {}; for (let i = 0; i < Math.min(k, word.length); i++) state[i] = 'done';
      host.innerHTML = L.mem(bytes, { size: 'lg', state, cur: k >= 0 && k <= word.length ? k : undefined });
      cap.textContent = k < 0 ? caps[0] : k <= word.length ? caps[1] : caps[2];
    }
    if (L.reducedMotion()) { k = word.length + 1; paint(); return; }
    paint();
    let hold = 0;
    const t = setInterval(() => {
      if (k > word.length) { if (++hold < 5) return; hold = 0; k = -1; }
      else k++;
      paint();
    }, 650);
    L.onLeave(() => clearInterval(t));
  }

  /* ── unit view ── */
  function renderUnit(id) {
    const u = L.UNITS[id];
    const pi = PART_OF[id], idx = ORDER.indexOf(id);
    const prev = ORDER[idx - 1], next = ORDER[idx + 1];
    P.setLast(id);

    main.innerHTML =
      '<header class="unit-head">' +
        '<p class="unit-kicker"><span class="k-num">' + num(id) + '</span><span>חלק ' + PART_LETTERS[pi] + ' · ' + C.parts[pi].title + '</span>' +
        (u.minutes ? '<span class="k-time">כ-' + u.minutes + ' דקות</span>' : '') + '</p>' +
        '<h2>' + u.title + '</h2>' +
        (u.lede ? '<p class="lede">' + u.lede + '</p>' : '') +
        (u.prereq ? L.note('warn', 'לפני היחידה', u.prereq) : '') +
        (u.goals && u.goals.length ? '<div class="unit-goals"><p class="g-t">בסוף היחידה תדעו</p><ul>' + u.goals.map(g => '<li>' + g + '</li>').join('') + '</ul></div>' : '') +
      '</header>' +
      '<div class="unit-body" id="unit-body"></div>' +
      (u.check ? '<div id="unit-check"></div>' : '') +
      '<footer class="unit-foot">' +
        '<div class="done-row"><button type="button" class="btn ghost" id="done-btn"></button></div>' +
        (prev ? '<a class="nav-card prev" href="#' + prev + '"><span class="nc-dir">→ היחידה הקודמת · ' + num(prev) + '</span><span class="nc-t">' + L.UNITS[prev].title + '</span></a>' : '<span></span>') +
        (next ? '<a class="nav-card next" href="#' + next + '" id="next-card"><span class="nc-dir">היחידה הבאה · ' + num(next) + ' ←</span><span class="nc-t">' + L.UNITS[next].title + '</span></a>'
              : '<a class="nav-card next" href="#home" id="next-card"><span class="nc-dir">סיום ←</span><span class="nc-t">חזרה לתוכן העניינים</span></a>') +
      '</footer>';

    const body = L.$('#unit-body');
    try { u.build(body); }
    catch (err) {
      console.error('unit ' + id, err);
      body.innerHTML = L.note('bad', 'שגיאה בטעינת היחידה', 'משהו השתבש בבניית היחידה. רעננו את הדף; אם זה חוזר, דווחו למרצה ונסו יחידה אחרת בינתיים.');
    }
    if (u.check) L.quiz(L.$('#unit-check'), u.check, { id: id, title: 'בדקו את עצמכם' });

    const doneBtn = L.$('#done-btn');
    const paintDone = () => {
      const d = P.isDone(id);
      doneBtn.textContent = d ? '✓ היחידה סומנה כהושלמה · ביטול הסימון' : 'סימון היחידה כהושלמה';
      doneBtn.classList.toggle('accent', !d);
      doneBtn.classList.toggle('ghost', d);
    };
    doneBtn.addEventListener('click', () => { P.setDone(id, !P.isDone(id)); paintDone(); drawSide(id); drawTopProgress(); });
    L.$('#next-card').addEventListener('click', () => { P.setDone(id, true); });
    paintDone();
    document.title = num(id) + ' ' + u.title.replace(/<[^>]+>/g, '') + ' · לומדת מחרוזות ב-C';
  }

  /* ── router ── */
  function route() {
    L.runLeave();
    const h = decodeURIComponent((location.hash || '').slice(1));
    const id = L.UNITS[h] && ORDER.indexOf(h) >= 0 ? h : 'home';
    closeMenu();
    if (id === 'home') { document.title = 'לומדת מחרוזות ב-C'; renderHome(); }
    else renderUnit(id);
    drawSide(id);
    drawTopProgress();
    window.scrollTo(0, 0);
    if (h) main.focus({ preventScroll: true });
  }

  /* ── mobile drawer ── */
  function openMenu() { side.classList.add('open'); scrim.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); const a = side.querySelector('[aria-current]') || side.querySelector('a'); if (a) a.focus(); }
  function closeMenu() { side.classList.remove('open'); scrim.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', () => side.classList.contains('open') ? closeMenu() : openMenu());
  scrim.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && side.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });

  window.addEventListener('hashchange', route);
  route();
})();
