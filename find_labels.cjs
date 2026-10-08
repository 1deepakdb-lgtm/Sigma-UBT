const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

const showContext = (lineNum) => {
  console.log('--- Context around line', lineNum, '---');
  for (let i = lineNum - 3; i <= lineNum + 3; i++) {
    console.log(i, lines[i-1]);
  }
};

lines.forEach((l, i) => {
  if (l.includes('<label style={{ fontSize: "13px", fontWeight: "900", color: "#9a3412"')) showContext(i+1);
  if (l.includes('<span> </span>')) showContext(i+1);
  if (l.includes('<label style={{ display: "block", fontSize: "12px", fontWeight: "900", color: "#166534"')) showContext(i+1);
  if (l.includes('<label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#1e3a8a"')) showContext(i+1);
  if (l.includes('<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>')) showContext(i+1);
});
