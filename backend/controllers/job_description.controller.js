import JobDescription from "../models/job_description.schema.js";
import { jobDescriptionSchema } from "../models/gemini.schemas.js";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI();

async function getJsonFromJobDescription(text) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
You are a job description extraction system.

Analyze the following document and determine whether it is actually a job description.

If it is NOT a job description:
- Set "is_job_description" to false
- Set "job" to null

If it IS a job description:
- Set "is_job_description" to true
- Extract the job information into the provided schema.
- Do not invent or infer information that is not explicitly present.
- If information is missing, use an empty string or empty array.
- Preserve the meaning of the original job description.
- Separate required skills/qualifications from preferred skills/qualifications whenever the document makes that distinction.
- Extract technical skills, soft skills, qualifications, responsibilities, experience requirements, and other relevant information accurately.
- Keep the extracted information concise and normalized.

DOCUMENT:

${text}
    `,

    config: {
      responseMimeType: "application/json",
      responseSchema: jobDescriptionSchema,
    },
  });

  return JSON.parse(response.text);
}

export async function createJobDescription(req, res) {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: "Job description text is required",
      });
    }

    const result = await getJsonFromJobDescription(text);

    if (!result.is_job_description) {
      return res.status(400).json({
        error: "The provided text is not a valid job description",
      });
    }

    const savedJob = await JobDescription.create(result.job);

    return res.status(201).json({
      message: "Job description created successfully",
      job: savedJob,
    });
  } catch (error) {
    console.error("Failed to create job description:", error);

    return res.status(500).json({
      error: "Failed to create job description",
    });
  }
}

export async function getJobDescriptions(req, res) {
  try {
    const jobs = await JobDescription.findAll();

    return res.status(200).json({
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Failed to fetch job descriptions:", error);

    return res.status(500).json({
      error: "Failed to fetch job descriptions",
    });
  }
}

export async function getJobDescription(req, res) {
  try {
    const { id } = req.params;

    const job = await JobDescription.findById(id);

    if (!job) {
      return res.status(404).json({
        error: "Job description not found",
      });
    }

    return res.status(200).json({
      job,
    });
  } catch (error) {
    console.error("Failed to fetch job description:", error);

    return res.status(500).json({
      error: "Failed to fetch job description",
    });
  }
}

export async function updateJobDescription(req, res) {
  try {
    const { id } = req.params;
    const { job } = req.body;

    if (!job) {
      return res.status(400).json({
        error: "Job description data is required",
      });
    }

    const updatedJob = await JobDescription.update(id, job);

    if (!updatedJob) {
      return res.status(404).json({
        error: "Job description not found",
      });
    }

    return res.status(200).json({
      message: "Job description updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Failed to update job description:", error);

    return res.status(500).json({
      error: "Failed to update job description",
    });
  }
}

export async function deleteJobDescription(req, res) {
  try {
    const { id } = req.params;

    const deletedJob = await JobDescription.delete(id);

    if (!deletedJob) {
      return res.status(404).json({
        error: "Job description not found",
      });
    }

    return res.status(200).json({
      message: "Job description deleted successfully",
      job: deletedJob,
    });
  } catch (error) {
    console.error("Failed to delete job description:", error);

    return res.status(500).json({
      error: "Failed to delete job description",
    });
  }
}