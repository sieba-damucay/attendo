import db from "../config/database.js";
import QRCode from "qrcode";

const GenerateQrCode = (req, res) => {
  const { studentId } = req.params;

  db.query(
    "SELECT user_id, name, username FROM users WHERE user_id=? AND role='student'",
    [studentId],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0)
        return res.status(404).json({ error: "Student not found" });

      // Include both user_id and username
      const qrValue = JSON.stringify({
        user_id: rows[0].user_id,
        username: rows[0].username,
      });

      try {
        const qrDataUrl = await QRCode.toDataURL(qrValue);
        console.log("QR will contain:", qrValue);

        res.json({ qr: qrDataUrl });
      } catch (err) {
        res.status(500).json({ error: "Failed to generate QR" });
      }
    }
  );
};


const GenerateStudManually = async (req, res) => {
  const { name, username, grade, section, strand } = req.body;

  if (!name || !username)
    return res.status(400).json({ error: "Name and username required" });

  const qrValue = JSON.stringify({
    name,
    username,
    grade,
    section,
    strand,
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(qrValue);
    res.json({ qr: qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR" });
  }
};

export default { GenerateQrCode, GenerateStudManually };
