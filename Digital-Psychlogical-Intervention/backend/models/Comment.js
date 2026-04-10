import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorAlias: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  mentions: {
    type: [String],
    default: () => []
  }
}, {
  timestamps: true
});

// Index for post comments
commentSchema.index({ postId: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
