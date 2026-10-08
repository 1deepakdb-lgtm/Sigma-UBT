const fs = require('fs');

let code = fs.readFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', 'utf8');

// The block to replace
const startBlock = '<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>';
const newStartBlock = '<div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", marginBottom: "24px" }}>';

let blockIdx = code.indexOf(startBlock);

if (blockIdx !== -1) {
    // Find the end of this grid block
    let endIdx = -1;
    let openCount = 0;
    
    for (let i = blockIdx; i < code.length; i++) {
        if (code.substr(i, 4) === '<div') {
            openCount++;
        } else if (code.substr(i, 5) === '</div') {
            openCount--;
            if (openCount === 0) {
                endIdx = i + 6; // Include `</div>`
                break;
            }
        }
    }
    
    if (endIdx !== -1) {
        let block = code.substring(blockIdx, endIdx);
        // Replace the start block
        block = block.replace(startBlock, newStartBlock);
        
        // Add padding: "12px" to all cards in this block
        block = block.replace(/justifyContent:\s*"center"\s*\}\}/g, 'justifyContent: "center", padding: "12px 14px" }}');
        
        // Reduce the number sizes slightly to fit better
        block = block.replace(/fontSize:\s*"22px"/g, 'fontSize: "20px"');
        block = block.replace(/fontSize:\s*"18px"/g, 'fontSize: "16px"');
        
        // Reduce subtitle sizes
        block = block.replace(/fontSize:\s*"12px"/g, 'fontSize: "11px"');
        
        code = code.substring(0, blockIdx) + block + code.substring(endIdx);
        
        fs.writeFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', code);
        console.log("Successfully compressed metrics cards into one line.");
    } else {
        console.error("Could not find end of grid block.");
    }
} else {
    console.error("Could not find grid start block.");
}
