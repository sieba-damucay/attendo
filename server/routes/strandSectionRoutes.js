import express from "express";
import strandSectionController from "../controllers/strandSectionController.js";

const strandSectionRouter = express.Router();

strandSectionRouter.get("/strands", strandSectionController.GetAllStrand);
strandSectionRouter.post("/strands", strandSectionController.AddNewStrand);
strandSectionRouter.put("/strands/:id",  strandSectionController.UpdateStrand);
strandSectionRouter.delete("/strands/:id",  strandSectionController.DeleteStrand);


strandSectionRouter.get("/sections", strandSectionController.GetAllSection);
strandSectionRouter.post("/sections", strandSectionController.AddNewSection);
strandSectionRouter.put("/sections/:id", strandSectionController.UpdateSection);
strandSectionRouter.delete("/sections/:id", strandSectionController.DeleteSection);


export default strandSectionRouter;