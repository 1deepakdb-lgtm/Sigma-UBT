import fs from 'fs';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

async function checkWordList() {
  for (let ch = 1; ch <= 30; ch++) {
    const file = `public/uploads/eps-chapters/Chapter_${String(ch).padStart(2, "0")}.pdf`;
    const wordsList = [];
    if (fs.existsSync(file)) {
      const data = new Uint8Array(fs.readFileSync(file));
      const doc = await pdfjs.getDocument({ data }).promise;
      for (let p = 1; p <= doc.numPages; p++) {
        const page = await doc.getPage(p);
        const text = (await page.getTextContent()).items.map(it => it.str).join(" ");
        const regex = /([가-힣]{2,15}(?:\s+[가-힣]{1,10})*)\s+([A-Za-z][A-Za-z\s,()/\-]{2,35})/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const ko = match[1].trim();
          const en = match[2].trim();
          if (
            !ko.includes("어휘") && !ko.includes("표준교재") && !ko.includes("학습 목표") &&
            !ko.includes("대화") && !ko.includes("문법") && !ko.includes("활동") && !ko.includes("정보") &&
            !en.includes("VOCABULARY") && !en.includes("LEARNING") && !en.includes("EPS") && !en.includes("CHAPTER")
          ) {
            if (!wordsList.some(w => w.ko === ko)) {
              wordsList.push({ ko, en });
            }
          }
        }
      }
    }
    console.log(`Ch ${ch}: ${wordsList.length} paired words`);
  }
}
checkWordList();
