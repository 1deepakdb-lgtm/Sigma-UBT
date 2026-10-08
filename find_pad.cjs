const fs = require('fs');
const lines = fs.readFileSync('src/components/InstituteBillingSection.jsx', 'utf8').split('\n');
const printPadIdx = lines.findIndex(l => l.includes('id="printable-bill-pad"'));
console.log('id printable-bill-pad found at line:', printPadIdx);
