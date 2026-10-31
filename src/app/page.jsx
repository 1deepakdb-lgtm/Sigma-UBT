'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DesktopAppDownloads from "@/components/DesktopAppDownloads";

export default function LoginPage() {
  const router = useRouter();

  // Active form view: 'login' | 'register' | 'reset'
  const [authMode, setAuthMode] = useState("login");

  // Login form fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Register form fields
  const [regName, setRegName] = useState("");
  const [regIdentifier, setRegIdentifier] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLanguage, setRegLanguage] = useState("both");

  // Reset password form fields (Super Admin, Institute, Student, Staff)
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1 = lookup, 2 = verify & set
  const [resetAccountInfo, setResetAccountInfo] = useState(null);
  const [resetCodeInput, setResetCodeInput] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

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
        localStorage.setItem("currentStudentPackage", "Free Student Access");
        localStorage.setItem("isFreeStudent", "true");
        localStorage.setItem("accountValidity", "Lifetime");
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

  // Password Strength Evaluator for Super Admin & Institute
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'Required', percent: '0%', color: '#94a3b8' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, text: 'Weak', percent: '33%', color: '#ef4444' };
    if (score <= 4) return { score, text: 'Good', percent: '66%', color: '#f59e0b' };
    return { score, text: 'Strong', percent: '100%', color: '#16a34a' };
  };

  // Step 1: Look up account for reset
  const handleResetLookup = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!resetIdentifier.trim()) {
      setError("Please enter your Phone number, Username, or ID");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lookup",
          identifier: resetIdentifier.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No matching account found");
        setLoading(false);
        return;
      }

      setResetAccountInfo(data);
      setResetCodeInput(data.verificationCode || "");
      setResetStep(2);
      setError("");
    } catch (err) {
      console.error("Password reset lookup error:", err);
      setError("Failed to connect to server. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify code and update password
  const handleResetSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!resetNewPassword) {
      setError("Please enter a new password");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (resetAccountInfo?.isStrongPasswordRequired) {
      if (resetNewPassword.length < 8) {
        setError("Super Admin & Institute passwords must be at least 8 characters long.");
        return;
      }
      if (!/[a-zA-Z]/.test(resetNewPassword) || !/[0-9]/.test(resetNewPassword)) {
        setError("Strong password required: Must contain both letters and numbers.");
        return;
      }
    } else {
      if (resetNewPassword.length < 4) {
        setError("Password must be at least 4 characters long.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          resetToken: resetAccountInfo?.resetToken,
          code: resetCodeInput.trim(),
          newPassword: resetNewPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccessMsg("Password reset successfully! Please sign in with your new password.");
      setIdentifier(resetAccountInfo?.username || resetIdentifier);
      setPassword("");
      setResetStep(1);
      setResetAccountInfo(null);
      setResetNewPassword("");
      setResetConfirmPassword("");
      setResetCodeInput("");
      setAuthMode("login");
    } catch (err) {
      console.error("Password reset update error:", err);
      setError("Failed to update password. Please try again.");
    } finally {
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
    padding: "10px"
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "20px 22px",
    borderRadius: "14px",
    boxShadow: "0 10px 28px -5px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
    boxSizing: "border-box"
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    marginBottom: "9px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13.5px",
    boxSizing: "border-box",
    backgroundColor: "#f8fafc",
    outline: "none",
    transition: "border-color 0.15s ease"
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "6px",
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
            width: "100px",
            height: "auto",
            margin: "0 auto 10px auto",
            display: "block"
          }}
        />

        {/* Tab Toggle: Login vs Sign Up vs Forgot Password */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#f1f5f9",
            borderRadius: "10px",
            padding: "4px",
            marginBottom: "12px",
            gap: "5px",
            border: "1.5px solid #e2e8f0"
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
              padding: "8px 6px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundColor: authMode === "login" ? "#2563eb" : "transparent",
              backgroundImage: authMode === "login" ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "none",
              color: authMode === "login" ? "#ffffff" : "#64748b",
              boxShadow: authMode === "login" ? "0 4px 14px rgba(37, 99, 235, 0.35)" : "none"
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
              padding: "8px 6px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12.5px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundColor: authMode === "register" ? "#16a34a" : "transparent",
              backgroundImage: authMode === "register" ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" : "none",
              color: authMode === "register" ? "#ffffff" : "#64748b",
              boxShadow: authMode === "register" ? "0 4px 14px rgba(22, 163, 74, 0.35)" : "none"
            }}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("reset");
              if (identifier) setResetIdentifier(identifier);
              setError("");
              setSuccessMsg("");
            }}
            style={{
              flex: 1.15,
              padding: "8px 6px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              backgroundColor: authMode === "reset" ? "#4f46e5" : "transparent",
              backgroundImage: authMode === "reset" ? "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" : "none",
              color: authMode === "reset" ? "#ffffff" : "#64748b",
              boxShadow: authMode === "reset" ? "0 4px 14px rgba(79, 70, 229, 0.35)" : "none"
            }}
          >
            Forgot Password
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
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1.5px solid #cbd5e1",
            backgroundColor: "#ffffff",
            color: "#1e293b",
            fontSize: "13px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            marginBottom: "10px",
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
          <svg width="16" height="16" viewBox="0 0 24 24">
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
        <div style={{ display: "flex", alignItems: "center", margin: "8px 0 10px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
          <span style={{ padding: "0 8px", fontSize: "10.5px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", marginTop: "-3px" }}>
              <span style={{ fontSize: "11px", color: "#64748b" }}>Super Admin · Institute · Student</span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("reset");
                  if (identifier) setResetIdentifier(identifier);
                  setError("");
                  setSuccessMsg("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  padding: "0 2px",
                  textDecoration: "underline"
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "AUTHENTICATING..." : "SIGN IN"}
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
                { key: "korean", label: "🇰🇷 Korean" },
                { key: "japanese", label: "🇯🇵 Japanese" },
                { key: "both", label: "🌐 Both" }
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setRegLanguage(opt.key)}
                  style={{
                    padding: "9px 6px",
                    borderRadius: "8px",
                    border: regLanguage === opt.key ? "1.5px solid #16a34a" : "1px solid #cbd5e1",
                    backgroundColor: regLanguage === opt.key ? "#16a34a" : "#ffffff",
                    backgroundImage: regLanguage === opt.key ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" : "none",
                    color: regLanguage === opt.key ? "#ffffff" : "#475569",
                    fontWeight: "800",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    boxShadow: regLanguage === opt.key ? "0 4px 12px rgba(22, 163, 74, 0.35)" : "none",
                    transition: "all 0.18s ease"
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
              {loading ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>
        )}

        {/* MODE 3: FORGOT / RESET PASSWORD FORM (ALL ACCOUNTS) */}
        {authMode === "reset" && (
          <div>
            {/* Header info */}
            <div style={{ marginBottom: "14px", textAlign: "center" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                background: "#eef2ff",
                color: "#4338ca",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "800",
                marginBottom: "4px"
              }}>
                <span>🔑 Reset Account Password</span>
              </div>
              <p style={{ margin: 0, fontSize: "11.5px", color: "#64748b" }}>
                Self-Service Password Reset for All Accounts
              </p>
            </div>

            {/* STEP 1: Search Account */}
            {resetStep === 1 && (
              <form onSubmit={handleResetLookup} autoComplete="off">
                <div style={{ textAlign: "left", marginBottom: "5px" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155" }}>
                    Phone Number, Username, or ID:
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. admin, sigma, or 98XXXXXXXX"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  style={inputStyle}
                  autoComplete="username"
                  required
                />
                <div style={{ textAlign: "left", fontSize: "11px", color: "#64748b", marginBottom: "14px", lineHeight: "1.4" }}>
                  💡 Enter <strong>admin</strong> for Super Admin, institute username for Institute, or mobile number for Student.
                </div>

                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#4f46e5",
                    backgroundImage: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
                    marginBottom: "10px"
                  }}
                  disabled={loading}
                >
                  {loading ? "SEARCHING ACCOUNT..." : "FIND ACCOUNT & VERIFY"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setError("");
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  ← Back to Sign In
                </button>
              </form>
            )}

            {/* STEP 2: Verify & Enter New Password */}
            {resetStep === 2 && resetAccountInfo && (
              <form onSubmit={handleResetSubmit} autoComplete="off">
                {/* Account details card */}
                <div style={{
                  background: "#f8fafc",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "12px",
                  textAlign: "left"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#0f172a" }}>
                      {resetAccountInfo.name || resetAccountInfo.username}
                    </span>
                    <span style={{
                      fontSize: "10.5px",
                      fontWeight: "800",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      background: resetAccountInfo.role === "admin" ? "#fef2f2" : resetAccountInfo.role === "institute" ? "#eef2ff" : "#f0fdf4",
                      color: resetAccountInfo.role === "admin" ? "#991b1b" : resetAccountInfo.role === "institute" ? "#4338ca" : "#16a34a",
                      border: `1px solid ${resetAccountInfo.role === "admin" ? "#fecaca" : resetAccountInfo.role === "institute" ? "#c7d2fe" : "#bbf7d0"}`
                    }}>
                      {resetAccountInfo.role === "admin" ? "SUPER ADMIN" : resetAccountInfo.role === "institute" ? "INSTITUTE" : resetAccountInfo.role.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                    Account: <strong style={{ color: "#334155" }}>@{resetAccountInfo.username}</strong>
                    {resetAccountInfo.maskedPhone && (
                      <span style={{ marginLeft: "8px" }}>· Phone: <strong style={{ color: "#334155" }}>{resetAccountInfo.maskedPhone}</strong></span>
                    )}
                  </div>
                </div>

                {/* Security Verification Code Box */}
                <div style={{
                  background: "#f0fdf4",
                  border: "1.5px dashed #86efac",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  marginBottom: "12px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "10.5px", color: "#166534", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Security Verification Code
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "900", letterSpacing: "5px", color: "#15803d", margin: "3px 0" }}>
                    {resetAccountInfo.verificationCode}
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#166534" }}>
                    Enter this code (or your registered phone) below
                  </div>
                </div>

                <div style={{ textAlign: "left", marginBottom: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                    Verification Code / Phone:
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit code or registered phone"
                  value={resetCodeInput}
                  onChange={(e) => setResetCodeInput(e.target.value)}
                  style={inputStyle}
                  required
                />

                {/* New Password input */}
                <div style={{ textAlign: "left", marginBottom: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                    New Password:
                  </label>
                </div>
                <input
                  type="password"
                  placeholder={resetAccountInfo.isStrongPasswordRequired ? "Min 8 chars (e.g. Pass@2026)" : "Min 4 characters"}
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  style={inputStyle}
                  required
                />

                {/* Password strength indicator for Super Admin & Institute */}
                {resetAccountInfo.isStrongPasswordRequired && resetNewPassword && (() => {
                  const strength = getPasswordStrength(resetNewPassword);
                  return (
                    <div style={{ textAlign: "left", marginBottom: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", marginBottom: "3px" }}>
                        <span style={{ color: "#475569" }}>Password Strength:</span>
                        <span style={{ color: strength.color }}>{strength.text}</span>
                      </div>
                      <div style={{ height: "4px", width: "100%", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: strength.percent, background: strength.color, transition: "all 0.2s ease" }} />
                      </div>
                      <span style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px", display: "block" }}>
                        🛡️ Super Admin & Institute requirement: min 8 characters with letters & numbers.
                      </span>
                    </div>
                  );
                })()}

                {/* Confirm Password input */}
                <div style={{ textAlign: "left", marginBottom: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                    Confirm New Password:
                  </label>
                </div>
                <input
                  type="password"
                  placeholder="Re-enter your new password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  style={inputStyle}
                  required
                />

                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#4f46e5",
                    backgroundImage: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
                    marginBottom: "8px"
                  }}
                  disabled={loading}
                >
                  {loading ? "SAVING NEW PASSWORD..." : "UPDATE & SAVE PASSWORD"}
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep(1);
                      setError("");
                    }}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      color: "#475569",
                      cursor: "pointer"
                    }}
                  >
                    ← Search Other Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setError("");
                    }}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      color: "#2563eb",
                      cursor: "pointer"
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
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
                    { key: "korean", label: "🇰🇷 Korean" },
                    { key: "japanese", label: "🇯🇵 Japanese" },
                    { key: "both", label: "🌐 Both" }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setRegLanguage(opt.key)}
                      style={{
                        padding: "9px 6px",
                        borderRadius: "8px",
                        border: regLanguage === opt.key ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                        backgroundColor: regLanguage === opt.key ? "#2563eb" : "#ffffff",
                        backgroundImage: regLanguage === opt.key ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "none",
                        color: regLanguage === opt.key ? "#ffffff" : "#475569",
                        fontWeight: "800",
                        fontSize: "12.5px",
                        cursor: "pointer",
                        boxShadow: regLanguage === opt.key ? "0 4px 12px rgba(37, 99, 235, 0.35)" : "none",
                        transition: "all 0.18s ease"
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
