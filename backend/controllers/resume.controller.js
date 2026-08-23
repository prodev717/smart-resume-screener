import Resume from "../models/resume.model.js";
import { resumeSchema } from "../models/gemini.schemas.js";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import "dotenv/config";

const ai = new GoogleGenAI();

const upload = multer({
  storage: multer.memoryStorage(),
});

export { upload };

async function getJsonFromResume(text) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
You are a resume extraction system.

Determine whether the following document is actually a resume.

If it is NOT a resume:
- Set "is_resume" to false
- Set "candidate" to null

If it IS a resume:
- Set "is_resume" to true
- Extract the candidate information into the provided schema.
- Do not invent information.
- If information is missing, use an empty string or empty array.
- Preserve the meaning of the original resume.

DOCUMENT:

${text}
    `,

    config: {
      responseMimeType: "application/json",
      responseSchema: resumeSchema,
    },
  });

  return JSON.parse(response.text);
}

async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({
      data: file.buffer,
    });

    try {
      const data = await parser.getText();
      return data.text;
    } finally {
      await parser.destroy();
    }
  }

  if (file.mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  return null;
}

export async function createResumes(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        // 1. Extract text
        const text = await extractText(file);

        if (text === null) {
          results.push({
            filename: file.originalname,
            ignored: true,
            reason: "Unsupported file type",
          });

          continue;
        }

        // 2. Ignore empty documents
        if (!text.trim()) {
          results.push({
            filename: file.originalname,
            ignored: true,
            reason: "No text could be extracted",
          });

          continue;
        }

        console.log(`Processing ${file.originalname}...`);

        // 3. Extract structured resume using Gemini
        const candidate = await getJsonFromResume(text);

        // 4. Check whether it is actually a resume
        if (!candidate.is_resume) {
          results.push({
            filename: file.originalname,
            ignored: true,
            reason: "Document is not a resume",
          });

          continue;
        }

        // 5. Store candidate JSON in Neon
        const savedResume = await Resume.create(candidate.candidate);

        // 6. Return result
        results.push({
          filename: file.originalname,
          ignored: false,
          resume: savedResume,
        });
      } catch (error) {
        console.error(
          `Failed to process ${file.originalname}:`,
          error
        );

        results.push({
          filename: file.originalname,
          error: "Failed to process file",
        });
      }
    }

    return res.status(201).json({
      count: results.length,
      resumes: results,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    return res.status(500).json({
      error: "Failed to process files",
    });
  }
}

export async function getResumes(req, res) {
  try {
    const resumes = await Resume.findAll();

    return res.status(200).json({
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    console.error("Failed to fetch resumes:", error);

    return res.status(500).json({
      error: "Failed to fetch resumes",
    });
  }
}

export async function getResume(req, res) {
  try {
    const { id } = req.params;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    return res.status(200).json({
      resume,
    });
  } catch (error) {
    console.error("Failed to fetch resume:", error);

    return res.status(500).json({
      error: "Failed to fetch resume",
    });
  }
}

export async function updateResume(req, res) {
  try {
    const { id } = req.params;
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({
        error: "Resume data is required",
      });
    }

    const updatedResume = await Resume.update(id, resume);

    if (!updatedResume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    return res.status(200).json({
      resume: updatedResume,
    });
  } catch (error) {
    console.error("Failed to update resume:", error);

    return res.status(500).json({
      error: "Failed to update resume",
    });
  }
}

export async function deleteResume(req, res) {
  try {
    const { id } = req.params;

    const deletedResume = await Resume.delete(id);

    if (!deletedResume) {
      return res.status(404).json({
        error: "Resume not found",
      });
    }

    return res.status(200).json({
      message: "Resume deleted successfully",
      resume: deletedResume,
    });
  } catch (error) {
    console.error("Failed to delete resume:", error);

    return res.status(500).json({
      error: "Failed to delete resume",
    });
  }
}