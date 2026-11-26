import fs from 'node:fs/promises';
import path from 'node:path';

const year = Number(process.argv[2] || new Date().getUTCFullYear());
if (!Number.isInteger(year) || year < 1900 || year > 2200) throw new Error('Invalid year');
const outDir = path.resolve('src/data/saints-calendar');
await fs.mkdir(outDir, { recursive: true });

async function requestJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Notre-Dame-du-Secours-SaintsCalendar/1.0' } });
  if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + url);
  return response.json();
}
function decodeEntities(value) {
  return value.replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
function htmlToLines(html) {
  return decodeEntities(html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|section|article|tr|td|th)>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[\t\f\v ]+/g, ' ')
    .split(/\r?\n/).map(x => x.trim()).filter(Boolean);
}
function parseMaroniteSynaxarion(html) {
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const monthMap = Object.fromEntries(months.map((m, i) => [m, i + 1]));
  const lines = htmlToLines(html);
  const entries = {};
  let month = 0, day = 0, current = [];
  const save = () => {
    if (month && day && current.length) {
      const key = String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      entries[key] = current.join(' ').replace(/\s+/g, ' ').trim();
    }
  };
  for (const line of lines) {
    const heading = line.toUpperCase().replace(/[^A-Z]/g, '');
    if (monthMap[heading]) { save(); month = monthMap[heading]; day = 0; current = []; continue; }
    const match = line.match(/^\s*Day\s+(\d{1,2})\s*:\s*(.*)$/i);
    if (match && month) {
      save(); day = Number(match[1]); current = [];
      if (match[2].trim()) current.push(match[2].trim());
      continue;
    }
    if (month && day && !/^(Back to Today|Today|Synaxarion)$/i.test(line)) current.push(line);
  }
  save();
  if (Object.keys(entries).length < 300) throw new Error('Maronite Synaxarion parser found only ' + Object.keys(entries).length + ' dated entries');
  return entries;
}
function parseArabicMaroniteIndex(html) {
  const monthPatterns = [
    [/^كانون\s*الثاني$/u, 1], [/^شباط$/u, 2], [/^(آذار|اذار)$/u, 3], [/^نيسان$/u, 4],
    [/^(أيار|ايار)$/u, 5], [/^حزيران$/u, 6], [/^تموز$/u, 7], [/^(آب|اب)$/u, 8],
    [/^(أيلول|ايلول)$/u, 9], [/^تشرين\s*(الأول|الاول)$/u, 10],
    [/^تشرين\s*الثاني$/u, 11], [/^كانون\s*(الأول|الاول)$/u, 12]
  ];
  const lines = htmlToLines(html);
  const entries = {};
  let pending = [], inIndex = false;
  for (const line of lines) {
    if (line.includes('فهرس السنكسار الشمسي')) { inIndex = true; pending = []; continue; }
    if (!inIndex) continue;
    if (/^حرف\s/u.test(line)) { pending = []; continue; }
    const match = line.match(/(أول|اول|[0-9]{1,2})\s*(كانون\s*الثاني|شباط|آذار|اذار|نيسان|أيار|ايار|حزيران|تموز|آب|اب|أيلول|ايلول|تشرين\s*(?:الأول|الاول|الثاني)|كانون\s*(?:الأول|الاول))\s*$/u);
    if (!match) {
      if (line.length > 1 && !/^(أسماء القديسين|تاريخ العيد|الصفحة)$/u.test(line)) pending.push(line);
      continue;
    }
    const day = /^(أول|اول)$/u.test(match[1]) ? 1 : Number(match[1]);
    const monthText = match[2].replace(/\s+/g, ' ').trim();
    const monthIndex = monthPatterns.findIndex(([pattern]) => pattern.test(monthText));
    const month = monthIndex >= 0 ? monthPatterns[monthIndex][1] : 0;
    const namePart = line.slice(0, match.index).trim();
    const name = [...pending, namePart].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    pending = [];
    if (!month || !day || !name) continue;
    const key = String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    if (!entries[key]) entries[key] = [];
    if (!entries[key].includes(name)) entries[key].push(name);
  }
  const count = Object.keys(entries).length;
  if (count < 250) throw new Error('Arabic Maronite index parser found only ' + count + ' dated entries');
  return entries;
}
function toArabicName(name) {
  const mappings = [
    [/Saint Maron/i, 'مار مارون'], [/Saint Sharbel/i, 'مار شربل'], [/Saint Charbel/i, 'مار شربل'],
    [/Saint Rafqa/i, 'القديسة رفقا'], [/Saint Nimatullah[^,;.]*/i, 'القديس نعمة الله الحرديني'],
    [/Saint John Maron/i, 'مار يوحنا مارون'], [/Saint Hardini/i, 'القديس نعمة الله الحرديني'],
    [/Saint Anthony the Great/i, 'القديس أنطونيوس الكبير'], [/Saint Joseph/i, 'القديس يوسف'],
    [/Saint Peter/i, 'القديس بطرس'], [/Saint Paul/i, 'القديس بولس'], [/Saint Mary Magdalene/i, 'القديسة مريم المجدلية'],
    [/Saint George/i, 'القديس جاورجيوس'], [/Saint Francis Xavier/i, 'القديس فرنسيس كسفاريوس'],
    [/Saint Barbara/i, 'القديسة بربارة'], [/Saint Nicholas/i, 'القديس نيقولاوس'],
    [/Saint Stephen/i, 'القديس اسطفانوس'], [/Saint John the Baptist/i, 'القديس يوحنا المعمدان'],
    [/Saint Agnes/i, 'القديسة أغنيس'], [/Saint Sebastian/i, 'القديس سبسطيا'],
    [/Saint Basil/i, 'القديس باسيليوس'], [/Saint Gregory/i, 'القديس غريغوريوس']
  ];
  for (const [pattern, value] of mappings) if (pattern.test(name)) return value;
  return name;
}

const catholic = {};
for (const locale of ['en', 'fr', 'it']) {
  const data = await requestJson('https://litcal.johnromanodorazio.com/api/v5/calendar/' + year + '?locale=' + locale + '&year_type=CIVIL');
  if (!Array.isArray(data && data.litcal)) throw new Error('Invalid Roman calendar payload for ' + locale);
  catholic[locale] = data.litcal.map(event => ({
    month: Number(event.month), day: Number(event.day),
    name: event.name || event.event_key || '',
    rank: event.grade_display || event.grade_lcl || event.grade_abbr || ''
  })).filter(event => event.month && event.day && event.name);
}

const maroniteUrl = 'https://www.maronite-heritage.com/LNE.php?page=Synaxarion';
const maroniteResponse = await fetch(maroniteUrl, { headers: { 'User-Agent': 'Notre-Dame-du-Secours-SaintsCalendar/1.0' } });
if (!maroniteResponse.ok) throw new Error('Maronite Synaxarion source returned HTTP ' + maroniteResponse.status);
const maroniteEn = parseMaroniteSynaxarion(await maroniteResponse.text());

const arabicIndexUrl = 'https://peregabriel.com/saintamaria/15884/';
const arabicIndexResponse = await fetch(arabicIndexUrl, { headers: { 'User-Agent': 'Notre-Dame-du-Secours-SaintsCalendar/1.0' } });
if (!arabicIndexResponse.ok) throw new Error('Arabic Maronite Synaxarion index returned HTTP ' + arabicIndexResponse.status);
const arabicIndex = parseArabicMaroniteIndex(await arabicIndexResponse.text());
const maroniteAr = Object.fromEntries(Object.entries(maroniteEn).map(([key, value]) => [key, arabicIndex[key] || [toArabicName(value)]]));

const maronite = { en: {}, ar: {} };
for (const item of Object.keys(maroniteEn)) {
  const parts = item.split('-').map(Number);
  const month = parts[0], day = parts[1];
  const key = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  maronite.en[key] = maroniteEn[item];
  maronite.ar[key] = maroniteAr[item];
}
// The Maronite Synaxarion index places Saint Sharbel on the third Sunday of July.
const julyFirst = new Date(Date.UTC(year, 6, 1));
const firstSunday = 1 + ((7 - julyFirst.getUTCDay()) % 7);
const sharbelDay = firstSunday + 14;
const sharbelKey = year + '-07-' + String(sharbelDay).padStart(2, '0');
maronite.en[sharbelKey] = [maronite.en[sharbelKey], 'Saint Sharbel Makhlouf (third Sunday of July)'].filter(Boolean).join('; ');
const sharbelArabic = Array.isArray(maronite.ar[sharbelKey]) ? maronite.ar[sharbelKey] : (maronite.ar[sharbelKey] ? [maronite.ar[sharbelKey]] : []);
if (!sharbelArabic.includes('شربل مخلوف الراهب اللبناني الماروني')) sharbelArabic.push('شربل مخلوف الراهب اللبناني الماروني');
maronite.ar[sharbelKey] = sharbelArabic;
const july23Key = year + '-07-23';
if (maronite.en[july23Key] === 'Saint Sharbel.') {
  maronite.en[july23Key] = 'Saint Apollinarius, Bishop of Ravenna, and Saint Foka, martyrs (Arabic Maronite Synaxarion index)';
}

const payload = {
  schemaVersion: 1, year, generatedAt: new Date().toISOString(),
  sources: {
    catholic: 'General Roman Calendar via LitCal API; official Vatican decrees are authoritative for universal-calendar changes.',
    maronite: 'Maronite Heritage transcription of the Antiochian Maronite Rite Synaxarion, Kaslik, Lebanon (1996). Arabic entries are sourced from a Maronite Synaxarion alphabetical index; Saint Sharbel is placed on the third Sunday of July.'
  },
  catholic,
  maronite
};
const output = path.join(outDir, year + '.json');
await fs.writeFile(output, JSON.stringify(payload));
console.log('Wrote ' + output + ' (' + Object.keys(maroniteEn).length + ' fixed Maronite dates; ' + Object.keys(arabicIndex).length + ' Arabic-index dates; Catholic EN/FR/IT)');
