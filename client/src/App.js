import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScannerPage from "./page/ScannerPage";
import AdminDashboard from "./page/AdminDashboard";
import StudentManagement from "./page/StudentManagement";
import TeacherManagement from "./page/TeacherManagement";
import GenerateQR from "./page/GenerateQR";
import AttendanceReport from "./page/AttendanceReport";
import Login from "./page/Login";
import AdminLayout from "./Layout/AdminLayout";
import TeacherLayout from "./Layout/TeacherLayout";
import TeacherDashboard from "./page/TeacherDashboard";
import AdminStrandManagement from "./page/AdminStrandManagement";
import Profile from "./page/Profile";
import MyStudents from "./page/MyStudents";
import TeacherNotifications from "./page/TeacherNotifications";
import AdminNotification from "./page/AdminNotification";
import AdminQRGenerate from "./page/AdminQRGenerate";
import AdminAnnouncement from "./page/AdminAnnounement";

function AppWrapper() {
  const location = useLocation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const userId = user?.user_id;

  const hideNavbar = location.pathname === "/" || location.pathname === "/scanner";

  return (
    <>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={user?.role === "admin" ? <Navigate to="/admin" /> : user?.role === "teacher" ? <Navigate to="/teacher" /> : <ScannerPage />} />
        <Route path="/scanner" element={<ScannerPage teacherId={userId} />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={user?.role === "admin" ? <AdminLayout setUser={setUser} /> : <Navigate to="/login" />}>
          <Route path="admin-notification" element={<AdminNotification />} />
          <Route path="gene" element={<AdminQRGenerate />} />
          <Route path="strands" element={<AdminStrandManagement />} />
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="announcement" element={<AdminAnnouncement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="profile" element={<Profile userId={userId} />} />
        </Route>

        {/* TEACHER ROUTES */}
        <Route path="/teacher" element={user?.role === "teacher" ? <TeacherLayout setUser={setUser} /> : <Navigate to="/login" />}>
          <Route index element={<TeacherDashboard teacherId={userId}/>} />
          <Route path="generate-qr" element={<GenerateQR />} />
          <Route path="notification" element={<TeacherNotifications teacherId={userId} />} />
          <Route path="my-students" element={<MyStudents userId={userId} />} />
          <Route path="attendance-report" element={<AttendanceReport userId={userId} teacherId={userId} />} />
          <Route path="profile" element={<Profile userId={userId} />} />
        </Route>

        <Route path="/login" element={user ? (user.role === "admin" ? <Navigate to="/admin" /> : <Navigate to="/teacher" />) : <Login setUser={setUser} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
