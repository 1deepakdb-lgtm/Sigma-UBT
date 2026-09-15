import { Header } from "../components";

export default function Settings() {
  function clearDemo() {
    if (window.confirm("Clear all local demo data? This cannot be undone.")) {
      localStorage.clear();
      window.location.href = "/";
    }
  }
  
  return (
    <>
      <Header title="Settings" />
      <main className="page-container">
        <div className="page-heading left">
          <h1>System Settings</h1>
          <p>Configure system preferences</p>
        </div>
        
        <div className="student-form-card" style={{ textAlign: "left" }}>
          <h2 style={{ color: "#17469b" }}>System Information</h2>
          <p><strong>Version:</strong> Sigma UBT 1.0</p>
          <p><strong>Storage:</strong> Browser localStorage (demo/development mode)</p>
          <p><strong>Data:</strong> All data is stored locally in your browser</p>
          <br />
          <button className="danger-btn" onClick={clearDemo}>Reset All Demo Data</button>
          <p style={{ fontSize: "12px", color: "#777", marginTop: "10px" }}>
            Warning: This will permanently delete all institutes, students, questions, and results.
          </p>
        </div>
      </main>
    </>
  );
}