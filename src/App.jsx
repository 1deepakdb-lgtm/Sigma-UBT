import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import InstituteSystem from "./pages/InstituteSystem";
import InstituteDashboard from "./pages/InstituteDashboard";
import ListeningAudio from "./pages/ListeningAudio";
import AdminNews from "./pages/AdminNews";
import Results from "./pages/Results";
import Settings from "./pages/AdminSettings";
import StudentDashboard from "./pages/StudentDashboard";
import StudentExam from "./pages/StudentExam";
import StudentResult from "./pages/StudentResult";
import AdminQuestionManager from "./pages/AdminQuestionManager";
import InstituteExamPreview from "./pages/InstituteExamPreview";
import AdminNotifications from "./pages/AdminNotifications";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/institutes" element={<InstituteSystem />} />
      <Route path="/admin/questions" element={<AdminQuestionManager />} />
      <Route path="/admin/listening" element={<ListeningAudio />} />
      <Route path="/admin/news" element={<AdminNews />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
      <Route path="/admin/results" element={<Results />} />
      <Route path="/admin/settings" element={<Settings />} />

      {/* Institute Routes */}
      <Route path="/institute" element={<InstituteDashboard />} />
      <Route path="/institute/questions" element={<AdminQuestionManager />} />
      <Route path="/institute/listening" element={<ListeningAudio />} />
      <Route path="/institute/news" element={<AdminNews />} />
      <Route path="/institute/results" element={<Results />} />
      <Route path="/institute/settings" element={<Settings />} />
      <Route path="/institute/exam-preview/:examId" element={<InstituteExamPreview />} />

      {/* Student Routes */}
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/exam/:examId" element={<StudentExam />} />
      <Route path="/student/result" element={<StudentResult />} />

      {/* Default Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;