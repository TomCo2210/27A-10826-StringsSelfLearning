/* ════════════════════════════════════════════════════════════
   progress.js — שמירת ההתקדמות בדפדפן של הסטודנט
   localStorage בלבד: לא נשלח לשום מקום, ולא עובר בין מחשבים.
   כל גישה עטופה ב-try/catch — בחלון פרטי הלומדה עובדת גם בלי שמירה.
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const L = window.Lomda;
  const KEY = (L.config && L.config.storageKey) || 'lomda-strings';

  function load() {
    try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') return s; }
    catch (e) { /* storage blocked */ }
    return {};
  }
  let st = load();
  st.done = st.done || {};
  st.answers = st.answers || {};

  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ignore */ } }

  L.progress = {
    isDone: id => !!st.done[id],
    setDone(id, v) { if (v) st.done[id] = 1; else delete st.done[id]; save(); },
    doneCount: ids => ids.filter(id => st.done[id]).length,
    last: () => st.last || null,
    setLast(id) { st.last = id; save(); },
    answer: key => (key in st.answers ? st.answers[key] : null),
    setAnswer(key, v) { if (v === null) delete st.answers[key]; else st.answers[key] = v; save(); },
    clearAnswers(prefix) { Object.keys(st.answers).forEach(k => { if (k.indexOf(prefix) === 0) delete st.answers[k]; }); save(); },
    reset() { st = { done: {}, answers: {} }; save(); }
  };
})();
