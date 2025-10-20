import express from "express";
import adminUsersCRUDController from "../controllers/adminUsersCRUDController.js";


const adminUserCrudRouter = express.Router();

adminUserCrudRouter.post("/admin_teachers", adminUsersCRUDController.AddNewTeacher);
adminUserCrudRouter.get("/admin_teachers", adminUsersCRUDController.GetAllTeacher);
adminUserCrudRouter.put("/admin_teachers/:id", adminUsersCRUDController.UpdateTeacher);
adminUserCrudRouter.delete("/admin_teachers/:id", adminUsersCRUDController.DeleteTeacher);


adminUserCrudRouter.post("/admin_students", adminUsersCRUDController.AddStudent);
adminUserCrudRouter.get("/admin_students", adminUsersCRUDController.GetAllStudents);
adminUserCrudRouter.put("/admin_students/:id", adminUsersCRUDController.UpdateStudents);
adminUserCrudRouter.delete("/admin_students/:id", adminUsersCRUDController.DeleteStudents);


export default adminUserCrudRouter;