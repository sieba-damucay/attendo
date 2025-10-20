import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from "./routes/authRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import reportRouter from "./routes/reportRoutes.js";
import studentsRouter from "./routes/studentRoutes.js";
import profileRouter from "./routes/profileRoutes.js";
import strandSectionRouter from "./routes/strandSectionRoutes.js";
import QrCodeRouter from "./routes/qrCodeRoutes.js";
import adminUserCrudRouter from "./routes/adminUsersCRUDroutes.js";
import teacherRouter from "./routes/TeacherReportRoutes.js";
import generateRouter from "./routes/generateBulkRoutes.js";
import certificateRouter from "./routes/certificateRoutes.js";
import AnnouncementRouter from "./routes/AnnounementRoutes.js";




const app = express();
app.use(cors());
app.use(bodyParser.json());



app.use("/api", authRouter)
app.use("/api", attendanceRouter);
app.use("/api", notificationRouter);
app.use("/api", reportRouter);
app.use("/api", studentsRouter);
app.use("/api", profileRouter);
app.use("/api", strandSectionRouter);
app.use("/api", QrCodeRouter);
app.use("/api", adminUserCrudRouter);
app.use("/api", teacherRouter);
app.use("/api", generateRouter);
app.use("/api", certificateRouter);
app.use("/api", AnnouncementRouter);







const PORT = process.env.PORT;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
