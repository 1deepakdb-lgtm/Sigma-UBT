'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DesktopAppDownloads from "@/components/DesktopAppDownloads";

export default function LoginPage() {
  const router = useRouter();

  // Active form view: 'login' | 'register'
  const [authMode, setAuthMode] = useState("login");

  // Login form fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Register form fields
  const [regName, setRegName] = useState("");
  const [regIdentifier, setRegIdentifier] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLanguage, setRegLanguage] = useState("both");

  // Google Sign-In modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize Google Identity Services if available in browser
  useEffect(() => {
    try {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse
          });
        }
      };
      document.body.appendChild(script);
      return () => {
        try {
          document.body.removeChild(script);
        } catch (e) {}
      };
    } catch (err) {}
  }, []);

  // Save session state to localStorage and redirect
  const handleAuthSuccess = (userData) => {
    localStorage.setItem("currentUser", userData.name || userData.username);
    localStorage.setItem("role", userData.role || "student");
    localStorage.setItem("currentRole", userData.role || "student");
    localStorage.setItem("sigma_current_user", JSON.stringify(userData));
    localStorage.setItem("instituteLanguage", userData.instituteLanguage || "both");

    let redirectUrl = "/";
    if (userData.role === "admin") {
      localStorage.setItem("billingRole", "admin");
      redirectUrl = "/admin";
    } else if (userData.role === "institute") {
      localStorage.setItem("currentInstitute", userData.instituteName || userData.name);
      localStorage.setItem("billingRole", "admin");
      redirectUrl = "/institute";
    } else if (userData.role === "staff") {
      localStorage.setItem("currentInstitute", userData.instituteName || "Language Institute");
      localStorage.setItem("billingRole", "user");
      redirectUrl = "/institute?tab=billing";
    } else {
      // Student role (self-registered or Google student)
      const studentPhone = userData.phone || userData.username;
      localStorage.setItem("currentStudentPhone", studentPhone);
      localStorage.setItem("studentPhone", studentPhone);
      localStorage.setItem("currentStudentName", userData.name || userData.username);
      if (userData.studentPackage && !userData.studentPackage.toLowerCase().includes("google") && !userData.studentPackage.toLowerCase().includes("free")) {
        localStorage.setItem("currentStudentPackage", userData.studentPackage);
      } else {
        localStorage.setItem("currentStudentPackage", "Full Set UBT");
      }
      if (userData.expiryDate) {
        localStorage.setItem("currentStudentExpiryDate", userData.expiryDate);
      }
      if (userData.instituteLanguage) {
        localStorage.setItem("instituteLanguage", userData.instituteLanguage);
      } else if (regLanguage) {
        localStorage.setItem("instituteLanguage", regLanguage);
      }
      if (userData.instituteName) {
        localStorage.setItem("currentInstitute", userData.instituteName);
      }
      redirectUrl = "/student";
    }

    window.location.replace(redirectUrl);
  };

  // 1. Existing User Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!identifier || !password) {
      setError("Please fill in both fields");
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

      handleAuthSuccess(data.user);
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Server connection failed. Please check your network and try again.");
      setLoading(false);
    }
  };

  // 2. New Student Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!regName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!regIdentifier.trim()) {
      setError("Please enter your mobile number or email.");
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          identifier: regIdentifier.trim(),
          password: regPassword,
          languageTrack: regLanguage
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        if (data.alreadyExists) {
          setAuthMode("login");
          setIdentifier(regIdentifier.trim());
        }
        setLoading(false);
        return;
      }

      setSuccessMsg("Account created! Granting free student materials access...");
      setTimeout(() => {
        handleAuthSuccess(data.user);
      }, 350);
    } catch (err) {
      console.error("Registration request failed:", err);
      setError("Server connection failed. Please try again.");
      setLoading(false);
    }
  };

  // 3. Google Sign-In Handler
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
          languageTrack: regLanguage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google Sign-In failed.");
        setLoading(false);
        return;
      }

      handleAuthSuccess(data.user);
    } catch (err) {
      setError("Google authentication failed. Please try again.");
      setLoading(false);
    }
  };

  // Manual Google One-Click Auth flow (works across Web, iOS, Android, macOS, Windows)
  const handleManualGoogleAuth = async (e) => {
    e.preventDefault();
    setError("");

    if (!googleEmail || !googleEmail.includes("@")) {
      setError("Please enter a valid Google email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleEmail.trim(),
          name: googleName.trim() || googleEmail.split("@")[0],
          languageTrack: regLanguage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google Sign-In failed.");
        setLoading(false);
        return;
      }

      setShowGoogleModal(false);
      handleAuthSuccess(data.user);
    } catch (err) {
      setError("Google Sign-In failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    if (window.google?.accounts?.id && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowGoogleModal(true);
        }
      });
    } else {
      setShowGoogleModal(true);
    }
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "20px"
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "36px 32px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "440px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14.5px",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
    outline: "none",
    transition: "border-color 0.15s ease"
  };

  const buttonStyle = {
    width: "100%",
    padding: "13px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    fontSize: "15px",
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "8px",
    letterSpacing: "0.3px",
    boxShadow: "0 4px 12px rgba(30, 58, 138, 0.2)",
    opacity: loading ? 0.8 : 1,
    transition: "all 0.15s ease"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* ExamJK Logo */}
        <img
          src="/examjk-logo.png"
          alt="ExamJK Logo"
          style={{
            width: "125px",
            height: "auto",
            margin: "0 auto 16px auto",
            display: "block"
          }}
        />

        {/* Tab Toggle: Sign In vs Create Free Account */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#f1f5f9",
            borderRadius: "10px",
            padding: "4px",
            marginBottom: "18px",
            gap: "4px"
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setError("");
              setSuccessMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: "8px",
              border: "none",
              fontSize: "13.5px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor: authMode === "login" ? "#ffffff" : "transparent",
              color: authMode === "login" ? "#1e3a8a" : "#64748b",
              boxShadow: authMode === "login" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("register");
              setError("");
              setSuccessMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: "8px",
              border: "none",
              fontSize: "13.5px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor: authMode === "register" ? "#ffffff" : "transparent",
              color: authMode === "register" ? "#1e3a8a" : "#64748b",
              boxShadow: authMode === "register" ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Google One-Click Continue Button */}
        <button
          type="button"
          onClick={handleGoogleButtonClick}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "11px 14px",
            borderRadius: "8px",
            border: "1.5px solid #cbd5e1",
            backgroundColor: "#ffffff",
            color: "#1e293b",
            fontSize: "14px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            marginBottom: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#94a3b8";
            e.currentTarget.style.backgroundColor = "#f8fafc";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.backgroundColor = "#ffffff";
          }}
        >
          {/* Official Google 'G' SVG Logo */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "14px 0 16px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
          <span style={{ padding: "0 10px", fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>
            Or with {authMode === "login" ? "credentials" : "phone / email"}
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
        </div>

        {/* Feedback banners */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "10px 12px",
              borderRadius: "8px",
              marginBottom: "14px",
              fontSize: "13px",
              fontWeight: "600",
              textAlign: "left"
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              padding: "10px 12px",
              borderRadius: "8px",
              marginBottom: "14px",
              fontSize: "13px",
              fontWeight: "600",
              textAlign: "left"
            }}
          >
            ✓ {successMsg}
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {authMode === "login" && (
          <form onSubmit={handleLogin} autoComplete="off">
            <div style={{ textAlign: "left", marginBottom: "5px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>
                Phone Number / Username:
              </label>
            </div>
            <input
              type="text"
              placeholder="e.g. 98XXXXXXXX or student"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={inputStyle}
              autoComplete="username"
              required
            />

            <div style={{ textAlign: "left", marginBottom: "5px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>
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
              {loading ? "AUTHENTICATING..." : "SIGN IN TO PORTAL"}
            </button>
          </form>
        )}

        {/* MODE 2: REGISTER FORM */}
        {authMode === "register" && (
          <form onSubmit={handleRegister} autoComplete="off">
            <div style={{ textAlign: "left", marginBottom: "5px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>
                Full Name:
              </label>
            </div>
            <input
              type="text"
              placeholder="Enter Your Full Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              style={inputStyle}
              required
            />

            <div style={{ textAlign: "left", marginBottom: "5px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>
                Mobile Number or Email:
              </label>
            </div>
            <input
              type="text"
              placeholder="e.g. 9812345678 or student@gmail.com"
              value={regIdentifier}
              onChange={(e) => setRegIdentifier(e.target.value)}
              style={inputStyle}
              required
            />

            <div style={{ textAlign: "left", marginBottom: "5px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>
                Create Password:
              </label>
            </div>
            <input
              type="password"
              placeholder="Create a Secure Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              style={inputStyle}
              required
            />

            <div style={{ textAlign: "left", marginBottom: "5px" }}>
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>
                Select Study Language:
              </label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "14px" }}>
              {[
                { key: "both", label: "🌐 Both" },
                { key: "korean", label: "🇰🇷 Korean" },
                { key: "japanese", label: "🇯🇵 Japanese" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRegLanguage(opt.key)}
                  style={{
                    padding: "8px 4px",
                    borderRadius: "6px",
                    border: regLanguage === opt.key ? "1.5px solid #16a34a" : "1px solid #cbd5e1",
                    backgroundColor: regLanguage === opt.key ? "#dcfce7" : "#ffffff",
                    color: regLanguage === opt.key ? "#166534" : "#475569",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              style={{
                ...buttonStyle,
                backgroundColor: "#16a34a",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)"
              }}
              disabled={loading}
            >
              {loading ? "CREATING FREE ACCOUNT..." : "CREATE ACCOUNT & ACCESS FREE MATERIALS"}
            </button>
          </form>
        )}

        {/* Windows, macOS, Android, and iOS App Downloads */}
        <DesktopAppDownloads />
      </div>

      {/* Google Email Sign-In Modal */}
      {showGoogleModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: "20px"
          }}
          onClick={() => setShowGoogleModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "420px",
              width: "100%",
              padding: "26px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              textAlign: "left"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0f172a" }}>
                  Sign in with Google
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                  fontWeight: "800",
                  color: "#475569"
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
              Sign in with your Google Account for instant student access to all free textbooks, audio readers, and dictionaries.
            </p>

            <form onSubmit={handleManualGoogleAuth}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>
                  Google Email Address:
                </label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  style={inputStyle}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "5px" }}>
                  Full Name (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Study Track Selection at Sign-up */}
              <div style={{ marginBottom: "18px", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Select Study Track (अध्ययन ट्र्याक):
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    { key: "both", label: "🌐 Both" },
                    { key: "korean", label: "🇰🇷 Korean" },
                    { key: "japanese", label: "🇯🇵 Japanese" }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setRegLanguage(opt.key)}
                      style={{
                        padding: "8px 4px",
                        borderRadius: "6px",
                        border: regLanguage === opt.key ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                        backgroundColor: regLanguage === opt.key ? "#eff6ff" : "#ffffff",
                        color: regLanguage === opt.key ? "#1d4ed8" : "#475569",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  style={{
                    padding: "11px 16px",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "Signing in..." : "Continue as Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
