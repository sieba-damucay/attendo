import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardList,
  FaBell,
  FaSignOutAlt,
  FaQrcode,
  FaLayerGroup,
  FaBars,
  FaNewspaper,
} from "react-icons/fa";

const AdminLayout = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const adminName = storedUser.name || "Admin";
  const adminRole = storedUser.role || "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const links = [
    { to: "/admin", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/admin/teachers", label: "Manage Teachers", icon: <FaUsers /> },
    { to: "/admin/students", label: "Manage Students", icon: <FaUsers /> },
    { to: "/admin/strands", label: "Strand & Section", icon: <FaLayerGroup /> },
    { to: "/admin/gene", label: "QR Generator", icon: <FaQrcode /> },
    { to: "/admin/announcement", label: "Announcement", icon: <FaNewspaper /> },
    { to: "/admin/profile", label: "My Profile", icon: <FaClipboardList /> },
  ];

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
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: sidebarOpen ? "0" : isMobile ? "-250px" : "0",
          height: "100%",
          width: sidebarOpen ? "250px" : isMobile ? "0" : "60px",
          background: "#800000",
          color: "#fff",
          padding: sidebarOpen ? "2rem 1rem" : "1.5rem 0.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "all 0.3s ease",
          zIndex: 1000,
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
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontWeight: "bold" }}>{adminName}</p>
                <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>{adminRole}</p>
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

          <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => isMobile && setSidebarOpen(false)}
                style={{
                  ...linkStyle,
                  ...(isActive(link.to) && activeLinkStyle),
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  padding: sidebarOpen ? "0.8rem 1rem" : "0.8rem 0",
                }}
              >
                <span style={{ display: "inline-flex", minWidth: "20px", justifyContent: "center" }}>
                  {link.icon}
                </span>
                {sidebarOpen && <span style={{ marginLeft: "0.5rem" }}>{link.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <button
          style={{
            ...logoutButtonStyle,
            justifyContent: sidebarOpen ? "flex-start" : "center",
            padding: sidebarOpen ? "0.8rem 1rem" : "0.8rem 0",
          }}
          onClick={handleLogout}
        >
          <FaSignOutAlt style={{ marginRight: sidebarOpen ? "0.5rem" : "0" }} />
          {sidebarOpen && "Logout"}
        </button>
      </aside>

      {/* ================== Mobile Burger Button ================*/}
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

      {/*=================== Main content ================*/}
      <main
        style={{
          flex: 1,
          marginLeft: !isMobile ? (sidebarOpen ? "250px" : "60px") : "0",
          padding: isMobile ? "0rem" : "2rem", 
          background: "#f1f5f9",
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

export default AdminLayout;

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  borderRadius: "8px",
  fontWeight: "500",
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s ease",
};

const activeLinkStyle = {
  background: "rgba(255,255,255,0.2)",
};

const logoutButtonStyle = {
  background: "#660000",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  borderRadius: "8px",
  fontWeight: "bold",
  width: "100%",
  display: "flex",
  alignItems: "center",
  transition: "background 0.3s ease",
};
