
import express from "express";
import TeacherReportController from "../controllers/teacherReportController.js";

const teacherRouter = express.Router();
// teacherRouter.get("/students", TeacherReportController.getStudents);
teacherRouter.get("/teacher_reportdashboard", TeacherReportController.getAttendanceReport);
teacherRouter.put("/attendance/:attendance_id", TeacherReportController.updateAttendance);
teacherRouter.delete("/attendance/:attendance_id", TeacherReportController.deleteAttendance);


export default teacherRouter;