import db from "../config/database.js";

const CUT_OFF_HOUR = 8; // 8:00 AM

// ================== HELPER FUNCTIONS ==================
const getStatus = (time_in) => {
  if (!time_in) return "Absent";
  const [h, m] = time_in.split(":").map(Number);
  if (h < 7) return "Present";
  if (h === 7 && m <= 15) return "Late";
  return "Absent";
};

const finalizeStatus = (record) => {
  if (record.time_in) {
    const [h, m] = record.time_in.split(":").map(Number);
    if (h < 7) return "Present";
    if (h === 7 && m <= 15) return "Late";
    return "Absent";
  } else {
    const now = new Date();
    const cutOff = new Date();
    cutOff.setHours(CUT_OFF_HOUR, 0, 0, 0);
    return now < cutOff ? "Pending" : "Absent";
  }
};



const autoMarkAbsent = () => {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(7, 16, 0, 0); // 7:16 AM

  if (now < cutoff) return; //  run after cutoff

  const today = now.toISOString().split("T")[0];

  const sql = `
    INSERT INTO attendance (user_id, date_scanned, time_in, status)
    SELECT u.user_id, NOW(), NULL, 'Absent'
    FROM users u
    WHERE u.role='student'
      AND u.user_id NOT IN (
        SELECT user_id FROM attendance WHERE DATE(date_scanned) = ?
      )
  `;

  db.query(sql, [today], (err) => {
    if (err) console.error("Error auto-marking absent:", err);
  });
};


// ================== FULL ATTENDANCE REPORT ==================
const fullAttendanceReport = (req, res) => {

  
  autoMarkAbsent();

  const query = `
    SELECT 
      u.user_id, u.name, u.username, u.grade_level,
      s.section_name, st.strand_name,
      a.attendance_id, a.date_scanned, a.time_in, a.time_out
    FROM users u
    LEFT JOIN sections s ON s.section_id = u.section_id
    LEFT JOIN strands st ON st.strand_id = s.strand_id
    LEFT JOIN attendance a ON a.user_id = u.user_id
      AND DATE(a.date_scanned) = CURDATE()
    WHERE u.role = 'student'
    ORDER BY u.grade_level, s.section_name, st.strand_name
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = rows.map((r) => ({
      ...r,
      status: finalizeStatus(r),
      date_scanned: r.date_scanned || null,
      time_in: r.time_in || null,
      time_out: r.time_out || null,
      grade_level: r.grade_level || "N/A",
      section_name: r.section_name || "N/A",
      strand_name: r.strand_name || "N/A",
    }));

    res.json(result);
  });
};

















// ================== DAILY STUDENT REPORT ==================
const studentReport = (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const query = `
    SELECT u.user_id, u.username, u.name, a.time_in, a.date_scanned
    FROM users u
    LEFT JOIN attendance a
      ON u.user_id = a.user_id
      AND DATE(a.date_scanned) = ?
    WHERE u.role='student'
  `;

  db.query(query, [today], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const report = rows.map((r) => ({
      user_id: r.user_id,
      username: r.username,
      name: r.name,
      date_scanned: r.date_scanned,
      status: getStatus(r.time_in ? r.time_in : null),
    }));

    res.json(report);
  });
};

// ================== WEEKLY / MONTHLY SUMMARY ==================
const attendanceReports = (req, res) => {
  const { type } = req.query;

  const today = new Date();
  let startDate;

  if (type === "week") {
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);
    startDate = weekAgo.toISOString().split("T")[0];
  } else {
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate = firstDayOfMonth.toISOString().split("T")[0];
  }

  const endDate = today.toISOString().split("T")[0];

  const query = `
    SELECT u.user_id, u.username, u.name,
      SUM(CASE WHEN TIME(a.time_in) < '07:00:00' THEN 1 ELSE 0 END) AS present_count,
      SUM(CASE WHEN TIME(a.time_in) BETWEEN '07:01:00' AND '07:15:00' THEN 1 ELSE 0 END) AS late_count,
      SUM(CASE WHEN a.time_in IS NULL OR TIME(a.time_in) > '07:15:00' THEN 1 ELSE 0 END) AS absent_count
    FROM users u
    LEFT JOIN attendance a
      ON u.user_id = a.user_id
      AND DATE(a.date_scanned) BETWEEN ? AND ?
    WHERE u.role='student'
    GROUP BY u.user_id
  `;

  db.query(query, [startDate, endDate], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// ================== TEACHERS LIST ==================
const teachersReport = (req, res) => {
  const query = `
    SELECT user_id, name
    FROM users
    WHERE role='teacher'
  `;

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// ================== GET ALL STUDENTS ==================
const GetAllStudents = (req, res) => {
  const { teacher_id } = req.query;

  let query = `
    SELECT 
      u.user_id, u.username, u.name, u.grade_level,
      s.section_name, st.strand_name,
      u.teacher_id
    FROM users u
    LEFT JOIN sections s ON u.section_id = s.section_id
    LEFT JOIN strands st ON st.strand_id = s.strand_id
    WHERE u.role = 'student'
  `;

  if (teacher_id) {
    query += ` AND u.teacher_id = ${db.escape(teacher_id)}`;
  }

  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = rows.map((r) => ({
      ...r,
      grade_level: r.grade_level || "N/A",
      section_name: r.section_name || "N/A",
      strand_name: r.strand_name || "N/A",
    }));

    res.json(result);
  });
};



const studentsPerSection = (req, res) => {
  const query = `
    SELECT s.section_name, COUNT(u.user_id) AS count
    FROM users u
    LEFT JOIN sections s ON u.section_id = s.section_id
    WHERE u.role = 'student'
    GROUP BY s.section_id
  `;
  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export default {
  studentReport,
  attendanceReports,
  teachersReport,
  GetAllStudents,
  fullAttendanceReport,
  studentsPerSection,
};
