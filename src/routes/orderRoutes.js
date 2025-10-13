import express from "express";
import { newOrder, getOrders } from "../controllers/ordersController.js";

const router = express.Router();

router.post("/", newOrder);
router.get("/", getOrders);

export default router;
