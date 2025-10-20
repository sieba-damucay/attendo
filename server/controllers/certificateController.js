import PDFDocument from "pdfkit";
import db from "../config/database.js";

const certificate = (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT u.user_id, u.name AS student_name, u.grade_level,
           s.section_name, st.strand_name,
           SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS total_absent,
           SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS total_late,
           COUNT(a.attendance_id) AS total_days
    FROM users u
    LEFT JOIN attendance a ON u.user_id = a.user_id
    LEFT JOIN sections s ON u.section_id = s.section_id
    LEFT JOIN strands st ON s.strand_id = st.strand_id
    WHERE u.user_id = ?
    GROUP BY u.user_id, u.name, u.grade_level, s.section_name, st.strand_name
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const student = results[0];

    // Check perfect attendance
    if (student.total_absent > 0 || student.total_late > 0) {
      return res
        .status(400)
        .json({ message: "Student does not have perfect attendance." });
    }

    // Generate PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const fileName = `Certificate_${student.student_name}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(res);

    doc.fontSize(24).text("Certificate of Perfect Attendance", {
      align: "center",
      underline: true,
    });
    doc.moveDown(2);
    doc.fontSize(16).text(`This certificate is proudly presented to`, {
      align: "center",
    });
    doc.moveDown(1);
    doc.fontSize(20).text(`${student.student_name}`, { align: "center" });
    doc.moveDown(1);
    doc
      .fontSize(16)
      .text(
        `of Grade ${student.grade_level}, Section ${student.section_name}, Strand ${student.strand_name}.`,
        { align: "center" }
      );
    doc.moveDown(2);
    doc
      .fontSize(14)
      .text(`For achieving PERFECT ATTENDANCE during this semester.`, {
        align: "center",
      });
    doc.moveDown(4);
    doc.text("_________________________", { align: "right" });
    doc.text("Teacher's Signature", { align: "right" });

    doc.end();
  });
};

export default { certificate };
