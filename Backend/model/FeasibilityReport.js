import mongoose from "mongoose";

const feasibilityReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startupName: { type: String, required: true },
    ideaDescription: { type: String, required: true },
    targetMarket: { type: String },
    aiReport: {
      marketAnalysis: String,
      competitorOverview: String,
      revenueProjection: String,
      riskAssessment: String,
      overallScore: Number, // 0-100
    },
    status: {
      type: String,
      enum: ["pending", "generated"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("FeasibilityReport", feasibilityReportSchema);
