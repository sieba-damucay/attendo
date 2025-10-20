import db from "../config/database.js";



const GetAllStrand = (req, res) => {
    const query = "SELECT * FROM strands";
    db.query(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

const AddNewStrand = (req, res) => {
    const { strand_name } = req.body;
    db.query(
        "INSERT INTO strands (strand_name) VALUES (?)",
        [strand_name],
        (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ strand_id: result.insertId, strand_name });
        }
    );
};

const UpdateStrand =(req, res) => {
    const { id } = req.params;
    const { strand_name } = req.body;
    db.query(
        "UPDATE strands SET strand_name=? WHERE strand_id=?",
        [strand_name, id],
        (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ strand_id: id, strand_name });
        }
    );
};

const DeleteStrand = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM strands WHERE strand_id=?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Strand deleted" });
    });
};



// ============================= SECTIONS ==============================

const GetAllSection = (req, res) => {
    const { strandId } = req.query; 
    let query = `
        SELECT sec.section_id, sec.section_name, st.strand_name, st.strand_id
        FROM sections sec
        JOIN strands st ON sec.strand_id = st.strand_id
    `;
    const params = [];

    if (strandId) {
        query += " WHERE st.strand_id = ?"; 
        params.push(strandId);
    }

    db.query(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

const AddNewSection = (req, res) => {
    const { section_name, strand_id } = req.body;
    db.query(
        "INSERT INTO sections (section_name, strand_id) VALUES (?, ?)",
        [section_name, strand_id],
        (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ section_id: result.insertId, section_name, strand_id });
        }
    );
};

const UpdateSection = (req, res) => {
    const { id } = req.params;
    const { section_name, strand_id } = req.body;
    db.query(
        "UPDATE sections SET section_name=?, strand_id=? WHERE section_id=?",
        [section_name, strand_id, id],
        (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ section_id: id, section_name, strand_id });
        }
    );
};

const DeleteSection = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM sections WHERE section_id=?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Section deleted" });
    });
};


export default {
    GetAllStrand,
    AddNewStrand,
    UpdateStrand,
    DeleteStrand,
    GetAllSection,
    AddNewSection,
    UpdateSection,
    DeleteSection
}
