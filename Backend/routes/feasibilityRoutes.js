import express from "express";
import {
  generateReport,
  getMyReports,
  getReportById,
} from "../controllers/feasibilityController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateReport);
router.get("/my", protect, getMyReports);
router.get("/:id", protect, getReportById);

export default router;
