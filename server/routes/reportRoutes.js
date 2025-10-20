import express from "express";
import reportsController from "../controllers/reportsController.js";

const reportRouter = express.Router();




reportRouter.get("/students", reportsController.GetAllStudents);
reportRouter.get("/strand_sections", reportsController.studentsPerSection);

// Daily attendance report
reportRouter.get("/students_report", reportsController.studentReport);
// Teachers list
reportRouter.get("/teachers_report", reportsController.teachersReport);
// Weekly / monthly attendance summary
reportRouter.get("/students-filtered", reportsController.attendanceReports);


reportRouter.get("/admin_attendance_report", reportsController.fullAttendanceReport);

export default reportRouter;
