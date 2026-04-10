import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'counselor', 'admin'],
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true
  },
  alias: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },
  needsIntervention: {
    type: Boolean,
    default: false
  },
  profile: {
    phone: String,
    bio: String,
    specialization: String // For counselors
  },
  token: {
    type: String,
    index: true
  },
  sessionTokenHash: {
    type: String,
    index: true
  },
  sessionExpiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for college isolation
userSchema.index({ collegeId: 1, email: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.clearSession = function() {
  this.token = undefined;
  this.sessionTokenHash = undefined;
  this.sessionExpiresAt = undefined;
};

const User = mongoose.model('User', userSchema);

export default User;
