
import express from "express";
import profileController from "../controllers/profileController.js";
const profileRouter = express.Router();

profileRouter.get("/profile/:id",  profileController.GetProfile);
profileRouter.put("/profile/:id",  profileController.UpdateProfile);


export default profileRouter;