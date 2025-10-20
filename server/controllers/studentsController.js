import db from "../config/database.js";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { format } from "fast-csv";
import XLSX from "xlsx";
import archiver from "archiver";
import { fileURLToPath } from "url";
import csvParser from "fast-csv";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ======================= Import My Students =======================
export const ImportStudent = async (req, res) => {
  try {
    const teacherId = req.body.teacherId;

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let students = [];

    if (ext === ".csv") {
      fs.createReadStream(filePath)
        .pipe(csvParser.parse({ headers: true }))
        .on("error", (err) => {
          fs.unlinkSync(filePath);
          console.error(err);
          return res.status(500).json({ error: "Failed to parse CSV file" });
        })
        .on("data", (row) => {
          students.push(row);
        })
        .on("end", async () => {
          fs.unlinkSync(filePath);

          const requiredColumns = ["Name", "Username", "Grade", "Section", "Strand"];
          const headers = Object.keys(students[0] || {});
          const missingColumns = requiredColumns.filter(
            col => !headers.includes(col)
          );
          if (missingColumns.length > 0) {
            return res.status(400).json({
              error: `Missing required columns: ${missingColumns.join(", ")}`
            });
          }

          await insertStudents(students, teacherId, res);
        });
    } else if (ext === ".xlsx" || ext === ".xls") {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      students = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      fs.unlinkSync(filePath);

      const requiredColumns = ["Name", "Username", "Grade", "Section", "Strand"];
      const headers = Object.keys(students[0] || {});
      const missingColumns = requiredColumns.filter(
        col => !headers.includes(col)
      );
      if (missingColumns.length > 0) {
        return res.status(400).json({
          error: `Missing required columns: ${missingColumns.join(", ")}`
        });
      }

      await insertStudents(students, teacherId, res);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file format" });
    }
  } catch (err) {
    console.error(err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};


// ======================= Helper =======================
async function insertStudents(students, teacherId, res) {
  let success = 0;
  let failed = 0;

  for (const student of students) {
    const Name = student.Name || student.name;
    const Username = student.Username || student.username; // <-- use username
    const Grade = student.Grade || student.grade;
    const Section = student.Section || student.section;
    const Strand = student.Strand || student.strand;
    
    if (!Name || !Username || !Grade || !Section || !Strand) {
      console.error("Skipping student, missing required field:", student);
      failed++;
      continue;
    }

    const sqlFind = `
      SELECT s.section_id
      FROM sections s
      JOIN strands st ON s.strand_id = st.strand_id
      WHERE s.section_name = ? AND st.strand_name = ?
    `;

    try {
      const sectionResults = await new Promise((resolve, reject) => {
        db.query(sqlFind, [Section, Strand], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (!sectionResults || sectionResults.length === 0) {
        console.error(`No match for Section=${Section}, Strand=${Strand}`);
        failed++;
        continue;
      }

      const section_id = sectionResults[0].section_id;
      const password_hash = bcrypt.hashSync("123456", 10);
      
      const sqlInsert = `INSERT INTO users (name, username, password_hash, grade_level, section_id, role, teacher_id)
        VALUES (?, ?, ?, ?, ?, 'student', ?)
      `;

      await new Promise((resolve, reject) => {
        db.query(sqlInsert, [Name, Username, password_hash, Grade, section_id, teacherId], (err) => {
          if (err) {
            console.error("Insert error:", err.message);
            reject(err);
          } else resolve();
        });
      });

      success++;
    } catch (err) {
      console.error("DB error:", err.message);
      failed++;
    }
  }

  res.json({
    message: "Import finished",
    successCount: success,
    failedCount: failed,
  });
}





// ======================= Export My Students CSV =======================
const ExportStudent = (req, res) => {
  const { teacherId } = req.query;

  const sql = `
    SELECT u.name AS Name, u.grade_level AS Grade,
      s.section_name AS Section, st.strand_name AS Strand
    FROM users u
    LEFT JOIN sections s ON u.section_id = s.section_id
    LEFT JOIN strands st ON s.strand_id = st.strand_id
    WHERE u.role = 'student' AND u.teacher_id = ?
  `;

  db.query(sql, [teacherId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    const header = "Name,Grade,Section,Strand\n";
    const csv =
      header +
      rows
        .map((r) => `${r.Name},${r.Grade},${r.Section},${r.Strand}`)
        .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=my_students.csv");
    res.send(csv);
  });
};


// ======================= GENERATE BULK =======================
const GenerateBulk = async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  let students = [];
  const fileExt = req.file.originalname.split(".").pop();

  try {
    if (fileExt === "csv") {
      fs.createReadStream(req.file.path)
        .pipe(format.parse({ headers: true }))
        .on("data", (row) => students.push(row))
        .on("end", async () => generateQRsAndSave(students, res, req.file.path));
    } else if (fileExt === "xlsx" || fileExt === "xls") {
      const workbook = XLSX.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      students = XLSX.utils.sheet_to_json(sheet);
      await generateQRsAndSave(students, res, req.file.path);
    } else {
      return res.status(400).send("Unsupported file type");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to process file");
  }
};



// ======================= Helper =======================
async function generateQRsAndSave(students, res, uploadedFilePath) {
  const zipPath = path.join(__dirname, "qr-codes.zip");
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip");

  output.on("close", () => {
    if (uploadedFilePath) fs.unlinkSync(uploadedFilePath);
    res.download(zipPath, "qr-codes.zip", () => fs.unlinkSync(zipPath));
  });

  archive.pipe(output);

  for (const student of students) {
    const Name = student.Name || student.name;
    const Grade = student.Grade || student.grade;
    const Section = student.Section || student.section;
    const Strand = student.Strand || student.strand;

    try {
      // 1. Find section_id
      const sqlFind = `
        SELECT s.section_id
        FROM sections s
        JOIN strands st ON s.strand_id = st.strand_id
        WHERE s.section_name = ? AND st.strand_name = ?
      `;

      const sectionResult = await new Promise((resolve, reject) => {
        db.query(sqlFind, [Section, Strand], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (!sectionResult || sectionResult.length === 0) {
        console.error(`No match for Section=${Section}, Strand=${Strand}`);
        continue;
      }

      const section_id = sectionResult[0].section_id;
      const password_hash = bcrypt.hashSync("123456", 10);

      // 2. Generate username
      const baseUsername = Name.toLowerCase().replace(/\s+/g, ".");
      const gradeSuffix = Grade.replace("Grade ", "");
      let username = `${baseUsername}${gradeSuffix}`;

      const existing = await new Promise((resolve, reject) => {
        db.query("SELECT user_id FROM users WHERE username=?", [username], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      if (existing.length > 0) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
      }

      const sqlInsert = `
        INSERT INTO users (name, username, password_hash, grade_level, section_id, role)
        VALUES (?, ?, ?, ?, ?, 'student')
      `;

      await new Promise((resolve, reject) => {
        db.query(sqlInsert, [Name, username, password_hash, Grade, section_id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const qrPath = path.join(__dirname, `qr-${username}.png`);
      await QRCode.toFile(qrPath, username); 

      archive.file(qrPath, { name: `qr-${username}.png` });

    } catch (err) {
      console.error("Error processing student:", err.message);
    }
  }

  await archive.finalize();

  for (const student of students) {
    const Name = student.Name || student.name;
    const Grade = student.Grade || student.grade;
    const baseUsername = Name.toLowerCase().replace(/\s+/g, ".") + Grade.replace("Grade ", "");
    const qrPath = path.join(__dirname, `qr-${baseUsername}.png`);
    if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);
  }
}


// ======================= Get Attendance Report =======================
const GetStudent = (req, res) => {
  const { teacherId } = req.query;

  const sql = `
    SELECT u.user_id,u.username, u.name, u.grade_level,
      s.section_name, st.strand_name
    FROM users u
    LEFT JOIN sections s ON u.section_id = s.section_id
    LEFT JOIN strands st ON s.strand_id = st.strand_id
    WHERE u.role = 'student' AND u.teacher_id = ?
  `;

  db.query(sql, [teacherId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    console.log("Query result:", rows);
    res.json(rows);
  });
};











export default { GetStudent, ExportStudent, ImportStudent, GenerateBulk };
