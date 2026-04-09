import express from "express";
import {
  startChatSession,
  sendMessage,
  generateStructuredPlan,
  getMyChatSessions,
  getChatSessionById,
  deleteChatSession,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startChatSession);
router.post("/:sessionId/message", protect, sendMessage);
router.post("/:sessionId/generate-plan", protect, generateStructuredPlan);
router.get("/my", protect, getMyChatSessions);
router.get("/:sessionId", protect, getChatSessionById);
router.delete("/:sessionId", protect, deleteChatSession);

export default router;
