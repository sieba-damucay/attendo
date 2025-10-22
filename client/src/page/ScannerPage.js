import React, { useState, useEffect, useRef } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./ScannerPage.css";
import {
  FaCamera,
  FaCheckCircle,
  FaTimesCircle,
  FaBullhorn,
  FaArrowLeft,
} from "react-icons/fa";
import api from "../api/axiosConfig";
import { assets } from "../Assets/logo";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function ScannerPage() {
  const [result, setResult] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [cameraAllowed, setCameraAllowed] = useState(true);
  const [scanningAllowed, setScanningAllowed] = useState(true);
  const [announcement, setAnnouncement] = useState(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await api.get("/announcement");
        console.log("Fetched announcement:", res.data);
        setAnnouncement(res.data || null);
      } catch (err) {
        console.error("Failed to fetch announcement", err);
      }
    };
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.video?.srcObject) {
        const tracks = scannerRef.current.video.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleScan = async (data) => {
    if (!data || !scanningAllowed) return;

    let text = "";
    if (Array.isArray(data)) text = data[0]?.rawValue || "";
    else if (typeof data === "object") text = data.rawValue || "";
    else text = String(data);

    if (!text) {
      setMsg({ text: "Invalid QR Code", type: "error" });
      return;
    }

    setResult(text);
    setScanningAllowed(false);

    let payload = {};
    try {
      const parsed = JSON.parse(text);
      if (parsed.user_id && parsed.username)
        payload = { user_id: parsed.user_id, username: parsed.username };
      else if (parsed.username) payload = { username: parsed.username };
      else throw new Error("Invalid QR format");
    } catch {
      payload = { username: text };
    }

    try {
      const token = localStorage.getItem("token");
      const res = await api.post("/attendance", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg({ text: res.data.msg || "Attendance recorded", type: "success" });
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Invalid QR Code";
      setMsg({ text: errorMessage, type: "error" });
    }

    setTimeout(() => {
      setMsg({ text: "", type: "" });
      setScanningAllowed(true);
    }, 5000);
  };

  const handleError = (err) => {
    console.error(err);
    setCameraAllowed(false);
    if (err.name === "NotAllowedError") {
      setMsg({
        text: "Camera permission denied. Please allow permissions.",
        type: "error",
      });
    } else if (err.name === "NotReadableError") {
      setMsg({
        text: "Camera already in use by another application.",
        type: "error",
      });
    } else {
      setMsg({
        text: "Camera error. Please check your device.",
        type: "error",
      });
    }
  };

  const hideScanner =
    announcement &&
    announcement.status === "active" &&
    (announcement.type === "Suspension" || announcement.type === "Holiday");

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center vh-100"
      style={{
        position: "relative",
        backgroundImage: `url(${assets.background_logo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "2rem",
      }}
    >
      {/* Circle button for Admin Login */}
      <button
        onClick={() => navigate("/login")}
        style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          backgroundColor: "#800000",
          color: "white",
          border: "2px solid gold",
          boxShadow: "0 0 10px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          transition: "transform 0.2s ease, background-color 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#a00000")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#800000")
        }
        title="Back to Admin Login"
      >
        <FaArrowLeft size={20} />
      </button>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 0,
        }}
      />
      <img
        src={assets.fitlogo}
        alt="School Logo"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: "900px",
          borderRadius: "50%",
          opacity: 0.08,
          filter: "brightness(1.1) contrast(1.2)",
          pointerEvents: "none",
          userSelect: "none",
          transition: "opacity 1s ease",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {hideScanner ? (
          <div
            className="text-center text-white p-4 rounded shadow"
            style={{
              backgroundColor: "#800000",
              borderTop: "5px solid gold",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <FaBullhorn size={28} className="mb-2" />
            <h4 className="fw-bold">{announcement.type} Announcement</h4>
            <p className="mb-0">{announcement.message}</p>
          </div>
        ) : (
          <>
            <h2 className="text-white mb-4 fw-bold d-flex align-items-center justify-content-center">
              <FaCamera className="me-2" /> QR Attendance
            </h2>

            <p
              className="text-white mb-4 text-center"
              style={{ fontSize: "0.9rem", opacity: 0.85 }}
            >
              Please make sure the QR code is clearly visible and properly
              aligned.
            </p>

            <div
              style={{
                position: "relative",
                padding: "6px",
                borderRadius: "1rem",
                overflow: "hidden",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  width: "200%",
                  height: "200%",
                  background:
                    "conic-gradient(maroon, gold, maroon, gold, maroon)",
                  animation: "spin 3s linear infinite",
                  zIndex: 0,
                }}
              />

              <div
                style={{
                  position: "relative",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  background: "#000",
                  zIndex: 1,
                }}
              >
                {cameraAllowed && scanningAllowed ? (
                  <Scanner
                    ref={scannerRef}
                    onScan={handleScan}
                    onError={handleError}
                    constraints={{ facingMode: "environment" }}
                    styles={{ width: "100%" }}
                  />
                ) : msg.text ? null : (
                  <div
                    style={{
                      color: "#fff",
                      padding: "2rem",
                      textAlign: "center",
                    }}
                  >
                    Camera not accessible or scanning disabled.
                  </div>
                )}

                {/* Notification centered over scanner */}
                {msg.text && (
                  <div
                    className={`alert-box d-flex align-items-center justify-content-center ${
                      msg.type === "success" ? "success" : "error"
                    }`}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      background:
                        msg.type === "success"
                          ? "linear-gradient(135deg, #4CAF50, #2E7D32)"
                          : "linear-gradient(135deg, #E53935, #B71C1C)",
                      color: "white",
                      padding: "1.2rem 2rem",
                      borderRadius: "1rem",
                      fontWeight: "600",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                      minWidth: "320px",
                      maxWidth: "90vw",
                      textAlign: "center",
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  >
                    {msg.type === "success" ? (
                      <FaCheckCircle
                        style={{ fontSize: "2rem", marginRight: "0.8rem" }}
                      />
                    ) : (
                      <FaTimesCircle
                        style={{ fontSize: "2rem", marginRight: "0.8rem" }}
                      />
                    )}
                    <span style={{ fontSize: "1.1rem", lineHeight: "1.3" }}>
                      {msg.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

export default ScannerPage;
