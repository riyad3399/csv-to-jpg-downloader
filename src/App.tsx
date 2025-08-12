import React from 'react';
import FileUpload from './components/FileUpload';
import { Download, Image, FileSpreadsheet } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CSV Image Downloader</h1>
              <p className="text-sm text-gray-600">Upload CSV files and download images as ZIP</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Instructions */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                How it works
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Prepare your CSV file</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Create a CSV with two columns: roll number and image URL
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Upload and process</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Our system will download and convert all images to JPEG format
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Download ZIP file</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get all images in a single ZIP file, named by roll number
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Image className="w-5 h-5 mr-2 text-green-600" />
                Features
              </h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  Automatic image format conversion to JPEG
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  Handles duplicate roll numbers with automatic numbering
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  Concurrent processing for faster downloads
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  Error handling - continues even if some images fail
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                  Complete logging and processing history
                </li>
              </ul>
            </div>

            {/* CSV Format Example */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">CSV Format Example</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div className="text-gray-700 mb-2">rollNumber,imageUrl</div>
                <div className="text-gray-600">STUD001,https://example.com/image1.jpg</div>
                <div className="text-gray-600">STUD002,https://example.com/image2.png</div>
                <div className="text-gray-600">STUD003,https://example.com/image3.gif</div>
              </div>
            </div>
          </div>

          {/* Upload Component */}
          <div>
            <FileUpload />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Built with React, Node.js, Express, and MongoDB
            </p>
            <p className="text-xs mt-2 opacity-75">
              Supports concurrent processing with automatic error handling
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;