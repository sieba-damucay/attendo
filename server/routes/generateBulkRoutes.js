import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import generateBulkController from "../controllers/generateBulkController.js";
// ======================= uploads folder exists =======================
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ======================= Multer setup =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const generateRouter = express.Router();


generateRouter.post(
  "/my-students/import",
  upload.single("file"),
  generateBulkController.ImportStudent
);

generateRouter.post(
  "/generate-bulk-qr",
  upload.single("file"),
  generateBulkController.GenerateBulk
);


export default generateRouter;
