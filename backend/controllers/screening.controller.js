import Screening from "../models/screening.schema.js";
import Resume from "../models/resume.model.js";
import JobDescription from "../models/job_description.schema.js";
import { screeningSchema } from "../models/gemini.schemas.js";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI();

async function evaluateResume(resume, jobDescription) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
You are an AI resume screening system.

Evaluate how well the candidate matches the given job description.

Consider:
- Required technical skills
- Preferred technical skills
- Work experience
- Required qualifications
- Education
- Certifications
- Responsibilities
- Relevant projects
- Overall suitability

Scoring:
- 1-2: Very poor match
- 3-4: Poor match
- 5-6: Moderate match
- 7-8: Good match
- 9: Very strong match
- 10: Excellent match

Important:
- Base the evaluation only on the information provided.
- Do not invent candidate experience or skills.
- Give more importance to required skills and qualifications than preferred ones.
- Provide a concise but meaningful reason explaining the score.
- Return only the requested JSON structure.

CANDIDATE RESUME:

${JSON.stringify(resume, null, 2)}

JOB DESCRIPTION:

${JSON.stringify(jobDescription, null, 2)}
    `,

    config: {
      responseMimeType: "application/json",
      responseSchema: screeningSchema,
    },
  });

  return JSON.parse(response.text);
}

export async function createScreening(req, res) {
  try {
    const { resume_id, jd_id } = req.body;

    if (resume_id === undefined || jd_id === undefined) {
      return res.status(400).json({
        error: "resume_id and jd_id are required",
      });
    }

    // Fetch resume
    const resume = await Resume.findById(resume_id);

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    // Fetch job description
    const jobDescription = await JobDescription.findById(jd_id);

    if (!jobDescription) {
      return res.status(404).json({
        error: "Job description not found",
      });
    }

    // Evaluate using Gemini
    const evaluation = await evaluateResume(
      resume.resume,
      jobDescription.job_description
    );

    // Extra validation for LLM output
    if (
      !Number.isInteger(evaluation.score) ||
      evaluation.score < 1 ||
      evaluation.score > 10
    ) {
      return res.status(500).json({
        error: "Invalid score returned by AI",
      });
    }

    if (!evaluation.reason?.trim()) {
      return res.status(500).json({
        error: "Invalid reason returned by AI",
      });
    }

    // Save screening result
    const screening = await Screening.create(
      resume_id,
      jd_id,
      evaluation.score,
      evaluation.reason
    );

    return res.status(201).json({
      message: "Screening completed successfully",
      screening,
    });
  } catch (error) {
    console.error("Failed to create screening:", error);

    return res.status(500).json({
      error: "Failed to screen resume",
    });
  }
}

export async function getScreenings(req, res) {
  try {
    const { resume_id, jd_id } = req.query;

    const screenings = await Screening.findAll({
      resumeId: resume_id,
      jdId: jd_id,
    });

    return res.status(200).json({
      count: screenings.length,
      screenings,
    });
  } catch (error) {
    console.error("Failed to fetch screenings:", error);

    return res.status(500).json({
      error: "Failed to fetch screenings",
    });
  }
}

export async function getScreening(req, res) {
  try {
    const { id } = req.params;

    const screening = await Screening.findById(id);

    if (!screening) {
      return res.status(404).json({
        error: "Screening not found",
      });
    }

    return res.status(200).json({
      screening,
    });
  } catch (error) {
    console.error("Failed to fetch screening:", error);

    return res.status(500).json({
      error: "Failed to fetch screening",
    });
  }
}

export async function updateScreening(req, res) {
  try {
    const { id } = req.params;
    const { score, reason } = req.body;

    if (score === undefined || !reason) {
      return res.status(400).json({
        error: "score and reason are required",
      });
    }

    if (
      !Number.isInteger(Number(score)) ||
      Number(score) < 1 ||
      Number(score) > 10
    ) {
      return res.status(400).json({
        error: "Score must be an integer between 1 and 10",
      });
    }

    const screening = await Screening.update(
      id,
      Number(score),
      reason
    );

    if (!screening) {
      return res.status(404).json({
        error: "Screening not found",
      });
    }

    return res.status(200).json({
      message: "Screening updated successfully",
      screening,
    });
  } catch (error) {
    console.error("Failed to update screening:", error);

    return res.status(500).json({
      error: "Failed to update screening",
    });
  }
}

export async function deleteScreening(req, res) {
  try {
    const { id } = req.params;

    const screening = await Screening.delete(id);

    if (!screening) {
      return res.status(404).json({
        error: "Screening not found",
      });
    }

    return res.status(200).json({
      message: "Screening deleted successfully",
      screening,
    });
  } catch (error) {
    console.error("Failed to delete screening:", error);

    return res.status(500).json({
      error: "Failed to delete screening",
    });
  }
}