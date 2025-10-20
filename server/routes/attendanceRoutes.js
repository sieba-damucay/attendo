import express from "express";
import attendanceController from "../controllers/attendanceController.js";

const attendanceRouter = express.Router();

attendanceRouter.post("/attendance", attendanceController.studentAttendance);   
attendanceRouter.delete("/attendance/:id", attendanceController.deleteAttendance); 
attendanceRouter.get("/attendance-report", attendanceController.fullAttendanceReport); 
attendanceRouter.get("/strands-sections", attendanceController.getStrandsAndSections);





// Attendance history per student
attendanceRouter.get("/attendance-history/:user_id", attendanceController.getAttendanceHistory);

// Attendance summary per student
attendanceRouter.get("/attendance-summary/:user_id", attendanceController.getAttendanceSummary);


export default attendanceRouter;
