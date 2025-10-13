import express from "express";
import { getDrones, updateDrone } from "../controllers/dronesController.js";

const router = express.Router();

router.get("/", getDrones);
router.put("/:id", updateDrone);

export default router;
