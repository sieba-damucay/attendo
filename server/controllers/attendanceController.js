import cron from "node-cron";
import db from "../config/database.js";

// ------------------- CRON JOB -------------------
cron.schedule("0 16 * * *", () => {
  console.log("Running end-of-day auto-close...");

  const sql = `
    UPDATE attendance
    SET time_out='16:00:00', auto_closed=1
    WHERE time_out IS NULL AND DATE(date_scanned)=CURDATE()
  `;

  db.query(sql, (err, result) => {
    if (err) return console.error("Auto-close failed:", err.message);
    console.log(`Auto-closed ${result.affectedRows} attendance records.`);
  });
});

// ------------------- HELPER -------------------
const getStatus = (date_scanned) => {
  if (!date_scanned) return "Absent";

  const scanTime = new Date(date_scanned);
  const hours = scanTime.getHours();
  const minutes = scanTime.getMinutes();
  const day = scanTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // MONDAY RULES
  if (day === 1) {
    if (hours === 7 && minutes >= 0 && minutes <= 15) return "Present";
    if (hours === 7 && minutes >= 20 && minutes <= 25) return "Late";
    if ((hours === 7 && minutes >= 26) || hours > 7) return "Absent";
    if (hours < 7) return "Present";
  }

  // TUESDAY–FRIDAY RULES
  if (day >= 2 && day <= 5) {
    if (hours < 7) return "Present";
    if (hours === 7 && minutes === 0) return "Present";
    if (hours === 7 && minutes >= 1 && minutes <= 15) return "Late";
    if ((hours === 7 && minutes >= 16) || hours > 7) return "Absent";
  }

  return "No Class";
};

// ------------------- CONTROLLER -------------------
export const studentAttendance = (req, res) => {
  const { user_id, username } = req.body;
  if (!user_id) return res.status(400).json({ error: "User ID is required" });

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const timeNow = now.toTimeString().slice(0, 8);
  const status = getStatus(now);
  const day = now.getDay();

  // Block weekends
  if (day === 0 || day === 6) {
    return res.json({
      msg: `Hi ${username}, attendance scanning is disabled on weekends.`,
    });
  }

  // Block after 4 PM
  if (now.getHours() >= 16) {
    return res.json({
      msg: `Hi ${username}, attendance scanning is closed after 4:00 PM.`,
    });
  }

  //  Step 1: Auto-close any unclosed previous attendance
  const sqlClosePrev = `
    UPDATE attendance
    SET time_out='16:00:00', auto_closed=1
    WHERE user_id=? AND time_out IS NULL AND DATE(date_scanned) < ?
  `;

  db.query(sqlClosePrev, [user_id, todayStr], (errClose) => {
    if (errClose)
      console.error("Error auto-closing previous:", errClose.message);

    // Step 2: Check if there is already an attendance record for today
    const sqlCheckToday = `
      SELECT * FROM attendance
      WHERE user_id=? AND DATE(date_scanned)=?
    `;
    db.query(sqlCheckToday, [user_id, todayStr], (errCheck, result) => {
      if (errCheck) return res.status(500).json({ error: errCheck.message });

      // If NO record today  TIME-IN
      if (result.length === 0) {
        const sqlInsert = `
          INSERT INTO attendance (user_id, date_scanned, time_in, status)
          VALUES (?, NOW(), ?, ?)
        `;
        db.query(sqlInsert, [user_id, timeNow, status], (errInsert) => {
          if (errInsert)
            return res.status(500).json({ error: errInsert.message });
          return res.json({
            msg: `Hi ${username}, you are marked "${status}" at ${timeNow}.`,
          });
        });
      }
      // If record exists  TIME-OUT (only if no time_out and not auto_closed)
      else {
        const record = result[0];
        if (!record.time_out && record.auto_closed !== 1) {
          const sqlUpdate = `UPDATE attendance SET time_out=? WHERE attendance_id=?`;
          db.query(sqlUpdate, [timeNow, record.attendance_id], (errUpdate) => {
            if (errUpdate)
              return res.status(500).json({ error: errUpdate.message });
            return res.json({
              msg: `Hi ${username}, your time-out has been recorded at ${timeNow}.`,
            });
          });
        } else if (record.auto_closed === 1) {
          return res.json({
            msg: `Hi ${username}, your time-out was auto-recorded yesterday at 4:00 PM.`,
          });
        } else {
          return res.json({
            msg: `Hi ${username}, your attendance for today is already complete.`,
          });
        }
      }
    });
  });
};

// ================== Delete attendance ==================
const deleteAttendance = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM attendance WHERE attendance_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Attendance record not found" });
    res.json({ message: "Attendance record deleted successfully" });
  });
};

// ================== Today's attendance by teacher ==================
const studentAttendanceByTeacher = (req, res) => {
  const { teacherId } = req.query;
  if (!teacherId) return res.status(400).json({ error: "teacherId required" });

  const query = `
    SELECT 
      u.user_id, u.name, u.username, u.grade_level, u.email,
      u.section_id, s.section_name, st.strand_name,
      a.attendance_id, a.date_scanned, a.status
    FROM users u
    LEFT JOIN sections s ON s.section_id = u.section_id
    LEFT JOIN strands st ON st.strand_id = s.strand_id
    LEFT JOIN attendance a 
      ON a.user_id = u.user_id AND DATE(a.date_scanned) = CURDATE()
    WHERE u.role='student' AND u.teacher_id = ?
    ORDER BY u.name
  `;

  db.query(query, [teacherId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = rows.map((r) => ({
      ...r,
      status: finalizeStatus(r),
      date_scanned: r.date_scanned || null,
    }));

    res.json(result);
  });
};

// ================== Full attendance report ==================
const fullAttendanceReport = (req, res) => {
  const { teacherId } = req.query;
  console.log("Received teacherId:", teacherId);

  const query = `
    SELECT 
      u.user_id, u.name, u.email, u.grade_level, u.username,
      s.section_id, s.section_name, st.strand_name,
      a.attendance_id, a.date_scanned, a.time_in, a.time_out, a.status
    FROM users u
    LEFT JOIN sections s ON s.section_id = u.section_id
    LEFT JOIN strands st ON st.strand_id = s.strand_id
    LEFT JOIN attendance a 
      ON a.user_id = u.user_id
      AND DATE(a.date_scanned) = CURDATE()   -- only today's attendance
    WHERE u.role = 'student'
      AND u.teacher_id = ?
    ORDER BY u.name ASC
  `;

  db.query(query, [teacherId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Format the result
    const result = rows.map((r) => {
      if (!r.attendance_id) {
        // No attendance today
        return {
          ...r,
          attendance_id: null,
          status: "Absent",
          date_scanned: null,
          time_in: null,
          time_out: null,
        };
      }

      return {
        ...r,
        status: r.status || "Present", // you can use finalizeStatus(r) if needed
      };
    });

    res.json(result);
  });
};

// ================== Get strands and sections ==================
const getStrandsAndSections = (req, res) => {
  const sql = `
    SELECT s.strand_id, s.strand_name, sec.section_id, sec.section_name
    FROM strands s
    JOIN sections sec ON s.strand_id = sec.strand_id
    ORDER BY s.strand_name, sec.section_name
  `;
  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    res.json(result);
  });
};

// ====================== history per student
const getAttendanceHistory = (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT a.attendance_id, a.date_scanned, a.time_in, a.time_out, a.status
    FROM attendance a
    WHERE a.user_id = ?
    ORDER BY a.date_scanned DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching attendance history:", err);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
    res.json(results);
  });
};

// ==================== summary counts (Present, Late, Absent)
const getAttendanceSummary = (req, res) => {
  const { user_id } = req.params;

  const sql = `SELECT status, COUNT(*) as count FROM attendance WHERE user_id = ? GROUP BY status`;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching summary:", err);
      return res.status(500).json({ error: "Failed to fetch summary" });
    }
    const summary = { Present: 0, Late: 0, Absent: 0 };
    results.forEach((r) => {
      summary[r.status] = r.count;
    });

    res.json(summary);
  });
};

export default {
  studentAttendance,
  deleteAttendance,
  studentAttendanceByTeacher,

  fullAttendanceReport,
  getStrandsAndSections,
  getAttendanceHistory,
  getAttendanceSummary,
};
