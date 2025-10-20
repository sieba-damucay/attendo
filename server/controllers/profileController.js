import db from "../config/database.js";



// =============== Get user profile
const GetProfile = (req, res) => {
  const { id } = req.params;
  const query = "SELECT user_id, name, email FROM users WHERE user_id = ?";
  db.query(query, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0)
        return res.status(404).json({ error: "User not found" });
        res.json(rows[0]);
    });
};



//================ Update user profile
const UpdateProfile = (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    let query = "UPDATE users SET name = ?, email = ?";
    const params = [name, email];

    if (password && password.trim() !== "") {
        query += ", password_hash = ?"; 
        const bcrypt = require("bcryptjs");
        const hashed = bcrypt.hashSync(password, 10);
        params.push(hashed);
    }

    query += " WHERE user_id = ?";
    params.push(id);

    db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });
        res.json({ message: "Profile updated successfully" });
    });
};

export default {GetProfile, UpdateProfile}
