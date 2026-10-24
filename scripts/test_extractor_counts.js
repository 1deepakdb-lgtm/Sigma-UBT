import fs from 'fs';
import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

async function checkBook1Matches() {
  for (let ch = 1; ch <= 30; ch++) {
    const pad = String(ch).padStart(2, "0");
    const p = `./public/uploads/eps-chapters/Chapter_${pad}.pdf`;
    if (!fs.existsSync(p)) continue;
    const data = new Uint8Array(fs.readFileSync(p));
    const doc = await pdfjs.getDocument({ data }).promise;

    let fullText = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      fullText += " " + content.items.map(it => it.str).join(" ");
    }

    const regex = /([가-힣]{2,15}(?:\s+[가-힣]{1,10})*)\s+([A-Za-z][A-Za-z\s,()/\-]{2,35})/g;
    const words = new Map();
    let m;
    while ((m = regex.exec(fullText)) !== null) {
      const ko = m[1].trim();
      const en = m[2].trim();
      if (!/한국어|표준교재|학습|목표|대화|문법|어휘|활동|정보|문화|듣기|읽기|정답|트랙/i.test(ko) &&
          !/CHAPTER|EPS-TOPIK|LEARNING|OBJECTIVES|CONVERSATION|GRAMMAR|VOCABULARY|ACTIVITY|INFORMATION|LISTENING|READING/i.test(en) &&
          en.length > 2 && ko.length >= 2) {
        if (!words.has(ko)) {
          words.set(ko, en);
        }
      }
    }
    console.log(`Ch ${ch}: matched ${words.size} unique paired words`);
  }
}
checkBook1Matches();
