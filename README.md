# CSV Image Downloader - MERN Stack Application

A full-stack application that processes CSV files containing roll numbers and image URLs, downloads all images, converts them to JPEG format, and provides them as a downloadable ZIP file.

## Features

- **CSV File Processing**: Upload CSV files with roll numbers and image URLs
- **Concurrent Downloads**: Process up to 5 images simultaneously for faster processing
- **Image Conversion**: Automatically converts all images to JPEG format using Sharp
- **Duplicate Handling**: Automatically handles duplicate roll numbers by adding numbering suffixes
- **Error Resilience**: Continues processing even if some images fail to download
- **MongoDB Logging**: Complete logging of all processing activities with timestamps
- **Modern UI**: Beautiful, responsive React frontend with real-time progress tracking
- **ZIP Download**: Automatic ZIP file download with all processed images

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database for logging
- **Mongoose** - MongoDB ODM
- **Multer** - File upload handling
- **csv-parser** - CSV file parsing
- **axios** - HTTP client for image downloads
- **sharp** - Image processing and conversion
- **archiver** - ZIP file creation
- **p-limit** - Concurrency control

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **TypeScript** - Type safety

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd csv-image-downloader
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Create `backend/.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/csv_image_downloader
   ```

5. **Start MongoDB**
   
   Make sure your MongoDB instance is running locally or update the `MONGO_URI` to point to your cloud database.

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server**
   
   In a new terminal:
   ```bash
   npm run dev
   ```

8. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173`

## Usage

### CSV File Format

Your CSV file should have exactly 2 columns:
1. **Roll Number** - Unique identifier (string or number)
2. **Image URL** - Direct link to the image

Example CSV content:
```csv
rollNumber,imageUrl
STUD001,https://example.com/image1.jpg
STUD002,https://example.com/image2.png
STUD003,https://example.com/image3.gif
```

### Processing Workflow

1. **Upload**: Select your CSV file using the drag-and-drop interface
2. **Processing**: The system will:
   - Parse the CSV file
   - Download images concurrently (max 5 at a time)
   - Convert all images to JPEG format
   - Handle filename collisions automatically
   - Log all activities to MongoDB
3. **Download**: Automatically receive a ZIP file with all processed images

### File Naming

- Images are saved as `<rollNumber>.jpg`
- Duplicate roll numbers get suffixes: `<rollNumber>_1.jpg`, `<rollNumber>_2.jpg`, etc.
- Invalid or failed downloads are logged but don't stop the process

## API Endpoints

### POST /api/upload-csv
Upload and process CSV file

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: CSV file as 'csvFile'

**Response:**
- Success: ZIP file download
- Error: JSON with error details

### GET /api/upload-history
Retrieve upload processing history

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rollNumber": "STUD001",
      "imageUrl": "https://example.com/image.jpg",
      "finalFilename": "STUD001.jpg",
      "status": "success",
      "createdAt": "2024-01-01T00:00:00Z",
      "uploadSession": "uuid"
    }
  ]
}
```

### GET /api/health
Health check endpoint

## Database Schema

### Log Collection
```javascript
{
  rollNumber: String,      // Roll number from CSV
  imageUrl: String,        // Original image URL
  finalFilename: String,   // Final saved filename
  status: String,          // 'success' | 'failed' | 'skipped'
  error: String,           // Error message if failed
  fileSize: Number,        // File size in bytes
  processingTime: Number,  // Processing time in milliseconds
  uploadSession: String,   // Unique session identifier
  createdAt: Date,         // Timestamp
  updatedAt: Date          // Timestamp
}
```

## Production Deployment

### Backend
1. Set environment variables for production
2. Use a production MongoDB instance
3. Consider using PM2 for process management
4. Set up reverse proxy with nginx

### Frontend
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Serve static files with nginx or similar
3. Update API endpoints to point to production backend

## Performance Considerations

- **Concurrency Control**: Limited to 5 simultaneous downloads to prevent overwhelming servers
- **Image Optimization**: JPEG compression with 85% quality for optimal file size
- **Memory Management**: Streams used for file processing to handle large files
- **Timeout Handling**: 30-second timeout for image downloads
- **Cleanup**: Automatic cleanup of temporary files after processing

## Error Handling

- Invalid URLs are skipped with logging
- Network timeouts are handled gracefully
- Invalid image formats are processed through Sharp
- File system errors are caught and logged
- MongoDB connection issues are handled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
1. Check the logs in the backend console
2. Verify MongoDB connection
3. Ensure CSV format is correct
4. Check network connectivity for image URLs