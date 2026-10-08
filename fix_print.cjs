const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

// 1. Direct Print on buttons
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('window.scrollTo({ top: 380, behavior: "smooth" });')) {
    lines[i] = lines[i].replace('window.scrollTo({ top: 380, behavior: "smooth" });', 'setTimeout(() => window.print(), 200);');
  }
}

// 2. Compress pad again but keep company name big
const start = lines.findIndex(l => l.includes('id="printable-bill-pad"'));
const end = start + 500;

function rep(target, replacement) {
  for (let i = start; i < end && i < lines.length; i++) {
    if (lines[i].includes(target)) {
      lines[i] = lines[i].replace(target, replacement);
    }
  }
}

// Compress paddings and margins
rep('padding: "30px 40px",', 'padding: "8px 20px",');
rep('gap: "20px", marginBottom: "20px"', 'gap: "12px", marginBottom: "10px"');
rep('width: "120px", height: "120px"', 'width: "70px", height: "70px"');
// Keep company name big (was 36px, let's keep it 28px)
rep('fontSize: "36px"', 'fontSize: "28px"');
rep('margin: "0 0 10px 0"', 'margin: "0 0 4px 0"');

// Reduce other headers
rep('fontSize: "18px", fontWeight: "bold", color: "#000000", marginBottom: "8px"', 'fontSize: "12px", fontWeight: "bold", color: "#000000", marginBottom: "3px"');
rep('fontSize: "16px", color: "#000000", marginBottom: "6px"', 'fontSize: "12px", color: "#000000", marginBottom: "2px"');
rep('fontSize: "16px", fontWeight: "bold", color: "#000000"', 'fontSize: "12px", fontWeight: "bold", color: "#000000"');

rep('paddingTop: "20px",', 'paddingTop: "6px",');
rep('paddingBottom: "20px",', 'paddingBottom: "6px",');
rep('marginBottom: "24px"', 'marginBottom: "10px"');

for (let i = start; i < start + 100; i++) {
  if (lines[i] && lines[i].includes('fontSize: "18px",') && lines[i-1].includes('fontWeight: "bold",')) {
    lines[i] = lines[i].replace('fontSize: "18px",', 'fontSize: "13px",');
  }
}

rep('gap: "30px",', 'gap: "15px",');
rep('padding: "24px",', 'padding: "10px",');

for (let i = start; i < end && i < lines.length; i++) {
  lines[i] = lines[i]
    .replace(/fontSize: "16px"/g, 'fontSize: "12px"')
    .replace(/fontSize: "15px"/g, 'fontSize: "12px"')
    .replace(/fontSize: "18px"/g, 'fontSize: "13px"')
    .replace(/lineHeight: "2.2"/g, 'lineHeight: "1.5"')
    .replace(/padding: "14px/g, 'padding: "5px')
    .replace(/padding: "16px/g, 'padding: "6px')
    .replace(/marginTop: "16px"/g, 'marginTop: "6px"')
    .replace(/marginTop: "40px"/g, 'marginTop: "15px"');
}

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('zoom: 0.92 !important;')) {
    lines[i] = lines[i].replace('zoom: 0.92 !important;', 'zoom: 0.8 !important;');
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Done fix_print');
