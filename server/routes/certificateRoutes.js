import express from "express";
import certificateController from "../controllers/certificateController.js";

const certificateRouter = express.Router();

certificateRouter.get("/certificate/:studentId", certificateController.certificate);

export default certificateRouter;
