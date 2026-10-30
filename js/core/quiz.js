/* ════════════════════════════════════════════════════════════
   quiz.js — שאלות אמריקאיות ו"מצא את הבאג"
   L.quiz(host, questions, { id, title })
     question: { q, code?, opts:[...], a, why }   (a = אינדקס התשובה הנכונה)
   L.bugHunt(host, items, { id })
     item: { title, code:[...], bug: n | [n,...], why, fix?:[...] }
   התשובות נשמרות, כך שחזרה ליחידה מציגה מה כבר נענה.
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = window.Lomda;
  const P = () => L.progress;
  const RIGHT = ['נכון.', 'בדיוק.', 'נכון מאוד.', 'יפה.'];
  const WRONG = ['לא בדיוק.', 'לא.', 'כמעט.', 'לא הפעם.'];

  L.quiz = function (host, qs, o) {
    o = o || {};
    const key = i => 'q:' + o.id + ':' + i;

    function render() {
      host.innerHTML =
        '<div class="quiz">' +
        '<div class="quiz-h"><span class="qt">' + (o.title || 'בדקו את עצמכם') + '</span><span class="qs"></span></div>' +
        qs.map((q, i) =>
          '<div class="q" data-i="' + i + '">' +
          '<p class="q-stem"><span class="qn">' + String(i + 1).padStart(2, '0') + '</span>' + q.q + '</p>' +
          (q.code ? L.code(q.code) : '') +
          '<div class="q-opts">' + q.opts.map((t, j) => '<button type="button" class="q-opt" data-j="' + j + '">' + t + '</button>').join('') + '</div>' +
          '<div class="q-why" hidden></div></div>').join('') +
        '<div class="quiz-foot"><button type="button" class="btn ghost small" data-act="reset">איפוס השאלות</button></div>' +
        '</div>';
      qs.forEach((q, i) => { const a = P().answer(key(i)); if (a !== null) lock(i, a); });
      score();
    }
    function lock(i, j) {
      const q = qs[i];
      const box = host.querySelector('.q[data-i="' + i + '"]');
      L.$$('.q-opt', box).forEach((b, k) => {
        b.disabled = true;
        if (k === q.a) b.classList.add('right');
        else if (k === j) b.classList.add('wrong');
      });
      const ok = j === q.a;
      const why = box.querySelector('.q-why');
      why.hidden = false;
      why.innerHTML = '<span class="verdict ' + (ok ? 'r' : 'w') + '">' + (ok ? RIGHT[i % RIGHT.length] : WRONG[i % WRONG.length]) + '</span>' + q.why;
    }
    function score() {
      let n = 0, r = 0;
      qs.forEach((q, i) => { const a = P().answer(key(i)); if (a !== null) { n++; if (a === q.a) r++; } });
      host.querySelector('.qs').textContent = n === 0 ? qs.length + ' שאלות' : 'נענו ' + n + ' מתוך ' + qs.length + ' · ' + r + ' נכונות';
    }
    host.addEventListener('click', e => {
      const b = e.target.closest('.q-opt');
      if (b && !b.disabled) {
        const i = +b.closest('.q').dataset.i, j = +b.dataset.j;
        P().setAnswer(key(i), j); lock(i, j); score(); return;
      }
      if (e.target.closest('[data-act=reset]')) { P().clearAnswers('q:' + o.id + ':'); render(); }
    });
    render();
  };

  L.bugHunt = function (host, items, o) {
    o = o || {};
    const key = i => 'b:' + o.id + ':' + i;
    const bugsOf = it => new Set(Array.isArray(it.bug) ? it.bug : [it.bug]);

    function render() {
      host.innerHTML = items.map((it, i) =>
        '<div class="bug" data-i="' + i + '">' +
        '<div class="bug-h"><span class="bn">' + String(i + 1).padStart(2, '0') + '</span><span class="bt">' + it.title + '</span><span class="bs"></span></div>' +
        '<p class="hint">' + (it.prompt || 'לחצו על השורה שבה נמצא הבאג.') + '</p>' +
        '<div class="bug-code">' + L.code(it.code) + '</div>' +
        '<div class="bug-why" hidden></div></div>').join('') +
        '<div class="quiz-foot"><button type="button" class="btn ghost small" data-act="reset">איפוס</button><span class="muted bh-score"></span></div>';
      L.$$('.bug', host).forEach(box => L.$$('.ln', box).forEach(l => { l.classList.add('pick'); l.tabIndex = 0; l.setAttribute('role', 'button'); }));
      items.forEach((it, i) => { const a = P().answer(key(i)); if (a !== null) lock(i, a); });
      score();
    }
    function lock(i, ln) {
      const it = items[i], bugs = bugsOf(it);
      const box = host.querySelector('.bug[data-i="' + i + '"]');
      L.$$('.ln', box).forEach(l => {
        l.classList.remove('pick'); l.removeAttribute('tabindex'); l.removeAttribute('role');
        const n = +l.dataset.ln;
        if (bugs.has(n)) l.classList.add('right');
        else if (n === ln) l.classList.add('wrong');
      });
      const ok = bugs.has(ln);
      const bs = box.querySelector('.bs');
      bs.className = 'bs ' + (ok ? 'r' : 'w');
      bs.textContent = ok ? 'מצאתם' : 'הבאג בשורה המסומנת בירוק';
      const w = box.querySelector('.bug-why');
      w.hidden = false;
      w.innerHTML = L.note(ok ? 'ok' : 'warn', ok ? 'נכון' : 'הסבר', it.why) +
        (it.fix ? L.code(it.fix, { label: 'גרסה מתוקנת', hi: it.fixHi }) : '');
    }
    function score() {
      let n = 0, r = 0;
      items.forEach((it, i) => { const a = P().answer(key(i)); if (a !== null) { n++; if (bugsOf(it).has(a)) r++; } });
      const el = host.querySelector('.bh-score');
      if (el) el.textContent = n ? 'נמצאו ' + r + ' מתוך ' + items.length : '';
    }
    function pick(l) {
      const box = l.closest('.bug'); const i = +box.dataset.i;
      if (P().answer(key(i)) !== null) return;
      const ln = +l.dataset.ln;
      P().setAnswer(key(i), ln); lock(i, ln); score();
    }
    host.addEventListener('click', e => {
      const l = e.target.closest('.ln.pick'); if (l) { pick(l); return; }
      if (e.target.closest('[data-act=reset]')) { P().clearAnswers('b:' + o.id + ':'); render(); }
    });
    host.addEventListener('keydown', e => {
      const l = e.target.closest('.ln.pick');
      if (l && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(l); }
    });
    render();
  };
})();
