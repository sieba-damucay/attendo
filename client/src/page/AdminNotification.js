import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { FaBell } from "react-icons/fa";

function AdminNotification() {
  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const paginatedData = notifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="container mt-4" style={{ color: "#800000" }}>
      <h2 className="text-center mb-4" style={{ color: "#800000" }}><FaBell /> Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-muted">No notifications</p>
      ) : (
        <div className="list-group mb-3">
          {paginatedData.map((n) => (
            <div key={n.notification_id} className={`list-group-item d-flex justify-content-between align-items-start ${!n.is_read ? "fw-bold" : ""}`} style={{ backgroundColor: n.is_read ? "#fff" : "#ffe6e6", border: "1px solid #800000", borderRadius: "0.3rem", marginBottom: "0.5rem" }}>
              <div>{n.message} <small className="text-muted d-block">{new Date(n.date_created).toLocaleString()}</small></div>
              {!n.is_read && <button className="btn btn-sm" style={{ backgroundColor: "#800000", color: "#fff", border: "none" }} onClick={() => markAsRead(n.notification_id)}>Mark as Read</button>}
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" style={{ backgroundColor: "#800000", color: "#fff", border: "1px solid #800000" }} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                <button className="page-link" style={{ backgroundColor: currentPage === page ? "#800000" : "#fff", color: currentPage === page ? "#fff" : "#800000", border: "1px solid #800000" }} onClick={() => setCurrentPage(page)}>{page}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" style={{ backgroundColor: "#800000", color: "#fff", border: "1px solid #800000" }} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default AdminNotification;
