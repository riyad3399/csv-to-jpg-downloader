import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  finalFilename: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'skipped'],
    required: true
  },
  error: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  processingTime: {
    type: Number,
    default: null
  },
  uploadSession: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
logSchema.index({ uploadSession: 1, createdAt: -1 });
logSchema.index({ rollNumber: 1 });
logSchema.index({ status: 1 });

const Log = mongoose.model('Log', logSchema);

export default Log;