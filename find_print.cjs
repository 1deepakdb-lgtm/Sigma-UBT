const fs = require('fs');
const lines = fs.readFileSync('src/components/InstituteBillingSection.jsx', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('id="printable-bill-pad"'));
for(let i = idx; i < idx + 50; i++) {
  console.log(lines[i]);
}
