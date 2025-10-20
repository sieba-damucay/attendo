import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import studentsController from "../controllers/studentsController.js";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const studentsRouter = express.Router();

studentsRouter.get("/my-students", studentsController.GetStudent);
studentsRouter.get("/my-students/export", studentsController.ExportStudent);
studentsRouter.post("/my-students/import",upload.single("file"),studentsController.ImportStudent);
// ================================== Generate bulk QR =====================================
studentsRouter.post("/generate-bulk-qr",upload.single("file"),studentsController.GenerateBulk);


export default studentsRouter;
