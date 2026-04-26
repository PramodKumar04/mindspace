import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['student', 'counselor', 'admin'],
    required: true
  },
  meetingCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  }
}, {
  timestamps: true
});

meetingSchema.index({ userId: 1, meetingCode: 1 }, { unique: true });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
