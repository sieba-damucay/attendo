import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          width: sidebarOpen ? "250px" : isMobile ? "0" : "70px",
          background: "#800000",
          color: "#fff",
          padding: sidebarOpen ? "1.5rem 1rem" : "1.5rem 0.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "all 0.3s ease",
          position: "fixed",
          left: sidebarOpen ? "0" : isMobile ? "-250px" : "0",
          height: "100vh",
          zIndex: 200,
          overflow: "hidden",
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
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
                onClick={() => isMobile && setSidebarOpen(false)}
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

      {/* ======================  Burger Button (Mobile Only) ================*/}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed",
            top: "1rem",
            left: "1rem",
            background: "#800000",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.2rem",
            padding: "0.5rem 0.6rem",
            zIndex: 300,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          <FaBars />
        </button>
      )}

      {/*===================== Overlay when sidebar is open (mobile) =================*/}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 100,
          }}
        ></div>
      )}



      <main
        style={{
          flex: 1,
          marginLeft: !isMobile ? (sidebarOpen ? "250px" : "70px") : "0",
          padding: isMobile ? "0rem" : "2rem", 
          transition: "margin-left 0.3s ease",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: isMobile ? "1rem" : "2rem",
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
