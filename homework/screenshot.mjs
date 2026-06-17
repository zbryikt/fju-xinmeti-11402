import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const imgDir = path.join(__dirname, 'img');

const files = [
  'student/138888/07/index.html',
  'student/138888/08/index.html',
  'student/138888/index.html',
  'student/413060017/07/background.html',
  'student/413060017/07/index.html',
  'student/413060017/08/eat.html',
  'student/413060017/08/index.html',
  'student/413060081/08/eat.html',
  'student/413060081/08/index.html',
  'student/413060081/game.html',
  'student/413060108/07/index.html',
  'student/413060108/08/eat.html',
  'student/413060108/08/index.html',
  'student/413060108/Game.html',
  'student/413060263/07/background.html',
  'student/413060263/07/index.html',
  'student/413060316/07/background.html',
  'student/413060316/07/index.html',
  'student/413060316/08/eat.html',
  'student/413060316/08/index.html',
  'student/413060330/07/index.html',
  'student/413060330/08/index.html',
  'student/413060445/07/index.html',
  'student/413060445/08/eat.html',
  'student/413060445/08/index.html',
  'student/413060445/fghj.html',
  'student/413060500/07/index.html',
  'student/413060500/08/eat.html',
  'student/413060500/08/index.html',
  'student/413060500/index2.html',
  'student/413060550/08/index.html',
  'student/413060550/princess_game.html',
];

function imgName(relPath) {
  return relPath.replace(/\//g, '_').replace(/\.html$/, '.png');
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 800 });

for (const rel of files) {
  const absPath = path.join(root, rel);
  const url = `file://${absPath}`;
  const outFile = path.join(imgDir, imgName(rel));

  if (fs.existsSync(outFile)) {
    console.log(`skip (exists): ${rel}`);
    continue;
  }

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: outFile, clip: { x: 0, y: 0, width: 1200, height: 800 } });
    console.log(`ok: ${rel}`);
  } catch (e) {
    console.error(`fail: ${rel} — ${e.message}`);
  }
}

await browser.close();
console.log('Done.');
