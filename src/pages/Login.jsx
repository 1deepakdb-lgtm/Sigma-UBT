import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    const trimmedId = identifier.trim().toLowerCase();

    // 1. Admin Direct Check (Guaranteed login)
    const storedAdminPass = localStorage.getItem("adminPassword") || "admin123";
    if ((trimmedId === "admin" || trimmedId === "9868736491") && (password === storedAdminPass || password === "admin123")) {
      localStorage.setItem("currentUser", identifier);
      navigate("/admin");
      return;
    }

    // 2. Institute Login Check
    const institutes = JSON.parse(localStorage.getItem("institutes")) || [];
    const foundInst = institutes.find((inst) => (inst.phone === identifier || inst.name?.toLowerCase() === trimmedId) && inst.password === password);
    
    if (foundInst) {
      localStorage.setItem("currentInstitute", foundInst.name);
      navigate("/institute");
      return;
    }

    // 3. Student Login Check
    const studentsMap = JSON.parse(localStorage.getItem("users")) || {};
    const allInstitutesStudents = JSON.parse(localStorage.getItem("instituteStudents")) || {};
    
    let validStudentName = "";
    let validStudentPhone = identifier;
    if (studentsMap[identifier] && studentsMap[identifier].password === password) {
      validStudentName = studentsMap[identifier].name;
      validStudentPhone = studentsMap[identifier].phone || identifier;
    } else {
      Object.values(allInstitutesStudents).forEach((studentsList) => {
        const match = studentsList.find(
          (s) => (s.phone === identifier || s.name?.toLowerCase() === trimmedId) && s.password === password
        );
        if (match) {
          validStudentName = match.name;
          validStudentPhone = match.phone || identifier;
        }
      });
    }

    if (validStudentName) {
      localStorage.setItem("currentUser", validStudentName);
      localStorage.setItem("currentStudentPhone", validStudentPhone);
      navigate("/student");
      return;
    }

    setError("Invalid username or password");
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "Arial, sans-serif",
    padding: "20px"
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    border: "1px solid #e2e8f0"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        
        <h2 style={{ color: "#1e3a8a", margin: "0 0 5px 0", fontSize: "26px" }}>SIGMA UBT</h2>
        <p style={{ color: "#64748b", margin: "0 0 25px 0", fontSize: "14px" }}>EPS-TOPIK UBT Examination System</p>

        <h3 style={{ color: "#1e293b", marginBottom: "20px", fontSize: "18px" }}>System Login</h3>

        {error && (
          <div style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "6px", marginBottom: "15px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} autoComplete="off">
          <input 
            type="text" 
            placeholder="Enter ID / Phone / Username" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={inputStyle}
            autoComplete="off"
            required
          />

          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="current-password"
            required
          />

          <button type="submit" style={buttonStyle}>
            LOGIN
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;