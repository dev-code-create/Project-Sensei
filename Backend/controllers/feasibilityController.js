import OpenAI from "openai";
import FeasibilityReport from "../model/FeasibilityReport.js";

const isGeminiKey = process.env.OPENAI_API_KEY?.startsWith("AIzaSy");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: isGeminiKey
    ? "https://generativelanguage.googleapis.com/v1beta/openai"
    : undefined,
});

/**
 * Safely parse JSON from AI response, handling potential markdown wrappers
 */
const parseAIResponse = (content) => {
  try {
    // Remove markdown code blocks if present (e.g., ```json ... ``` or ``` ...)
    const cleanedContent = content.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
    // If there's still something outside the JSON, this regex might need adjustment, 
    // but usually Gemini/OpenAI with json_object mode are pretty good.
    return JSON.parse(cleanedContent || content);
  } catch (error) {
    console.error("AI_PARSE_ERROR. Raw Content:", content);
    throw new Error("AI returned an invalid response format. Please try again.");
  }
};

// @route POST /api/feasibility/generate
export const generateReport = async (req, res, next) => {
  console.log("ROUTE_HIT: /api/feasibility/generate");
  let reportId = null;

  try {
    const { startupName, ideaDescription, targetMarket } = req.body;

    // Create a pending report first
    const report = await FeasibilityReport.create({
      user: req.user._id,
      startupName,
      ideaDescription,
      targetMarket,
    });
    reportId = report._id;

    const prompt = `
      You are a startup advisor. Analyze this startup idea and return a detailed feasibility report.
      
      Startup Name: ${startupName}
      Idea: ${ideaDescription}
      Target Market: ${targetMarket}
      
      Return ONLY a valid JSON object with the following structure:
      {
        "marketAnalysis": "Detailed market analysis text",
        "competitorOverview": "Competitive landscape text",
        "revenueProjection": "How the startup will make money",
        "riskAssessment": "Key risks and mitigation and potential pitfalls",
        "overallScore": <number between 0 and 100>
      }
    `;

    console.log("Requesting AI completion...");
    const completion = await openai.chat.completions.create({
      model: isGeminiKey ? "gemini-flash-latest" : "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional startup consultant. Response must be in valid JSON format." },
        { role: "user", content: prompt }
      ]
    });


    const content = completion.choices[0].message.content;
    const aiResult = parseAIResponse(content);

    report.aiReport = aiResult;
    report.status = "generated";
    await report.save();

    res.status(201).json(report);
  } catch (error) {
    console.error("GENERATE_REPORT_ERROR:", error.message);
    if (error.status) console.error("Error Status:", error.status);
    if (error.response?.data) console.error("Error Response Data:", JSON.stringify(error.response.data));
    
    // If we created a report but generation failed, update status or delete it
    if (reportId) {
       await FeasibilityReport.findByIdAndDelete(reportId).catch(err => console.error("Error cleaning up report:", err));
    }

    // Map AI service 404 (model not found) to 502 Bad Gateway to avoid confusing the UI/Router into thinking the Express route is missing
    let status = error.status || 500;
    if (status === 404) status = 502;
    const message = error.message || "Internal Server Error during report generation";
    
    res.status(status).json({ message });
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

// @route DELETE /api/feasibility/:id
export const deleteReport = async (req, res, next) => {
  try {
    const report = await FeasibilityReport.findById(req.params.id);

    if (!report) {
      res.status(404);
      throw new Error("Report not found");
    }

    // Only owner can delete
    if (report.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this report");
    }

    await report.deleteOne();
    res.json({ message: "Report removed" });
  } catch (error) {
    next(error);
  }
};

