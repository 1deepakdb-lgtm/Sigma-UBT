const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 4500; i < 4850; i++) {
  if (lines[i] && lines[i].includes('💳 Payment Method (Select Arrow) *')) {
    if (lines[i-1].includes('<label')) {
      lines[i-1] = lines[i-1].replace(
        'color: "#1e3a8a", marginBottom: "4px"',
        'color: "#9a3412", backgroundColor: "#ffedd5", padding: "4px 8px", borderRadius: "4px", marginBottom: "6px", border: "1px solid #fdba74", display: "inline-block"'
      );
    }
  }
}

// Ensure the style tag doesn't get added multiple times
let hasStyle = false;
for(let i=0; i<3000; i++) {
  if(lines[i] && lines[i].includes('@media print')) hasStyle = true;
}

if(!hasStyle) {
  const printStyleStr = `<style>{'\\n@media print {\\n  @page {\\n    size: A5 landscape;\\n    margin: 10mm;\\n  }\\n}\\n'}</style>`;
  lines.splice(2045, 0, printStyleStr);
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Modified label and added print style.');
