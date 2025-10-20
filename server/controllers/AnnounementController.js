import db from "../config/database.js";

const createAnnouncement = (req, res) => {
  const { message, type, start_date, end_date } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const status = "active";

  const sql = `
    INSERT INTO announcements (message, status, type, start_date, end_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;

  db.query(
    sql,
    [message, status, type || "General", start_date || null, end_date || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      // auto mark attendance for Suspension / Holiday
      if (type === "Suspension" || type === "Holiday") {
        const statusToMark = type === "Suspension" ? "Suspended" : "Holiday";
        const dateToMark = start_date || new Date().toISOString().split("T")[0];

        const updateAttendanceSql = `
        UPDATE attendance
        SET status = ?
        WHERE DATE(date_scanned) = ?
          AND user_id IN (SELECT user_id FROM users WHERE role = 'student')
      `;
        db.query(updateAttendanceSql, [statusToMark, dateToMark], (err2) => {
          if (err2) console.error("Error updating attendance:", err2);

          const insertAttendanceSql = `
          INSERT INTO attendance (user_id, date_scanned, status)
          SELECT u.user_id, ?, ?
          FROM users u
          WHERE u.role = 'student'
            AND u.user_id NOT IN (
              SELECT a.user_id FROM attendance a WHERE DATE(a.date_scanned) = ?
            )
        `;
          db.query(
            insertAttendanceSql,
            [dateToMark, statusToMark, dateToMark],
            (err3) => {
              if (err3) console.error("Error inserting attendance:", err3);
            }
          );
        });
      }

      res.json({ success: true, message: "Announcement added successfully" });
    }
  );
};

const getAllAnnouncements = (req, res) => {
  const sql = "SELECT * FROM announcements ORDER BY created_at DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(result);
  });
};

const getActiveAnnouncement = (req, res) => {
  const sql = `
    SELECT *
    FROM announcements
    WHERE status = 'active'
      AND (
        (start_date IS NULL AND end_date IS NULL)
        OR (CURDATE() BETWEEN DATE(start_date) AND DATE(end_date))
        OR (start_date <= CURDATE() AND end_date >= CURDATE())
      )
    ORDER BY 
      CASE 
        WHEN type = 'Suspension' THEN 1
        WHEN type = 'Holiday' THEN 2
        ELSE 3
      END,
      updated_at DESC
    LIMIT 1
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(result[0] || null);
  });
};

const UpdateAnnouncement = (req, res) => {
  const { id } = req.params;
  const { message, type, start_date, end_date } = req.body;

  const formatDate = (value) => {
    if (!value) return null;
    try {
      const d = new Date(value);
      if (isNaN(d)) return null;
      return d.toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  const formattedStart = formatDate(start_date);
  const formattedEnd = formatDate(end_date);

  const sql = `
    UPDATE announcements 
    SET 
      message = ?,
      type = ?,
      start_date = ?,
      end_date = ?,
      status = 'active',
      updated_at = NOW()
    WHERE announcement_id = ?
  `;

  db.query(
    sql,
    [message, type, formattedStart, formattedEnd, id],
    (err, result) => {
      if (err) {
        console.error("SQL error:", err);
        return res
          .status(500)
          .json({ error: "Database error", details: err.sqlMessage });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      // Ensure scanner page refresh gets the latest version
      res.json({
        success: true,
        message: "Announcement updated successfully and now active",
      });
    }
  );
};

const updateAnnouncementStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status))
    return res.status(400).json({ error: "Invalid status" });

  const getAnnouncementSql =
    "SELECT * FROM announcements WHERE announcement_id = ?";
  db.query(getAnnouncementSql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "Announcement not found" });

    const announcement = result[0];

    if (announcement.type === "Suspension" || announcement.type === "Holiday") {
      return res.json({
        success: true,
        message: "Cannot change status for Suspension or Holiday announcements",
      });
    }

    const updateSql = `
      UPDATE announcements 
      SET status = ?, updated_at = NOW() 
      WHERE announcement_id = ?
    `;
    db.query(updateSql, [status, id], (err2) => {
      if (err2) return res.status(500).json({ error: "Database error" });
      res.json({ success: true, message: "Status updated successfully" });
    });
  });
};

const deleteAnnouncement = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM announcements WHERE announcement_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Announcement not found" });
    res.json({ success: true, message: "Announcement deleted successfully" });
  });
};

export const autoMarkAttendance = () => {
  const today = new Date().toISOString().split("T")[0];

  const announcementQuery = `
    SELECT * FROM announcements
    WHERE status = 'active'
    AND type IN ('Suspension', 'Holiday')
    AND start_date <= ? AND end_date >= ?
  `;

  db.query(announcementQuery, [today, today], (err, results) => {
    if (err) return console.error("Error checking announcements:", err);

    const type = results.length > 0 ? results[0].type : null;
    const statusToMark =
      type === "Suspension"
        ? "Suspended"
        : type === "Holiday"
        ? "Holiday"
        : "Absent";

    db.query(
      "SELECT user_id FROM users WHERE role = 'student'",
      (err, users) => {
        if (err) return console.error("Error fetching users:", err);

        const insertValues = users.map((u) => [
          u.user_id,
          today,
          null,
          null,
          statusToMark,
        ]);
        const insertQuery = `
        INSERT INTO attendance (user_id, date_scanned, time_in, time_out, status)
        VALUES ?
      `;

        db.query(insertQuery, [insertValues], (err) => {
          if (err) console.error("Error inserting attendance:", err);
          else
            console.log(`All students marked as ${statusToMark} for ${today}`);
        });
      }
    );
  });
};

export default {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncement,
  UpdateAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
};
