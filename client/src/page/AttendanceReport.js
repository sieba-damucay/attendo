import React, { useEffect, useState } from "react";
import { FaClipboardList, FaPrint, FaTrashAlt, FaHistory, FaGraduationCap } from "react-icons/fa";
import api from "../api/axiosConfig";

function AttendanceReport({ teacherId }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [showPast, setShowPast] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Monthly");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateStudent, setCertificateStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/attendance-report", { params: { teacherId } });
      const data = res.data;
      setAttendance(data);
      const uniqueSections = [
        ...new Map(
          data.map((s) => [
            s.section_id,
            { id: s.section_id, name: `${s.strand_name} - ${s.section_name}` },
          ])
        ).values(),
      ];
      setSections(uniqueSections);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const parts = timeString.split(":");
    if (parts.length < 2) return "-";
    const [h, m, s = "0"] = parts;
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10), parseInt(s, 10));
    return date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleRemove = async (attendanceId) => {
    if (!window.confirm("Are you sure you want to remove this record?")) return;
    try {
      await api.delete(`http://localhost:3000/api/attendance/${attendanceId}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to remove attendance");
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("attendance-table");
    const sectionTitle = selectedSection
      ? sections.find((s) => s.id === parseInt(selectedSection))?.name
      : "All Sections";
    const newWin = window.open("", "_blank");
    newWin.document.write(`
      <html>
        <head>
          <title>Attendance Report - ${sectionTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { color: #800000; text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
            th, td { border: 1px solid #800000; padding: 8px; text-align: left; }
            th { background-color: #800000; color: white; }
            @media print { th:last-child, td:last-child { display: none; } }
          </style>
        </head>
        <body>
          <h2>Attendance Report - ${sectionTitle}</h2>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };

  const handleViewHistory = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(`http://localhost:3000/api/attendance-history/${student.user_id}`);
      setHistoryData(res.data);
      setHistoryModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load history");
    }
  };

  const handleViewCertificate = (student) => {
    setCertificateStudent(student);
    setShowCertificate(true);
  };

  const filterHistory = () => {
    const now = new Date();
    if (activeFilter === "Daily") {
      return historyData.filter(
        (r) => new Date(r.date_scanned).toDateString() === now.toDateString()
      );
    } else if (activeFilter === "Weekly") {
      const last7 = new Date();
      last7.setDate(now.getDate() - 7);
      return historyData.filter((r) => new Date(r.date_scanned) >= last7);
    }
    return historyData;
  };

  const getSummary = (data) => {
    let present = 0, late = 0, absent = 0, pending = 0;
    data.forEach((r) => {
      if (r.status === "Present") present++;
      else if (r.status === "Late") late++;
      else if (r.status === "Absent") absent++;
      else pending++;
    });
    return { present, late, absent, pending };
  };

  const today = new Date();
  const todayStr = today.toDateString();

  const displayReport = attendance
    .filter(
      (r) => !selectedSection || r.section_id === parseInt(selectedSection)
    )
    .filter(
      (r) =>
        (r.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
        (r.username || "").toLowerCase().includes((search || "").toLowerCase())
    );

  const summary = getSummary(displayReport);

  return (
    <div className="container" style={{ maxWidth: "100%", padding: "1rem" }}>
      <h2
        className="mb-4"
        style={{
          color: "#800000",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <FaClipboardList /> Attendance Management
      </h2>

      <div className="d-flex gap-3 mb-3 flex-wrap">
        <div
          className="p-3 rounded shadow-sm text-white"
          style={{
            backgroundColor: "green",
            flex: "1 1 150px",
            textAlign: "center",
          }}
        >
          <h5 className="mb-1">Present</h5>
          <h3>{summary.present}</h3>
        </div>
        <div
          className="p-3 rounded shadow-sm text-white"
          style={{
            backgroundColor: "orange",
            flex: "1 1 150px",
            textAlign: "center",
          }}
        >
          <h5 className="mb-1">Late</h5>
          <h3>{summary.late}</h3>
        </div>
        <div
          className="p-3 rounded shadow-sm text-white"
          style={{
            backgroundColor: "red",
            flex: "1 1 150px",
            textAlign: "center",
          }}
        >
          <h5 className="mb-1">Absent</h5>
          <h3>{summary.absent}</h3>
        </div>
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
        <select
          className="form-select w-auto"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control w-50"
        />
        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#800000", borderColor: "#800000" }}
          onClick={handlePrint}
        >
          <FaPrint /> Print Attendance
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : displayReport.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            id="attendance-table"
            className="table table-bordered table-striped"
            style={{ minWidth: "950px", fontSize: ".8rem" }}
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Grade</th>
                <th>Strand - Section</th>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Status</th>
                <th>Action</th>
                <th>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {displayReport.map((r, index) => (
                <tr key={r.attendance_id || r.user_id}>
                  <td>{index + 1}</td>
                  <td>{r.name || "-"}</td>
                  <td>{r.grade_level || "-"}</td>
                  <td>
                    {r.strand_name || "-"} - {r.section_name || "-"}
                  </td>
                  <td>{formatDate(r.date_scanned)}</td>
                  <td>{formatTime(r.time_in)}</td>
                  <td>{formatTime(r.time_out)}</td>
                  <td
                    className={
                      r.status === "Present"
                        ? "text-success"
                        : r.status === "Late"
                        ? "text-warning"
                        : r.status === "Pending"
                        ? "text-primary"
                        : "text-danger"
                    }
                  >
                    {r.status || "-"}
                  </td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleViewHistory(r)}
                    >
                      <FaHistory /> History
                    </button>
                    {r.attendance_id && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(r.attendance_id)}
                      >
                        <FaTrashAlt /> Remove
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm d-flex align-items-center gap-1"
                      onClick={() => handleViewCertificate(r)}
                      disabled={!r.perfectAttendance}
                      title={
                        r.perfectAttendance
                          ? "View Certificate"
                          : "Not qualified for certificate"
                      }
                    >
                      <FaGraduationCap /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {historyModalOpen && selectedStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setHistoryModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "1rem",
              borderRadius: "8px",
              width: "70%",
              maxHeight: "80%",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>
              Attendance History - {selectedStudent?.name} (
              {selectedStudent?.username})
            </h4>
            <div className="d-flex gap-2 mb-2">
              {["Daily", "Weekly", "Monthly"].map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${
                    activeFilter === f ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filterHistory()
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.date_scanned) - new Date(a.date_scanned)
                  )
                  .map((h, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(h.date_scanned)}</td>
                      <td>{formatTime(h.time_in)}</td>
                      <td>{formatTime(h.time_out)}</td>
                      <td>{h.status}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="mt-2">
              {(() => {
                const summary = getSummary(filterHistory());
                return (
                  <p>
                    <strong>Summary:</strong> Present = {summary.present}, Late
                    = {summary.late}, Absent = {summary.absent}
                  </p>
                );
              })()}
            </div>
            <button
              className="btn btn-secondary mt-2"
              onClick={() => setHistoryModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showCertificate && certificateStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowCertificate(false)}
        >
          <div
            style={{
              width: "80%",
              height: "90%",
              background: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "0.5rem",
                background: "#800000",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Certificate - {certificateStudent.name}</span>
              <button
                className="btn btn-light btn-sm"
                onClick={() => setShowCertificate(false)}
              >
                Close
              </button>
            </div>
            <iframe
              src={`http://localhost:3000/api/certificate/${certificateStudent.user_id}`}
              style={{ flex: 1, border: "none" }}
              title="Certificate"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceReport;
