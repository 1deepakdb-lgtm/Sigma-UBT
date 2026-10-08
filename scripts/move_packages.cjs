const fs = require('fs');
let code = fs.readFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', 'utf8');

// Remove the button
code = code.replace(/<button onClick=\{\(\) => handleTabChange\("packages"\)\} style=\{getNavBtnStyle\("packages"\)\}>\s*UBT Packages\s*<\/button>/, '');

// Extract the packages block
let packagesBlockRegex = /\{\/\*\s*UBT PACKAGES & PRICING MANAGEMENT[^]*?\}\)\}\s*\n/;
// Wait, a better regex is needed. Let's just find the indexes.
let startIndex = code.indexOf('{/* UBT PACKAGES & PRICING MANAGEMENT (CREATED BY OWN CHOICE & CUSTOM PRICE) */}');
let endIndex = code.indexOf('{(activeTab === "students" || activeTab === "exams") && (');

if (startIndex !== -1 && endIndex !== -1) {
    let block = code.substring(startIndex, endIndex);
    // Remove it from current location
    code = code.substring(0, startIndex) + code.substring(endIndex);
    
    // Modify the condition
    block = block.replace('{activeTab === "packages" && (', '{true && (');
    
    // Insert it before UBT EXAM SETS UNDER INSIDE MANAGE STUDENTS
    let insertIndex = code.indexOf('{/* UBT EXAM SETS UNDER INSIDE MANAGE STUDENTS */}');
    if (insertIndex !== -1) {
        code = code.substring(0, insertIndex) + block + '\n              ' + code.substring(insertIndex);
        fs.writeFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', code);
        console.log('Successfully moved UBT packages section');
    } else {
        console.log('Could not find insert point');
    }
} else {
    console.log('Could not find start or end point');
}
