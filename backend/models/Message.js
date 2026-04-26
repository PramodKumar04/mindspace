import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  riskKeywords: [{
    type: String
  }],
  suggestedUi: {
    type: String,
    default: null
  },
  intensity: {
    type: String,
    enum: ['Neutral', 'Anxious', 'Distressed', 'Crisis'],
    default: 'Neutral'
  },
  metadata: {
    emotionTags: [String],
    riskLevel: String,
    trend: String,
    escalate: Boolean
  }
}, {
  timestamps: true
});

// Index for session messages
messageSchema.index({ sessionId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
