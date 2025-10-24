import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { FaChartBar } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [studentsBySection, setStudentsBySection] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const DARK = "#800000";
  const LIGHT = "#B76E79";
  const MEDIUM = "#A0525E";
  const GOLD = "#FFD700";
  const CUT_OFF_HOUR = 8;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [studentsRes, teachersRes, attendanceRes, sectionRes] =
          await Promise.all([
            api.get("/students"),
            api.get("/teachers_report"),
            api.get("/admin_attendance_report"),
            api.get("/strand_sections"),
          ]);

        setStudents(studentsRes.data || []);
        setTeachers(teachersRes.data || []);

        const today = new Date().toDateString();
        const updatedAttendance = attendanceRes.data.map((a) => {
          if (!a.time_in) {
            const now = new Date();
            const cutOff = new Date();
            cutOff.setHours(CUT_OFF_HOUR, 0, 0, 0);
            return { ...a, status: now < cutOff ? "Pending" : "Absent" };
          }
          return a;
        });
        setAttendance(updatedAttendance);

        setStudentsBySection(
          sectionRes.data.map((s) => ({
            section: s.section_name || "N/A",
            count: s.count || 0,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalUsers = totalStudents + totalTeachers;

  const today = new Date().toDateString();
  const presentToday = attendance.filter(
    (a) =>
      a.date_scanned &&
      new Date(a.date_scanned).toDateString() === today &&
      a.status === "Present"
  ).length;
  const lateToday = attendance.filter(
    (a) =>
      a.date_scanned &&
      new Date(a.date_scanned).toDateString() === today &&
      a.status === "Late"
  ).length;
  const absentToday = attendance.filter(
    (a) =>
      a.date_scanned &&
      new Date(a.date_scanned).toDateString() === today &&
      a.status === "Absent"
  ).length;
  const pendingToday = attendance.filter(
    (a) =>
      (!a.date_scanned || a.status === "Pending") &&
      new Date(a.date_scanned || today).toDateString() === today
  ).length;

  const attendancePercent = totalStudents
    ? (((presentToday + lateToday) / totalStudents) * 100).toFixed(0)
    : 0;

  const pieData = [
    { name: "Present", value: presentToday },
    { name: "Late", value: lateToday },
    { name: "Absent", value: absentToday },
    { name: "Pending", value: pendingToday },
  ];
  const PIE_COLORS = [DARK, LIGHT, MEDIUM, GOLD];

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = attendance.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(attendance.length / rowsPerPage);

  return (
    <div className="container mt-4" style={{ color: DARK }}>
      <h2 className="text-center mb-4">
        <FaChartBar style={{ marginRight: "0.5rem" }} />
        Admin Dashboard
      </h2>

      {loading ? (
        <>
          {/* Skeleton for top cards */}
          <div className="row mb-4 g-3">
            {Array(4)
              .fill()
              .map((_, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="card p-3 shadow-sm text-center">
                    <Skeleton height={80} />
                  </div>
                </div>
              ))}
          </div>

          {/* Skeleton for charts */}
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <Skeleton height={300} />
            </div>
            <div className="col-12 col-md-6">
              <Skeleton height={300} />
            </div>
          </div>

          {/* Skeleton for table */}
          <div className="row mt-4">
            <div className="col-12">
              <Skeleton height={400} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Actual dashboard content */}
          <div className="row mb-4 g-3">
            {[
              { label: "Total Students", value: totalStudents },
              { label: "Total Teachers", value: totalTeachers },
              { label: "Total Users", value: totalUsers },
              {
                label: "Attendance Today",
                value: `${attendancePercent}%`,
                color: LIGHT,
                textColor: DARK,
              },
            ].map((card, i) => (
              <div key={i} className="col-6 col-md-3">
                <div
                  className="card p-3 shadow-sm text-center"
                  style={{
                    backgroundColor: card.color || DARK,
                    color: card.textColor || "#fff",
                    borderTop: `5px solid ${DARK}`,
                  }}
                >
                  <h5>{card.label}</h5>
                  <h2>{card.value}</h2>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <h5>Today's Attendance</h5>
              <div
                className="card"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  borderTop: `5px solid ${DARK}`,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <h5>Students per Section</h5>
              <div
                className="card"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  borderTop: `5px solid ${DARK}`,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentsBySection}>
                    <CartesianGrid strokeDasharray="3 3" stroke={MEDIUM} />
                    <XAxis dataKey="section" stroke={DARK} />
                    <YAxis stroke={DARK} />
                    <Tooltip />
                    <Bar dataKey="count" fill={DARK} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="row mt-4">
            <div className="col-12">
              <h5>Recent Attendance</h5>
              <div
                className="p-3 mb-4 rounded shadow-sm"
                style={{
                  backgroundColor: "#fff",
                  borderTop: `5px solid ${DARK}`,
                }}
              >
                <div className="table-responsive">
                  <table
                    className="table table-bordered table-hover"
                    style={{ borderColor: DARK, fontSize: ".8rem" }}
                  >
                    <thead
                      className="table-light"
                      style={{ backgroundColor: DARK, color: "#fff" }}
                    >
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Grade</th>
                        <th>Section</th>
                        <th>Strand</th>
                        <th>Status</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRows.length > 0 ? (
                        currentRows.map((a, index) => (
                          <tr key={a.attendance_id || index}>
                            <td>{indexOfFirst + index + 1}</td>
                            <td>{a.name}</td>
                            <td>{a.username}</td>
                            <td>
                              {a.grade_level ? `Grade ${a.grade_level}` : "N/A"}
                            </td>
                            <td>{a.section_name || "N/A"}</td>
                            <td>{a.strand_name || "N/A"}</td>
                            <td
                              className={
                                a.status === "Present"
                                  ? "text-success"
                                  : a.status === "Late"
                                  ? "text-warning"
                                  : a.status === "Pending"
                                  ? "text-primary"
                                  : "text-danger"
                              }
                            >
                              {a.status || "-"}
                            </td>
                            <td>{a.time_in || "-"}</td>
                            <td>{a.time_out || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center text-muted">
                            No attendance records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: DARK, color: "#fff" }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Prev
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="btn btn-sm"
                      style={{ backgroundColor: DARK, color: "#fff" }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
