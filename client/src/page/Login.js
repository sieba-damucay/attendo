import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaQrcode } from "react-icons/fa";
import { assets } from "../Assets/logo";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      if (res.data.user.role === "admin") navigate("/admin-dashboard");
      else navigate("/scanner");
    } catch {
      setMsg("Invalid credentials");
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center vh-100"
      style={{
        position: "relative",
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "40%",
          height: "40%",
          background:
            "radial-gradient(circle at center, #80000040, transparent)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      <img
        src={assets.fitlogo}
        alt="School Logo"
        style={{
          position: "absolute",
          bottom: "5%",
          left: "5%",
          width: "120px",
          opacity: 0.05,
          filter: "grayscale(1)",
          zIndex: 0,
          userSelect: "none",
          pointerEvents: "none",
        }}
      />

      <form
        onSubmit={handleLogin}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "380px",
          textAlign: "center",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: "1.2rem",
          padding: "2.5rem 2rem",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          animation: "fadeIn 1s ease forwards",
        }}
      >
        <FaQrcode
          size={58}
          style={{
            marginBottom: "1rem",
            color: "#800000",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
          }}
        />
        <h1
          className="fw-bold"
          style={{
            color: "#222",
            marginBottom: "0.3rem",
            letterSpacing: "0.5px",
          }}
        >
          QR Attendance
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#555",
            marginBottom: "1.5rem",
          }}
        >
          Sign in to continue
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #ddd",
            background: "#fff",
            color: "#333",
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #800000")}
          onBlur={(e) => (e.target.style.border = "1px solid #ddd")}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
            border: "1px solid #ddd",
            background: "#fff",
            color: "#333",
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.border = "1px solid #800000")}
          onBlur={(e) => (e.target.style.border = "1px solid #ddd")}
        />

        {msg && (
          <p className="mb-2" style={{ color: "#c62828", fontWeight: "500" }}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "linear-gradient(135deg, #800000, #b71c1c)",
            color: "#fff",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 10px rgba(128,0,0,0.3)",
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 6px 15px rgba(128,0,0,0.4)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 10px rgba(128,0,0,0.3)";
          }}
        >
          Log In
        </button>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Login;
