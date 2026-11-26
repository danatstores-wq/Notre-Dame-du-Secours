import fs from 'node:fs/promises';
import path from 'node:path';

const year = Number(process.argv[2] || new Date().getUTCFullYear());
if (!Number.isInteger(year) || year < 1900 || year > 2200) throw new Error('Invalid year');

const outDir = path.resolve('src/data/saints-calendar');
await fs.mkdir(outDir, { recursive: true });

async function requestJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Notre-Dame-du-Secours-SaintsCalendar/1.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function htmlToLines(html) {
  return decodeEntities(html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|section|article|br|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[\t\f\v ]+/g, ' ')
    .split(/\r?\n/).map(x => x.trim()).filter(Boolean);
}

function parseSynaxarion(html, locale) {
  const lines = htmlToLines(html);
  const heading = locale === 'ar' ? 'السنكسار' : 'Synaxarion';
  const normalize = value => value.normalize('NFKC').replace(/[\\u064B-\\u065F\\u0670\\u0640]/g, '').replace(/[：:]/g, '').trim();
  const start = lines.findIndex(line => normalize(line).includes(normalize(heading)));
  if (start < 0) throw new Error(`Missing ${heading} section; page text: ${JSON.stringify(lines.slice(0, 28))}`);
  const stop = /^(Liturgical Year|Gospel|Previous day|Next day|Liturgy service|Letter|السنّة الطقسيّة|السنة الطقسية|الإنجيل|اليوم السابق|اليوم التالي|خدمة الليتورجيا|خدمة الليتورجيّا|الرسالة|القديسون|القدّيسون)/i;
  const names = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (stop.test(line) || /^\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}$/i.test(line)) break;
    if (/^(Back to Today|Today|Synaxarion)$/i.test(line)) continue;
    const name = line.replace(/^[-•*]\s*/, '').trim();
    if (name.length > 1 && !names.includes(name)) names.push(name);
  }
  return names;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

const days = [];
for (let month = 0; month < 12; month++) {
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  for (let day = 1; day <= count; day++) days.push({ year, month: month + 1, day, key: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` });
}

const catholic = {};
for (const locale of ['en', 'fr', 'it']) {
  const data = await requestJson(`https://litcal.johnromanodorazio.com/api/v5/calendar/${year}?locale=${locale}&year_type=CIVIL`);
  if (!Array.isArray(data?.litcal)) throw new Error(`Invalid Roman calendar payload for ${locale}`);
  catholic[locale] = data.litcal.map(event => ({
    month: Number(event.month), day: Number(event.day),
    name: event.name || event.event_key || '',
    rank: event.grade_display || event.grade_lcl || event.grade_abbr || ''
  })).filter(event => event.month && event.day && event.name);
}

const maronite = {};
for (const locale of ['ar', 'en']) {
  maronite[locale] = await mapLimit(days, 4, async ({ key }) => {
    const url = `https://olm.org.lb/${locale}/liturgical-calendar/${key}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Notre-Dame-du-Secours-SaintsCalendar/1.0' } });
    if (!response.ok) throw new Error(`Maronite source returned HTTP ${response.status} for ${key} (${locale})`);
    const names = parseSynaxarion(await response.text(), locale);
    return { date: key, names };
  });
}

const payload = {
  schemaVersion: 1,
  year,
  generatedAt: new Date().toISOString(),
  sources: {
    catholic: 'General Roman Calendar via LitCal API; official Vatican decrees are authoritative for universal-calendar changes.',
    maronite: 'Lebanese Maronite Order official daily liturgical calendar and Synaxarion.'
  },
  catholic,
  maronite: {
    ar: Object.fromEntries(maronite.ar.map(item => [item.date, item.names])),
    en: Object.fromEntries(maronite.en.map(item => [item.date, item.names]))
  }
};

const output = path.join(outDir, `${year}.json`);
await fs.writeFile(output, JSON.stringify(payload));
console.log(`Wrote ${output} (${days.length} days; Catholic EN/FR/IT; Maronite AR/EN)`);
