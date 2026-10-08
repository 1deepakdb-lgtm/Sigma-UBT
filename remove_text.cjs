
const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1
content = content.replace('?? Payment Method (Select Arrow) *', ' ');
// 2
content = content.replace('<span>?? Fee Breakdown & Payment Summary</span>', '<span> </span>');
// 3
content = content.replace('??? Cannot accept more than course fee after discount ({formatCurrency(maxAllowedPayment)}).', ' ');
// 4
content = content.replace('?? Course Fee, Discount & Study Items', ' ');
// 5
content = content.replace('? Course Fee (Gross) Rs. *', ' ');
// 6
content = content.replace('Course Detail (Choose Option or Type Manually) *', ' ');

fs.writeFileSync(filePath, content);
console.log('Text removed');

