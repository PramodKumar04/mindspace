import mongoose from 'mongoose';

const userResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    questionnaireType: { type: String, required: true },
    totalScore:        { type: Number, required: true },
    severityTag:       { type: String, required: true },
    // New: store individual sub-scores from the unified flow
    phq9Score:  { type: Number },
    gad7Score:  { type: Number },
    pssScore:   { type: Number },
    promisScore: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('UserResult', userResultSchema);