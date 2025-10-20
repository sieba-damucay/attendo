import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { FaBell } from "react-icons/fa";

function TeacherNotifications({ teacherId }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get(`/notifications/${teacherId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [teacherId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "3rem 1rem",
        background: "linear-gradient(135deg, #ffffff, #f9f9f9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "700px" }}>
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.8rem",
            fontWeight: "600",
            color: "#800000",
            borderBottom: "3px solid #80000022",
            paddingBottom: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <FaBell />
          Notifications
        </h2>

        {notifications.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#888",
              fontStyle: "italic",
              marginTop: "2rem",
            }}
          >
            No notifications yet.
          </p>
        ) : (
          <div
            style={{
              maxHeight: "75vh",
              overflowY: "auto",
              paddingRight: "0.5rem",
              scrollbarWidth: "thin",
            }}
          >
            {notifications.map((n, index) => (
              <div
                key={n.notification_id || index}
                style={{
                  backgroundColor: n.is_read ? "#fff" : "#fff7f7",
                  padding: "1.2rem 1rem",
                  marginBottom: "1rem",
                  borderRadius: "0.4rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  borderLeft: `4px solid ${n.is_read ? "#ccc" : "#800000"}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0,0,0,0.05)";
                }}
              >
                <div style={{ marginBottom: ".3rem" }}>
                  <strong style={{ color: "#800000", fontSize: "1rem" }}>
                    {n.type === "late_absent"
                      ? "Late / Absent Alert"
                      : "Perfect Attendance 🎉"}
                  </strong>
                </div>

                <p
                  style={{
                    margin: "0 0 .5rem 0",
                    color: "#333",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {n.message}
                </p>

                <small style={{ color: "#777", fontSize: "0.85rem" }}>
                  {new Date(n.date_created).toLocaleString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherNotifications;
