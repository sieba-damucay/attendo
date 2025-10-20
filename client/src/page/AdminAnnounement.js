import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminAnnouncement = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("General");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcement/all");
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/announcement", {
        message,
        type,
        start_date: startDate,
        end_date: endDate,
      });
      alert("Announcement added successfully!");
      setMessage("");
      setType("General");
      setStartDate("");
      setEndDate("");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("Failed to add announcement.");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const announcement = announcements.find((a) => a.announcement_id === id);

      await api.put(`/announcement/${id}`, {
        message: editMessage,
        type: announcement.type,
        start_date: announcement.start_date,
        end_date: announcement.end_date,
      });

      alert("Announcement updated successfully!");
      setEditId(null);
      setEditMessage("");
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("Failed to update announcement.");
    }
  };



  const updateStatus = async (id, newStatus, announcementType) => {
    if (announcementType !== "General") return;
    try {
      await api.put(`/announcement/${id}/status`, { status: newStatus });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };




  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;
    try {
      await api.delete(`/announcement/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert("Failed to delete announcement.");
    }
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh", backgroundColor: "#fdfdfd", fontFamily: "Poppins, sans-serif" }}>
      <div className="shadow p-4" style={{ width: "100%", borderRadius: "1rem", borderTop: "5px solid #800000", backgroundColor: "#fff" }}>
        <h3 className="text-center mb-4 fw-bold" style={{ color: "#800000", letterSpacing: "0.5px" }}>System Announcement</h3>

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <textarea className="form-control" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter announcement" rows="3" style={{ borderRadius: "0.5rem", borderColor: "#ccc", resize: "none" }} />
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="General">General</option>
                <option value="Suspension">Suspension</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="text-left">
            <button type="submit" className="btn px-4 py-2" style={{ backgroundColor: "#800000", color: "#fff", fontWeight: "600", borderRadius: "0.5rem", width: "20%", transition: "0.3s ease" }}>Add Announcement</button>
          </div>
        </form>

        <h5 className="mb-3 fw-semibold" style={{ color: "#800000", borderBottom: "2px solid #800000", paddingBottom: "4px" }}>Announcement History</h5>

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle small" style={{ fontSize: ".8rem" }}>
            <thead className="text-white" style={{ backgroundColor: "#800000" }}>
              <tr>
                <th>Message</th>
                <th>Type</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Date Created</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length > 0 ? (
                announcements.map((item, index) => (
                  <tr key={item.announcement_id}>
                    <td>{editId === item.announcement_id ? <input type="text" className="form-control form-control-sm" value={editMessage} onChange={(e) => setEditMessage(e.target.value)} /> : item.message}</td>
                    <td>{item.type}</td>
                    <td>
                      {item.type === "General" ? (
                        <select value={item.status} onChange={(e) => updateStatus(item.announcement_id, e.target.value, item.type)} className="form-select form-select-sm">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span>{item.status}</span>
                      )}
                    </td>
                    <td>
                      {item.start_date
                        ? new Date(item.start_date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
                        : "-"}
                    </td>
                    <td>
                      {item.end_date
                        ? new Date(item.end_date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
                        : "-"}
                    </td>

                    <td>{new Date(item.created_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td>{new Date(item.updated_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td>
                      {editId === item.announcement_id ? (
                        <>
                          <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdate(item.announcement_id)}>Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          {/* <button className="btn btn-warning btn-sm me-2" onClick={() => { setEditId(item.announcement_id); setEditMessage(item.message); }}>Edit</button> */}
                          <button className="btn btn-danger btn-sm" onClick={() => deleteAnnouncement(item.announcement_id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-3">No announcements yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncement;
