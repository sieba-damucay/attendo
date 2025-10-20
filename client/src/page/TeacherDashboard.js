import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { FaChalkboardTeacher } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function TeacherDashboard({ teacherId }) {
  const [attendance, setAttendance] = useState([]);

  const COLORS = ["#28a745", "#ffc107", "#dc3545", "#6c757d"];

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const fetchData = async () => {
    try {
      const res = await api.get("/attendance-report", { params: { teacherId } });
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const summary = attendance.reduce(
    (acc, a) => {
      if (!a.date_scanned || a.status === "-" || a.status === "Pending") acc.pending++;
      else if (a.status === "Present") acc.present++;
      else if (a.status === "Late") acc.late++;
      else if (a.status === "Absent") acc.absent++;
      return acc;
    },
    { present: 0, late: 0, absent: 0, pending: 0 }
  );

  const attendanceByDate = attendance.reduce((acc, a) => {
    if (a.date_scanned && a.status !== "-" && a.status !== "Pending") {
      const date = new Date(a.date_scanned).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});
  const lineData = Object.keys(attendanceByDate).map((date) => ({
    date,
    scans: attendanceByDate[date],
  }));

  const attendanceByStudent = attendance.reduce((acc, a) => {
    acc[a.name] = (acc[a.name] || 0) + (a.status === "Present" ? 1 : 0);
    return acc;
  }, {});
  const barData = Object.keys(attendanceByStudent).map((name) => ({
    name,
    scans: attendanceByStudent[name],
  }));

  const pieData = [
    { name: "Present Today", value: summary.present },
    { name: "Late Today", value: summary.late },
    { name: "Absent Today", value: summary.absent },
    { name: "Pending Today", value: summary.pending },
  ];

  return (
    <div className="container-fluid mt-4">
      <h2
        className="text-center mb-4 d-flex align-items-center justify-content-center gap-2"
        style={{ color: "#800000", fontWeight: "700" }}
      >
        <FaChalkboardTeacher size={28} /> Teacher Dashboard
      </h2>

      {/* KPI Cards */}
      <div className="d-flex flex-wrap mb-4 gap-3 justify-content-center">
        {[
          { label: "Total Students", value: attendance.length },
          { label: "Present Today", value: summary.present },
          { label: "Late Today", value: summary.late },
          { label: "Absent Today", value: summary.absent },
          { label: "Pending Today", value: summary.pending },
        ].map((kpi, idx) => (
          <div key={idx} className="flex-grow-1" style={{ minWidth: "160px", maxWidth: "220px" }}>
            <div
              className="card text-center"
              style={{
                border: "none",
                borderTop: "6px solid #800000",
                borderRadius: "0.75rem",
                background: "#fff",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                padding: "1.5rem 1rem",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 22px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
              }}
            >
              <h6 style={{ color: "#555", fontWeight: "600", marginBottom: ".5rem" }}>
                {kpi.label}
              </h6>
              <h2 style={{ color: "#800000", fontWeight: "700", margin: 0 }}>{kpi.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card chart-card">
            <h5 className="chart-title">Attendance Trend</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="scans" stroke="#800000" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card chart-card">
            <h5 className="chart-title">Attendance by Student</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="scans" fill="#800000" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card chart-card">
            <h5 className="chart-title">Today's Attendance Summary</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>




      {/* Card styles */}
      <style>{`
        .chart-card {
          background: #fff;
          border-radius: 0.75rem;
          border-top: 6px solid #800000;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          padding: 1rem 1rem 1.5rem 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .chart-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 22px rgba(0,0,0,0.12);
        }
        .chart-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default TeacherDashboard;
