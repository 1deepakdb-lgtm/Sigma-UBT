const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let content = fs.readFileSync(filePath, 'utf8');

let lines = content.split('\n');
const start = lines.findIndex(l => l.includes('id="printable-bill-pad"'));
const end = start + 500;

for (let i = start; i < end; i++) {
  if (lines[i] && lines[i].includes('padding:')) {
    lines[i] = lines[i].replace(/padding:\s*"[^"]+"/g, (match) => {
      // Further reduce padding
      return match.replace(/5px/g, '1px').replace(/6px/g, '1px').replace(/8px/g, '2px').replace(/10px/g, '2px').replace(/12px/g, '3px').replace(/7px/g, '2px').replace(/9px/g, '2px');
    });
  }
  if (lines[i] && lines[i].includes('marginBottom:')) {
    lines[i] = lines[i].replace(/marginBottom:\s*"[^"]+"/g, (match) => {
      return match.replace(/10px/g, '2px').replace(/8px/g, '2px').replace(/6px/g, '1px').replace(/4px/g, '1px').replace(/14px/g, '4px').replace(/16px/g, '4px');
    });
  }
  if (lines[i] && lines[i].includes('marginTop:')) {
    lines[i] = lines[i].replace(/marginTop:\s*"[^"]+"/g, (match) => {
      return match.replace(/15px/g, '4px').replace(/6px/g, '1px').replace(/10px/g, '2px');
    });
  }
  if (lines[i] && lines[i].includes('lineHeight:')) {
    lines[i] = lines[i].replace(/lineHeight:\s*"[^"]+"/g, 'lineHeight: "1.1"');
  }
  if (lines[i] && lines[i].includes('gap:')) {
    lines[i] = lines[i].replace(/gap:\s*"[^"]+"/g, 'gap: "2px"');
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Compressed heights again');
