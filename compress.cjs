const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

const start = lines.findIndex(l => l.includes('id="printable-bill-pad"'));
const end = start + 500; // Search window

function rep(target, replacement) {
  for (let i = start; i < end && i < lines.length; i++) {
    if (lines[i].includes(target)) {
      lines[i] = lines[i].replace(target, replacement);
    }
  }
}

// 1. Modal padding
rep('padding: "30px 36px",', 'padding: "10px 15px",');

// 2. Logo and Header
rep('gap: "20px", marginBottom: "12px"', 'gap: "10px", marginBottom: "6px"');
rep('width: "80px", height: "80px"', 'width: "50px", height: "50px"');
rep('fontSize: "22px"', 'fontSize: "18px"');
rep('margin: "0 0 3px 0"', 'margin: "0 0 2px 0"');
rep('fontSize: "14px", fontWeight: "bold", color: "#000000", marginBottom: "2px"', 'fontSize: "12px", fontWeight: "bold", color: "#000000", marginBottom: "2px"');
// Change 13px to 11px in header lines
rep('fontSize: "13px", color: "#000000", marginBottom: "1px"', 'fontSize: "11px", color: "#000000", marginBottom: "1px"');
rep('fontSize: "13px", fontWeight: "bold", color: "#000000"', 'fontSize: "11px", fontWeight: "bold", color: "#000000"');

// 3. VAT line
rep('paddingTop: "10px",', 'paddingTop: "4px",');
rep('paddingBottom: "10px",', 'paddingBottom: "4px",');
rep('marginBottom: "16px"', 'marginBottom: "8px"');
// Change VAT font size from 14px to 12px
for (let i = start; i < start + 100; i++) {
  if (lines[i] && lines[i].includes('fontSize: "14px",') && lines[i-1].includes('fontWeight: "bold",')) {
    lines[i] = lines[i].replace('fontSize: "14px",', 'fontSize: "12px",');
  }
}

// 4. Bill Number Grid
rep('gap: "20px",', 'gap: "10px",');
rep('padding: "14px",', 'padding: "8px",');
rep('fontSize: "13px",', 'fontSize: "11px",');
rep('lineHeight: "1.9"', 'lineHeight: "1.4"');
rep('fontSize: "15px"', 'fontSize: "13px"');

// 5. Tables
// Change all padding in Particulars and Summary tables within this block
for (let i = start; i < end && i < lines.length; i++) {
  // Replace all occurrences of 9px, 10px, 7px, 8px padding to smaller values
  lines[i] = lines[i]
    .replace(/padding: "9px/g, 'padding: "3px')
    .replace(/padding: "10px/g, 'padding: "4px')
    .replace(/padding: "7px/g, 'padding: "3px')
    .replace(/padding: "8px/g, 'padding: "3px')
    // Reduce font sizes in tables
    .replace(/fontSize: "13px"/g, 'fontSize: "11px"')
    .replace(/fontSize: "12px"/g, 'fontSize: "10px"')
    .replace(/marginTop: "10px"/g, 'marginTop: "4px"')
    .replace(/marginTop: "35px"/g, 'marginTop: "15px"');
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Compressed bill pad successfully.');
