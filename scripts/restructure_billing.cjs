const fs = require('fs');

let code = fs.readFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', 'utf8');

// Step 1: Extract UBT Packages Block
// It starts with `{/* UBT PACKAGES & PRICING MANAGEMENT (CREATED BY OWN CHOICE & CUSTOM PRICE) */}`
// and ends right before `{/* UBT EXAM SETS UNDER INSIDE MANAGE STUDENTS */}`
const pkgStartStr = '{/* UBT PACKAGES & PRICING MANAGEMENT (CREATED BY OWN CHOICE & CUSTOM PRICE) */}';
const pkgEndStr = '{/* UBT EXAM SETS UNDER INSIDE MANAGE STUDENTS */}';
const pkgStartIdx = code.indexOf(pkgStartStr);
const pkgEndIdx = code.indexOf(pkgEndStr);

let packagesBlock = "";
if (pkgStartIdx !== -1 && pkgEndIdx !== -1) {
    packagesBlock = code.substring(pkgStartIdx, pkgEndIdx);
    // remove it from the students tab
    code = code.substring(0, pkgStartIdx) + code.substring(pkgEndIdx);
} else {
    console.error("Could not find packages block boundaries");
}

// Step 2: Extract Login Form
// It starts with `!isStudentsUnlocked ? (` and ends at the corresponding `) : (` before the `<div>` of My Enrolled Students.
const loginStartStr = '!isStudentsUnlocked ? (';
const loginEndStr = ') : (\n            <div>\n              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>';
const loginStartIdx = code.indexOf(loginStartStr);
const loginEndIdx = code.indexOf(loginEndStr);

let loginBlock = "";
if (loginStartIdx !== -1 && loginEndIdx !== -1) {
    // The login block starts after `!isStudentsUnlocked ? (` and ends before `) : (`
    loginBlock = code.substring(loginStartIdx + loginStartStr.length, loginEndIdx).trim();
    
    // Replace the entire `!isStudentsUnlocked ? ... : ( <div> ... )` with just `(!isStudentsUnlocked ? (<div style={{textAlign:"center", padding:"50px"}}>Please login from the Billing Dashboard to unlock Manage Students.</div>) : (<div> ... ))`
    // Actually, just leave the locked state message.
    let replacement = `!isStudentsUnlocked ? (
            <div style={{ textAlign: "center", padding: "50px", fontSize: "18px", color: "#64748b" }}>
               🔒 Please login from the <b>Billing</b> Dashboard to access Manage Students.
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>`;
    
    code = code.substring(0, loginStartIdx) + replacement + code.substring(loginEndIdx + loginEndStr.length);
} else {
    console.error("Could not find login block boundaries");
}

// Ensure the packagesBlock starts with a div (it currently starts with `{true && (` which needs to be removed if we use it without curly braces inside JSX)
if (packagesBlock.startsWith(pkgStartStr)) {
    packagesBlock = packagesBlock.substring(pkgStartStr.length).trim();
    if (packagesBlock.startsWith('{true && (')) {
        packagesBlock = packagesBlock.substring('{true && ('.length);
        // find the matching closing `)}` at the end
        let lastBracket = packagesBlock.lastIndexOf(')}');
        if (lastBracket !== -1) {
            packagesBlock = packagesBlock.substring(0, lastBracket).trim();
        }
    }
}

// The Dictionary Section isn't currently extracted, we just use `<DictionarySection />` component.

// Step 3: Replace `activeTab === "billing"` block
const billingStartStr = '{activeTab === "billing" && (';
const billingEndStr = ')}'; // Needs careful slicing
const billingStartIdx = code.indexOf(billingStartStr);

if (billingStartIdx !== -1) {
    // Find the end of this block
    let count = 0;
    let endIdx = -1;
    for (let i = billingStartIdx + billingStartStr.length - 1; i < code.length; i++) {
        if (code[i] === '(') count++;
        else if (code[i] === ')') {
            count--;
            if (count === 0 && code[i+1] === '}') {
                endIdx = i + 2;
                break;
            }
        }
    }
    
    if (endIdx !== -1) {
        const oldBillingBlock = code.substring(billingStartIdx, endIdx);
        
        // Define the new 3-column layout
        const newBillingDashboard = `
        {activeTab === "billing" && (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start", width: "100%" }}>
            
            {/* LEFT COLUMN: UBT Packages */}
            <div style={{ flex: "1 1 400px", maxWidth: "800px", minWidth: "300px" }}>
              {/* UBT PACKAGES OVERVIEW */}
              ${packagesBlock}
            </div>
            
            {/* MIDDLE COLUMN: Login Form */}
            <div style={{ flex: "1 1 350px", minWidth: "300px", maxWidth: "450px" }}>
              ${loginBlock}
            </div>
            
            {/* RIGHT COLUMN: Dictionary */}
            <div style={{ flex: "1 1 350px", minWidth: "300px", maxWidth: "450px", backgroundColor: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#1e3a8a", margin: 0, padding: "5px 15px", display: "inline-block", backgroundColor: "#f8fafc", borderRadius: "8px", border: "2px solid #e2e8f0" }}>
                  Dictionary
                </h2>
              </div>
              <DictionarySection />
            </div>
            
          </div>
        )}
        `;
        
        code = code.substring(0, billingStartIdx) + newBillingDashboard + code.substring(endIdx);
    } else {
        console.error("Could not find end of billing block");
    }
} else {
    console.error("Could not find start of billing block");
}

fs.writeFileSync('c:/Users/Administrator/Downloads/sigma-ubt/src/app/institute/page.jsx', code);
console.log("Transformation complete.");
