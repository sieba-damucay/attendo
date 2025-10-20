import AnnounementController from "../controllers/AnnounementController.js";
import express from "express";


const AnnouncementRouter = express.Router();

// Create new announcement
AnnouncementRouter.post("/announcement", AnnounementController.createAnnouncement);

// Get latest active announcement
AnnouncementRouter.get("/announcement", AnnounementController.getActiveAnnouncement);

// Get all announcements
AnnouncementRouter.get("/announcement/all", AnnounementController.getAllAnnouncements);

// Update announcement status only
AnnouncementRouter.put("/announcement/:id/status", AnnounementController.updateAnnouncementStatus);

// Update announcement message
AnnouncementRouter.put("/announcement/:id", AnnounementController.UpdateAnnouncement);

// Delete announcement
AnnouncementRouter.delete("/announcement/:id", AnnounementController.deleteAnnouncement);



export default AnnouncementRouter;
