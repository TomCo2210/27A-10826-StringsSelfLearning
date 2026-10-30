/* יחידה 15 — תרגילי כתיבה
   הקובץ נוצר מתוך פתרונות שעברו קומפילציה ובדיקות (gcc -std=c99 -Wall -Wextra -pedantic).
   הצגת הפתרונות נשלטת ב-config.js: showSolutions. */
(function () {
  'use strict';
  const L = window.Lomda;
  const EX = [
  {
    "id": "countWords",
    "sig": "int countWords(const char s[]);",
    "desc": "מחזירה את מספר המילים במחרוזת. בין מילים יש רווח אחד או יותר, וייתכנו רווחים בהתחלה ובסוף.",
    "ex": [
      [
        "\"hello world\"",
        "2"
      ],
      [
        "\"  one   two  three \"",
        "3"
      ],
      [
        "\"\"",
        "0"
      ],
      [
        "\"    \"",
        "0"
      ]
    ],
    "hints": [
      "ספירת רווחים לא עובדת: יש רווחים כפולים, ורווחים בקצוות. סִפרו במקום זה <b>התחלות של מילים</b>: תו שאינו רווח, שלפניו רווח או תחילת המחרוזת.",
      "החזיקו משתנה דגל <code>inWord</code> שאומר \"אני כרגע בתוך מילה\". הוא נכבה בכל רווח. כשפוגשים תו שאינו רווח והדגל כבוי, זו מילה חדשה."
    ],
    "mistake": "לספור רווחים ולהוסיף 1. זה נכון רק כשיש בדיוק רווח אחד בין מילים ואין רווחים בקצוות.",
    "sol": [
      "int countWords(const char s[])",
      "{",
      "    int i, count = 0, inWord = 0;",
      "    for (i = 0; s[i] != '\\0'; i++)",
      "    {",
      "        if (s[i] == ' ')",
      "            inWord = 0;",
      "        else if (!inWord)",
      "        {",
      "            inWord = 1;",
      "            count++;",
      "        }",
      "    }",
      "    return count;",
      "}"
    ]
  },
  {
    "id": "isPalindrome",
    "sig": "int isPalindrome(const char s[]);",
    "desc": "מחזירה 1 אם המחרוזת זהה כשקוראים אותה משני הכיוונים, ו-0 אחרת. ההשוואה מדויקת (אות גדולה שונה מקטנה).",
    "ex": [
      [
        "\"abba\"",
        "1"
      ],
      [
        "\"racecar\"",
        "1"
      ],
      [
        "\"abca\"",
        "0"
      ],
      [
        "\"a\"",
        "1"
      ],
      [
        "\"\"",
        "1"
      ]
    ],
    "hints": [
      "שני אינדקסים: <code>i</code> מההתחלה ו-<code>j</code> מהסוף. מה האינדקס של התו האחרון? (לא <code>strlen(s)</code>: שם יושב <code>'\\0'</code>.)",
      "מתקדמים פנימה כל עוד <code>i &lt; j</code>. ברגע שיש הבדל אפשר להחזיר 0 מיד. אם הלולאה הסתיימה, זה פלינדרום."
    ],
    "mistake": "להתחיל את <code>j</code> מ-<code>strlen(s)</code> ולהשוות את התו הראשון ל-<code>'\\0'</code>.",
    "sol": [
      "int isPalindrome(const char s[])",
      "{",
      "    int i = 0, j = (int)strlen(s) - 1;",
      "    while (i < j)",
      "    {",
      "        if (s[i] != s[j])",
      "            return 0;",
      "        i++;",
      "        j--;",
      "    }",
      "    return 1;",
      "}"
    ]
  },
  {
    "id": "reverse",
    "sig": "void reverse(char s[]);",
    "desc": "הופכת את סדר התווים במחרוזת, במקום, בלי מערך עזר.",
    "ex": [
      [
        "\"hello\"",
        "\"olleh\""
      ],
      [
        "\"abcd\"",
        "\"dcba\""
      ],
      [
        "\"\"",
        "\"\""
      ]
    ],
    "hints": [
      "אותם שני אינדקסים כמו בפלינדרום. במקום להשוות, מחליפים בין <code>s[i]</code> ל-<code>s[j]</code> דרך משתנה <code>temp</code>.",
      "עוצרים כש-<code>i</code> ו-<code>j</code> נפגשים. אם תמשיכו עד הסוף, כל זוג יוחלף פעמיים והמחרוזת תחזור למצבה המקורי."
    ],
    "mistake": "לולאה שרצה על כל המחרוזת במקום רק עד האמצע.",
    "sol": [
      "void reverse(char s[])",
      "{",
      "    int i = 0, j = (int)strlen(s) - 1;",
      "    char temp;",
      "    while (i < j)",
      "    {",
      "        temp = s[i];",
      "        s[i] = s[j];",
      "        s[j] = temp;",
      "        i++;",
      "        j--;",
      "    }",
      "}"
    ]
  },
  {
    "id": "removeChar",
    "sig": "void removeChar(char s[], char ch);",
    "desc": "מוחקת מהמחרוזת את כל המופעים של התו <code>ch</code>, במקום, בלי מערך עזר.",
    "ex": [
      [
        "\"banana\", 'a'",
        "\"bnn\""
      ],
      [
        "\"aaa\", 'a'",
        "\"\""
      ],
      [
        "\"hello\", 'z'",
        "\"hello\""
      ]
    ],
    "hints": [
      "שני אינדקסים על אותו מערך: <code>read</code> עובר על כל התווים, ו-<code>write</code> מסמן לאן לכתוב את התו הבא שנשאר. <code>write</code> אף פעם לא עוקף את <code>read</code>, ולכן לא נדרס תו שעוד לא נקרא.",
      "מעתיקים רק תווים ששונים מ-<code>ch</code>. בסוף, המחרוזת קצרה יותר, ולכן חייבים לכתוב <code>'\\0'</code> במקום החדש שלה."
    ],
    "mistake": "לשכוח את <code>s[write] = '\\0'</code>. בלי זה נשארים בסוף שרידים מהמחרוזת הארוכה.",
    "sol": [
      "void removeChar(char s[], char ch)",
      "{",
      "    int read, write = 0;",
      "    for (read = 0; s[read] != '\\0'; read++)",
      "    {",
      "        if (s[read] != ch)",
      "        {",
      "            s[write] = s[read];",
      "            write++;",
      "        }",
      "    }",
      "    s[write] = '\\0';",
      "}"
    ]
  },
  {
    "id": "capitalizeWords",
    "sig": "void capitalizeWords(char s[]);",
    "desc": "משנה את המחרוזת כך שהאות הראשונה בכל מילה תהיה גדולה, וכל שאר האותיות קטנות.",
    "ex": [
      [
        "\"hELLO wORLD\"",
        "\"Hello World\""
      ],
      [
        "\" c is  FUN\"",
        "\" C Is  Fun\""
      ]
    ],
    "hints": [
      "תו הוא תחילת מילה אם הוא התו הראשון במחרוזת, או שהתו שלפניו הוא רווח.",
      "<code>toupper</code> ו-<code>tolower</code> לא משנות תווים שאינם אותיות, ולכן אפשר להפעיל אותן על כל תו בלי לבדוק. אבל צריך לשמור את מה שהן מחזירות."
    ],
    "mistake": "לבדוק <code>s[i - 1]</code> כש-<code>i</code> הוא 0: קריאה מחוץ למערך. הבדיקה <code>i == 0</code> חייבת לבוא קודם.",
    "sol": [
      "void capitalizeWords(char s[])",
      "{",
      "    int i;",
      "    for (i = 0; s[i] != '\\0'; i++)",
      "    {",
      "        if (i == 0 || s[i - 1] == ' ')",
      "            s[i] = toupper(s[i]);",
      "        else",
      "            s[i] = tolower(s[i]);",
      "    }",
      "}"
    ]
  },
  {
    "id": "longestWord",
    "sig": "int longestWord(const char s[], char out[]);",
    "desc": "מעתיקה ל-<code>out</code> את המילה הארוכה ביותר במחרוזת ומחזירה את אורכה. אם יש כמה באותו אורך, את הראשונה. אם אין מילים, <code>out</code> יהיה מחרוזת ריקה והערך 0.",
    "ex": [
      [
        "\"the quick brown fox\"",
        "5, out = \"quick\""
      ],
      [
        "\"  hi   there  \"",
        "5, out = \"there\""
      ],
      [
        "\"\"",
        "0, out = \"\""
      ]
    ],
    "hints": [
      "לולאה חיצונית שבכל סיבוב מטפלת במילה אחת: מדלגת על רווחים, שומרת את אינדקס ההתחלה, ומתקדמת עד הרווח הבא או <code>'\\0'</code>. האורך הוא ההפרש בין האינדקסים.",
      "אל תעתיקו כל מילה שהיא \"הכי ארוכה עד עכשיו\". שמרו רק את ההתחלה והאורך של הטובה ביותר, והעתיקו פעם אחת בסוף, עם <code>'\\0'</code>."
    ],
    "mistake": "להשתמש ב-<code>&gt;=</code> בהשוואת האורכים: אז נשמרת המילה <b>האחרונה</b> מבין השוות, ולא הראשונה.",
    "sol": [
      "int longestWord(const char s[], char out[])",
      "{",
      "    int i = 0, start, len, best = 0, bestStart = 0;",
      "    while (s[i] != '\\0')",
      "    {",
      "        while (s[i] == ' ')",
      "            i++;",
      "        start = i;",
      "        while (s[i] != ' ' && s[i] != '\\0')",
      "            i++;",
      "        len = i - start;",
      "        if (len > best)",
      "        {",
      "            best = len;",
      "            bestStart = start;",
      "        }",
      "    }",
      "    for (i = 0; i < best; i++)",
      "        out[i] = s[bestStart + i];",
      "    out[best] = '\\0';",
      "    return best;",
      "}"
    ]
  }
];
  const TESTS = ["/* ---------- tests ---------- */", "static int fails = 0;", "#define CHECK(cond, msg) do { if (cond) printf(\"ok    %s\\n\", msg); else { printf(\"FAIL  %s\\n\", msg); fails++; } } while (0)", "", "int main(void)", "{", "    char buf[100];", "", "    CHECK(countWords(\"hello world\") == 2,        \"countWords: two words\");", "    CHECK(countWords(\"  one   two  three \") == 3, \"countWords: extra spaces\");", "    CHECK(countWords(\"\") == 0,                   \"countWords: empty\");", "    CHECK(countWords(\"    \") == 0,               \"countWords: only spaces\");", "", "    CHECK(isPalindrome(\"abba\") == 1,   \"isPalindrome: abba\");", "    CHECK(isPalindrome(\"racecar\") == 1,\"isPalindrome: racecar\");", "    CHECK(isPalindrome(\"abca\") == 0,   \"isPalindrome: abca\");", "    CHECK(isPalindrome(\"a\") == 1,      \"isPalindrome: one char\");", "    CHECK(isPalindrome(\"\") == 1,       \"isPalindrome: empty\");", "", "    strcpy(buf, \"hello\"); reverse(buf); CHECK(strcmp(buf, \"olleh\") == 0, \"reverse: odd length\");", "    strcpy(buf, \"abcd\");  reverse(buf); CHECK(strcmp(buf, \"dcba\") == 0,  \"reverse: even length\");", "    strcpy(buf, \"\");      reverse(buf); CHECK(strcmp(buf, \"\") == 0,      \"reverse: empty\");", "", "    strcpy(buf, \"banana\"); removeChar(buf, 'a'); CHECK(strcmp(buf, \"bnn\") == 0,   \"removeChar: banana a\");", "    strcpy(buf, \"aaa\");    removeChar(buf, 'a'); CHECK(strcmp(buf, \"\") == 0,      \"removeChar: all removed\");", "    strcpy(buf, \"hello\");  removeChar(buf, 'z'); CHECK(strcmp(buf, \"hello\") == 0, \"removeChar: none\");", "", "    strcpy(buf, \"hELLO wORLD\"); capitalizeWords(buf); CHECK(strcmp(buf, \"Hello World\") == 0, \"capitalizeWords: basic\");", "    strcpy(buf, \" c is  FUN\");  capitalizeWords(buf); CHECK(strcmp(buf, \" C Is  Fun\") == 0,  \"capitalizeWords: spaces\");", "", "    CHECK(longestWord(\"the quick brown fox\", buf) == 5 && strcmp(buf, \"quick\") == 0, \"longestWord: first of equals\");", "    CHECK(longestWord(\"  hi   there  \", buf) == 5 && strcmp(buf, \"there\") == 0,      \"longestWord: spaces\");", "    CHECK(longestWord(\"\", buf) == 0 && strcmp(buf, \"\") == 0,                         \"longestWord: empty\");", "    CHECK(longestWord(\"   \", buf) == 0 && strcmp(buf, \"\") == 0,                      \"longestWord: only spaces\");", "", "    printf(fails ? \"\\n%d test(s) failed\\n\" : \"\\nall tests passed\\n\", fails);", "    return fails != 0;", "}"];

  L.unit({
    id: 'practice',
    title: 'תרגילי כתיבה',
    blurb: 'שש פונקציות לכתוב בעצמכם, עם רמזים ובדיקות',
    minutes: 60,
    lede: 'שש פונקציות, מהקלה לקשה. כתבו כל אחת בעצמכם לפני שאתם פותחים רמז. את פונקציות <code>string.h</code> ו-<code>ctype.h</code> מותר להשתמש.',
    goals: ['לכתוב פונקציות על מחרוזות מאפס, כולל מקרי הקצה: מחרוזת ריקה, רווחים כפולים, תו אחד'],

    build(host) {
      const show = !!L.config.showSolutions;
      host.innerHTML =
        L.note('info', 'איך לעבוד', '<ol style="margin:0"><li>קראו את החתימה ואת הדוגמאות, כולל השורה האחרונה: היא בדרך כלל מקרה הקצה.</li><li>כתבו את הפונקציה בסביבת הפיתוח, והריצו אותה עם תוכנית הבדיקה שבסוף העמוד.</li><li>נתקעתם? רמז 1 נותן כיוון, רמז 2 מתאר את הפתרון במילים.' + (show ? ' את הפתרון המלא פתחו רק אחרי שהבדיקות עוברות, כדי להשוות.' : '') + '</li></ol>') +
        EX.map((e, i) =>
          '<h3>' + (i + 1) + ' · <code>' + e.id + '</code></h3>' +
          L.code([e.sig]) +
          '<p>' + e.desc + '</p>' +
          L.table(['קלט', 'תוצאה'], e.ex.map(r => [L.ic(r[0]), L.ic(r[1])])) +
          L.reveal('רמז 1', '<p>' + e.hints[0] + '</p>') +
          L.reveal('רמז 2', '<p>' + e.hints[1] + '</p>') +
          (show ? L.reveal('פתרון', L.code(e.sol) + L.note('warn', 'הטעות הנפוצה כאן', e.mistake), 'solution') : '')
        ).join('') +
        '<h3>תוכנית בדיקה</h3>' +
        '<p>הדביקו את הפונקציות שלכם מעל ה-<code>main</code> הזה (עם <code>#include &lt;stdio.h&gt;</code>, <code>&lt;string.h&gt;</code> ו-<code>&lt;ctype.h&gt;</code>), והריצו. כל שורה מתחילה ב-<code>ok</code> או ב-<code>FAIL</code>. פונקציה שעוד לא כתבתם? מחקו את השורות שלה.</p>' +
        L.code(TESTS);
    }
  });
})();
