import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
const port = 3000;

const ai = new GoogleGenAI();

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
});

const resumeSchema = {
  type: 'object',
  properties: {
    is_resume: {
      type: 'boolean',
    },
    candidate: {
      type: ['object', 'null'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        location: { type: 'string' },
        summary: { type: 'string' },

        skills: {
          type: 'array',
          items: { type: 'string' },
        },

        education: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              degree: { type: 'string' },
              institution: { type: 'string' },
              field: { type: 'string' },
              start_year: { type: 'string' },
              end_year: { type: 'string' },
            },
            required: [
              'degree',
              'institution',
              'field',
              'start_year',
              'end_year',
            ],
          },
        },

        experience: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company: { type: 'string' },
              role: { type: 'string' },
              start_date: { type: 'string' },
              end_date: { type: 'string' },
              description: { type: 'string' },
            },
            required: [
              'company',
              'role',
              'start_date',
              'end_date',
              'description',
            ],
          },
        },

        projects: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              technologies: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: [
              'name',
              'description',
              'technologies',
            ],
          },
        },

        certifications: {
          type: 'array',
          items: { type: 'string' },
        },

        achievements: {
          type: 'array',
          items: { type: 'string' },
        },

        links: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: [
        'name',
        'email',
        'phone',
        'location',
        'summary',
        'skills',
        'education',
        'experience',
        'projects',
        'certifications',
        'achievements',
        'links',
      ],
    },
  },
  required: ['is_resume', 'candidate'],
};

app.post('/upload', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        let text;

        // Extract text
        if (file.mimetype === 'application/pdf') {
          const parser = new PDFParse({
            data: file.buffer,
          });

          const data = await parser.getText();
          text = data.text;

          await parser.destroy();
        } else if (file.mimetype === 'text/plain') {
          text = file.buffer.toString('utf-8');
        } else {
          results.push({
            filename: file.originalname,
            error: 'Unsupported file type',
          });

          continue;
        }

        // Ignore empty documents
        if (!text.trim()) {
          results.push({
            filename: file.originalname,
            ignored: true,
            reason: 'No text could be extracted',
          });

          continue;
        }

        console.log(`Processing ${file.originalname}...`);

        // Gemini extraction
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',

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
            responseMimeType: 'application/json',
            responseSchema: resumeSchema,
          },
        });

        const candidate = JSON.parse(response.text);

        if (!candidate.is_resume) {
          results.push({
            filename: file.originalname,
            ignored: true,
            reason: 'Document is not a resume',
          });

          continue;
        }

        results.push({
          filename: file.originalname,
          ignored: false,
          candidate: candidate.candidate,
        });

      } catch (error) {
        console.error(
          `Failed to process ${file.originalname}:`,
          error
        );

        results.push({
          filename: file.originalname,
          error: 'Failed to process file',
        });
      }
    }

    res.json({
      count: results.length,
      resumes: results,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to process files',
    });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});