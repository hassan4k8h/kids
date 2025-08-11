// Fetch open-licensed animal sounds from Wikimedia Commons and save locally
// Output dir: public/audio/animals
// Node >=18 is required (global fetch)

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public', 'audio', 'animals');

const animals = {
  // pets
  cat: ['cat meow sound', 'meow sound'],
  dog: ['dog bark sound', 'bark sound'],
  bird: ['bird chirp sound', 'sparrow chirp sound'],
  rabbit: ['rabbit sound'],
  hamster: ['hamster sound'],
  // farm
  cow: ['cow moo sound'],
  horse: ['horse neigh sound'],
  sheep: ['sheep bleat sound'],
  goat: ['goat bleat sound'],
  pig: ['pig oink sound'],
  chicken: ['chicken cluck sound'],
  duck: ['duck quack sound'],
  turkey: ['turkey gobble sound'],
  rooster: ['rooster crow sound'],
  // wild
  lion: ['lion roar sound'],
  tiger: ['tiger roar sound'],
  elephant: ['elephant trumpet sound'],
  wolf: ['wolf howl sound'],
  bear: ['bear growl sound'],
  monkey: ['monkey sound'],
  zebra: ['zebra sound'],
  giraffe: ['giraffe sound'],
  hippo: ['hippopotamus sound'],
  rhino: ['rhinoceros sound'],
  // birds
  owl: ['owl hoot sound'],
  eagle: ['eagle screech sound'],
  parrot: ['parrot sound'],
  penguin: ['penguin sound'],
  flamingo: ['flamingo sound'],
  peacock: ['peacock sound'],
  // marine
  whale: ['whale sound'],
  dolphin: ['dolphin sound'],
  seal: ['seal sound'],
  shark: ['shark sound'],
  octopus: ['octopus sound'],
  // insects / reptiles / amphibians
  bee: ['bee buzz sound'],
  butterfly: ['butterfly sound'], // might be silent; will fallback
  cricket: ['cricket chirp sound'],
  snake: ['snake hiss sound'],
  lizard: ['lizard sound'],
  turtle: ['turtle sound'],
  frog: ['frog croak sound'],
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function commonsSearch(query) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:audio`,
    gsrlimit: '5',
    prop: 'imageinfo',
    iiprop: 'url|mediatype|mime',
    format: 'json',
    origin: '*',
  });
  const url = `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Commons search failed: ${res.status}`);
  const data = await res.json();
  if (!data.query || !data.query.pages) return null;
  const pages = Object.values(data.query.pages);
  // pick first audio with url
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (info?.url && (info.mime?.startsWith('audio/') || info.mediatype === 'AUDIO')) {
      return info.url;
    }
  }
  return null;
}

async function download(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
}

async function main() {
  ensureDir(OUTPUT_DIR);
  const entries = Object.entries(animals);
  let ok = 0, fail = 0;
  for (const [id, queries] of entries) {
    const outBase = path.join(OUTPUT_DIR, `${id}`);
    const candidates = [`${outBase}.mp3`, `${outBase}.ogg`, `${outBase}.wav`];
    if (candidates.some(f => fs.existsSync(f))) {
      console.log(`✓ exists: ${id}`);
      ok++;
      continue;
    }
    let foundUrl = null;
    for (const q of queries) {
      try {
        const url = await commonsSearch(q);
        if (url) { foundUrl = url; break; }
      } catch (e) {
        // try next
      }
    }
    if (!foundUrl) {
      console.warn(`! not found: ${id}`);
      fail++;
      continue;
    }
    const ext = foundUrl.split('?')[0].split('.').pop() || 'ogg';
    const out = `${outBase}.${ext}`;
    try {
      await download(foundUrl, out);
      console.log(`✓ downloaded: ${id} -> ${out}`);
      ok++;
    } catch (e) {
      console.warn(`! failed download for ${id}:`, e.message);
      fail++;
    }
  }
  console.log(`Done. Success: ${ok}, Failed: ${fail}. Output: ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});


