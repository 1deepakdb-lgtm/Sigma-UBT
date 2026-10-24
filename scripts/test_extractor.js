import fs from 'fs';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

async function scanAll() {
  const stats = [];
  for (let ch = 1; ch <= 60; ch++) {
    const file = `public/uploads/eps-chapters/Chapter_${String(ch).padStart(2, "0")}.pdf`;
    if (!fs.existsSync(file)) {
      stats.push({ ch, count: 0 });
      continue;
    }
    const data = new Uint8Array(fs.readFileSync(file));
    const doc = await pdfjs.getDocument({ data }).promise;

    const words = [];
    for (let p of [1, 2, 3, 4, 5, 6, 7, 8]) {
      if (p > doc.numPages) continue;
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const text = content.items.map(it => it.str).join(" ");
      
      const regex = /([가-힣]{2,15}(?:\s+[가-힣]{1,10})*)\s+([A-Za-z][A-Za-z\s,()/'\-]{2,35})/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const ko = match[1].trim();
        const en = match[2].trim();
        if (!ko.includes("어휘") && !ko.includes("표준교재") && !ko.includes("학습 목표") && !en.includes("VOCABULARY") && !en.includes("LEARNING")) {
          // Avoid duplicate Korean word
          if (!words.some(w => w.ko === ko)) {
            words.push({ ko, en, page: p });
          }
        }
      }
    }
    stats.push({ ch, count: words.length });
  }
  console.log("Extraction stats:", stats);
  const total = stats.reduce((sum, s) => sum + s.count, 0);
  console.log(`Total unique words extracted across 60 chapters: ${total}`);
}

scanAll();
