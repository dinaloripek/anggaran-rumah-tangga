// Anggaran Rumah Tangga — entri make.fun "Make the best household budget site" (Node 22, pustaka standar saja).
// Situsnya adalah folder app/ di sebelah file ini: berkas statis yang dibuka peramban di app/index.html
// (modul ES, CSS, tanpa langkah build), isinya berkas milik sendiri: tidak ada yang dimuat dari jaringan.
// Program ini menyerahkan situs: menyalin app/ dan screenshots/ dari repositori ke /output lalu menulis
// /output/dossier.json, ringkasan yang dibaca juri (tangkapan layar, berkas dan byte muatan pertama, dan sumber),
// memakai pustaka make.fun yang divendorkan. vendor/makefun-frontend.ts dibiarkan apa adanya: penilai
// mengharuskan dossier.json sama byte per byte dengan yang ditulis salinannya sendiri.
//
// Di luar kontainer penilai, MAKEFUN_OUTPUT_DIR menggantikan /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Batas penilai (reference/gate.json): hanya text_max_bytes yang membentuk byte; sisanya menolak entri
// yang akan ditolak penilai (lebih dari 4 tangkapan layar atau satu di atas 256 KiB; lebih dari 993 berkas
// dan direktori di app/ atau 16 MiB berkas app/: app/ dihitung di samping batas 1000 entri /output sendiri,
// beserta screenshots/ dan dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);

// Satu baris ringkasan ke stdout supaya dua jalan program bisa dibandingkan sekilas:
// berkas yang disalin dan byte dossier yang ditulis.
const countFiles = (dir) => readdirSync(dir, { withFileTypes: true }).reduce(
  (n, e) => n + (e.isDirectory() ? countFiles(join(dir, e.name)) : 1), 0);
console.log(`anggaran-rumah-tangga: ${countFiles(join(out, 'app'))} berkas app, ${countFiles(join(out, 'screenshots'))} tangkapan layar, dossier ${statSync(join(out, 'dossier.json')).size} byte -> ${out}`);
