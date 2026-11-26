import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_SHA = 'b76e44393b3593ce10334e04421ffa82ce9e9c98';
const SOURCE_BASE = `https://raw.githubusercontent.com/clinto-abraham/bible.ciyo.in/${SOURCE_SHA}/public/data/french/bible`;
const OUT = 'bibles/fr';

async function getJson(url, label) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Notre-Dame-du-Secours-Bible-Importer' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 5) await new Promise(resolve => setTimeout(resolve, attempt * 1200));
    }
  }
  throw new Error(`Unable to download ${label}: ${lastError}`);
}

const books = await getJson(`${SOURCE_BASE}/books.json`, 'French Catholic Bible index');
if (!Array.isArray(books) || books.length !== 73 || books.reduce((sum, book) => sum + book.chapterCount, 0) !== 1334) {
  throw new Error('French Bible source does not match the expected 73 books / 1,334 chapters.');
}
const frenchBookNames = {
  'joshua':'Josué','judges':'Juges','1-samuel':'1 Samuel','2-samuel':'2 Samuel',
  '1-kings':'1 Rois','2-kings':'2 Rois','1-chronicles':'1 Chroniques','2-chronicles':'2 Chroniques',
  'ezra':'Esdras','nehemiah':'Néhémie','tobit':'Tobie','1-maccabees':'1 Maccabées','2-maccabees':'2 Maccabées',
  'psalms':'Psaumes','proverbs':'Proverbes','ecclesiastes':'Ecclésiaste','song-of-solomon':'Cantique des Cantiques',
  'wisdom':'Sagesse','sirach':'Ecclésiastique','isaiah':'Isaïe','jeremiah':'Jérémie','ezekiel':'Ézéchiel',
  'hosea':'Osée','joel':'Joël','obadiah':'Abdias','jonah':'Jonas','micah':'Michée','habakkuk':'Habacuc',
  'zephaniah':'Sophonie','haggai':'Aggée','zechariah':'Zacharie','malachi':'Malachie',
  '1-corinthians':'1 Corinthiens','2-corinthians':'2 Corinthiens','galatians':'Galates','ephesians':'Éphésiens',
  'philippians':'Philippiens','colossians':'Colossiens','1-thessalonians':'1 Thessaloniciens',
  '2-thessalonians':'2 Thessaloniciens','1-timothy':'1 Timothée','2-timothy':'2 Timothée',
  'titus':'Tite','philemon':'Philémon','hebrews':'Hébreux','james':'Jacques','1-peter':'1 Pierre',
  '2-peter':'2 Pierre','1-john':'1 Jean','2-john':'2 Jean','3-john':'3 Jean'
};
const localizedBooks = books.map(book => ({ ...book, nativeName: frenchBookNames[book.slug] || book.nativeName }));
await mkdir(path.join(OUT, 'books'), { recursive: true });
let completed = 0;
const jobs = [];
for (const book of localizedBooks) {
  jobs.push(async () => {
    const chapters = new Array(book.chapterCount);
    let next = 1;
    const workers = Array.from({ length: 8 }, async () => {
      while (true) {
        const chapter = next++;
        if (chapter > book.chapterCount) return;
        const data = await getJson(`${SOURCE_BASE}/${book.slug}/${chapter}.json`, `${book.nativeName} ${chapter}`);
        if (!data || !Array.isArray(data.verses) || data.verses.length === 0) {
          throw new Error(`Invalid chapter data: ${book.nativeName} ${chapter}`);
        }
        chapters[chapter - 1] = data;
        completed++;
        if (completed % 50 === 0) console.log(`Downloaded ${completed}/1334 chapters`);
      }
    });
    await Promise.all(workers);
    await writeFile(path.join(OUT, 'books', `${book.slug}.json`), JSON.stringify({
      name: book.nativeName,
      slug: book.slug,
      chapterCount: book.chapterCount,
      chapters
    }));
  });
}
let cursor = 0;
const bookWorkers = Array.from({ length: 5 }, async () => {
  while (true) {
    const job = jobs[cursor++];
    if (!job) return;
    await job();
  }
});
await Promise.all(bookWorkers);
await writeFile(path.join(OUT, 'index.json'), JSON.stringify(localizedBooks));
await writeFile(path.join(OUT, 'ATTRIBUTION.txt'),
  'French Bible: Augustin Crampon, revised 1923 edition (public domain).\n' +
  'Digital chapter data source: clinto-abraham/bible.ciyo.in, FreCrampon dataset.\n' +
  'Source commit: ' + SOURCE_SHA + '.\n' +
  'Catholic canon: 73 books, 1,334 chapters.\n');
console.log('French Bible import complete: 73 books, 1,334 chapters.');
