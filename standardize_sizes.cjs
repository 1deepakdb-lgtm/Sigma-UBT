const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

const replaceStyle = (startSearch) => {
  const startIdx = lines.findIndex(l => l.includes(startSearch));
  if (startIdx === -1) return;
  for (let i = startIdx; i < startIdx + 20; i++) {
    if (lines[i] && lines[i].includes('padding:')) lines[i] = lines[i].replace(/padding:\s*"[^"]+"/, 'padding: "8px 10px"');
    if (lines[i] && lines[i].includes('fontSize:')) lines[i] = lines[i].replace(/fontSize:\s*"[^"]+"/, 'fontSize: "13px"');
  }
};

replaceStyle('placeholder="Course Gross Fee"');
replaceStyle('placeholder="Discount % (Manual Entry)"');
replaceStyle('placeholder="PAID AMOUNT"');
replaceStyle('value={PAYMENT_METHODS.includes(form.paymentMethod)');

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Done standardizing heights');
