import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Questions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form state for new question
  const [formData, setFormData] = useState({
    type: "Reading",
    text: "",
    image: "",
    audio: "",
    opt0: "",
    opt1: "",
    opt2: "",
    opt3: "",
    correctAnswer: "0"
  });

  useEffect(() => {
    const savedQuestions = JSON.parse(localStorage.getItem("questionBank")) || [];
    setQuestions(savedQuestions);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    const newQ = {
      id: Date.now(),
      type: formData.type,
      text: formData.text,
      image: formData.image,
      audio: formData.audio,
      options: [formData.opt0, formData.opt1, formData.opt2, formData.opt3],
      answer: parseInt(formData.correctAnswer)
    };

    const updatedQuestions = [...questions, newQ];
    setQuestions(updatedQuestions);
    localStorage.setItem("questionBank", JSON.stringify(updatedQuestions));

    // Reset Form
    setFormData({
      type: "Reading",
      text: "",
      image: "",
      audio: "",
      opt0: "",
      opt1: "",
      opt2: "",
      opt3: "",
      correctAnswer: "0"
    });
    setShowForm(false);
    alert("✅ Question Added Successfully to Question Bank!");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      const updatedQuestions = questions.filter(q => q.id !== id);
      setQuestions(updatedQuestions);
      localStorage.setItem("questionBank", JSON.stringify(updatedQuestions));
      alert("🗑️ Question Deleted Successfully!");
    }
  };

  const containerStyle = { display: "flex", minHeight: "100vh", backgroundColor: "#f1f5f9", fontFamily: "Arial, sans-serif" };
  const sidebarStyle = { width: "250px", backgroundColor: "#1e293b", color: "white", display: "flex", flexDirection: "column" };
  const sidebarHeader = { padding: "20px", fontSize: "22px", fontWeight: "bold", borderBottom: "1px solid #334155", textAlign: "center" };
  const linkStyle = { color: "#cbd5e1", textDecoration: "none", padding: "15px 20px", display: "block", borderBottom: "1px solid #334155" };
  const mainContentStyle = { flex: 1, display: "flex", flexDirection: "column" };
  const topbarStyle = { backgroundColor: "white", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" };
  const contentAreaStyle = { padding: "30px", flex: 1 };
  const tableStyle = { width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px", overflow: "hidden" };
  const thStyle = { backgroundColor: "#f8fafc", padding: "15px", textAlign: "left", borderBottom: "2px solid #e2e8f0", color: "#475569" };
  const tdStyle = { padding: "15px", borderBottom: "1px solid #e2e8f0", color: "#1e293b" };
  const inputStyle = { width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #cbd5e1", borderRadius: "5px", boxSizing: "border-box", backgroundColor: "white" };

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <div style={sidebarHeader}>SIGMA ADMIN</div>
        <div style={{ flex: 1, marginTop: "10px" }}>
          <Link to="/admin" style={linkStyle}>Dashboard</Link>
          <Link to="/admin/institutes" style={linkStyle}>Manage Institutes</Link>
          <Link to="/admin/students" style={linkStyle}>Manage Students</Link>
          <Link to="/admin/questions" style={{ ...linkStyle, backgroundColor: "#2563eb", color: "white" }}>Question Bank</Link>
          <Link to="/admin/settings" style={linkStyle}>Settings</Link>
        </div>
      </div>

      <div style={mainContentStyle}>
        <div style={topbarStyle}>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px" }}>Question Bank Management</h2>
          <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
        </div>

        <div style={contentAreaStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ color: "#475569", margin: 0, fontSize: "18px" }}>Total Questions: {questions.length}</h3>
            <button 
              onClick={() => setShowForm(!showForm)}
              style={{ backgroundColor: showForm ? "#ef4444" : "#16a34a", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
            >
              {showForm ? "Cancel" : "+ Add New Question"}
            </button>
          </div>

          {showForm && (
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: "20px", borderLeft: "5px solid #16a34a" }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#1e293b" }}>Create New Exam Question</h4>
              
              <form onSubmit={handleAddQuestion} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Question Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} style={inputStyle}>
                    <option value="Reading">Reading</option>
                    <option value="Listening">Listening</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Correct Answer</label>
                  <select name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} style={inputStyle}>
                    <option value="0">Option 1</option>
                    <option value="1">Option 2</option>
                    <option value="2">Option 3</option>
                    <option value="3">Option 4</option>
                  </select>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Question Text / Description</label>
                  <textarea name="text" value={formData.text} onChange={handleInputChange} required rows="3" style={{ ...inputStyle, resize: "vertical" }} placeholder="Enter question text here..." />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Image URL (Optional)</label>
                  <input type="text" name="image" value={formData.image} onChange={handleInputChange} style={inputStyle} placeholder="Paste image link" />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Audio URL (Optional)</label>
                  <input type="text" name="audio" value={formData.audio} onChange={handleInputChange} style={inputStyle} placeholder="Paste audio mp3 link" />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Option 1</label>
                  <input type="text" name="opt0" value={formData.opt0} onChange={handleInputChange} required style={inputStyle} placeholder="Option 1" />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Option 2</label>
                  <input type="text" name="opt1" value={formData.opt1} onChange={handleInputChange} required style={inputStyle} placeholder="Option 2" />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Option 3</label>
                  <input type="text" name="opt2" value={formData.opt2} onChange={handleInputChange} required style={inputStyle} placeholder="Option 3" />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", color: "#64748b" }}>Option 4</label>
                  <input type="text" name="opt3" value={formData.opt3} onChange={handleInputChange} required style={inputStyle} placeholder="Option 4" />
                </div>

                <div style={{ gridColumn: "span 2", marginTop: "10px" }}>
                  <button type="submit" style={{ backgroundColor: "#2563eb", color: "white", border: "none", padding: "12px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                    Save Question to Bank
                  </button>
                </div>
              </form>
            </div>
          )}

          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Question</th>
                <th style={thStyle}>Correct Answer</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ ...tdStyle, textAlign: "center", color: "#94a3b8" }}>No questions added in the bank yet.</td>
                </tr>
              ) : (
                questions.map((q, idx) => (
                  <tr key={q.id}>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: q.type === 'Listening' ? '#ede9fe' : '#dbeafe', color: q.type === 'Listening' ? '#6d28d9' : '#1e40af', padding: "5px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                        {q.type}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: "bold" }}>
                      {idx + 1}. {q.text}
                    </td>
                    <td style={{ ...tdStyle, color: "#16a34a", fontWeight: "bold" }}>
                      Option {q.answer + 1}: {q.options[q.answer]}
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        style={{ backgroundColor: "#fee2e2", color: "#991b1b", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
};

export default Questions;