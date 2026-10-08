const fs = require('fs');

let code = fs.readFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', 'utf8');

// 1. Remove Copy All Students Data button and replace with + Create Custom Package button
const copyBtnRegex = /\{students\.length > 0 && \([\s\S]*?<button\s+onClick=\{handleCopyAllStudents\}[\s\S]*?<\/button>\s*\)\}/;

const createPkgBtn = `<button
                  className="dynamic-btn"
                  onClick={() => setShowCreatePkgForm(!showCreatePkgForm)}
                  style={{
                    backgroundColor: showCreatePkgForm ? "#ef4444" : "#15803d",
                    color: showCreatePkgForm ? "#ffffff" : "#facc15",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                  }}
                >
                  {showCreatePkgForm ? "✕ Cancel Creation" : "+ Create Custom Package (By Your Own Choice)"}
                </button>`;

if (copyBtnRegex.test(code)) {
    code = code.replace(copyBtnRegex, createPkgBtn);
} else {
    console.error("Could not find Copy All Students button");
}

// 2. Remove the old + Create Custom Package button
const oldCreateBtnRegex = /<button[\s\S]*?onClick=\{\(\) => setShowCreatePkgForm\(!showCreatePkgForm\)\}[\s\S]*?<\/button>/;

// Note: since I already injected `createPkgBtn`, doing replace will match the first one (the new one).
// Let's do it carefully by finding the block `{/* Header with "+ Create Custom Package" button */}`
const headerBlockIdx = code.indexOf('{/* Header with "+ Create Custom Package" button */}');
if (headerBlockIdx !== -1) {
    let searchArea = code.substring(headerBlockIdx);
    // Find the button in searchArea
    const btnMatch = searchArea.match(/<button[\s\S]*?onClick=\{\(\) => setShowCreatePkgForm\(!showCreatePkgForm\)\}[\s\S]*?<\/button>/);
    if (btnMatch) {
        let newSearchArea = searchArea.substring(0, btnMatch.index) + searchArea.substring(btnMatch.index + btnMatch[0].length);
        code = code.substring(0, headerBlockIdx) + newSearchArea;
    } else {
        console.error("Could not find old create package button");
    }
} else {
    console.error("Could not find header block");
}

// 3. Add the 5th metric card for Total Students
const newCard = `
              <div className="dynamic-card" style={{ ...cardStyle, background: "linear-gradient(145deg, #8b5cf6, #6d28d9)", marginBottom: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", color: "#f1f5f9", fontWeight: "700", textTransform: "uppercase" }}>Total Students</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "22px", fontWeight: "800", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {students.length}
                </p>
                <span style={{ fontSize: "12px", color: "#e2e8f0" }}>Enrolled in {instituteName}</span>
              </div>
`;

const pricingRangeCardEndIdx = code.indexOf('Customizable per package</span>\n              </div>');
if (pricingRangeCardEndIdx !== -1) {
    let insertIdx = pricingRangeCardEndIdx + 'Customizable per package</span>\n              </div>'.length;
    code = code.substring(0, insertIdx) + newCard + code.substring(insertIdx);
} else {
    console.error("Could not find pricing range card");
}

fs.writeFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', code);
console.log("Successfully updated the UI.");
