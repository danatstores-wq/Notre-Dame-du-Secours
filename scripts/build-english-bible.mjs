import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const OUT = path.resolve('bibles/en');
const ZIP_URL = 'https://ebible.org/Scriptures/engDRA_usfm.zip';
const CODE_TO_SLUG = {
  GEN:'genesis',EXO:'exodus',LEV:'leviticus',NUM:'numbers',DEU:'deuteronomy',
  JOS:'joshua',JDG:'judges',RUT:'ruth', '1SA':'1-samuel','2SA':'2-samuel',
  '1KI':'1-kings','2KI':'2-kings','1CH':'1-chronicles','2CH':'2-chronicles',
  EZR:'ezra',NEH:'nehemiah',TOB:'tobit',JDT:'judith',EST:'esther',
  '1MA':'1-maccabees','2MA':'2-maccabees',JOB:'job',PSA:'psalms',PRO:'proverbs',
  ECC:'ecclesiastes',SNG:'song-of-solomon',WIS:'wisdom',SIR:'sirach',ISA:'isaiah',
  JER:'jeremiah',LAM:'lamentations',BAR:'baruch',EZK:'ezekiel',DAN:'daniel',
  HOS:'hosea',JOL:'joel',AMO:'amos',OBA:'obadiah',JON:'jonah',MIC:'micah',
  NAM:'nahum',HAB:'habakkuk',ZEP:'zephaniah',HAG:'haggai',ZEC:'zechariah',
  MAL:'malachi',MAT:'matthew',MRK:'mark',LUK:'luke',JHN:'john',ACT:'acts',
  ROM:'romans','1CO':'1-corinthians','2CO':'2-corinthians',GAL:'galatians',
  EPH:'ephesians',PHP:'philippians',COL:'colossians','1TH':'1-thessalonians',
  '2TH':'2-thessalonians','1TI':'1-timothy','2TI':'2-timothy',TIT:'titus',
  PHM:'philemon',HEB:'hebrews',JAS:'james','1PE':'1-peter','2PE':'2-peter',
  '1JN':'1-john','2JN':'2-john','3JN':'3-john',JUD:'jude',REV:'revelation'
};
const stripMarkers = value => String(value)
  .replace(/\\f[\s\S]*?\\f\*/g,' ')
  .replace(/\\x[\s\S]*?\\x\*/g,' ')
  .replace(/\\[a-zA-Z0-9+]+\*?/g,' ')
  .replace(/[{}]/g,'')
  .replace(/\s+/g,' ').trim();

function parseUsfm(raw, bookName, slug) {
  const chapters=[];
  let current=null, currentVerse=null, verseText='';
  const saveVerse=()=>{
    if(current && currentVerse!==null){
      const text=stripMarkers(verseText);
      if(text)current.verses.push({verse:currentVerse,text});
    }
    currentVerse=null;verseText='';
  };
  for(const line of raw.split(/\r?\n/)){
    const chapterMatch=line.match(/^\\c\s+(\d+)/);
    if(chapterMatch){
      saveVerse();
      current={translation:'Douay-Rheims American Edition (1899)',language:'english',dir:'ltr',bookName,bookSlug:slug,nativeName:bookName,chapterNumber:Number(chapterMatch[1]),verses:[]};
      chapters.push(current);
      continue;
    }
    const verseMatch=line.match(/^\\v\s+(\d+)(?:-\d+)?\s*(.*)$/);
    if(verseMatch){
      saveVerse();
      if(!current)throw new Error('Verse before chapter in '+bookName);
      currentVerse=Number(verseMatch[1]);verseText=verseMatch[2]||'';
      continue;
    }
    if(currentVerse!==null){
      if(/^\\(?:s\d*|r|d|sp|cl|cp|ms\d*|mt\d*|toc\d*)\b/.test(line)){
        saveVerse();
        continue;
      }
      verseText+=' '+line;
    }
  }
  saveVerse();
  for(const chapter of chapters){
    chapter.totalVerses=chapter.verses.length;
    if(!chapter.verses.length)throw new Error('Empty chapter '+bookName+' '+chapter.chapterNumber);
  }
  return chapters;
}

const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'dra-'));
const zipPath=path.join(tmp,'engDRA_usfm.zip');
const response=await fetch(ZIP_URL);
if(!response.ok)throw new Error('Could not download public-domain Douay-Rheims USFM: HTTP '+response.status);
await fs.writeFile(zipPath,Buffer.from(await response.arrayBuffer()));
execFileSync('unzip',['-q',zipPath,'-d',tmp]);
const files=[];
async function walk(dir){
  for(const entry of await fs.readdir(dir,{withFileTypes:true})){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())await walk(full);
    else if(entry.name.toLowerCase().endsWith('.usfm'))files.push(full);
  }
}
await walk(tmp);
if(files.length!==73)throw new Error('Expected 73 USFM books, found '+files.length);

const frIndex=JSON.parse(await fs.readFile('bibles/fr/index.json','utf8'));
if(frIndex.length!==73||frIndex.reduce((n,b)=>n+b.chapterCount,0)!==1334)throw new Error('Existing Catholic index failed its 73-book / 1,334-chapter check');
const bySlug=new Map(frIndex.map(b=>[b.slug,b]));
const generated=[];
let totalChapters=0,totalVerses=0;
for(const file of files){
  const raw=await fs.readFile(file,'utf8');
  const id=raw.match(/^\\id\s+([A-Z0-9]{3})/m);
  if(!id)throw new Error('Missing USFM book ID in '+file);
  const slug=CODE_TO_SLUG[id[1]];
  const metadata=bySlug.get(slug);
  if(!slug||!metadata)throw new Error('Unmapped Catholic Bible book code: '+id[1]);
  const chapters=parseUsfm(raw,metadata.name,slug);
  if(chapters.length!==metadata.chapterCount)throw new Error(metadata.name+' has '+chapters.length+' chapters; expected '+metadata.chapterCount);
  totalChapters+=chapters.length;
  totalVerses+=chapters.reduce((n,c)=>n+c.verses.length,0);
  const book={name:metadata.name,slug,nativeName:metadata.name,chapterCount:chapters.length,chapters};
  await fs.mkdir(path.join(OUT,'books'),{recursive:true});
  await fs.writeFile(path.join(OUT,'books',slug+'.json'),JSON.stringify(book));
  generated.push({name:metadata.name,slug,nativeName:metadata.name,chapterCount:chapters.length,language:'english',dir:'ltr'});
  console.log(metadata.name+': '+chapters.length+' chapters');
}
generated.sort((a,b)=>frIndex.findIndex(x=>x.slug===a.slug)-frIndex.findIndex(x=>x.slug===b.slug));
if(generated.length!==73||totalChapters!==1334)throw new Error('Catholic canon validation failed: '+generated.length+' books, '+totalChapters+' chapters');
await fs.writeFile(path.join(OUT,'index.json'),JSON.stringify(generated));
await fs.writeFile(path.join(OUT,'ATTRIBUTION.txt'),
  'English text: Douay-Rheims American Edition (1899), public domain.\\n'+
  'Source: eBible.org, https://ebible.org/engDRA/ and https://ebible.org/Scriptures/engDRA_usfm.zip\\n'+
  'The complete 73-book Catholic canon, including the Deuterocanonical books, is bundled in this app.\\n'+
  'USFM files are converted into local JSON for the Notre-Dame-du-Secours reader.'
);
console.log('Validated English Catholic Bible: '+generated.length+' books, '+totalChapters+' chapters, '+totalVerses+' verses.');
await fs.rm(tmp,{recursive:true,force:true});
