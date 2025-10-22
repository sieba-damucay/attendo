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

  // Step 1: Auto-close any unclosed previous attendance
  const sqlClosePrev = `
    UPDATE attendance
    SET time_out='16:00:00', auto_closed=1
    WHERE user_id=? AND time_out IS NULL AND DATE(date_scanned) < ?
  `;

  db.query(sqlClosePrev, [user_id, todayStr], (errClose) => {
    if (errClose) console.error("Error auto-closing previous:", errClose.message);

    // Step 2: Check if there is already an attendance record for today
    const sqlCheckToday = `
      SELECT * FROM attendance
      WHERE user_id=? AND DATE(date_scanned)=?
    `;
    db.query(sqlCheckToday, [user_id, todayStr], (errCheck, result) => {
      if (errCheck) return res.status(500).json({ error: errCheck.message });

      // If NO record = TIME-IN
      if (result.length === 0) {
        // Check 4PM only for TIME-IN
        if (now.getHours() >= 16) {
          return res.json({
            msg: `Hi ${username}, attendance scanning is closed after 4:00 PM.`,
          });
        }

        const sqlInsert = `
          INSERT INTO attendance (user_id, date_scanned, time_in, status)
          VALUES (?, NOW(), ?, ?)
        `;
        db.query(sqlInsert, [user_id, timeNow, status], (errInsert) => {
          if (errInsert) return res.status(500).json({ error: errInsert.message });
          return res.json({ msg: `Hi ${username}, you are marked "${status}" at ${timeNow}.` });
        });
      } 
      // If record exists → TIME-OUT or already done
      else {
        const record = result[0];

        if (!record.time_out && record.auto_closed !== 1) {
          const sqlUpdate = `UPDATE attendance SET time_out=? WHERE attendance_id=?`;
          db.query(sqlUpdate, [timeNow, record.attendance_id], (errUpdate) => {
            if (errUpdate) return res.status(500).json({ error: errUpdate.message });
            return res.json({ msg: `Hi ${username}, your time-out has been recorded at ${timeNow}.` });
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
