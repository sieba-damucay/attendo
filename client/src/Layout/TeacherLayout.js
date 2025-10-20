import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaRegListAlt,
  FaChalkboardTeacher,
  FaQrcode,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

const TeacherLayout = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const teacherName = storedUser.name || "Teacher";
  const teacherRole = storedUser.role || "Teacher";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === `/teacher${path}`;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
        backgroundColor: "#f1f5f9",
      }}
    >
      <aside
        style={{
          width: sidebarOpen ? "250px" : "70px",
          background: "#800000",
          color: "#fff",
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.3s ease",
          boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: sidebarOpen ? "space-between" : "center",
              marginBottom: "2rem",
            }}
          >
            {sidebarOpen && (
              <div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "1rem" }}>
                  {teacherName}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    opacity: 0.8,
                    fontStyle: "italic",
                  }}
                >
                  {teacherRole}
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
            >
              <FaBars />
            </button>
          </div>





          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {[
              { to: "", label: "Dashboard", icon: <FaTachometerAlt /> },
              { to: "attendance-report", label: "Attendance", icon: <FaRegListAlt /> },
              { to: "my-students", label: "My Students", icon: <FaChalkboardTeacher /> },
              { to: "generate-qr", label: "Generate QR", icon: <FaQrcode /> },
              { to: "notification", label: "Notifications", icon: <FaBell /> },
              { to: "profile", label: "My Profile", icon: <FaUserCircle /> },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  ...linkStyle,
                  ...(isActive("/" + item.to) && activeLinkStyle),
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  padding: sidebarOpen ? "0.8rem 1rem" : "0.8rem 0",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    minWidth: "20px",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span style={{ marginLeft: "0.8rem" }}>{item.label}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>



        {/* Logout Button */}
        {storedUser && (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#fff",
              color: "#800000",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            <FaSignOutAlt />
            {sidebarOpen && <span>Logout</span>}
          </button>
        )}
      </aside>



      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? "250px" : "70px",
          padding: "2rem",
          transition: "margin-left 0.3s ease",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
            minHeight: "80vh",
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;







const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s ease",
  fontSize: "0.95rem",
};
const activeLinkStyle = {
  background: "rgba(255,255,255,0.2)",
};
