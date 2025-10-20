
import express from "express";
import qrCodeController from "../controllers/qrCodeController.js";


const QrCodeRouter = express.Router();

QrCodeRouter.get("/generate-qr/:studentId", qrCodeController.GenerateQrCode);

export default QrCodeRouter;