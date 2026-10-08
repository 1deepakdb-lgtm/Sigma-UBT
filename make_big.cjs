const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

const start = lines.findIndex(l => l.includes('id="printable-bill-pad"'));
const end = start + 500;

function rep(target, replacement) {
  for (let i = start; i < end && i < lines.length; i++) {
    if (lines[i].includes(target)) {
      lines[i] = lines[i].replace(target, replacement);
    }
  }
}

rep('padding: "4px 15px",', 'padding: "30px 40px",');
rep('gap: "10px", marginBottom: "6px"', 'gap: "20px", marginBottom: "20px"');
rep('width: "50px", height: "50px"', 'width: "120px", height: "120px"');
rep('fontSize: "18px"', 'fontSize: "36px"');
rep('margin: "0 0 2px 0"', 'margin: "0 0 10px 0"');
rep('fontSize: "10px", fontWeight: "bold", color: "#000000", marginBottom: "2px"', 'fontSize: "18px", fontWeight: "bold", color: "#000000", marginBottom: "8px"');
rep('fontSize: "11px", color: "#000000", marginBottom: "1px"', 'fontSize: "16px", color: "#000000", marginBottom: "6px"');
rep('fontSize: "11px", fontWeight: "bold", color: "#000000"', 'fontSize: "16px", fontWeight: "bold", color: "#000000"');

rep('paddingTop: "4px",', 'paddingTop: "20px",');
rep('paddingBottom: "4px",', 'paddingBottom: "20px",');
rep('marginBottom: "8px"', 'marginBottom: "24px"');

for (let i = start; i < start + 100; i++) {
  if (lines[i] && lines[i].includes('fontSize: "12px",') && lines[i-1].includes('fontWeight: "bold",')) {
    lines[i] = lines[i].replace('fontSize: "12px",', 'fontSize: "18px",');
  }
}

rep('gap: "10px",', 'gap: "30px",');
rep('padding: "8px",', 'padding: "24px",');

for (let i = start; i < end && i < lines.length; i++) {
  lines[i] = lines[i]
    .replace(/fontSize: "11px"/g, 'fontSize: "16px"')
    .replace(/fontSize: "10px"/g, 'fontSize: "15px"')
    .replace(/fontSize: "12px"/g, 'fontSize: "15px"')
    .replace(/fontSize: "13px"/g, 'fontSize: "18px"')
    .replace(/lineHeight: "1.4"/g, 'lineHeight: "2.2"')
    .replace(/padding: "3px/g, 'padding: "14px')
    .replace(/padding: "4px/g, 'padding: "16px')
    .replace(/marginTop: "4px"/g, 'marginTop: "16px"')
    .replace(/marginTop: "15px"/g, 'marginTop: "40px"');
}

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('zoom: 0.70 !important;')) {
    lines[i] = lines[i].replace('zoom: 0.70 !important;', 'zoom: 0.92 !important;');
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Done!');
