import db from "../config/database.js";


// teacher only
const getNotifications = (req, res) => {
  const { teacherId } = req.params;
  const sql = `
    SELECT n.notification_id, n.type, n.message, n.date_created, n.is_read,
           u.name AS student_name
    FROM notifications n
    LEFT JOIN users u ON n.student_id = u.user_id
    WHERE n.teacher_id = ?
    ORDER BY n.date_created DESC
  `;
  db.query(sql, [teacherId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export default { getNotifications };
