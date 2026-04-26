import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'low'
  },
  emotionTags: {
    type: [String],
    default: []
  },
  isFlagged: {
    type: Boolean,
    default: false
  },
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  sessionIntensity: {
    type: String,
    enum: ['Neutral', 'Anxious', 'Distressed', 'Crisis'],
    default: 'Neutral'
  },
  suggestedToolsThisSession: {
    type: [String],
    default: []
  },
  sessionSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  closedAt: {
    type: Date
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
}, {
  timestamps: true
});

// Indexes
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ collegeId: 1, isFlagged: 1 });
chatSessionSchema.index({ collegeId: 1, flaggedForReview: 1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
