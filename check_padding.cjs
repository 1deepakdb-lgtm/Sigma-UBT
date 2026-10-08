const fs = require('fs');
const lines = fs.readFileSync('src/components/InstituteBillingSection.jsx', 'utf8').split('\n');

const findInputContext = (search) => {
  const idx = lines.findIndex(l => l.includes(search));
  if (idx !== -1) {
    console.log('--- Context around', search, '---');
    for (let i = idx - 5; i <= idx + 15; i++) {
      if (lines[i] && (lines[i].includes('padding:') || lines[i].includes('style={{'))) {
        console.log(i + 1, lines[i].trim());
      }
    }
  }
}

findInputContext('placeholder="Course Gross Fee"');
findInputContext('placeholder="Discount % (Manual Entry)"');
findInputContext('placeholder="PAID AMOUNT"');
