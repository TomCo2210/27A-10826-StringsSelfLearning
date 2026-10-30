/* יחידה 13 — מצאו את הבאג */
(function () {
  'use strict';
  const L = window.Lomda;

  const BUGS = [
    { title: 'שם פרטי',
      code: ['char name[5];', 'strcpy(name, "Moshe");', 'printf("Hello %s\\n", name);'],
      bug: [0, 1], why: 'ל-<code>"Moshe"</code> יש 5 אותיות, ו-<code>strcpy</code> כותבת 6 בתים, כולל <code>\'\\0\'</code>. המערך צריך להיות לפחות בגודל 6. השורה של <code>strcpy</code> היא זו שגולשת, אבל הטעות היא בהגדרה.',
      fix: ['char name[6];', 'strcpy(name, "Moshe");', 'printf("Hello %s\\n", name);'], fixHi: 0 },
    { title: 'אישור מהמשתמש',
      code: ['char ans[10];', 'scanf("%9s", ans);', 'if (ans == "yes")', '    printf("OK\\n");'],
      bug: 2, why: '<code>==</code> משווה את מקום המערך בזיכרון למקום של המחרוזת <code>"yes"</code>. הם אף פעם לא שווים, ו-<code>OK</code> לא יודפס גם כשהמשתמש הקליד yes.',
      fix: ['if (strcmp(ans, "yes") == 0)', '    printf("OK\\n");'], fixHi: 0 },
    { title: 'פקודת יציאה',
      code: ['char cmd[20];', 'fgets(cmd, sizeof(cmd), stdin);', 'if (strcmp(cmd, "quit") == 0)', '    return 0;'],
      bug: 1, prompt: 'המשתמש מקליד quit ולוחץ Enter, והתוכנית לא יוצאת. לחצו על השורה שגורמת לזה.',
      why: '<code>fgets</code> משאירה את <code>\'\\n\'</code> במחרוזת. ב-<code>cmd</code> יש <code>"quit\\n"</code>, וההשוואה ל-<code>"quit"</code> נכשלת. צריך להוריד את ה-<code>\'\\n\'</code> אחרי הקליטה.',
      fix: ['fgets(cmd, sizeof(cmd), stdin);', 'len = strlen(cmd);', "if (len > 0 && cmd[len - 1] == '\\n')", "    cmd[len - 1] = '\\0';", 'if (strcmp(cmd, "quit") == 0)', '    return 0;'], fixHi: [1, 2, 3] },
    { title: 'מספר ואז שם',
      code: ['int id;', 'char name[30];', 'scanf("%d", &id);', 'fgets(name, sizeof(name), stdin);'],
      bug: 3, prompt: 'השם תמיד יוצא ריק. איפה?',
      why: 'אחרי <code>scanf("%d")</code> נשאר <code>\'\\n\'</code> בתור, ו-<code>fgets</code> קוראת אותו מיד. צריך לנקות את שארית השורה בין השתיים (ראו ' + L.ref('input') + ').',
      fix: ['scanf("%d", &id);', "while ((ch = getchar()) != '\\n' && ch != EOF)", '    ;', 'fgets(name, sizeof(name), stdin);'], fixHi: [1, 2] },
    { title: 'העתקה לאותיות גדולות', topic: 'CTYPE',
      code: ['void copyUpper(char dest[], const char src[])', '{', '    int i;', "    for (i = 0; src[i] != '\\0'; i++)", '        dest[i] = toupper(src[i]);', '}'],
      bug: 5, prompt: 'משהו חסר. לחצו על השורה שלפניה הוא צריך להיות.',
      why: 'הלולאה עוצרת <b>לפני</b> <code>\'\\0\'</code> ולא מעתיקה אותו. <code>dest</code> מקבל את כל האותיות, אבל אין בו סימן סוף, ולכן הוא לא מחרוזת.',
      fix: ['    for (i = 0; src[i] != \'\\0\'; i++)', '        dest[i] = toupper(src[i]);', "    dest[i] = '\\0';", '}'], fixHi: 2 },
    { title: 'שם מלא',
      code: ['char full[12];', 'strcpy(full, "Avigail");', 'strcat(full, " ");', 'strcat(full, "Ben-David");'],
      bug: [0, 3], why: 'אחרי שתי השורות הראשונות יש ב-<code>full</code> 8 תווים. הוספה של 9 תווים נותנת 17, ועוד <code>\'\\0\'</code>: 18 בתים במערך של 12. צריך מערך גדול יותר, או לבדוק לפני השרשור.',
      fix: ['char full[30];', '/* ... */', 'if (strlen(full) + strlen(last) + 1 <= sizeof(full))', '    strcat(full, last);'], fixHi: [0, 2] },
    { title: 'המרה לאותיות קטנות', topic: 'CTYPE',
      code: ["for (i = 0; s[i] != '\\0'; i++)", '    tolower(s[i]);'],
      bug: 1, why: '<code>tolower</code> מחזירה את התו החדש, ולא משנה את מה שקיבלה. התוצאה נזרקת, והמחרוזת לא משתנה.',
      fix: ["for (i = 0; s[i] != '\\0'; i++)", '    s[i] = tolower(s[i]);'], fixHi: 1 },
    { title: 'ספירת a',
      code: ['int i, count = 0;', "for (i = 0; s[i] != '\\0'; i++)", "    if (s[i] = 'a')", '        count++;'],
      bug: 2, why: '<code>=</code> במקום <code>==</code>. התנאי <b>מציב</b> <code>\'a\'</code> לכל תא, וערך ההשמה (97) תמיד "אמת". התוצאה: כל המחרוזת הופכת ל-<code>aaa…</code>, ו-<code>count</code> שווה לאורך.',
      fix: ["    if (s[i] == 'a')"], fixHi: 0 },
    { title: 'הדפסה הפוכה',
      code: ['int i, len = strlen(s);', 'for (i = len; i >= 0; i--)', '    printf("%c", s[i]);'],
      bug: 1, why: 'התו האחרון של המחרוזת נמצא ב-<code>s[len - 1]</code>. ב-<code>s[len]</code> יש <code>\'\\0\'</code>, והלולאה מדפיסה אותו בתחילת הפלט: תו בלתי נראה שיכול לקלקל השוואה של הפלט (למשל בבודק אוטומטי).',
      fix: ['for (i = len - 1; i >= 0; i--)', '    printf("%c", s[i]);'], fixHi: 0 },
    { title: 'פונקציה שמחזירה ברכה',
      code: ['void greet(char dest[], const char name[])', '{', '    dest = "Hello ";', '    strcat(dest, name);', '}'],
      bug: 2, why: 'אי אפשר "להציב" מחרוזת. ההשמה רק משנה את הפרמטר המקומי <code>dest</code> כך שיצביע על מחרוזת קבועה, ו-<code>strcat</code> מנסה לכתוב לתוך מחרוזת קבועה. צריך להעתיק לתוך המערך של הקורא.',
      fix: ['void greet(char dest[], const char name[])', '{', '    strcpy(dest, "Hello ");', '    strcat(dest, name);', '}'], fixHi: 2 }
  ];

  L.unit({
    id: 'bugs',
    title: 'מצאו את הבאג',
    blurb: L.keep(BUGS).length + ' קטעים קצרים, באג אחד בכל אחד',
    minutes: 15,
    lede: 'אלה הבאגים שמופיעים שוב ושוב בתרגילים ובמבחנים. בכל קטע יש באג אחד. לחצו על השורה הבעייתית; אחר כך יופיעו ההסבר והגרסה המתוקנת.',
    goals: ['לזהות במהירות את הבאגים הנפוצים ביותר עם מחרוזות'],
    build(host) {
      host.innerHTML = '<div id="bh"></div>';
      L.bugHunt(host.querySelector('#bh'), L.keep(BUGS), { id: 'bugs' });
    }
  });
})();
