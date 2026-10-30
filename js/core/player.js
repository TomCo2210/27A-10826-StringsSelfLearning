/* ════════════════════════════════════════════════════════════
   player.js — נגן צעד-אחר-צעד
   L.player(host, { code:[...], frames:[...], out:true, label })
   כל frame:  { line, stage, note, out, outHtml }
     line   השורה המודגשת בקוד (מ-0), או מערך שורות
     stage  HTML של מצב הזיכרון (בדרך כלל L.mem(...))
     note   הסבר לצעד
     out    הפלט עד עכשיו (טקסט)   /  outHtml — פלט כ-HTML
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = window.Lomda;

  L.player = function (host, cfg) {
    const frames = cfg.frames;
    const showOut = cfg.out !== false;
    let i = 0, timer = null;

    /* כל נגן בונה לעצמו עטיפה חדשה, כדי שמאזינים לא יצטברו כשמציירים מחדש באותו מקום */
    host.innerHTML = '';
    const root = document.createElement('div');
    root.className = 'player';
    host.appendChild(root);
    root.innerHTML =
      '<div class="pl-code"></div>' +
      '<div class="pl-stage"></div>' +
      '<div class="pl-note" aria-live="polite"></div>' +
      (showOut ? '<div class="pl-out out"></div>' : '') +
      '<div class="pl-bar"><i></i></div>' +
      '<div class="pl-ctrl">' +
        '<button type="button" class="btn" data-a="play">הרצה ▸</button>' +
        '<button type="button" class="btn ghost" data-a="step">צעד</button>' +
        '<button type="button" class="btn ghost" data-a="back">אחורה</button>' +
        '<button type="button" class="btn ghost" data-a="reset">מההתחלה</button>' +
        '<span class="pl-pos"></span>' +
      '</div>';
    const q = s => root.querySelector(s);

    function draw() {
      const f = frames[i];
      q('.pl-code').innerHTML = L.code(cfg.code, { hi: f.line, label: cfg.label });
      q('.pl-stage').innerHTML = f.stage || '';
      q('.pl-note').innerHTML = f.note || '';
      if (showOut) {
        const o = q('.pl-out');
        if (f.outHtml !== undefined) o.innerHTML = f.outHtml;
        else if (f.out) o.innerHTML = L.outText(f.out);
        else o.innerHTML = '<span class="dim" dir="rtl">(אין פלט עדיין)</span>';
      }
      q('.pl-pos').textContent = (i + 1) + ' / ' + frames.length;
      q('.pl-bar i').style.width = (frames.length > 1 ? (i / (frames.length - 1)) * 100 : 100) + '%';
      q('[data-a=back]').disabled = i === 0;
      q('[data-a=step]').disabled = i >= frames.length - 1;
    }
    function stop() {
      clearInterval(timer); timer = null;
      const p = q('[data-a=play]'); if (p) { p.textContent = 'הרצה ▸'; p.classList.remove('on'); }
    }
    root.addEventListener('click', e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      const act = a.dataset.a;
      if (act === 'step') { stop(); if (i < frames.length - 1) i++; draw(); }
      if (act === 'back') { stop(); if (i > 0) i--; draw(); }
      if (act === 'reset') { stop(); i = 0; draw(); }
      if (act === 'play') {
        if (timer) { stop(); return; }
        if (i >= frames.length - 1) i = 0;
        a.textContent = 'עצירה ■'; a.classList.add('on');
        timer = setInterval(() => { if (i < frames.length - 1) { i++; draw(); } else stop(); }, cfg.speed || 750);
      }
    });
    L.localLeave(root, stop);
    draw();
    return { stop, go: n => { stop(); i = Math.max(0, Math.min(frames.length - 1, n)); draw(); } };
  };
})();
