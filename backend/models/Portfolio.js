import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  portfolioId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    index: true
  },
  template: {
    type: String,
    default: 'template1'
  },
  personalInfo: {
    name: { type: String, required: true },
    title: { type: String, required: true },
    email: String,
    phone: String,
    location: String,
    about: String,
    github: String,
    linkedin: String,
    portfolio: String,
    profilePhoto: String
  },
  experience: [{
    company: String,
    position: String,
    duration: String,
    description: String,
    responsibilities: [String]
  }],
  education: [{
    degree: String,
    institution: String,
    year: String,
    cgpa: String
  }],
  skills: [String],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String,
    image: String
  }],
  certifications: [String],
  achievements: [String],
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  vercelDeployment: {
    deploymentId: String,
    url: String,
    projectId: String,
    deployedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'ready', 'error', null],
      default: null
    }
  }
}, {
  timestamps: true
});

// Index for faster lookups
portfolioSchema.index({ userId: 1 });

export default mongoose.model('Portfolio', portfolioSchema);
