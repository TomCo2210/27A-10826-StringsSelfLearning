/* יחידה 14 — חידון מסכם */
(function () {
  'use strict';
  const L = window.Lomda;

  const Q = [
    { q: 'מה <code>sizeof(s)</code>?', code: ['char s[] = "C";'], opts: ['1', '2', '4', '8'], a: 1,
      why: 'תו אחד ועוד <code>\'\\0\'</code>.' },
    { q: 'האם <code>s</code> היא מחרוזת?', code: ['char s[4] = "abcd";'],
      opts: ['כן', 'לא: יש בה 4 תווים ואין מקום ל-\'\\0\'', 'זו שגיאת קומפילציה', 'כן, הקומפיילר מגדיל את המערך'], a: 1,
      why: 'ב-C זה חוקי, והתוצאה מערך של 4 תווים בלי סימן סוף. (ב-C++ זו שגיאה.)' },
    { q: 'מה יודפס?', code: ["printf(\"%d\", '9' - '0' + 1);"], opts: ['10', '58', "':'", '91'], a: 0,
      why: "<code>'9' - '0'</code> הוא 9, ועוד 1." },
    { q: 'מה יודפס?', code: ['char s[] = "abc";', "s[1] = '\\0';", 'printf("%s %d", s, (int)strlen(s));'],
      opts: [L.ic('abc 3'), L.ic('ac 2'), L.ic('a 1'), L.ic('a 3')], a: 2, why: 'המחרוזת נגמרת עכשיו בתא 1.' },
    { q: 'המשתמש מקליד <code>Hello World</code> ולוחץ Enter. מה יודפס?', code: ['char s[20];', 'scanf("%19s", s);', 'printf("[%s]", s);'],
      opts: [L.ic('[Hello World]'), L.ic('[Hello]'), L.ic('[World]'), L.ic('[Hello World\\n]')], a: 1, why: '<code>%s</code> עוצר ברווח.' },
    { q: 'המשתמש מקליד <code>abcdefg</code> ולוחץ Enter. מה יהיה ב-<code>s</code>?', code: ['char s[5];', 'fgets(s, sizeof(s), stdin);'],
      opts: [L.ic('"abcde"'), L.ic('"abcd"'), L.ic('"abcdefg\\n"'), L.ic('"abcd\\n"')], a: 1,
      why: '<code>fgets</code> קוראת לכל היותר 4 תווים (גודל פחות 1) ומוסיפה <code>\'\\0\'</code>. השאר נשאר בתור.' },
    { q: 'מה הסימן של <code>strcmp("abc", "ABC")</code>?', opts: ['שלילי', '0', 'חיובי', 'תלוי בקומפיילר'], a: 2,
      why: "<code>'a'</code> (97) גדול מ-<code>'A'</code> (65). ההשוואה מבחינה בין אותיות גדולות לקטנות." },
    { q: 'מה יודפס?', code: ['char a[10] = "12", b[10] = "34";', 'strcat(b, a);', 'printf("%s", b);'],
      opts: [L.ic('1234'), L.ic('3412'), L.ic('46'), L.ic('34')], a: 1, why: '<code>a</code> נוסף לסוף של <code>b</code>. אלה מחרוזות, לא מספרים.' },
    { q: 'האם הקוד תקין?', code: ['char d[3];', 'strcpy(d, "ab");'],
      opts: ['כן, בדיוק נכנס', 'לא, צריך d[2]', 'לא, צריך d[4]', 'לא, strcpy לא עובדת עם מחרוזת קבועה'], a: 0, why: 'שני תווים ועוד <code>\'\\0\'</code>: 3 בתים.' },
    { topic: 'SPRINTF_SSCANF', q: 'מה תחזיר הקריאה?', code: ['int x, y;', 'int r = sscanf("7,8", "%d %d", &x, &y);'], opts: ['2', '1', '0', '-1'], a: 1,
      why: 'ההמרה הראשונה קוראת 7. הפסיק אינו רווח ואינו ספרה, ולכן ההמרה השנייה נכשלת. הפורמט הנכון כאן: <code>"%d,%d"</code>.' },
    { topic: 'STRTOK', q: 'כמה פעמים ירוץ גוף הלולאה?', code: ['char s[] = ",a,,b,";', 'char *w = strtok(s, ",");', 'while (w != NULL)', '{', '    puts(w);', '    w = strtok(NULL, ",");', '}'],
      opts: ['2', '3', '4', '5'], a: 0, why: '<code>strtok</code> מדלגת על מפרידים בהתחלה, בסוף ורצופים. יש שתי מילים: <code>a</code> ו-<code>b</code>.' },
    { topic: 'STRTOK', q: 'על איזו מההגדרות מותר להפעיל <code>strtok</code>?',
      opts: [L.ic('char s[] = "a b c";'), L.ic('char *s = "a b c";'), L.ic('const char *s = "a b c";'), 'על כולן'], a: 0,
      why: '<code>strtok</code> כותבת לתוך המחרוזת. רק המערך ניתן לכתיבה.' },
    { q: 'פונקציה צריכה לבנות מחרוזת חדשה ולתת אותה לקורא. מה החתימה המקובלת?',
      opts: [L.ic('char[] build(int n)'), L.ic('void build(char out[], int n)'), L.ic('char build(int n)'), L.ic('void build(int n, char out)')], a: 1,
      why: 'הקורא מקצה את המערך ומעביר אותו. הפונקציה כותבת לתוכו.' },
    { topic: 'CTYPE', q: 'מה מחזירה <code>isupper(\'a\')</code>?', opts: ['0', '1', "'A'", '-1'], a: 0, why: "<code>'a'</code> אינה אות גדולה. את ההמרה עושה <code>toupper</code>." }
  ];

  L.unit({
    id: 'quiz',
    title: 'חידון מסכם',
    blurb: L.keep(Q).length + ' שאלות מכל הלומדה',
    minutes: 15,
    lede: 'שאלות מכל היחידות, בלי להריץ קוד. ההסבר נפתח אחרי כל תשובה. כדאי לקרוא אותו גם כשצדקתם.',
    build(host) {
      host.innerHTML = '<div id="qz"></div>';
      L.quiz(host.querySelector('#qz'), L.keep(Q), { id: 'final', title: 'חידון מסכם' });
    }
  });
})();
