import express from 'express';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
      });
    }

    const file = req.file;
    let text;

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
      return res.status(400).json({
        error: 'Only PDF and TXT files are supported',
      });
    }

    console.log('Extracted text:\n');
    console.log(text);

    res.json({
      filename: file.originalname,
      text,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Failed to process file',
    });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});