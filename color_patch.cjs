const fs = require('fs');
const filePath = 'src/components/InstituteBillingSection.jsx';
let content = fs.readFileSync(filePath, 'utf8');

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('🖨️')) {
    // Check lines before it for backgroundColor
    for(let j=i-15; j<i; j++) {
      if(lines[j] && lines[j].includes('backgroundColor:') && lines[j].includes('#581c87')) {
        lines[j] = lines[j].replace('#581c87', '#dc2626');
      }
      if(lines[j] && lines[j].includes('border:') && lines[j].includes('#6b21a8')) {
        lines[j] = lines[j].replace('#6b21a8', '#b91c1c');
      }
    }
  }
  
  // Next Pay to green
  if (lines[i].includes('Next Pay')) {
    for(let j=i-20; j<i; j++) {
      if(lines[j] && lines[j].includes('backgroundColor:') && lines[j].includes('#f97316')) {
        lines[j] = lines[j].replace('#f97316', '#16a34a');
      }
      if(lines[j] && lines[j].includes('border:') && lines[j].includes('#ea6c0a')) {
        lines[j] = lines[j].replace('#ea6c0a', '#15803d');
      }
      if(lines[j] && lines[j].includes('boxShadow:') && lines[j].includes('249, 115, 22')) {
        lines[j] = lines[j].replace('249, 115, 22', '22, 163, 74');
      }
    }
  }
}

// 2. Change A5 portrait to A4 portrait
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('size: A5 portrait;')) {
    lines[i] = lines[i].replace('size: A5 portrait;', 'size: A4 portrait;');
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Done!');
