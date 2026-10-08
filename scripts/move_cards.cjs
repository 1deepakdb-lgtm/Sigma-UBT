const fs = require('fs');

let code = fs.readFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', 'utf8');

// The block to extract
const startComment = '{/* Top Metrics Cards */}';
const endBlock = '</div>'; // It's a grid div with 4 children. We will find it using regex or parsing.
// Actually, it's easier to find the start and end by index.
const startIdx = code.indexOf(startComment);

// Find the end of the <div style={{ display: "grid"...> block
let searchStart = code.indexOf('<div style={{ display: "grid"', startIdx);
let count = 0;
let endIdx = -1;
for (let i = searchStart; i < code.length; i++) {
    if (code.substr(i, 4) === '<div') {
        count++;
    } else if (code.substr(i, 5) === '</div') {
        count--;
        if (count === 0) {
            endIdx = i + 6; // include `</div>`
            break;
        }
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    let block = code.substring(startIdx, endIdx);
    
    // Remove the block from its current place
    code = code.substring(0, startIdx) + code.substring(endIdx);
    
    // Find the insertion point: right after `) : (\n            <div>\n`
    const insertAfter = ') : (\n            <div>';
    const insertIdx = code.indexOf(insertAfter);
    
    if (insertIdx !== -1) {
        code = code.substring(0, insertIdx + insertAfter.length) + '\n              ' + block + '\n' + code.substring(insertIdx + insertAfter.length);
        fs.writeFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', code);
        console.log("Moved Top Metrics Cards to the top");
    } else {
        console.log("Could not find insertion point");
    }
} else {
    console.log("Could not find block boundaries");
}
