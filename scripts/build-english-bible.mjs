import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve('bibles/en');
const SOURCE = 'https://raw.githubusercontent.com/xxruyle/Bible-DouayRheims/main/Douay-Rheims/';
const BOOKS = [
  ['Genesis','Genesis'],['Exodus','Exodus'],['Leviticus','Leviticus'],['Numbers','Numbers'],['Deuteronomy','Deuteronomy'],
  ['Joshua','Josue'],['Judges','Judges'],['Ruth','Ruth'],['1 Samuel','1 Kings'],['2 Samuel','2 Kings'],
  ['1 Kings','3 Kings'],['2 Kings','4 Kings'],['1 Chronicles','1 Paralipomenon'],['2 Chronicles','2 Paralipomenon'],
  ['Ezra','1 Esdras'],['Nehemiah','2 Esdras'],['Tobit','Tobias'],['Judith','Judith'],['Esther','Esther'],
  ['1 Maccabees','1 Machabees'],['2 Maccabees','2 Machabees'],['Job','Job'],['Psalms','Psalms'],['Proverbs','Proverbs'],
  ['Ecclesiastes','Ecclesiastes'],['Song of Solomon','Canticles'],['Wisdom','Wisdom'],['Sirach','Ecclesiasticus'],
  ['Isaiah','Isaias'],['Jeremiah','Jeremias'],['Lamentations','Lamentations'],['Baruch','Baruch'],['Ezekiel','Ezechiel'],
  ['Daniel','Daniel'],['Hosea','Osee'],['Joel','Joel'],['Amos','Amos'],['Obadiah','Abdias'],['Jonah','Jonas'],
  ['Micah','Micheas'],['Nahum','Nahum'],['Habakkuk','Habacuc'],['Zephaniah','Sophonias'],['Haggai','Aggeus'],
  ['Zechariah','Zacharias'],['Malachi','Malachias'],['Matthew','Matthew'],['Mark','Mark'],['Luke','Luke'],
  ['John','John'],['Acts','Acts'],['Romans','Romans'],['1 Corinthians','1 Corinthians'],['2 Corinthians','2 Corinthians'],
  ['Galatians','Galatians'],['Ephesians','Ephesians'],['Philippians','Philippians'],['Colossians','Colossians'],
  ['1 Thessalonians','1 Thessalonians'],['2 Thessalonians','2 Thessalonians'],['1 Timothy','1 Timothy'],
  ['2 Timothy','2 Timothy'],['Titus','Titus'],['Philemon','Philemon'],['Hebrews','Hebrews'],['James','James'],
  ['1 Peter','1 Peter'],['2 Peter','2 Peter'],['1 John','1 John'],['2 John','2 John'],['3 John','3 John'],
  ['Jude','Jude'],['Revelation','Apocalypse']
];
const slugify = value => value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const cleanText = value => String(value).replace(/\*/g,'').replace(/\s+/g,' ').trim();

await fs.mkdir(path.join(OUT,'books'),{recursive:true});
const index=[];
let totalChapters=0,totalVerses=0;
for (const [name,sourceName] of BOOKS) {
  const url=SOURCE+encodeURIComponent(sourceName+'.json');
  const response=await fetch(url);
  if(!response.ok) throw new Error('Could not fetch '+sourceName+': HTTP '+response.status);
  const raw=await response.json();
  const chapterKeys=Object.keys(raw).filter(k=>/^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b));
  if(!chapterKeys.length) throw new Error('No chapters in '+sourceName);
  const slug=slugify(name);
  const chapters=chapterKeys.map(chapterKey=>{
    const sourceVerses=raw[chapterKey];
    const verseKeys=Object.keys(sourceVerses).filter(k=>/^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b));
    const verses=verseKeys.map(verseKey=>({verse:Number(verseKey),text:cleanText(sourceVerses[verseKey])}));
    if(!verses.length) throw new Error('Empty chapter '+name+' '+chapterKey);
    totalVerses+=verses.length;
    return {translation:'Douay-Rheims American Edition (1899)',language:'english',dir:'ltr',bookName:name,bookSlug:slug,nativeName:name,chapterNumber:Number(chapterKey),totalVerses:verses.length,verses};
  });
  totalChapters+=chapters.length;
  const book={name,slug,nativeName:name,chapterCount:chapters.length,chapters};
  await fs.writeFile(path.join(OUT,'books',slug+'.json'),JSON.stringify(book));
  index.push({name,slug,nativeName:name,chapterCount:chapters.length,language:'english',dir:'ltr'});
  console.log(name+': '+chapters.length+' chapters');
}
if(index.length!==73 || totalChapters!==1334) {
  throw new Error('Catholic canon validation failed: '+index.length+' books, '+totalChapters+' chapters (expected 73 / 1334)');
}
await fs.writeFile(path.join(OUT,'index.json'),JSON.stringify(index));
await fs.writeFile(path.join(OUT,'ATTRIBUTION.txt'),
  'English text: Douay-Rheims Bible, American Edition (1899), public domain.\\n'+
  'Structured JSON transcription: https://github.com/xxruyle/Bible-DouayRheims (MIT-licensed repository).\\n'+
  'The 73-book Catholic canon is included, including the Deuterocanonical books.\\n'+
  'Generated locally for Notre-Dame-du-Secours; no external Bible reader is required.'
);
console.log('Validated English Catholic Bible: '+index.length+' books, '+totalChapters+' chapters, '+totalVerses+' verses.');
