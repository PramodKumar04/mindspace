import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  tags: [{
    type: String
  }],
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Slug must be unique per college
groupSchema.index({ collegeId: 1, slug: 1 }, { unique: true });
groupSchema.index({ collegeId: 1, createdAt: -1 });

const Group = mongoose.model('Group', groupSchema);

export default Group;
