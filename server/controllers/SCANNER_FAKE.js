import cron from "node-cron";
import db from "../config/database.js";

// ------------------- CRON JOB -------------------
// Auto-close  4:00 PM daily
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

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const now = new Date();
  const timeNow = now.toTimeString().slice(0, 8);
  const status = getStatus(now);

  // Auto-close any previous open attendance 
  const sqlPrevOpen = `
    UPDATE attendance
    SET time_out='16:00:00', auto_closed=1
    WHERE user_id=? AND time_out IS NULL AND DATE(date_scanned) < ?
  `;
  db.query(sqlPrevOpen, [user_id, todayStr], (errPrev) => {
    if (errPrev) console.error(errPrev.message);

    // Step 2: Check today's attendance
    const sqlCheck = "SELECT * FROM attendance WHERE user_id=? AND DATE(date_scanned)=?";
    db.query(sqlCheck, [user_id, todayStr], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        // First scan today → insert time-in
        const sqlInsert = `
          INSERT INTO attendance (user_id, date_scanned, time_in, status)
          VALUES (?, NOW(), ?, ?)
        `;
        db.query(sqlInsert, [user_id, timeNow, status], (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          // Notify teacher if late or absent
          db.query("SELECT teacher_id FROM users WHERE user_id=?", [user_id], (err3, userRes) => {
            if (err3) console.error(err3);
            const teacherId = userRes?.[0]?.teacher_id;
            if ((status === "Late" || status === "Absent") && teacherId) {
              const message =
                status === "Late"
                  ? `${username} has been marked late at ${timeNow}.`
                  : `${username} has been marked absent today.`;
              db.query(
                "INSERT INTO notifications (teacher_id, student_id, type, message) VALUES (?, ?, 'late_absent', ?)",
                [teacherId, user_id, message],
                (err4) => { if (err4) console.error(err4); }
              );
            }
          });

          return res.json({ msg: `Hi ${username}, you are marked "${status}" at ${timeNow}.` });
        });
      } else {
        const record = results[0];
        if (!record.time_out) {
          // Second scan - update time-out
          const sqlUpdate = `UPDATE attendance SET time_out=? WHERE attendance_id=?`;
          db.query(sqlUpdate, [timeNow, record.attendance_id], (err3) => {
            if (err3) return res.status(500).json({ error: err3.message });
            return res.json({ msg: `Hi ${username}, your time-out has been recorded at ${timeNow}.` });
          });
        } else {
          // Attendance already complete
          return res.json({ msg: `Hi ${username}, your attendance for today is already complete.` });
        }
      }
    });
  });
};


