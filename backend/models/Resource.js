// backend/models/Resource.js
import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['article', 'video', 'audio', 'exercise'], required: true },
    category: { type: String, required: true },
    // Smart ranking: tag values match SEVERITY_TAG_MAP in resourceController.js
    tags: { type: [String], default: [] },
    url: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ResourceSchema.index({ collegeId: 1, isActive: 1 });
ResourceSchema.index({ collegeId: 1, category: 1 });
ResourceSchema.index({ collegeId: 1, tags: 1 });

export default mongoose.model('Resource', ResourceSchema);