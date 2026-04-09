import OpenAI from "openai";
import FeasibilityReport from "../model/FeasibilityReport.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// @route POST /api/feasibility/generate
export const generateReport = async (req, res, next) => {
  try {
    const { startupName, ideaDescription, targetMarket } = req.body;

    // Create a pending report first
    const report = await FeasibilityReport.create({
      user: req.user._id,
      startupName,
      ideaDescription,
      targetMarket,
    });

    const prompt = `
      You are a startup advisor. Analyze this startup idea and return ONLY a valid JSON object.
      
      Startup Name: ${startupName}
      Idea: ${ideaDescription}
      Target Market: ${targetMarket}
      
      Return this exact JSON structure:
      {
        "marketAnalysis": "...",
        "competitorOverview": "...",
        "revenueProjection": "...",
        "riskAssessment": "...",
        "overallScore": <number between 0 and 100>
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);

    report.aiReport = aiResult;
    report.status = "generated";
    await report.save();

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/feasibility/my
// Get all reports for the logged-in user
export const getMyReports = async (req, res, next) => {
  try {
    const reports = await FeasibilityReport.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/feasibility/:id
export const getReportById = async (req, res, next) => {
  try {
    const report = await FeasibilityReport.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!report) {
      res.status(404);
      throw new Error("Report not found");
    }

    // Only owner can view
    if (report.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this report");
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};
