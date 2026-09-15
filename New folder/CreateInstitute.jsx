import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EXAM_PACKAGES = [
  "10 Set UBT",
  "20 Set UBT",
  "30 Set UBT",
  "50 Set UBT",
  "80 Set UBT",
  "100 Set UBT",
  "150 Set UBT",
  "200 Set UBT",
  "30 Set Chapter UBT",
  "60 Set Chapter Final Set UBT",
  "Full Set UBT",
];

const SUBSCRIPTION_PACKAGES = [
  { label: "1 Month", months: 1 },
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 },
];

function calculateExpireDate(entryDate, months) {
  const date = new Date(entryDate);

  date.setMonth(date.getMonth() + months);

  return date.toISOString().split("T")[0];
}

export default function CreateInstitute() {
  const navigate = useNavigate();

  const [instituteName, setInstituteName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [subscription, setSubscription] = useState("1 Month");
  const [examPackage, setExamPackage] = useState("10 Set UBT");

  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [message, setMessage] = useState("");

  const selectedPackage = SUBSCRIPTION_PACKAGES.find(
    (item) => item.label === subscription
  );

  const expireDate = calculateExpireDate(
    entryDate,
    selectedPackage?.months || 1
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("");

    // Institute name validation
    if (!instituteName.trim()) {
      setMessage("Please enter institute name.");
      return;
    }

    // Username validation
    if (!username.trim()) {
      setMessage("Please enter username.");
      return;
    }

    // Password validation
    if (!password.trim()) {
      setMessage("Please enter password.");
      return;
    }

    // Get existing institutes
    const existingInstitutes =
      JSON.parse(localStorage.getItem("sigmaInstitutes")) || [];

    // Check duplicate username
    const usernameExists = existingInstitutes.some(
      (item) =>
        item.username &&
        item.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (usernameExists) {
      setMessage("This username already exists.");
      return;
    }

    // New institute
    const newInstitute = {
      id: Date.now(),

      instituteName: instituteName.trim(),

      username: username.trim(),

      password: password,

      subscription: subscription,

      examPackage: examPackage,

      entryDate: entryDate,

      expireDate: expireDate,

      createdAt: new Date().toISOString(),
    };

    // Update institute list
    const updatedInstitutes = [
      ...existingInstitutes,
      newInstitute,
    ];

    localStorage.setItem(
      "sigmaInstitutes",
      JSON.stringify(updatedInstitutes)
    );

    alert("Institute created successfully!");

    navigate("/admin/institutes");
  };

  return (
    <div
      className="create-institute-page"
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="create-institute-card"
        style={{
          width: "100%",
          maxWidth: "650px",
          background: "#ffffff",
          borderRadius: "18px",
          padding: "35px",
          boxSizing: "border-box",
          boxShadow: "0 10px 35px rgba(0, 0, 0, 0.10)",
          border: "1px solid #e5eaf0",
        }}
      >
        {/* ================= HEADER ================= */}

        <div
          className="create-header"
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <img
            src="/sigma-logo.png"
            alt="Sigma Education"
            className="create-logo"
            style={{
              width: "140px",
              height: "140px",
              objectFit: "contain",
              display: "block",
              margin: "0 auto 15px",
            }}
          />

          <h1
            style={{
              margin: "0",
              fontSize: "30px",
              fontWeight: "700",
              color: "#172554",
            }}
          >
            Create Institute
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Create a new institute account
          </p>
        </div>

        {/* ================= FORM ================= */}

        <form onSubmit={handleSubmit}>

          {/* Institute Name */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Institute Name
            </label>

            <input
              type="text"
              placeholder="Enter Institute Name"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Username */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Username
            </label>

            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Subscription */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Subscription Package
            </label>

            <select
              value={subscription}
              onChange={(e) => setSubscription(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "15px",
                background: "#fff",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            >
              {SUBSCRIPTION_PACKAGES.map((item) => (
                <option
                  key={item.label}
                  value={item.label}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Package */}

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#334155",
              }}
            >
              Exam Package
            </label>

            <select
              value={examPackage}
              onChange={(e) => setExamPackage(e.target.value)}
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "15px",
                background: "#fff",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            >
              {EXAM_PACKAGES.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Date Row */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginBottom: "20px",
            }}
          >

            {/* Entry Date */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                }}
              >
                Entry Date
              </label>

              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Expire Date */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                }}
              >
                Expire Date
              </label>

              <input
                type="date"
                value={expireDate}
                readOnly
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  background: "#f1f5f9",
                  color: "#475569",
                  boxSizing: "border-box",
                }}
              />
            </div>

          </div>

          {/* Error Message */}

          {message && (
            <div
              className="form-error"
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "20px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {message}
            </div>
          )}

          {/* Buttons */}

          <div
            className="form-buttons"
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "25px",
            }}
          >

            <button
              type="submit"
              className="create-button"
              style={{
                flex: "1",
                height: "50px",
                border: "none",
                borderRadius: "10px",
                background: "#1d4ed8",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              CREATE INSTITUTE
            </button>

            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/admin/institutes")}
              style={{
                flex: "1",
                height: "50px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "#ffffff",
                color: "#334155",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Back to Institutes
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}