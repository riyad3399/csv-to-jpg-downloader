import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';
import axios from 'axios';
import sharp from 'sharp';
import archiver from 'archiver';
import pLimit from 'p-limit';
import crypto from 'crypto';
import Log from '../models/Log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const limit = pLimit(5); // Limit concurrent downloads to 5

export const processCSVUpload = async (req, res) => {
  const uploadSession = crypto.randomUUID();
  const tempDir = path.join(path.dirname(__dirname), 'temp', uploadSession);
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No CSV file uploaded'
    });
  }

  const csvFilePath = req.file.path;
  
  try {
    // Create temporary directory for this session
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Parse CSV file
    const csvData = await parseCSV(csvFilePath);
    
    if (csvData.length === 0) {
      throw new Error('CSV file is empty or invalid');
    }

    console.log(`📊 Processing ${csvData.length} entries from CSV`);

    // Process images with concurrency control
    const results = await Promise.allSettled(
      csvData.map((row, index) => 
        limit(() => processImage(row, index, tempDir, uploadSession))
      )
    );

    // Collect successful downloads
    const successfulResults = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);

    if (successfulResults.length === 0) {
      throw new Error('No images were successfully processed');
    }

    console.log(`✅ Successfully processed ${successfulResults.length}/${csvData.length} images`);

    // Create ZIP file
    const zipBuffer = await createZipFile(tempDir, successfulResults);

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="images-${uploadSession.slice(0, 8)}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);

    // Send ZIP file
    res.send(zipBuffer);

    // Cleanup
    setTimeout(() => {
      cleanup(csvFilePath, tempDir);
    }, 1000);

  } catch (error) {
    console.error('❌ CSV processing error:', error);
    
    // Cleanup on error
    cleanup(csvFilePath, tempDir);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process CSV file',
      uploadSession
    });
  }
};

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csvParser({ 
        headers: ['rollNumber', 'imageUrl'],
        skipEmptyLines: true 
      }))
      .on('data', (data) => {
        if (data.rollNumber && data.imageUrl) {
          results.push({
            rollNumber: String(data.rollNumber).trim(),
            imageUrl: String(data.imageUrl).trim()
          });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function processImage(row, index, tempDir, uploadSession) {
  const startTime = Date.now();
  const { rollNumber, imageUrl } = row;
  
  try {
    console.log(`⬇️ Downloading image ${index + 1}: ${rollNumber}`);
    
    // Validate URL
    if (!isValidUrl(imageUrl)) {
      throw new Error('Invalid URL format');
    }

    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('Empty image data received');
    }

    // Generate unique filename
    const filename = generateUniqueFilename(rollNumber, tempDir);
    const filePath = path.join(tempDir, filename);

    // Convert to JPEG using Sharp
    await sharp(Buffer.from(response.data))
      .jpeg({ quality: 85 })
      .toFile(filePath);

    const fileStats = fs.statSync(filePath);
    const processingTime = Date.now() - startTime;

    // Log success
    await Log.create({
      rollNumber,
      imageUrl,
      finalFilename: filename,
      status: 'success',
      fileSize: fileStats.size,
      processingTime,
      uploadSession
    });

    console.log(`✅ Successfully processed: ${filename} (${fileStats.size} bytes, ${processingTime}ms)`);

    return {
      rollNumber,
      filename,
      filePath,
      size: fileStats.size
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // Log error
    await Log.create({
      rollNumber,
      imageUrl,
      finalFilename: `${rollNumber}.jpg`,
      status: 'failed',
      error: error.message,
      processingTime,
      uploadSession
    });

    console.error(`❌ Failed to process ${rollNumber}:`, error.message);
    return null;
  }
}

function generateUniqueFilename(rollNumber, tempDir) {
  let filename = `${rollNumber}.jpg`;
  let counter = 1;
  
  while (fs.existsSync(path.join(tempDir, filename))) {
    filename = `${rollNumber}_${counter}.jpg`;
    counter++;
  }
  
  return filename;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

async function createZipFile(tempDir, results) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('data', chunk => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // Add files to archive
    results.forEach(result => {
      archive.file(result.filePath, { name: result.filename });
    });

    archive.finalize();
  });
}

function cleanup(csvFilePath, tempDir) {
  try {
    // Remove CSV file
    if (fs.existsSync(csvFilePath)) {
      fs.unlinkSync(csvFilePath);
    }
    
    // Remove temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    
    console.log('🧹 Cleanup completed');
  } catch (error) {
    console.error('⚠️ Cleanup error:', error);
  }
}