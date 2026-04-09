import Session from "../models/Session.js";
import Mentor from "../models/Mentor.js";

// @route POST /api/sessions/book
export const bookSession = async (req, res, next) => {
  try {
    const { mentorId, scheduledAt, duration } = req.body;

    const mentor = await Mentor.findById(mentorId);
    if (!mentor || !mentor.isApproved) {
      res.status(404);
      throw new Error("Mentor not found or not approved");
    }

    const session = await Session.create({
      founder: req.user._id,
      mentor: mentorId,
      scheduledAt,
      duration: duration || 60,
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/sessions/my
// Get all sessions for the logged-in user (founder or mentor)
export const getMySessions = async (req, res, next) => {
  try {
    const query =
      req.user.role === "mentor"
        ? { mentor: req.user._id }
        : { founder: req.user._id };

    const sessions = await Session.find(query)
      .populate("founder", "name email profilePic")
      .populate({
        path: "mentor",
        populate: { path: "user", select: "name email profilePic" },
      })
      .sort({ scheduledAt: -1 });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/sessions/:id/status
// Mentor confirms or cancels; founder cancels
export const updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    const validStatuses = ["confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error("Invalid status value");
    }

    session.status = status;
    await session.save();

    res.json({ message: `Session marked as ${status}`, session });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/sessions/:id/payment
// Update payment status after Razorpay/Stripe webhook
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    session.paymentStatus = paymentStatus;
    session.paymentId = paymentId;
    if (paymentStatus === "paid") session.status = "confirmed";

    await session.save();
    res.json({ message: "Payment status updated", session });
  } catch (error) {
    next(error);
  }
};
