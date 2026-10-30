/* ════════════════════════════════════════════════════════════
   config.js — הגדרות הלומדה
   כאן משנים את פרטי הקורס, את סדר היחידות ואת הצגת הפתרונות.
   אין צורך לגעת בשום קובץ אחר כדי לשנות את הדברים האלה.
   ════════════════════════════════════════════════════════════ */
window.Lomda = window.Lomda || {};

window.Lomda.config = {
  courseNumber: '10826',
  courseName: 'מבוא לתכנות בשפת C',
  institution: 'אפקה — המכללה האקדמית להנדסה בתל אביב',
  lecturer: 'תום כהן',
  year: 'תשפ"ז',

  /* קרדיט: הלומדה מבוססת על לומדה קודמת. מוצג בתחתית דף הבית ובתפריט. */
  basedOn: 'מבוסס על לומדה שנבנתה על ידי אפרת הרצברג-מורג',

  /* ── אילו פרקים לכלול ──
     true = הפרק מופיע בלומדה, false = הוא מוסתר לגמרי (כולל שאלות עליו בחידון ובתרגול).
     המספור של היחידות מתעדכן לבד.
     בפריסה דרך GitHub Pages הערכים נקבעים מה-Secrets של הריפו
     (INCLUDE_STRTOK, INCLUDE_CTYPE, INCLUDE_SPRINTF_SSCANF, INCLUDE_PRACTICE) ודורסים את מה שכתוב כאן.
     בהעלאה ידנית (zip למודל) משנים כאן ישירות. */
  include: {
    STRTOK: true,          // יחידה: פירוק עם strtok
    CTYPE: true,           // יחידה: הספרייה ctype.h
    SPRINTF_SSCANF: true,  // יחידה: sprintf ו-sscanf
    PRACTICE: true         // חלק ה' כולו: מצאו את הבאג, חידון מסכם, תרגילי כתיבה
  },
  /* איזה דגל שולט באילו יחידות */
  flagUnits: {
    STRTOK: ['strtok'],
    CTYPE: ['ctype'],
    SPRINTF_SSCANF: ['format'],
    PRACTICE: ['bugs', 'quiz', 'practice']
  },

  /* הצגת פתרונות מלאים בתרגילי יחידה 15.
     false = רק רמזים (למשל עד מועד ההגשה של תרגיל 3), true = רמזים ופתרונות. */
  showSolutions: true,

  /* מפתח השמירה של ההתקדמות בדפדפן. שינוי שלו מאפס את ההתקדמות לכולם. */
  storageKey: 'lomda-strings-10826:v1',

  /* החלקים והיחידות, לפי הסדר. כל מזהה תואם ל-id באחד מקובצי js/units. */
  parts: [
    { id: 'basics',    title: 'יסודות',            sub: 'מה זו מחרוזת ואיך היא נראית בזיכרון',
      units: ['what', 'chars', 'traverse', 'print'] },
    { id: 'io',        title: 'קלט ופונקציות',     sub: 'קליטה נכונה והעברה לפונקציות',
      units: ['input', 'functions'] },
    { id: 'libs',      title: 'הספריות הסטנדרטיות', sub: 'פונקציות מוכנות לעבודה עם מחרוזות ותווים',
      units: ['string-h', 'strtok', 'ctype', 'format'] },
    { id: 'structure', title: 'מבנים מורכבים',     sub: 'מערך של מחרוזות, ומחרוזות דרך מצביעים',
      units: ['matrix', 'pointers'] },
    { id: 'practice',  title: 'תרגול ובדיקה עצמית', sub: 'באגים, חידון מסכם ותרגילי כתיבה',
      units: ['bugs', 'quiz', 'practice'] }
  ]
};
