import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { processCSVUpload } from '../controllers/uploadController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(path.dirname(__dirname), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `upload-${uniqueSuffix}.csv`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload CSV endpoint
router.post('/upload-csv', upload.single('csvFile'), processCSVUpload);

// Get upload history
router.get('/upload-history', async (req, res) => {
  try {
    const { Log } = await import('../models/Log.js');
    const logs = await Log.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select('rollNumber imageUrl finalFilename status createdAt uploadSession');
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upload history',
      error: error.message
    });
  }
});

export default router;