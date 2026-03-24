import mongoose from 'mongoose';

const generatedResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  resumeData: {
    type: Object,
    default: null
  },
  resumeUrl: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['pdf', 'docx'],
    default: 'docx'
  },
  atsScore: {
    type: Number,
    default: null
  },
  aiSuggestions: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster lookups
generatedResumeSchema.index({ userId: 1, version: -1 });

export default mongoose.model('GeneratedResume', generatedResumeSchema);
