'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DesktopAppDownloads from "@/components/DesktopAppDownloads";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: identifier.trim(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid username or password");
        setLoading(false);
        return;
      }

      // Store in localStorage for legacy/component local state reading
      localStorage.setItem("currentUser", data.user.name || data.user.username);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("currentRole", data.user.role);
      localStorage.setItem("sigma_current_user", JSON.stringify(data.user));
      localStorage.setItem("instituteLanguage", data.user.instituteLanguage || "both");

      let redirectUrl = "/";
      if (data.user.role === "admin") {
        localStorage.setItem("billingRole", "admin");
        redirectUrl = "/admin";
      } else if (data.user.role === "institute") {
        localStorage.setItem("currentInstitute", data.user.instituteName || data.user.name);
        localStorage.setItem("billingRole", "admin");
        redirectUrl = "/institute";
      } else if (data.user.role === "staff") {
        localStorage.setItem("currentInstitute", data.user.instituteName || "Language Institute");
        localStorage.setItem("billingRole", "user");
        redirectUrl = "/institute?tab=billing";
      } else {
        const studentPhone = data.user.phone || identifier.trim();
        localStorage.setItem("currentStudentPhone", studentPhone);
        localStorage.setItem("studentPhone", studentPhone);
        localStorage.setItem("currentStudentName", data.user.name || data.user.username);
        if (data.user.studentPackage) {
          localStorage.setItem("currentStudentPackage", data.user.studentPackage);
        }
        if (data.user.expiryDate) {
          localStorage.setItem("currentStudentExpiryDate", data.user.expiryDate);
        }
        if (data.user.instituteName) {
          localStorage.setItem("currentInstitute", data.user.instituteName);
        }
        redirectUrl = "/student";
      }

      window.location.replace(redirectUrl);
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "10px",
    opacity: loading ? 0.8 : 1
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img
          src="/examjk-logo.png"
          alt="ExamJK Logo"
          style={{
            width: "185px",
            height: "auto",
            margin: "0 auto 18px auto",
            display: "block",
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.06))"
          }}
        />

        <h3 style={{ color: "#1e293b", marginBottom: "20px", fontSize: "18px" }}>System Login</h3>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "14px"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ textAlign: "left", marginBottom: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              Phone Number / Username:
            </label>
          </div>
          <input
            type="text"
            placeholder="Enter Phone Number or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={inputStyle}
            autoComplete="username"
            required
          />

          <div style={{ textAlign: "left", marginBottom: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>
              Password:
            </label>
          </div>
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            autoComplete="current-password"
            required
          />

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "AUTHENTICATING..." : "LOGIN"}
          </button>
        </form>

        {/* Windows & macOS Desktop App Download Section */}
        <DesktopAppDownloads />
      </div>
    </div>
  );
}
