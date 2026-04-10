import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  text:  { type: String, required: true },
  score: { type: Number, required: true },
});

const questionSchema = new mongoose.Schema({
  text:    { type: String, required: true },
  answers: [answerSchema],
});

const questionnaireSchema = new mongoose.Schema({
  type:      { type: String, required: true, unique: true },
  title:     { type: String, required: true },
  questions: [questionSchema],
});

export default mongoose.model('Questionnaire', questionnaireSchema);