import db from "../config/database.js";
import bcrypt from "bcryptjs";

// =========================================TEACHERS CRUD================================================
const AddNewTeacher = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  db.query("SELECT * FROM users WHERE email=?", [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    const password_hash = bcrypt.hashSync(password, 10);
    db.query(
      "INSERT INTO users (name, email, grade_level, password_hash, role) VALUES (?, ?, ?, ?, 'teacher')",
      [name, email, "N/A", password_hash],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: "Teacher added successfully" });
      }
    );
  });
};

const GetAllTeacher = (req, res) => {
  db.query(
    "SELECT user_id, name, created_at, email FROM users WHERE role='teacher'",
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

const UpdateTeacher = (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!name || !email)
    return res.status(400).json({ error: "Name & Email required" });

  let query = "UPDATE users SET name=?, email=?";
  const params = [name, email];

  if (password) {
    const password_hash = bcrypt.hashSync(password, 10);
    query += ", password_hash=?";
    params.push(password_hash);
  }
  query += " WHERE user_id=? AND role='teacher'";
  params.push(id);

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Teacher updated successfully" });
  });
};

const DeleteTeacher = (req, res) => {
  const { id } = req.params;
  db.query(
    "DELETE FROM users WHERE user_id=? AND role='teacher'",
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Teacher deleted successfully" });
    }
  );
};




// =========================================STUDENTS CRUD==================================================
const AddStudent = (req, res) => {
  const { name, username, password, section_id, teacher_id, grade_level } = req.body;

  console.log("Received body:", req.body); 

  if (!name || !username || !password || !section_id || !grade_level) {
    return res.status(400).json({ error: "Name, username, password, section & grade level required" });
  }

  db.query("SELECT * FROM users WHERE username=?", [username], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length > 0) return res.status(400).json({ error: "Username already exists" });

    const password_hash = bcrypt.hashSync(password, 10);
    const sectionIdValue = section_id ? section_id : null;
    const teacherIdValue = teacher_id ? teacher_id : null;

    db.query(
      `INSERT INTO users (name, username, password_hash, role, section_id, teacher_id, grade_level) 
       VALUES (?, ?, ?, 'student', ?, ?, ?)`,
      [name, username, password_hash, sectionIdValue, teacherIdValue, grade_level],
      (err2) => {
        if (err2) {
          console.error("Insert error:", err2); 
          return res.status(500).json({ error: err2.message });
        }
        res.json({ message: "Student added successfully", username });
      }
    );
  });
};


const GetAllStudents = (req, res) => {
  const { teacherId, strandId, sectionId } = req.query;

  let query = `
    SELECT 
      u.user_id, 
      u.name, 
      u.username,
      u.grade_level,    
      u.section_id, 
      u.teacher_id, 
      u.created_at,
      s.section_name, 
      st.strand_name
    FROM users u
    LEFT JOIN sections s ON u.section_id = s.section_id
    LEFT JOIN strands st ON s.strand_id = st.strand_id
    WHERE u.role = 'student'
  `;

  const params = [];
  if (teacherId) {
    query += " AND u.teacher_id = ?";
    params.push(teacherId);
  }
  if (strandId) {
    query += " AND st.strand_id = ?";
    params.push(strandId);
  }
  if (sectionId) {
    query += " AND u.section_id = ?";
    params.push(sectionId);
  }

  db.query(query, params, (err, rows) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};




const UpdateStudents = (req, res) => {
  const { id } = req.params;
  const { name, username, password, section_id, teacher_id, grade_level } = req.body;

  if (!name || !username || !section_id || !grade_level)
    return res.status(400).json({ error: "Name, username, section & grade level required" });

  let query = "UPDATE users SET name=?, username=?, section_id=?, teacher_id=?, grade_level=?";
  const params = [name, username, section_id, teacher_id || null, grade_level];

  if (password) {
    const password_hash = bcrypt.hashSync(password, 10);
    query += ", password_hash=?";
    params.push(password_hash);
  }

  query += " WHERE user_id=? AND role='student'";
  params.push(id);

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Student updated successfully" });
  });
};

const DeleteStudents = (req, res) => {
  const { id } = req.params;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query("DELETE FROM attendance WHERE user_id = ?", [id], (err) => {
      if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

      db.query(
        "DELETE FROM users WHERE user_id = ? AND role = 'student'",
        [id],
        (err, result) => {
          if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

          db.commit((err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

            res.json({ message: "Student and their attendance deleted successfully" });
          });
        }
      );
    });
  });
};


export default {
  AddNewTeacher,
  GetAllTeacher,
  UpdateTeacher,
  DeleteTeacher,
  
  AddStudent,
  GetAllStudents,
  UpdateStudents,
  DeleteStudents,
};
