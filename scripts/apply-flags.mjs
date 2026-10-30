#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════
   apply-flags.mjs — בונה את האתר לתיקייה _site ומחיל את הדגלים
   רץ ב-GitHub Actions לפני הפריסה ל-Pages.

   קורא ממשתני הסביבה (שמגיעים מה-Secrets של הריפו):
     INCLUDE_STRTOK, INCLUDE_CTYPE, INCLUDE_SPRINTF_SSCANF, INCLUDE_PRACTICE
   ערכים מותרים: true / false (גם True, FALSE, 1, 0, yes, no).
   משתנה ריק או חסר = משאירים את ברירת המחדל שב-js/config.js.

   הרצה מקומית לבדיקה:
     INCLUDE_CTYPE=false node scripts/apply-flags.mjs && open _site/index.html
   ════════════════════════════════════════════════════════════ */
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const FLAGS = ['STRTOK', 'CTYPE', 'SPRINTF_SSCANF', 'PRACTICE'];
const OUT = '_site';

function parse(name, raw) {
  if (raw === undefined || raw.trim() === '') return null;
  const v = raw.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(v)) return true;
  if (['false', '0', 'no', 'off'].includes(v)) return false;
  console.error(`::error::INCLUDE_${name} = "${raw}" — הערך חייב להיות true או false`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const p of ['index.html', 'css', 'js']) cpSync(p, `${OUT}/${p}`, { recursive: true });

const cfgPath = `${OUT}/js/config.js`;
let cfg = readFileSync(cfgPath, 'utf8');
const rows = [];

for (const flag of FLAGS) {
  const re = new RegExp(`(\\b${flag}:\\s*)(true|false)`);
  const m = cfg.match(re);
  if (!m) { console.error(`::error::הדגל ${flag} לא נמצא בבלוק include של js/config.js`); process.exit(1); }
  const fromEnv = parse(flag, process.env[`INCLUDE_${flag}`]);
  const value = fromEnv === null ? m[2] === 'true' : fromEnv;
  cfg = cfg.replace(re, `$1${value}`);
  rows.push({ flag, value, source: fromEnv === null ? 'ברירת מחדל (config.js)' : 'Secret' });
}
writeFileSync(cfgPath, cfg);

console.table(rows);
if (process.env.GITHUB_STEP_SUMMARY) {
  const md = ['### פרקים בלומדה', '', '| Secret | כלול | מקור |', '|---|---|---|',
    ...rows.map(r => `| \`INCLUDE_${r.flag}\` | ${r.value ? '✅ true' : '❌ false'} | ${r.source} |`), ''].join('\n');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
