import express from "express";
import notificationController from "../controllers/notificationController.js";

const notificationRouter = express.Router();

// Only one route needed
notificationRouter.get("/notifications/:teacherId", notificationController.getNotifications);

export default notificationRouter;
