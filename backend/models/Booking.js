import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  counselorId: {
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
  slotStart: {
    type: Date,
    required: true
  },
  slotEnd: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  studentNotes: {
    type: String
  },
  meetingCode: {
    type: String,
    trim: true,
    uppercase: true
  }
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ counselorId: 1, slotStart: 1 });
bookingSchema.index({ studentId: 1, status: 1 });
bookingSchema.index({ collegeId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
