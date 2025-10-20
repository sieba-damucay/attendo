import db from "../config/database.js";

const getStatus = (time_in) => {
  if (!time_in) return "Absent";
  const [h, m] = time_in.split(":").map(Number);
  if (h < 7) return "Present";
  if (h === 7 && m <= 15) return "Late";
  return "Absent";
};

// const isWithinSchoolHours = () => {
//   const now = new Date();
//   const hour = now.getHours();
//   return hour >= 7 && hour <= 17; 
// };





const getStudents = (req, res) => {
  const teacher_id = req.query;
  const query = `SELECT * FROM users WHERE role='student' AND teacher_id=?`;

  db.query(query, [teacher_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};







const updateAttendance = (req, res) => {
  const { attendance_id } = req.params;
  const { status } = req.body;

  const query = `UPDATE attendance SET status=? WHERE attendance_id=?`;
  db.query(query, [status, attendance_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Attendance not found" });

    res.json({ message: "Attendance updated successfully" });
  });
};

const deleteAttendance = (req, res) => {
  const { attendance_id } = req.params;

  const query = `DELETE FROM attendance WHERE attendance_id=?`;
  db.query(query, [attendance_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Attendance not found" });

    res.json({ message: "Attendance deleted successfully" });
  });
};









const getAttendanceReport = (req, res) => {
  const { teacher_id, type = "daily" } = req.query;
  if (!teacher_id)
    return res.status(400).json({ error: "teacher_id required" });

  let startDate, endDate;
  const today = new Date().toISOString().split("T")[0];
  endDate = today;

  if (type === "daily") startDate = today;
  else if (type === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    startDate = d.toISOString().split("T")[0];
  } else if (type === "month") {
    const d = new Date();
    d.setDate(1);
    startDate = d.toISOString().split("T")[0];
  }

  const query = `
    SELECT 
      u.user_id,
      u.name,
      u.username,
      u.grade_level,
      u.section_id,
      s.section_name,
      st.strand_name,
      a.attendance_id,
      DATE(a.date_scanned) AS date_scanned,
      TIME(a.time_in) AS time_in,
      TIME(a.time_out) AS time_out,
      a.status
    FROM users u
    LEFT JOIN sections s ON u.section_id = s.section_id
    LEFT JOIN strands st ON s.strand_id = st.strand_id
    LEFT JOIN (
      SELECT *
      FROM attendance
      WHERE DATE(date_scanned) BETWEEN ? AND ?
    ) a ON u.user_id = a.user_id
    WHERE u.role = 'student' AND u.teacher_id = ?
    ORDER BY u.name
  `;

  db.query(query, [startDate, endDate, teacher_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Map students: fill Absent if no attendance today
    const todayStr = new Date().toDateString();
    const result = rows.map((r) => {
      let status = r.status || "Absent";
      if (r.date_scanned) {
        const scannedDate = new Date(r.date_scanned).toDateString();
        if (scannedDate !== todayStr) status = "Absent";
      }
      return {
        user_id: r.user_id,
        name: r.name,
        username: r.username,
        grade_level: r.grade_level,
        section_id: r.section_id,
        section_name: r.section_name,
        strand_name: r.strand_name,
        attendance_id: r.attendance_id,
        date_scanned: r.date_scanned,
        time_in: r.time_in,
        time_out: r.time_out,
        status,
      };
    });

    res.json(result);
  });
};

export default {
  getStudents,
  getAttendanceReport,
  updateAttendance,
  deleteAttendance,
  getStatus,
};
