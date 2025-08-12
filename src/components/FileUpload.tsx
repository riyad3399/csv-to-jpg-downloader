import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface UploadStatus {
  type: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
}

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>({ type: 'idle' });
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        setStatus({ type: 'idle' });
      } else {
        setStatus({
          type: 'error',
          message: 'Please select a CSV file only.'
        });
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
        setStatus({ type: 'idle' });
      } else {
        setStatus({
          type: 'error',
          message: 'Please drop a CSV file only.'
        });
      }
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus({ type: 'uploading' });
    setProgress(0);

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await fetch('http://localhost:5000/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      // Handle ZIP file download
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'images.zip'
        : 'images.zip';

      downloadFile(blob, filename);

      setStatus({
        type: 'success',
        message: `Successfully processed! Downloaded ${filename}`
      });

      // Reset after success
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
        setStatus({ type: 'idle' });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Upload failed'
      });
      setProgress(0);
    }
  };

  const getStatusIcon = () => {
    switch (status.type) {
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status.type) {
      case 'uploading':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload CSV File</h2>
      
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          selectedFile
            ? 'border-green-300 bg-green-50/50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-100/50'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={status.type === 'uploading'}
        />
        
        <div className="space-y-4">
          {selectedFile ? (
            <div className="flex items-center justify-center space-x-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">Drop your CSV file here</p>
                <p className="text-gray-500">or click to browse</p>
              </div>
            </>
          )}
          
          {!selectedFile && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              disabled={status.type === 'uploading'}
            >
              Choose File
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {status.type === 'uploading' && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Processing...</span>
            <span className="text-sm text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      {status.message && (
        <div className={`mt-6 p-4 rounded-lg border flex items-center space-x-3 ${getStatusColor()}`}>
          {getStatusIcon()}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && status.type !== 'uploading' && (
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleUpload}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Process & Download Images</span>
          </button>
          
          <button
            onClick={() => {
              setSelectedFile(null);
              setStatus({ type: 'idle' });
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Important:</p>
            <ul className="space-y-1 text-xs">
              <li>• CSV must have exactly 2 columns: roll number and image URL</li>
              <li>• Images will be converted to JPEG format automatically</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Processing may take time depending on image count and sizes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;