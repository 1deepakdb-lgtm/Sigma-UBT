import React, { useState } from "react";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";



// Set worker for PDF.js

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;



const AdminQuestionUpload = () => {

  const [questionType, setQuestionType] = useState("Reading");

  const [correctAnswer, setCorrectAnswer] = useState("0");

  const [mainHeading, setMainHeading] = useState("");

  const [questionHeading, setQuestionHeading] = useState("");

  const [description, setDescription] = useState("");

  const [options, setOptions] = useState(["", "", "", ""]);

  const [image, setImage] = useState("");



  // Function to handle PDF Upload and Auto-Extract Text

  const handlePdfUpload = async (e) => {

    const file = e.target.files[0];

    if (!file) return;



    const reader = new FileReader();

    reader.onload = async function () {

      try {

        const typedarray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

       

        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {

          const page = await pdf.getPage(i);

          const textContent = await page.getTextContent();

          const pageText = textContent.items.map((item) => item.str).join(" ");

          extractedText += pageText + "\n";

        }



        // Auto-populate fields based on extracted PDF content

        setDescription(extractedText.substring(0, 500)); // Sample mapping to description

        setMainHeading("PDF सेलेक्ट गरिएको मुख्य शीर्षक");

        alert("✅ PDF सेलेक्ट गरेर सफलतापूर्वक डेटा अटो-फेच (Auto-fetch) भयो!");

      } catch (error) {

        console.error("Error reading PDF:", error);

        alert("❌ PDF फाइल διαβάउन सकिएन!");

      }

    };

    reader.readAsArrayBuffer(file);

  };



  const handleOptionChange = (index, value) => {

    const newOptions = [...options];

    newOptions[index] = value;

    setOptions(newOptions);

  };



  const handleSaveQuestion = (e) => {

    e.preventDefault();

    const newQ = {

      id: Date.now(),

      type: questionType,

      mainHeading,

      questionHeading,

      description,

      image,

      options,

      answer: Number(correctAnswer)

    };



    const existingQuestions = JSON.parse(localStorage.getItem("questionBank")) || [];

    localStorage.setItem("questionBank", JSON.stringify([...existingQuestions, newQ]));

    alert("✅ Question Saved Successfully!");

  };



  return (

    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "25px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontFamily: "Arial" }}>

      <h3 style={{ color: "#1e3a8a", marginTop: 0 }}>Add New Question with PDF Auto-Fetch</h3>



      {/* PDF Upload Box */}

      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: "6px", textAlign: "center" }}>

        <label style={{ fontWeight: "bold", color: "#0284c7", cursor: "pointer", display: "block" }}>

          📄 Upload Question PDF (Auto-Extract)

          <input type="file" accept="application/pdf" onChange={handlePdfUpload} style={{ display: "none" }} />

        </label>

        <span style={{ fontSize: "12px", color: "#64748b" }}>PDF फाइल अपलोड गरेपछि यसले स्वतः टेक्स्ट फेच गर्नेछ।</span>

      </div>



      <form onSubmit={handleSaveQuestion}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>

          <div>

            <label style={{ fontSize: "13px", fontWeight: "bold" }}>Question Type</label>

            <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>

              <option value="Reading">Reading</option>

              <option value="Listening">Listening</option>

            </select>

          </div>

          <div>

            <label style={{ fontSize: "13px", fontWeight: "bold" }}>Correct Answer</label>

            <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1" }}>

              <option value="0">Option 1</option>

              <option value="1">Option 2</option>

              <option value="2">Option 3</option>

              <option value="3">Option 4</option>

            </select>

          </div>

        </div>



        <div style={{ marginBottom: "15px" }}>

          <label style={{ fontSize: "13px", fontWeight: "bold" }}>Main Heading</label>

          <input type="text" value={mainHeading} onChange={(e) => setMainHeading(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Enter main heading" />

        </div>



        <div style={{ marginBottom: "15px" }}>

          <label style={{ fontSize: "13px", fontWeight: "bold" }}>Question Heading</label>

          <input type="text" value={questionHeading} onChange={(e) => setQuestionHeading(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Enter question heading" />

        </div>



        <div style={{ marginBottom: "15px" }}>

          <label style={{ fontSize: "13px", fontWeight: "bold" }}>Description / Text</label>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Extracted or manual text..." />

        </div>



        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>

          {options.map((opt, idx) => (

            <div key={idx}>

              <label style={{ fontSize: "12px", fontWeight: "bold" }}>Option {idx + 1}</label>

              <input type="text" value={opt} onChange={(e) => handleOptionChange(idx, e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder={`Option ${idx + 1}`} />

            </div>

          ))}

        </div>



        <button type="submit" style={{ width: "100%", backgroundColor: "#0284c7", color: "white", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>

          Save Question

        </button>

      </form>

    </div>

  );

};



export default AdminQuestionUpload; 

